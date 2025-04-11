import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';
import { updateGistFile } from './github';

let autoSyncEnabled = true;
let syncStatusBarItem: vscode.StatusBarItem;

export function registerAutoSync(context: vscode.ExtensionContext) {
  // Listen for file saves
  vscode.workspace.onDidSaveTextDocument(async (doc) => {
    if (!autoSyncEnabled) {return;}

    const filePath = doc.fileName;
    const match = filePath.match(/gist-(\w+)/);
    if (!match) {return;}

    const gistId = match[1];
    const content = doc.getText();
    const filename = path.basename(filePath);

    await updateGistFile(context, gistId, filename, content);
    vscode.window.setStatusBarMessage(`✅ Synced "${filename}" to Gist`, 2000);
  });

  // Register toggle command
  context.subscriptions.push(
    vscode.commands.registerCommand('open-gist.toggleAutoSync', () => {
      autoSyncEnabled = !autoSyncEnabled;
      updateStatusBar();
      vscode.window.showInformationMessage(`📡 Auto Sync is now ${autoSyncEnabled ? 'ON' : 'OFF'}`);
    })
  );

  // Create status bar item
  syncStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  syncStatusBarItem.command = 'open-gist.toggleAutoSync';
  context.subscriptions.push(syncStatusBarItem);
  updateStatusBar();
}

function updateStatusBar() {
  syncStatusBarItem.text = `$(sync) Auto Sync: ${autoSyncEnabled ? 'ON' : 'OFF'}`;
  syncStatusBarItem.tooltip = 'Click to toggle Auto Sync for Gists';
  syncStatusBarItem.show();
}
