import * as vscode from 'vscode';
import { fetchUserGists } from './github';

export class GistTreeProvider implements vscode.TreeDataProvider<GistItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<GistItem | undefined> = new vscode.EventEmitter();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(private context: vscode.ExtensionContext) {}

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: GistItem): vscode.TreeItem {
    return element;
  }

  async getChildren(): Promise<GistItem[]> {
    const gists = await fetchUserGists(this.context);
    return gists.map(g => new GistItem(g.description || 'No description', g.id));
  }
}

class GistItem extends vscode.TreeItem {
  constructor(label: string, public readonly gistId: string) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.command = {
      command: 'open-gist.openGistById',
      title: 'Open Gist',
      arguments: [gistId]
    };
    this.tooltip = `Gist ID: ${gistId}`;
    this.contextValue = 'gistItem';
  }
}

// ✅ This function registers the sidebar view — EXPORT this!
export function registerGistExplorer(context: vscode.ExtensionContext) {
  const provider = new GistTreeProvider(context);

  const treeView = vscode.window.createTreeView('gistExplorerView', {
    treeDataProvider: provider,
    showCollapseAll: true
  });

  context.subscriptions.push(treeView);

  // Optional command to refresh from other commands
  context.subscriptions.push(
    vscode.commands.registerCommand('open-gist.refreshGistExplorer', () => {
      provider.refresh();
    })
  );
}
