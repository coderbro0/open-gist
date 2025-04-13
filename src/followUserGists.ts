import * as vscode from 'vscode';
import fetch from 'node-fetch';

const FOLLOWED_USERS_KEY = 'followedGitHubUsers';

export async function followGitHubUser(context: vscode.ExtensionContext) {
  const username = await vscode.window.showInputBox({
    prompt: 'Enter GitHub username to follow and explore their public Gists'
  });

  if (!username) {return;}

  const res = await fetch(`https://api.github.com/users/${username}/gists`);
  if (!res.ok) {
    vscode.window.showErrorMessage(`❌ Failed to fetch gists for ${username}`);
    return;
  }

  const gists = (await res.json()) as { id: string; description: string | null }[];

  if (!gists.length) {
    vscode.window.showInformationMessage(`📭 No public gists found for ${username}`);
    return;
  }

  const items = gists.map((g) => ({
    label: g.description || '(No description)',
    detail: g.id
  }));

  const selection = await vscode.window.showQuickPick(items, {
    placeHolder: `Select a Gist from ${username} to copy its ID`
  });

  if (selection) {
    await vscode.env.clipboard.writeText(selection.detail!);
    vscode.window.showInformationMessage(`📋 Copied Gist ID: ${selection.detail}`);
  }

  // Store followed user persistently
  const existing = context.globalState.get<string[]>(FOLLOWED_USERS_KEY) || [];
  if (!existing.includes(username)) {
    await context.globalState.update(FOLLOWED_USERS_KEY, [...existing, username]);
    vscode.window.showInformationMessage(`👥 Now following ${username}`);
  } else {
    vscode.window.showInformationMessage(`✅ Already following ${username}`);
  }
}

export function getFollowedUsers(context: vscode.ExtensionContext): string[] {
  return context.globalState.get<string[]>(FOLLOWED_USERS_KEY) || [];
}

export async function unfollowGitHubUser(context: vscode.ExtensionContext) {
  const followed = getFollowedUsers(context);
  if (followed.length === 0) {
    vscode.window.showInformationMessage('You are not following any GitHub users.');
    return;
  }

  const toUnfollow = await vscode.window.showQuickPick(followed, {
    placeHolder: 'Select a user to unfollow'
  });

  if (toUnfollow) {
    const updated = followed.filter((u) => u !== toUnfollow);
    await context.globalState.update(FOLLOWED_USERS_KEY, updated);
    vscode.window.showInformationMessage(`🚫 Unfollowed ${toUnfollow}`);
  }
}
