
import { MenuNode, Page, GitHubConfig, SiteSettings } from '../types';

interface GitHubFile {
  path: string;
  mode: string;
  type: 'blob' | 'tree';
  sha: string;
  size?: number;
  url?: string;
}

interface TreeResponse {
  sha: string;
  url: string;
  tree: GitHubFile[];
  truncated: boolean;
}

export class GitHubAdapter {
  private config: GitHubConfig;
  private baseUrl: string;

  constructor(config: GitHubConfig) {
    this.config = config;
    this.baseUrl = config.isProxy && config.proxyUrl 
      ? config.proxyUrl 
      : 'https://api.github.com';
  }

  private get headers() {
    if (this.config.isProxy) return {};
    return {
      'Authorization': `Bearer ${this.config.token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    };
  }

  async loadSiteMap(): Promise<MenuNode[]> {
    try {
      const refRes = await fetch(`${this.baseUrl}/repos/${this.config.owner}/${this.config.repo}/git/ref/heads/${this.config.branch}`, {
        headers: this.headers
      });
      
      if (!refRes.ok) throw new Error('Failed to fetch branch ref. Check your Token and Repo name.');
      const refData = await refRes.json();
      const headSha = refData.object.sha;

      const treeRes = await fetch(`${this.baseUrl}/repos/${this.config.owner}/${this.config.repo}/git/trees/${headSha}?recursive=1`, {
        headers: this.headers
      });

      if (!treeRes.ok) throw new Error('Failed to fetch repository tree');
      const treeData: TreeResponse = await treeRes.json();

      const prefix = this.config.pathPrefix.replace(/^\/|\/$/g, '');
      
      const files = treeData.tree.filter(node => 
        node.type === 'blob' && 
        node.path.endsWith('.json') && 
        (!prefix || node.path.startsWith(prefix)) &&
        !node.path.endsWith('config.json') // Exclude config from menu tree
      );

      return this.buildMenuFromFiles(files, prefix);
    } catch (error) {
      console.error('GitHub Adapter Error:', error);
      throw error;
    }
  }

  private buildMenuFromFiles(files: GitHubFile[], prefix: string): MenuNode[] {
    const root: MenuNode[] = [];
    files.forEach(file => {
      const relativePath = prefix ? file.path.slice(prefix.length + 1) : file.path;
      const cleanPath = relativePath.replace('.json', '');
      const parts = cleanPath.split('/');
      let currentLevel = root;

      parts.forEach((part, index) => {
        const isLeaf = index === parts.length - 1;
        const existingNode = currentLevel.find(n => n.id === part || n.label === part);

        if (existingNode) {
          if (!isLeaf) {
            if (!existingNode.children) existingNode.children = [];
            currentLevel = existingNode.children;
          }
        } else {
          const newNode: MenuNode = {
            id: isLeaf ? cleanPath.replace(/\//g, '-') : part,
            label: this.formatLabel(part),
            type: isLeaf ? 'page' : 'folder',
            path: file.path,
            children: isLeaf ? undefined : [],
            collapsed: false
          };
          currentLevel.push(newNode);
          if (!isLeaf) currentLevel = newNode.children!;
        }
      });
    });
    return root;
  }

  private formatLabel(str: string) {
    return str.split(/[-_]/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  async loadPage(path: string): Promise<Page> {
    const res = await fetch(`${this.baseUrl}/repos/${this.config.owner}/${this.config.repo}/contents/${path}?ref=${this.config.branch}`, {
        headers: this.headers
    });
    if (!res.ok) throw new Error(`Failed to load page: ${path}`);
    const data = await res.json();
    const content = decodeURIComponent(escape(atob(data.content))); 
    const pageData = JSON.parse(content);
    return { ...pageData, _sha: data.sha, _path: path };
  }

  async loadConfig(): Promise<{ settings: Partial<SiteSettings>, menu?: MenuNode[] } | null> {
    try {
        const path = `${this.config.pathPrefix}/config.json`.replace(/^\/|\/\/+/g, '/');
        const res = await fetch(`${this.baseUrl}/repos/${this.config.owner}/${this.config.repo}/contents/${path}?ref=${this.config.branch}`, {
            headers: this.headers
        });
        if (!res.ok) return null;
        const data = await res.json();
        const content = decodeURIComponent(escape(atob(data.content)));
        return JSON.parse(content);
    } catch (e) {
        return null;
    }
  }

  async saveFile(path: string, content: any, message: string, sha?: string): Promise<string> {
    const contentString = JSON.stringify(content, null, 2);
    const contentBase64 = btoa(unescape(encodeURIComponent(contentString)));
    const body = { message, content: contentBase64, sha, branch: this.config.branch };

    const res = await fetch(`${this.baseUrl}/repos/${this.config.owner}/${this.config.repo}/contents/${path}`, {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify(body)
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Commit failed');
    }
    const data = await res.json();
    return data.content.sha;
  }

  async savePage(page: Page, message: string = 'Update page'): Promise<{ newSha: string }> {
     if (!page._path) throw new Error("No path");
     const content = { id: page.id, title: page.title, blocks: page.blocks };
     const newSha = await this.saveFile(page._path, content, message, page._sha);
     return { newSha };
  }
}
