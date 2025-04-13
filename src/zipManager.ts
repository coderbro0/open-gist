import * as vscode from 'vscode';

export function registerZipCommands(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('open-gist.exportGistAsZip', async () => {
      const gistId = await vscode.window.showInputBox({ prompt: 'Enter Gist ID to export as ZIP' });
      if (!gistId) {return;}

      try {
        const response = await fetch(`https://api.github.com/gists/${gistId}`);
        if (!response.ok) {throw new Error(`Failed to fetch gist: ${response.statusText}`);}

        const gist = await response.json() as { files?: { [key: string]: { content: string } } };
        if (!gist.files || Object.keys(gist.files).length === 0) {
          throw new Error('No files found in the Gist.');
        }

        const AdmZip = (await import('adm-zip')).default;
        const zip = new AdmZip();
        for (const fileName in gist.files) {
          const file = gist.files[fileName];
          if (!file || typeof file.content !== 'string') {
            throw new Error(`Invalid file content for: ${fileName}`);
          }
          zip.addFile(fileName.replace(/\.\.\./g, '/'), Buffer.from(file.content));
        }

        const zipUri = await vscode.window.showSaveDialog({
          defaultUri: vscode.Uri.file(`gist-${gistId}.zip`),
          filters: { Zip: ['zip'] },
        });

        if (zipUri) {
          zip.writeZip(zipUri.fsPath);
          vscode.window.showInformationMessage(`✅ Exported Gist to ${zipUri.fsPath}`);
        }
      } catch (err: any) {
        vscode.window.showErrorMessage(`❌ Export failed: ${err.message || err}`);
      }
    }),

    vscode.commands.registerCommand('open-gist.importGistFromZip', async () => {
      const zipUris = await vscode.window.showOpenDialog({
        canSelectMany: false,
        filters: { Zip: ['zip'] },
        openLabel: 'Import Gist ZIP',
      });

      if (!zipUris?.[0]) {return;}

      try {
        const AdmZip = (await import('adm-zip')).default;
        const zip = new AdmZip(zipUris[0].fsPath);
        const entries = zip.getEntries();

        if (!entries || entries.length === 0) {
          throw new Error('ZIP archive is empty or unreadable.');
        }

        const token = await context.secrets.get('githubToken');
        if (!token) {
          vscode.window.showErrorMessage('🔒 GitHub token is not set.');
          return;
        }

        const files: any = {};
        for (const entry of entries) {
          if (entry.isDirectory) {continue;}
          try {
            const flatName = entry.entryName.replace(/[\\/]/g, '...');
            files[flatName] = { content: zip.readAsText(entry) };
          } catch (readErr) {
            throw new Error(`Failed to read file from ZIP: ${entry.entryName}`);
          }
        }

        const body = {
          description: 'Imported from ZIP',
          public: true,
          files,
        };

        const response = await fetch('https://api.github.com/gists', {
          method: 'POST',
          headers: {
            Authorization: `token ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`GitHub API error: ${errorText}`);
        }

        const result = await response.json();
        vscode.window.showInformationMessage(`✅ Gist created: ${result.id}`);
      } catch (err: any) {
        vscode.window.showErrorMessage(`❌ Import failed: ${err.message || err}`);
      }
    })
  );
}
