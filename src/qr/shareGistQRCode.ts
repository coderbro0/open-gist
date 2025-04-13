// src/qr/shareGistQRCode.ts
import * as vscode from 'vscode';
import fetch from 'node-fetch';
import * as qrcode from 'qrcode';

export async function shareGistViaQRCode() {
  const gistId = await vscode.window.showInputBox({ prompt: 'Enter Gist ID to share via QR' });
  if (!gistId) {return;}

  const res = await fetch(`https://api.github.com/gists/${gistId}`);
  const data = await res.json() as { html_url?: string };

  const url = data.html_url || `https://gist.github.com/${gistId}`;
  const panel = vscode.window.createWebviewPanel(
    'qrCodePanel',
    'QR Code for Gist',
    vscode.ViewColumn.One,
    { enableScripts: true }
  );

  const qrDataURL = await qrcode.toDataURL(url);

  panel.webview.html = `
    <html><body>
      <h2>Scan QR Code to View Gist</h2>
      <img src="${qrDataURL}" />
      <p><a href="${url}" target="_blank">${url}</a></p>
    </body></html>
  `;

  vscode.env.clipboard.writeText(url);
  vscode.window.showInformationMessage(`🔗 Gist URL copied: ${url}`);
}
