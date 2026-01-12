
import React from 'react';
import { ComponentDefinition, MenuNode } from '../../../types';

// Helper to find filenames for links in static export
const getStaticHref = (nodeId: string, menu: MenuNode[]) => {
    if (nodeId === 'home') return 'index.html';
    const findNode = (nodes: MenuNode[]): MenuNode | null => {
        for (const n of nodes) {
            if (n.id === nodeId) return n;
            if (n.children) {
                const found = findNode(n.children);
                if (found) return found;
            }
        }
        return null;
    };
    const node = findNode(menu);
    if (!node) return '#';
    const safeName = node.label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return `${safeName}.html`;
};

export const PageHeader: React.FC<any> = ({ navLinks, sticky, _brand, layoutPosition, _context }) => {
  const links = navLinks ? navLinks.split(',').map((s: string) => s.trim()) : [];
  const brand = _brand || { title: 'No.7', type: 'icon', iconClass: 'box' };
  const isVertical = layoutPosition === 'left' || layoutPosition === 'right';

  // In the editor, _context might be available. We can use it to find the real target ID if labels match.
  // But for the editor UI, we usually just show the label.
  
  return (
    <header 
      className={`
         flex backdrop-blur-xl z-50 border-[var(--border)]
         ${isVertical ? 'flex-col w-full h-full border-r items-center py-8 px-4 gap-12' : 'w-full flex-row items-center justify-between px-8 py-4 border-b rounded-b-[var(--radius)]'}
         ${sticky ? 'sticky top-0' : 'relative'}
      `}
      style={{ backgroundColor: 'rgba(9, 9, 11, 0.85)' }}
    >
       <div className={`font-bold text-lg brand flex items-center gap-3 ${isVertical ? 'flex-col text-center' : ''}`}>
          {brand.type === 'image' && brand.imageUrl ? (
              <img src={brand.imageUrl} alt="Logo" className="h-10 w-auto object-contain" />
          ) : (
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg shadow-xl shadow-[var(--primary)]/20" style={{ backgroundColor: 'var(--primary)' }}>
                  <span className="font-mono">{brand.iconClass ? brand.iconClass[0].toUpperCase() : '7'}</span>
              </div>
          )}
          <span className="tracking-tighter text-[var(--text)] font-black text-base uppercase">{brand.title}</span>
       </div>
       <nav className={`${isVertical ? 'w-full' : ''}`}>
          <ul className={`flex text-sm font-bold tracking-tight text-[var(--text)] ${isVertical ? 'flex-col items-center gap-6' : 'flex-row items-center gap-8'}`}>
             {links.map((link: string, i: number) => (
                <li key={i}>
                    <a 
                        href="#" 
                        onClick={(e) => {
                            e.preventDefault();
                            // If we have context, try to navigate in editor
                            const target = _context?.menu.find((n: any) => n.label === link);
                            if (target && _context.onSelectPage) _context.onSelectPage(target.id);
                        }}
                        className="opacity-60 hover:opacity-100 hover:text-[var(--primary)] transition-all uppercase text-[11px]"
                    >
                        {link}
                    </a>
                </li>
             ))}
          </ul>
       </nav>
    </header>
  );
};

export const PageHeaderDef: ComponentDefinition = {
  name: 'Navigation',
  slug: 'page-header',
  category: 'Layout',
  icon: 'layout', 
  enabled: true,
  version: '1.2.0',
  schema: {
    fields: [
      { name: 'navLinks', label: 'Links (Labels)', type: 'string', default: 'Home, Projects, About' },
      { name: 'layoutPosition', label: 'Position', type: 'select', options: ['top', 'left', 'right'], default: 'top' },
      { name: 'sticky', label: 'Sticky', type: 'boolean', default: true }
    ],
    bindings: {}
  },
  render: (p, ctx) => {
      const isVertical = p.layoutPosition === 'left' || p.layoutPosition === 'right';
      const brand = ctx.siteSettings.brand;
      const menu = ctx.menu;
      
      const logoHtml = brand.type === 'image' && brand.imageUrl 
            ? `<img src="${brand.imageUrl}" class="h-10 w-auto object-contain"/>` 
            : `<div class="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg" style="background-color: var(--primary); box-shadow: 0 10px 20px -5px var(--primary);"><span style="font-family: monospace; font-weight: 900;">${brand.iconClass ? brand.iconClass[0].toUpperCase() : '7'}</span></div>`;

      // Match labels in navLinks with actual menu items to get correct hrefs
      const labels = p.navLinks ? p.navLinks.split(',').map((s:string) => s.trim()) : [];
      
      const linksHtml = labels.map((label: string) => {
          const findNodeByLabel = (nodes: MenuNode[]): MenuNode | null => {
              for (const n of nodes) {
                  if (n.label.toLowerCase() === label.toLowerCase()) return n;
                  if (n.children) { const f = findNodeByLabel(n.children); if (f) return f; }
              }
              return null;
          };
          const node = findNodeByLabel(menu);
          const href = node ? getStaticHref(node.id, menu) : '#';
          const isActive = node?.id === ctx.activePageId;

          return `<li>
            <a href="${href}" 
               class="transition-all hover:text-purple-400" 
               style="text-decoration: none; color: var(--text); font-size: 11px; text-transform: uppercase; font-weight: 800; opacity: ${isActive ? '1' : '0.6'}">
               ${label}
            </a>
          </li>`;
      }).join('');

      return `
        <header class="glass-panel w-full h-full flex ${isVertical ? 'flex-col py-10 items-center gap-12' : 'flex-row items-center justify-between px-8'}" style="background-color: rgba(9,9,11,0.85); border: none; border-${isVertical ? 'right' : 'bottom'}: 1px solid var(--border); border-radius: 0;">
            <div class="flex items-center gap-3 font-black ${isVertical ? 'flex-col text-center' : ''}">
                ${logoHtml}
                <span style="letter-spacing: -0.05em; color: var(--text); text-transform: uppercase; font-size: 14px;">${brand.title}</span>
            </div>
            <nav>
                <ul class="flex ${isVertical ? 'flex-col gap-6 items-center' : 'flex-row gap-8'}" style="list-style: none; margin: 0; padding: 0;">
                    ${linksHtml}
                </ul>
            </nav>
        </header>
      `;
  }
};
