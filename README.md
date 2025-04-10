# 📂 Open Gist Folder by ID — VS Code Extension

[![VS Code Marketplace](https://img.shields.io/visual-studio-marketplace/v/coderbro.open-gist.svg?label=Open%20in%20VS%20Code&logo=visualstudiocode)](https://marketplace.visualstudio.com/items?itemName=coderbro.open-gist)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/coderbro.open-gist.svg)](https://marketplace.visualstudio.com/items?itemName=coderbro.open-gist)
[![GitHub](https://img.shields.io/badge/@coderbro-%20Follow-blue?logo=github)](https://github.com/coderbr0)

---

### ✨ Features

✅ Open a GitHub Gist **as a folder**, preserving nested structure using filenames  
✅ Create public or private Gists directly from any file  
✅ Add individual files or full folders to an existing Gist  
✅ Delete specific files or the entire Gist  
✅ Flatten folder paths using `...` so Gist can simulate subfolders  
✅ Built-in GitHub token authentication with validation  
✅ Tokens are stored securely using VS Code's SecretStorage  
✅ Works behind firewalls and proxies (no browser dependency)

---

## 🔐 Setting Up Your GitHub Token

Creating or editing Gists requires authentication. Follow these steps to create and add your **GitHub Personal Access Token**:

### 🔑 How to Create a GitHub Token

1. Go to [https://github.com/settings/tokens](https://github.com/settings/tokens)
2. Click **"Fine-grained tokens"** → then **"Generate new token"**
3. Name your token (e.g., `VS Code Gist`)
4. Select:
   - **Expiration**: Choose 30 days or "No expiration"
   - **Repository access**: Set to "Only select repositories" or "All repositories" (doesn't matter for gists)
   - **Permissions**:
     - Under **Gists**, check ✅ `Read and write`
5. Click **Generate token**
6. **Copy the token** (you won’t see it again!)

### 🚀 Adding Token to Extension

1. In VS Code, press `F1`
2. Run `coderbro: Set GitHub Token`
3. Paste the token you created

🔐 Your token will be securely saved using VS Code’s internal Secret Storage.

To remove it later:  
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

- Open a file
- Run: `coderbro: Create New Gist`
- Enter a description and choose visibility (Public or Private)
- Gist is created, and its ID is copied to your clipboard

---

### 📁 Upload a Folder to a Gist

- Run: `coderbro: Upload Folder to Gist`
- Select a folder from your system
- Enter the target Gist ID  
All files will be uploaded using `...` to simulate folder paths.

---

### ➕ Add File to Gist

- Run: `coderbro: Add File to Gist`
- Select a file → Enter Gist ID → File is added

---

### ➖ Remove File from Gist

- Run: `coderbro: Remove File from Gist`
- Enter Gist ID and the exact file name to remove (e.g., `src...index.js`)

---

### 🗑️ Delete a Gist

- Run: `coderbro: Delete Gist`
- Enter Gist ID → It will be permanently deleted

---

## 🎬 Tutorials (Coming Soon)

- 📹 How to create and set a GitHub token  
- 📹 How to upload a folder to a Gist  
- 📹 How to use all commands  

> Video links will be added here once available

---

<p align="center">
  <img src="https://raw.githubusercontent.com/coderbro0/open-gist/main/logo.png" alt="coderbro logo" width="120" style="border-radius: 20px;">
</p>

## 👨‍💻 Maintained by [@coderbro](https://github.com/coderbr0)

- 🧠 Love the tool? Star it on GitHub!  
- 💬 Issues, suggestions, or feature requests welcome.

---

## 📄 License

MIT © [coderbro](https://github.com/coderbr0)
