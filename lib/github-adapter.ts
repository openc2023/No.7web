
import { MenuNode, Page, GitHubConfig } from '../types';

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
    // If using a proxy, the proxy might handle auth. 
    // If direct to GitHub, we need the token.
    if (this.config.isProxy) return {};
    return {
      'Authorization': `Bearer ${this.config.token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    };
  }

  /**
   * 1. Load Repository Structure
   * Fetches the git tree recursively and filters for .json files in the content path.
   */
  async loadSiteMap(): Promise<MenuNode[]> {
    try {
      // 1. Get the SHA of the branch head
      const refRes = await fetch(`${this.baseUrl}/repos/${this.config.owner}/${this.config.repo}/git/ref/heads/${this.config.branch}`, {
        headers: this.headers
      });
      
      if (!refRes.ok) throw new Error('Failed to fetch branch ref');
      const refData = await refRes.json();
      const headSha = refData.object.sha;

      // 2. Fetch the recursive tree
      const treeRes = await fetch(`${this.baseUrl}/repos/${this.config.owner}/${this.config.repo}/git/trees/${headSha}?recursive=1`, {
        headers: this.headers
      });

      if (!treeRes.ok) throw new Error('Failed to fetch repository tree');
      const treeData: TreeResponse = await treeRes.json();

      // 3. Filter and Map to Structure
      // We assume pages are stored as JSON files. e.g. "content/home.json"
      const prefix = this.config.pathPrefix.replace(/^\/|\/$/g, ''); // Trim slashes
      
      const files = treeData.tree.filter(node => 
        node.type === 'blob' && 
        node.path.endsWith('.json') && 
        (!prefix || node.path.startsWith(prefix))
      );

      return this.buildMenuFromFiles(files, prefix);

    } catch (error) {
      console.error('GitHub Adapter Error:', error);
      throw error;
    }
  }

  /**
   * Converts flat file paths to nested MenuNode structure
   */
  private buildMenuFromFiles(files: GitHubFile[], prefix: string): MenuNode[] {
    const root: MenuNode[] = [];
    
    files.forEach(file => {
      // Remove prefix and extension to get logical ID/path
      // e.g. "content/pages/about/team.json" -> "about/team"
      const relativePath = prefix ? file.path.slice(prefix.length + 1) : file.path;
      const cleanPath = relativePath.replace('.json', '');
      const parts = cleanPath.split('/');

      let currentLevel = root;

      parts.forEach((part, index) => {
        const isLeaf = index === parts.length - 1;
        const existingNode = currentLevel.find(n => n.id === part || n.label === part); // Simplified ID matching

        if (existingNode) {
          if (!isLeaf) {
            if (!existingNode.children) existingNode.children = [];
            currentLevel = existingNode.children;
          }
        } else {
          // Create new node
          const newNode: MenuNode = {
            id: isLeaf ? cleanPath.replace(/\//g, '-') : part, // Flat ID for pages, name for folders
            label: this.formatLabel(part),
            type: isLeaf ? 'page' : 'folder',
            path: file.path, // Store full repo path
            children: isLeaf ? undefined : [],
            collapsed: false
          };
          
          currentLevel.push(newNode);
          if (!isLeaf) {
            currentLevel = newNode.children!;
          }
        }
      });
    });

    return root;
  }

  private formatLabel(str: string) {
    // "about-us" -> "About Us"
    return str
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * 2. Load Page Content
   */
  async loadPage(path: string): Promise<Page> {
    const res = await fetch(`${this.baseUrl}/repos/${this.config.owner}/${this.config.repo}/contents/${path}?ref=${this.config.branch}`, {
        headers: this.headers
    });

    if (!res.ok) throw new Error(`Failed to load page: ${path}`);
    
    const data = await res.json();
    // GitHub API returns content as base64
    const content = atob(data.content); // Use generic atob for browser
    
    // Check if encoding is utf-8, otherwise decodeURIComponent(escape(content)) handles special chars better
    const decodedContent = decodeURIComponent(escape(content)); 
    
    const pageData = JSON.parse(decodedContent);
    
    return {
        ...pageData,
        _sha: data.sha, // Important for updates
        _path: path
    };
  }

  /**
   * 3. Save Page Content (Commit)
   */
  async savePage(page: Page, message: string = 'Update page content'): Promise<{ newSha: string }> {
     if (!page._path) throw new Error("Cannot save page without a path");

     // Clean internal metadata before saving
     const contentToSave = {
         id: page.id,
         title: page.title,
         blocks: page.blocks
     };

     const contentString = JSON.stringify(contentToSave, null, 2);
     // Encode to Base64 (handling UTF-8)
     const contentBase64 = btoa(unescape(encodeURIComponent(contentString)));

     const body = {
         message: message,
         content: contentBase64,
         sha: page._sha, // If undefined, GitHub creates a new file
         branch: this.config.branch
     };

     const res = await fetch(`${this.baseUrl}/repos/${this.config.owner}/${this.config.repo}/contents/${page._path}`, {
         method: 'PUT',
         headers: this.headers,
         body: JSON.stringify(body)
     });

     if (!res.ok) {
         const err = await res.json();
         throw new Error(`GitHub Commit Failed: ${err.message}`);
     }

     const data = await res.json();
     return { newSha: data.content.sha };
  }
}
