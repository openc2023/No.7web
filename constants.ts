
import { MenuNode, SiteSettings } from './types';
import { BLOCK_DEFINITIONS } from './lib/blocks';

export const DEFAULT_THEME = {
  '--bg': '#09090b', // Zinc-950
  '--bg-image': '', // New: Background Image URL
  '--surface': 'rgba(24, 24, 27, 0.3)', // Zinc-900 with opacity for glass
  '--surface-hover': 'rgba(39, 39, 42, 0.5)', // Zinc-800
  '--text': '#fafafa', // Zinc-50
  '--muted': '#a1a1aa', // Zinc-400
  '--border': 'rgba(255, 255, 255, 0.1)',
  '--primary': '#8b5cf6', // Violet-500
  '--radius': '6px', // Rounded corners
  '--blur': '10px', // Glassmorphism blur
  '--shadow': '0 0 0 1px rgba(255,255,255,0.05), 0 8px 30px rgba(0,0,0,0.5)',
  '--font-sans': '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, sans-serif'
};

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  brand: {
    type: 'icon',
    iconClass: 'layers', 
    imageUrl: '',
    title: 'Portfolio'
  },
  theme: DEFAULT_THEME
};

export const MOCK_MENU: MenuNode[] = [
  {
    id: 'home',
    label: 'Home',
    type: 'page',
    filename: 'index.json',
  },
  {
    id: 'projects',
    label: 'Projects',
    type: 'page',
    filename: 'projects.json',
    collapsed: false,
    children: [
        {
            id: 'saas-dashboard',
            label: 'SaaS Dashboard',
            type: 'page',
            filename: 'saas-dashboard.json'
        },
        {
            id: 'ecommerce',
            label: 'E-commerce',
            type: 'page',
            filename: 'ecommerce.json'
        }
    ]
  }
];

// Re-export the definitions from the new library source
export const MOCK_COMPONENTS = BLOCK_DEFINITIONS;
