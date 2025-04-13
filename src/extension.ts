import * as vscode from 'vscode';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs/promises';
import { registerGistExplorer } from './explorerView';
import { summarizeActiveFile } from './aiSummarizer';
import { registerAutoSync } from './gistSync';
import { openScratchNote } from './scratchNotes';
import { pasteImageIntoGist } from './imagePaster';
import { launchPlayground } from './playground';
import { forkCurrentGist } from './forkGist';
import { starUnstarCurrentGist } from './starGist';
import { followGitHubUser } from './followUserGists';
import { shareGistViaQRCode } from './qr/shareGistQRCode';
import { registerZipCommands } from './zipManager';
const GITHUB_API = 'https://api.github.com';

// --- Token Helpers ---
async function getGitHubToken(context: vscode.ExtensionContext): Promise<string | null> {
  const stored = await context.secrets.get('githubToken');
  return stored ?? null;
}

async function setGitHubToken(context: vscode.ExtensionContext) {
  const token = await vscode.window.showInputBox({
    prompt: 'Enter your GitHub Personal Access Token',
    ignoreFocusOut: true,
    password: true
  });
  if (token) {
    const valid = await validateGitHubToken(token);
    if (valid) {
      await context.secrets.store('githubToken', token);
      vscode.window.showInformationMessage(`✅ GitHub token saved for user ${valid}`);
    } else {
      vscode.window.showErrorMessage('❌ Invalid GitHub token. Please check and try again.');
    }
  }
}

async function clearGitHubToken(context: vscode.ExtensionContext) {
  await context.secrets.delete('githubToken');
  vscode.window.showInformationMessage('🧹 GitHub token cleared.');
}

async function validateGitHubToken(token: string): Promise<string | null> {
  const fetch = (await import('node-fetch')).default;
  try {
    const res = await fetch(`${GITHUB_API}/user`, {
      headers: {
        Authorization: `token ${token}`,
        'User-Agent': 'VSCode-Gist'
      }
    });
    if (!res.ok) {return null;}

    const user = await res.json() as { login?: string };
    return user.login ?? null;
  } catch {
    return null;
  }
}

export function activate(context: vscode.ExtensionContext) {
  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('open-gist.summarizeGist', () => summarizeActiveFile(context)),
    vscode.commands.registerCommand('open-gist.setGitHubToken', () => setGitHubToken(context)),
    vscode.commands.registerCommand('open-gist.clearGitHubToken', () => clearGitHubToken(context)),
    vscode.commands.registerCommand('open-gist.openGistById', () => openGistById(context)),
    vscode.commands.registerCommand('open-gist.createGist', () => createGist(context)),
    vscode.commands.registerCommand('open-gist.addFileToGist', () => addFileToGist(context)),
    vscode.commands.registerCommand('open-gist.addFolderToGist', () => addFolderToGist(context)),
    vscode.commands.registerCommand('open-gist.deleteGist', () => deleteGist(context)),
    vscode.commands.registerCommand('open-gist.removeFileFromGist', () => removeFileFromGist(context)),
    vscode.commands.registerCommand('open-gist.exploreGists', () => {
      vscode.commands.executeCommand('workbench.view.extension.gistExplorerContainer');
    }),
    vscode.commands.registerCommand('open-gist.toggleAutoSync', async () => {
      const config = vscode.workspace.getConfiguration();
      const current = config.get<boolean>('open-gist.autoSync', false);
      await config.update('open-gist.autoSync', !current, vscode.ConfigurationTarget.Global);
      vscode.window.showInformationMessage(`🔁 Auto Gist Sync ${!current ? 'enabled' : 'disabled'}`);
    }),

    // New feature commands
    vscode.commands.registerCommand('open-gist.openScratchNote', () => openScratchNote(context)),
    vscode.commands.registerCommand('open-gist.pasteImageToGist', () => pasteImageIntoGist(context)),
    vscode.commands.registerCommand('open-gist.launchPlayground', () => launchPlayground(context)),
    vscode.commands.registerCommand('open-gist.forkCurrentGist', () => forkCurrentGist(context)),
    vscode.commands.registerCommand('open-gist.starUnstarCurrentGist', () => starUnstarCurrentGist(context)),
    vscode.commands.registerCommand('open-gist.followGitHubUser', () => followGitHubUser(context)),
    // Command to share Gist via QR Code
    vscode.commands.registerCommand('open-gist.shareGistViaQRCode', () => shareGistViaQRCode())
  );

  // Register additional features
  registerZipCommands(context);
  registerGistExplorer(context);
  registerAutoSync(context);
}

async function openGistById(context: vscode.ExtensionContext) {
  const gistId = await vscode.window.showInputBox({ prompt: 'Enter GitHub Gist ID' });
  if (!gistId) {return;}

  const destDir = path.join(os.tmpdir(), `gist-${gistId}`);
  await fs.mkdir(destDir, { recursive: true });

  try {
    const fetch = (await import('node-fetch')).default;
    const res = await fetch(`${GITHUB_API}/gists/${gistId}`, {
      headers: { 'User-Agent': 'VSCode-Gist' }
    });

    const data: any = await res.json();
    if (!data.files) {
      vscode.window.showWarningMessage('No files found in this Gist.');
      return;
    }

    for (const key in data.files) {
      const file = data.files[key];
      const parts = file.filename.split('...');
      const filePath = path.join(destDir, ...parts);
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, file.content ?? '', 'utf-8');
    }

    await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(destDir), true);
  } catch (err: any) {
    vscode.window.showErrorMessage(`❌ Failed to fetch Gist: ${err.message}`);
  }
}

