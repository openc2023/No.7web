
import { MenuNode, SiteSettings } from './types';
import { BLOCK_DEFINITIONS } from './lib/blocks';

export const DEFAULT_THEME = {
  '--bg': '#000000',
  '--bg-type': 'color' as const,
  '--bg-image': '',
  '--bg-code': '',
  '--surface': '#141417',
  '--surface-hover': '#1e1e23',
  '--surface-opacity': '0.6',
  '--text': '#ffffff',
  '--muted': '#a1a1aa',
  '--border': 'rgba(255, 255, 255, 0.08)',
  '--primary': '#a78bfa',
  '--radius': '24px',
  '--blur': '20px',
  '--gap': '16px',
  '--cell-size': '140px',
  '--tablet-gap': '12px',
  '--tablet-cell-size': '115px',
  '--mobile-gap': '10px',
  '--mobile-cell-size': '100px',
  '--shadow': '0 0 0 1px rgba(255,255,255,0.05), 0 20px 50px rgba(0,0,0,0.5)',
  '--font-sans': '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, sans-serif'
};

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  brand: {
    type: 'icon',
    iconClass: 'N7', 
    imageUrl: '',
    title: 'No.7 Digital'
  },
  theme: DEFAULT_THEME as any
};

export const MOCK_MENU: MenuNode[] = [
  {
    id: 'home',
    label: 'Index',
    type: 'page',
    filename: 'index.json',
  },
  {
    id: 'work',
    label: 'Portfolio',
    type: 'page',
    filename: 'work.json',
    collapsed: false,
    children: [
        {
            id: 'design-system',
            label: 'Design System',
            type: 'page',
            filename: 'design-system.json'
        },
        {
            id: 'mobile-app',
            label: 'Mobile App',
            type: 'page',
            filename: 'mobile-app.json'
        }
    ]
  },
  {
      id: 'about',
      label: 'About',
      type: 'page',
      filename: 'about.json'
  }
];

export const MOCK_COMPONENTS = BLOCK_DEFINITIONS;
