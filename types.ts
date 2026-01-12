
// --- Schema & Components ---

export type FieldType = 'string' | 'text' | 'number' | 'boolean' | 'select' | 'color' | 'image' | 'richtext';

export interface SchemaField {
  name: string;
  label: string;
  type: FieldType;
  default?: any;
  options?: string[]; // For 'select'
  description?: string;
}

export interface SchemaBinding {
  selector?: string; // CSS selector to target inside template
  mode: 'text' | 'html' | 'attr' | 'style';
  attr?: string; // If mode is 'attr'
}

export interface ComponentSchema {
  fields: SchemaField[];
  bindings: Record<string, SchemaBinding>;
}

export interface ComponentDefinition {
  name: string;
  slug: string; // Folder name
  category: string;
  icon: string; // FontAwesome suffix or Lucide name
  enabled: boolean;
  version: string;
  schema: ComponentSchema;
  // In a real app, 'template' would be HTML string. Here we might use a render helper or just simulate.
  templateString?: string; 
}

// --- Page & Content ---

export interface Block {
  id: string;
  type: string; // Corresponds to ComponentDefinition.slug
  props: Record<string, any>;
}

export interface Page {
  id: string;
  title: string;
  blocks: Block[];
}

export interface MenuNode {
  id: string;
  label: string;
  type: 'page' | 'folder';
  filename?: string; // If page
  collapsed?: boolean;
  children?: MenuNode[];
}

// --- Global Settings (Theme & Brand) ---

export interface SiteTheme {
  '--bg': string;
  '--surface': string;
  '--text': string;
  '--muted': string;
  '--border': string;
  '--primary': string;
  '--radius': string;
  '--shadow': string;
  '--font-sans': string;
  [key: string]: string;
}

export interface SiteBrand {
  type: 'icon' | 'image';
  iconClass: string; 
  imageUrl: string;
  title: string;
}

export interface SiteSettings {
  brand: SiteBrand;
  theme: SiteTheme;
}

// --- Editor State ---

export interface EditorState {
  menu: MenuNode[];
  pages: Record<string, Page>;
  activePageId: string;
  selectedBlockId: string | null;
}
