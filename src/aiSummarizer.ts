import * as vscode from 'vscode';

export async function summarizeActiveFile(context?: vscode.ExtensionContext) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage('❗ No active editor. Open a file to summarize.');
    return;
  }

  const code = editor.document.getText();
  const filename = editor.document.fileName;

  const key = await vscode.window.showInputBox({
    prompt: 'Enter your OpenAI API Key (stored only in memory)',
    password: true,
    ignoreFocusOut: true
  });

  if (!key) {
    vscode.window.showWarningMessage('❌ OpenAI API key is required.');
    return;
  }

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: `Explain this code:\n\n${code}` }]
      })
    });

    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(`OpenAI API Error ${res.status}: ${errorBody}`);
    }

    const json = await res.json() as {
      choices: { message: { content: string } }[]
    };

    const msg = json.choices?.[0]?.message?.content ?? '⚠️ No summary returned by AI.';

    const doc = await vscode.workspace.openTextDocument({
      content: `🧠 Summary for: ${filename}\n\n${msg}`,
      language: 'markdown'
    });

    await vscode.window.showTextDocument(doc, { preview: false });
  } catch (error: any) {
    vscode.window.showErrorMessage(`❌ Failed to fetch summary: ${error.message}`);
  }
}
