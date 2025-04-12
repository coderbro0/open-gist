import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';

export async function openScratchNote(context: vscode.ExtensionContext) {
  const scratchDir = path.join(vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '', 'scratch');
  await fs.mkdir(scratchDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const noteName = `note-${timestamp}.md`;
  const notePath = path.join(scratchDir, noteName);

  await fs.writeFile(notePath, `# Scratch Note - ${timestamp}\n\n`, 'utf-8');

  const doc = await vscode.workspace.openTextDocument(notePath);
  await vscode.window.showTextDocument(doc, { preview: false });

  vscode.window.showInformationMessage(`🧷 Scratch note created: ${noteName}`);
}
