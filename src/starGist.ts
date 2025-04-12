import * as vscode from 'vscode';
import fetch from 'node-fetch';

export async function starUnstarCurrentGist(context: vscode.ExtensionContext) {
  const gistId = await vscode.window.showInputBox({ prompt: 'Enter Gist ID to star/unstar' });
  if (!gistId) {return;}

  const token = await context.secrets.get('githubToken');
  if (!token) {
    vscode.window.showErrorMessage('GitHub token is not set.');
    return;
  }

  const isStarred = await fetch(`https://api.github.com/gists/${gistId}/star`, {
    method: 'GET',
    headers: { Authorization: `token ${token}` }
  }).then(res => res.status === 204);

  const method = isStarred ? 'DELETE' : 'PUT';
  const res = await fetch(`https://api.github.com/gists/${gistId}/star`, {
    method,
    headers: {
      Authorization: `token ${token}`,
      'Content-Length': '0'
    }
  });

  if (res.ok) {
    vscode.window.showInformationMessage(isStarred ? `⭐ Gist ${gistId} unstarred` : `⭐ Gist ${gistId} starred`);
  } else {
    vscode.window.showErrorMessage('Failed to toggle star');
  }
}
