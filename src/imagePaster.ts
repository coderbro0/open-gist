import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';

export async function pasteImageIntoGist(context: vscode.ExtensionContext) {
  const clipboardImage = await vscode.env.clipboard.readText();
  if (!clipboardImage.startsWith('data:image')) {
    vscode.window.showErrorMessage('❌ No image data in clipboard.');
    return;
  }

  const fileName = `image-${Date.now()}.png`;
  const useBase64 = await vscode.window.showQuickPick(['Base64 (inline)', 'Upload to Gist'], {
    placeHolder: 'Paste image as:'
  });

  if (!useBase64) {return;}

  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage('No active editor to paste image reference.');
    return;
  }

  if (useBase64.startsWith('Base64')) {
    editor.insertSnippet(new vscode.SnippetString(`![pasted image](data:image/png;base64,${clipboardImage.split(',')[1]})`));
  } else {
    const folder = path.join(vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '', 'images');
    await fs.mkdir(folder, { recursive: true });
    const filePath = path.join(folder, fileName);
    const imageData = Buffer.from(clipboardImage.split(',')[1], 'base64');
    await fs.writeFile(filePath, imageData);
    editor.insertSnippet(new vscode.SnippetString(`![${fileName}](images/${fileName})`));
    vscode.window.showInformationMessage(`🖼️ Image saved at ${filePath}`);
  }
}
