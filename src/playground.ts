import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';

const PREVIEW_URI = 'playground-preview';

export async function launchPlayground(context: vscode.ExtensionContext) {
  const folderUri = await vscode.window.showOpenDialog({
    canSelectFolders: true,
    openLabel: 'Open Playground Folder'
  });

  if (!folderUri) {return;}

  const folderPath = folderUri[0].fsPath;
  const html = await tryReadFile(path.join(folderPath, 'index.html'));
  const css = await tryReadFile(path.join(folderPath, 'style.css'));
  const js = await tryReadFile(path.join(folderPath, 'script.js'));
  const md = await tryReadFile(path.join(folderPath, 'README.md'));

  const previewContent = getPlaygroundPreview(html, css, js, md);

  const provider = new (class implements vscode.TextDocumentContentProvider {
    onDidChangeEmitter = new vscode.EventEmitter<vscode.Uri>();
    onDidChange = this.onDidChangeEmitter.event;
    provideTextDocumentContent(): string {
      return previewContent;
    }
  })();

  const uri = vscode.Uri.parse(`${PREVIEW_URI}://authority/preview`);
  vscode.workspace.registerTextDocumentContentProvider(PREVIEW_URI, provider);
  const doc = await vscode.workspace.openTextDocument(uri);
  await vscode.window.showTextDocument(doc, { preview: false });
}

async function tryReadFile(filePath: string): Promise<string> {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch {
    return '';
  }
}

function getPlaygroundPreview(html: string, css: string, js: string, markdown: string): string {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Code Playground</title>
    <style>
      body { font-family: sans-serif; margin: 0; padding: 10px; }
      iframe { width: 100%; height: 400px; border: 1px solid #ccc; }
      pre { background: #1e1e1e; color: white; padding: 1em; overflow-x: auto; }
    </style>
  </head>
  <body>
    <h2>🚀 Live Preview</h2>
    <iframe srcdoc="
      <html>
      <head>
        <style>${css}</style>
        <script src='https://unpkg.com/react@18/umd/react.production.min.js'></script>
        <script src='https://unpkg.com/react-dom@18/umd/react-dom.production.min.js'></script>
        <script src='https://cdn.jsdelivr.net/npm/vue@3'></script>
      </head>
      <body>${html}
        <script>${js}</script>
      </body>
      </html>
    "></iframe>

    ${markdown ? `<h3>📘 Markdown Preview</h3><pre>${markdown}</pre>` : ''}
    <h3>💬 Console Output</h3>
    <pre id="consoleOutput">Console will appear here...</pre>

    <script>
      const log = console.log;
      console.log = (...args) => {
        document.getElementById('consoleOutput').textContent += args.join(' ') + '\\n';
        log(...args);
      };
    </script>
  </body>
  </html>`;
}
