
export type FieldType = 'string' | 'text' | 'number' | 'boolean' | 'select' | 'multiselect' | 'color' | 'image' | 'richtext';

export interface SchemaField {
  name: string;
  label: string;
  type: FieldType;
  default?: any;
  options?: string[];
  dynamicOptionsSource?: 'children';
  description?: string;
  min?: number;
  max?: number;
  step?: number;
}

export interface SchemaBinding {
  selector?: string;
  mode: 'text' | 'html' | 'attr' | 'style';
  attr?: string;
}

export interface ComponentSchema {
  fields: SchemaField[];
  bindings: Record<string, SchemaBinding>;
}

export interface StaticRenderContext {
    siteSettings: SiteSettings;
    menu: MenuNode[];
    pages: Record<string, Page>;
    activePageId?: string;
    getHref?: (id: string) => string;
}

export interface ComponentDefinition {
  name: string;
  slug: string;
  category: string;
  icon: string;
  enabled: boolean;
  version: string;
  schema: ComponentSchema;
  render?: (props: any, context: StaticRenderContext) => string; 
}

export interface Block {
  id: string;
  type: string;
  props: Record<string, any>;
}

export interface Page {
  id: string;
  title: string;
  blocks: Block[];
  status?: 'draft' | 'published';
  _sha?: string; 
  _path?: string;
}

export interface MenuNode {
  id: string;
  label: string;
  type: 'page' | 'folder';
  filename?: string;
  collapsed?: boolean;
  children?: MenuNode[];
  path?: string;
}

export type BackgroundType = 'color' | 'image' | 'code';

export interface SiteTheme {
  '--bg': string;
  '--surface': string;
  '--surface-hover': string;
  '--surface-opacity': string;
  '--text': string;
  '--muted': string;
  '--border': string;
  '--primary': string;
  '--radius': string;
  '--shadow': string;
  '--font-sans': string;
  '--bg-type': BackgroundType;
  '--bg-image': string;
  '--bg-code': string;
  '--blur': string;
  '--gap': string;
  '--cell-size': string;
  // Responsive variables
  '--tablet-gap'?: string;
  '--tablet-cell-size'?: string;
  '--mobile-gap'?: string;
  '--mobile-cell-size'?: string;
  [key: string]: string | undefined;
}

export interface SiteBrand {
  type: 'icon' | 'image';
  iconClass: string; 
  imageUrl: string;
  title: string;
}

export interface GitHubConfig {
  owner: string;
  repo: string;
  branch: string;
  token: string;
  pathPrefix: string;
  isProxy?: boolean;
  proxyUrl?: string;
}

export interface SiteSettings {
  brand: SiteBrand;
  theme: SiteTheme;
  github?: GitHubConfig;
}
