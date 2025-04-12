import * as vscode from 'vscode';
import fetch from 'node-fetch';

export async function showGistComments(context: vscode.ExtensionContext) {
  const gistId = await vscode.window.showInputBox({ prompt: 'Enter Gist ID to view comments' });
  if (!gistId) {return;}

  const res = await fetch(`https://api.github.com/gists/${gistId}/comments`);
  const comments = await res.json();

  if (!Array.isArray(comments)) {
    vscode.window.showErrorMessage('❌ Failed to fetch comments');
    return;
  }

  const content = comments.map((c: any) => `👤 ${c.user?.login}:\n${c.body}\n---`).join('\n\n') || 'No comments found.';
  const doc = await vscode.workspace.openTextDocument({ content, language: 'markdown' });
  await vscode.window.showTextDocument(doc, { preview: false });
}
