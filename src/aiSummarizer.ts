import * as vscode from 'vscode';

export async function summarizeActiveFile(context?: vscode.ExtensionContext) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage('❗ No active editor. Open a file to summarize.');
    return;
  }

  const content = editor.document.getText();
  const filename = editor.document.fileName;

  const config = vscode.workspace.getConfiguration('open-gist');
  let provider = config.get<string>('aiProvider', 'openai');
  const openaiKeySetting = config.get<string>('openaiApiKey');
  const geminiKeySetting = config.get<string>('geminiApiKey');

  let openaiKey = openaiKeySetting;
  let geminiKey = geminiKeySetting;

  try {
    // Ask the user which provider to use
    const picked = await vscode.window.showQuickPick(['OpenAI', 'Gemini'], {
      placeHolder: 'Select AI provider for summarization'
    });
    if (!picked) { return; }
    provider = picked.toLowerCase();

    let summary = '';

    if (provider === 'gemini') {
      if (!geminiKey) {
        geminiKey = await vscode.window.showInputBox({
          prompt: 'Enter your Google Gemini API key (not stored)',
          ignoreFocusOut: true,
          password: true
        });
        if (!geminiKey) {
          return vscode.window.showWarningMessage('⚠️ Gemini API key is required.');
        }
      }
      const model = await vscode.window.showInputBox({
        prompt: 'Enter Gemini model (default: gemini-1.5-pro)',
        value: 'gemini-1.5-pro',
        ignoreFocusOut: true
      });
      summary = await summarizeWithGemini(geminiKey, content, model?.trim() || 'gemini-1.5-pro');
    } else {
      if (!openaiKey) {
        openaiKey = await vscode.window.showInputBox({
          prompt: 'Enter your OpenAI API key (not stored)',
          ignoreFocusOut: true,
          password: true
        });
        if (!openaiKey) {
          return vscode.window.showWarningMessage('⚠️ OpenAI API key is required.');
        }
      }
      const model = await vscode.window.showInputBox({
        prompt: 'Enter OpenAI model (default: gpt-4)',
        value: 'gpt-4',
        ignoreFocusOut: true
      });
      summary = await summarizeWithOpenAI(openaiKey, content, model?.trim() || 'gpt-4');
    }

    const doc = await vscode.workspace.openTextDocument({
      content: `🧠 Summary for: ${filename}\n\n${summary}`,
      language: 'markdown'
    });

    await vscode.window.showTextDocument(doc, { preview: false });
  } catch (error: any) {
    vscode.window.showErrorMessage(`❌ Failed to fetch summary: ${error.message}`);
  }
}

async function summarizeWithOpenAI(apiKey: string, code: string, model: string): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: `Explain this code:\n\n${code}` }]
    })
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`OpenAI API Error ${res.status}: ${errorBody}`);
  }

  const json: any = await res.json();
  const usage = json.usage?.total_tokens;
  const summary = json.choices?.[0]?.message?.content ?? '⚠️ No summary returned by OpenAI.';
  return usage ? `${summary}\n\n🔢 Tokens used: ${usage}` : summary;
}

async function summarizeWithGemini(apiKey: string, code: string, model: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `Explain this code:\n\n${code}` }]
          }
        ]
      })
    }
  );

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Gemini API Error ${res.status}: ${errorBody}`);
  }

  const json: any = await res.json();
  return json.candidates?.[0]?.content?.parts?.[0]?.text ?? '⚠️ No summary returned by Gemini.';
}