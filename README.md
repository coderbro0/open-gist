# 📂 Open Gist Folder by ID — VS Code Extension

[![VS Code Marketplace](https://img.shields.io/visual-studio-marketplace/v/coderbro.open-gist.svg?label=Open%20in%20VS%20Code&logo=visualstudiocode)](https://marketplace.visualstudio.com/items?itemName=coderbro.open-gist)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/coderbro.open-gist.svg)](https://marketplace.visualstudio.com/items?itemName=coderbro.open-gist)
[![GitHub](https://img.shields.io/badge/@coderbro-%20Follow-blue?logo=github)](https://github.com/coderbro0)

> 📦 **Version**: `v0.0.2` – Now with AI Summarizer, Gist Explorer Sidebar, Auto-Sync and Enhanced UI!

---

## ✨ Features

✅ Open a GitHub Gist **as a folder**, preserving nested structure using filenames  
✅ Create public or private Gists directly from any file  
✅ Add individual files or full folders to an existing Gist  
✅ Delete specific files or the entire Gist  
✅ Flatten folder paths using `...` so Gist can simulate subfolders  
✅ Built-in GitHub token authentication with validation  
✅ Tokens are stored securely using VS Code's SecretStorage  
✅ Works behind firewalls and proxies (no browser dependency)

---

### 🆕 v0.0.2 — New Advanced Features

| Feature | Description |
|--------|-------------|
| 📂 **Gist Explorer Sidebar View** | Browse and manage all your Gists from the sidebar |
| 🔁 **Auto-Sync on Save** | Automatically sync files to Gist whenever you save |
| 🤖 **AI-Powered Gist Summarizer** | Summarize any file using OpenAI |
| 🧩 **Seamless UI Integration** | Deep integration with status bar, error prompts, and live feedback |

---

## 🔐 Setting Up Your GitHub Token

Creating or editing Gists requires authentication. Follow these steps to create and add your **GitHub Personal Access Token**:

### 🔑 How to Create a GitHub Token

1. Go to [https://github.com/settings/tokens](https://github.com/settings/tokens)
2. Click **"Fine-grained tokens"** → then **"Generate new token"**
3. Name your token (e.g., `VS Code Gist`)
4. Set:
   - Expiration: Choose 30 days or "No expiration"
   - Repository access: Doesn't matter for Gists
   - Permissions:
     - Under **Gists**, check ✅ `Read and write`
5. Click **Generate token**
6. **Copy the token** — you won’t see it again!

### 🚀 Adding Token to Extension

1. In VS Code, press `F1`
2. Run `coderbro: Set GitHub Token`
3. Paste the token you created

🔐 Your token is securely saved via VS Code’s SecretStorage.

To remove it:  
`F1` → `coderbro: Clear GitHub Token`

---

## 🛠️ Usage Guide

### 📂 Open Gist by ID

- Run: `coderbro: Open Gist by ID`
- Paste your Gist ID (e.g., `abcd12345`)
- It will open as a **folder in VS Code**

➡️ Supports folder-like files: `src...main.cpp` → `src/main.cpp`

---

### ✏️ Create a New Gist

- Open any file
- Run: `coderbro: Create New Gist`
- Enter description + choose Public/Private
- Gist is created and ID is copied to your clipboard

---

### 📁 Upload a Folder to a Gist

- Run: `coderbro: Upload Folder to Gist`
- Select a folder from your system
- Enter the target Gist ID  
All files will be uploaded using `...` to simulate folder paths

---

### ➕ Add File to Gist

- Run: `coderbro: Add File to Gist`
- Select file → Enter Gist ID → Done!

---

### ➖ Remove File from Gist

- Run: `coderbro: Remove File from Gist`
- Enter Gist ID and file name (e.g., `src...index.js`)

---

### 🗑️ Delete a Gist

- Run: `coderbro: Delete Gist`
- Enter Gist ID → Gist is permanently deleted

---

## 🚀 Advanced Features (v0.0.2)

### 📂 Gist Explorer Sidebar View

Browse, preview, and interact with your Gists visually.

- Click the **Open Gist icon** in the sidebar
- Gists are fetched and displayed in a tree view
- Right-click to:
  - Open in workspace
  - Delete Gist
  - View file contents

📦 Command: `open-gist.exploreGists`

---

### 🔁 Auto-Sync Support (Live Save)

Any file opened from a Gist will automatically sync on save.

- Modify a file in VS Code
- Press `Ctrl+S` / `Cmd+S`
- ✅ It instantly updates the Gist content online!

⚙️ To toggle this feature:
- Run: `F1` → `Open Settings (UI)`
- Search: `open-gist.autoSync`
- Enable or disable as needed

---

### 🤖 AI-Powered Gist Summarizer

Let OpenAI instantly summarize any file’s contents.

- Open a file (any code or text)
- Run: `coderbro: Summarize Gist with AI`
- View summary in the output window

📦 Requires a working OpenAI API key stored in your environment (or future setting)

---

### 🧩 Seamless UI Integration

- ✅ Live feedback in the **VS Code status bar**
- 🔔 Error messages via `vscode.window.showErrorMessage`
- 📝 Auto clipboard copy on Gist creation
- 🎯 Smart UI behaviors (e.g., open folder after Gist upload)

---

## 🎬 Tutorials (Coming Soon)

- 📹 How to create and set a GitHub token  
- 📹 How to upload a folder to a Gist  
- 📹 How to use the AI summarizer and auto-sync  

> 📺 Video links will appear here once available

---

<p>
  <img src="logo.png" alt="Open Gist Logo" width="80" style="border-radius: 50% !important; float: left !important; margin-right: 10px !important;" />
</p>

## 👨‍💻 Maintained by [@coderbro](https://github.com/coderbro0)

- 🧠 Love the tool? Star it on GitHub!  
- 💬 Issues, suggestions, or feature requests welcome.

---

## 📄 License

Apache License 2.0 © [coderbro](https://github.com/coderbro0)