async function createGist(context: vscode.ExtensionContext) {
  const token = await getGitHubToken(context);
  if (!token) {
    vscode.window.showErrorMessage('🔒 GitHub token is not set. Run "Set GitHub Token" first.');
    return;
  }

  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage('No active editor. Open a file to create a Gist.');
    return;
  }

  const content = editor.document.getText();
  const filename = path.basename(editor.document.fileName);
  const description = await vscode.window.showInputBox({ prompt: 'Enter Gist Description' });
  const visibility = await vscode.window.showQuickPick(['Public', 'Private'], { placeHolder: 'Gist visibility' });

  const body = {
    description: description || '',
    public: visibility === 'Public',
    files: {
      [filename]: { content }
    }
  };

  const fetch = (await import('node-fetch')).default;
  try {
    const res = await fetch(`${GITHUB_API}/gists`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'VSCode-Gist'
      },
      body: JSON.stringify(body)
    });

    const data: any = await res.json();
    if (data.id && data.html_url) {
      await vscode.env.clipboard.writeText(data.id);
      vscode.window.showInformationMessage(`✅ Gist created!\nID copied: ${data.id}`);
    } else {
      throw new Error(data.message || 'Unknown error creating Gist');
    }
  } catch (err: any) {
    vscode.window.showErrorMessage(`❌ Failed to create Gist: ${err.message}`);
  }
}

async function addFileToGist(context: vscode.ExtensionContext) {
  const token = await getGitHubToken(context);
  if (!token) {return vscode.window.showErrorMessage('Set GitHub Token first.');}

  const gistId = await vscode.window.showInputBox({ prompt: 'Enter Gist ID to add file to' });
  const fileUri = await vscode.window.showOpenDialog({ canSelectMany: false });
  if (!fileUri || !gistId) {return;}

  const fetch = (await import('node-fetch')).default;
  const content = await fs.readFile(fileUri[0].fsPath, 'utf-8');
  const filename = path.basename(fileUri[0].fsPath);

  const body = { files: { [filename]: { content } } };

  await fetch(`${GITHUB_API}/gists/${gistId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `token ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  vscode.window.showInformationMessage(`✅ Added file ${filename} to Gist ${gistId}`);
}

async function addFolderToGist(context: vscode.ExtensionContext) {
  const token = await getGitHubToken(context);
  if (!token) {return vscode.window.showErrorMessage('Set GitHub Token first.');}

  const gistId = await vscode.window.showInputBox({ prompt: 'Enter Gist ID to add folder to' });
  const folderUri = await vscode.window.showOpenDialog({ canSelectFolders: true });
  if (!folderUri || !gistId) {return;}

  const fetch = (await import('node-fetch')).default;
  const filesPayload: any = {};
  const folderPath = folderUri[0].fsPath;

  async function walk(dir: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else {
        const content = await fs.readFile(fullPath, 'utf-8');
        const relative = path.relative(folderPath, fullPath);
        const flattened = relative.replace(/\\/g, '...');
        filesPayload[flattened] = { content };
      }
    }
  }

  await walk(folderPath);

  await fetch(`${GITHUB_API}/gists/${gistId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `token ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ files: filesPayload })
  });

  vscode.window.showInformationMessage(`✅ Folder uploaded to Gist ${gistId}`);
}

async function deleteGist(context: vscode.ExtensionContext) {
  const token = await getGitHubToken(context);
  if (!token) {return vscode.window.showErrorMessage('Set GitHub Token first.');}

  const gistId = await vscode.window.showInputBox({ prompt: 'Enter Gist ID to delete' });
  if (!gistId) {return;}

  const fetch = (await import('node-fetch')).default;
  await fetch(`${GITHUB_API}/gists/${gistId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `token ${token}`
    }
  });

  vscode.window.showInformationMessage(`🗑️ Gist ${gistId} deleted`);
}

async function removeFileFromGist(context: vscode.ExtensionContext) {
  const token = await getGitHubToken(context);
  if (!token) {return vscode.window.showErrorMessage('Set GitHub Token first.');}

  const gistId = await vscode.window.showInputBox({ prompt: 'Enter Gist ID to remove file from' });
  const fileName = await vscode.window.showInputBox({ prompt: 'Enter exact file name to remove (e.g. index.js)' });
  if (!gistId || !fileName) {return;}

  const fetch = (await import('node-fetch')).default;
  const body = { files: { [fileName]: null } };

  await fetch(`${GITHUB_API}/gists/${gistId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `token ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  vscode.window.showInformationMessage(`🗑️ Removed ${fileName} from Gist ${gistId}`);
}

export function deactivate() {}
function activateChatbot(context: vscode.ExtensionContext) {
  throw new Error('Function not implemented.');
}

