import * as vscode from 'vscode';
import fetch from 'node-fetch';

export async function followGitHubUser(context: vscode.ExtensionContext) {
  const username = await vscode.window.showInputBox({ prompt: 'Enter GitHub username to explore gists' });
  if (!username) {return;}

  const res = await fetch(`https://api.github.com/users/${username}/gists`);
  if (!res.ok) {
    vscode.window.showErrorMessage(`❌ Failed to fetch gists for ${username}`);
    return;
  }

  const gists = await res.json() as { id: string, description: string | null }[];
  const items = gists.map((g) => ({
    label: g.description || '(No description)',
    detail: g.id
  }));

  const selection = await vscode.window.showQuickPick(items, { placeHolder: 'Select a Gist to copy ID' });
  if (selection) {
    await vscode.env.clipboard.writeText(selection.detail!);
    vscode.window.showInformationMessage(`📋 Copied Gist ID: ${selection.detail}`);
  }
}

