import * as vscode from 'vscode';
import fetch from 'node-fetch';

export async function forkCurrentGist(context: vscode.ExtensionContext) {
  const gistId = await vscode.window.showInputBox({ prompt: 'Enter Gist ID to fork' });
  if (!gistId) {return;}

  const token = await context.secrets.get('githubToken');
  if (!token) {
    vscode.window.showErrorMessage('GitHub token is not set.');
    return;
  }

  const res = await fetch(`https://api.github.com/gists/${gistId}/forks`, {
    method: 'POST',
    headers: {
      Authorization: `token ${token}`,
      'Content-Type': 'application/json'
    }
  });

  const data = await res.json() as { id: string };
  if (data?.id) {
    vscode.window.showInformationMessage(`🍴 Forked as ${data.id}`);
    vscode.env.clipboard.writeText(data.id);
  } else {
    vscode.window.showErrorMessage('❌ Fork failed');
  }
}
