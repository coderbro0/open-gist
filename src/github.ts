import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import * as path from 'path';

const GITHUB_API = 'https://api.github.com';

async function fetchWithAuth(context: vscode.ExtensionContext, url: string, init: RequestInit = {}) {
  const fetch = (await import('node-fetch')).default;
  const token = await context.secrets.get('githubToken');
  if (!token) {
    throw new Error('GitHub token not found. Set it using the "coderbro: Set GitHub Token" command.');
  }

  const mergedHeaders: Record<string, string> = {
    ...(init.headers as Record<string, string> || {}),
    Authorization: `token ${token}`,
    'User-Agent': 'VSCode-Gist'
  };

  const res = await fetch(url, {
    ...init,
    headers: mergedHeaders,
    body: init.body as string | undefined
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`GitHub API error: ${res.status} - ${res.statusText}\n${errorBody}`);
  }

  return res;
}

  

// 🔄 Auto-sync helper
export async function updateGistFile(
  context: vscode.ExtensionContext,
  gistId: string,
  filename: string,
  content: string
) {
  await fetchWithAuth(context, `${GITHUB_API}/gists/${gistId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      files: {
        [filename]: { content }
      }
    })
  });
}

// 📂 Explorer fetch
export async function fetchUserGists(context: vscode.ExtensionContext): Promise<Array<{ id: string; description: string; public: boolean }>> {
  const res = await fetchWithAuth(context, `${GITHUB_API}/gists`);
  const data = await res.json() as Array<{ id: string; description: string; public: boolean }>;
  return data;
}

// 📄 Download single Gist by ID
export async function downloadGistFiles(
  context: vscode.ExtensionContext,
  gistId: string,
  destDir: string
): Promise<any> {
  const fetch = (await import('node-fetch')).default;
  const res = await fetch(`${GITHUB_API}/gists/${gistId}`);
  const data = await res.json() as any;
  const files = data.files;

  for (const key in files) {
    const file = files[key];
    const parts = file.filename.split('...');
    const filePath = path.join(destDir, ...parts);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, file.content ?? '', 'utf-8');
  }

  return data;
}
