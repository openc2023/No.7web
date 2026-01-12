
import React, { useState } from 'react';
import { ComponentDefinition, MenuNode } from '../../../types';
import { ChevronDown } from 'lucide-react';

export const PageHeader: React.FC<any> = (props) => {
  const { 
    navLinks, sticky, _brand, layoutPosition, _context,
    transparency = 0.85,
    blur = 20,
    radius = 0,
    bgColor = '#09090b',
    bgImage = '',
    customCss = ''
  } = props;

  const links = navLinks ? navLinks.split(',').map((s: string) => s.trim()) : [];
  const brand = _brand || { title: 'No.7', type: 'icon', iconClass: 'box' };
  const isVertical = layoutPosition === 'left' || layoutPosition === 'right';

  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const headerStyle: React.CSSProperties = {
    backgroundColor: bgColor.startsWith('rgba') ? bgColor : `rgba(${parseInt(bgColor.slice(1,3),16)}, ${parseInt(bgColor.slice(3,5),16)}, ${parseInt(bgColor.slice(5,7),16)}, ${transparency})`,
    backdropFilter: `blur(${blur}px)`,
    WebkitBackdropFilter: `blur(${blur}px)`,
    borderRadius: isVertical ? '0' : `${radius}px`,
    backgroundImage: bgImage ? `url(${bgImage})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    borderBottom: isVertical ? 'none' : '1px solid var(--border)',
    borderRight: isVertical ? '1px solid var(--border)' : 'none',
    height: isVertical ? '100%' : '72px', // Lock height for top header
    display: 'flex',
    alignItems: 'center'
  };

  const renderNavItems = () => {
    return links.map((link: string, i: number) => {
      const findNode = (nodes: MenuNode[]): MenuNode | null => {
          for (const n of nodes) {
              if (n.label.toLowerCase() === link.toLowerCase()) return n;
              if (n.children) { const found = findNode(n.children); if (found) return found; }
          }
          return null;
      };
      
      const node = _context?.menu ? findNode(_context.menu) : null;
      const hasChildren = node && node.children && node.children.length > 0;

      return (
        <li 
          key={i} 
          className="relative group/item"
          onMouseEnter={() => node && setHoveredNodeId(node.id)}
          onMouseLeave={() => setHoveredNodeId(null)}
        >
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              if (node && _context.onSelectPage) _context.onSelectPage(node.id);
            }}
            className="flex items-center gap-1 opacity-60 hover:opacity-100 hover:text-[var(--primary)] transition-all uppercase text-[11px] font-bold py-2 whitespace-nowrap"
          >
            {link}
            {hasChildren && <ChevronDown size={10} className={`opacity-50 transition-transform ${hoveredNodeId === node.id ? 'rotate-180' : ''}`} />}
          </a>

          {hasChildren && (
            <div className={`
                absolute z-[100] transition-all duration-200
                ${isVertical ? 'left-full top-0 ml-2' : 'top-full left-0 pt-1'}
                ${hoveredNodeId === node.id ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-1'}
            `}>
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl p-1.5 min-w-[180px] backdrop-blur-xl">
                    {node.children.map((child: any) => (
                        <button
                            key={child.id}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (_context.onSelectPage) _context.onSelectPage(child.id);
                            }}
                            className="w-full text-left px-3 py-2 text-[11px] hover:bg-white/5 rounded-md transition-colors text-zinc-400 hover:text-white flex items-center justify-between"
                        >
                            {child.label}
                        </button>
                    ))}
                </div>
            </div>
          )}
        </li>
      );
    });
  };

  return (
    <header 
      className={`
         flex z-50 border-[var(--border)]
         ${isVertical ? 'flex-col w-full items-center py-8 px-4 gap-12 overflow-y-auto' : 'w-full flex-row items-center justify-between px-8 py-0'}
         ${sticky ? 'sticky top-0' : 'relative'}
      `}
      style={headerStyle}
    >
       <style dangerouslySetInnerHTML={{ __html: customCss }} />
       <div className={`font-bold text-lg brand flex items-center gap-3 ${isVertical ? 'flex-col text-center' : ''}`}>
          {brand.type === 'image' && brand.imageUrl ? (
              <img src={brand.imageUrl} alt="Logo" className="h-8 w-auto object-contain" />
          ) : (
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-lg shadow-xl shadow-[var(--primary)]/20" style={{ backgroundColor: 'var(--primary)' }}>
                  <span className="font-mono">{brand.iconClass ? brand.iconClass[0].toUpperCase() : '7'}</span>
              </div>
          )}
          <span className="tracking-tighter text-[var(--text)] font-black text-sm uppercase whitespace-nowrap">{brand.title}</span>
       </div>
       <nav className={`${isVertical ? 'w-full' : ''}`}>
          <ul className={`flex tracking-tight text-[var(--text)] ${isVertical ? 'flex-col items-center gap-4' : 'flex-row items-center gap-8'}`}>
             {renderNavItems()}
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
  version: '1.4.0',
  schema: {
    fields: [
      { name: 'navLinks', label: 'Links (Labels)', type: 'string', default: 'Home, Projects, About' },
      { name: 'layoutPosition', label: 'Position', type: 'select', options: ['top', 'left', 'right'], default: 'top' },
      { name: 'sticky', label: 'Sticky', type: 'boolean', default: true },
      { name: 'bgColor', label: 'Background Color', type: 'color', default: '#09090b' },
      { name: 'bgImage', label: 'Background Image', type: 'image', default: '' },
      { name: 'transparency', label: 'Opacity (0-1)', type: 'number', default: 0.85, min: 0, max: 1, step: 0.01 },
      { name: 'blur', label: 'Blur Intensity (px)', type: 'number', default: 20, min: 0, max: 60, step: 1 },
      { name: 'radius', label: 'Corner Radius (px)', type: 'number', default: 0, min: 0, max: 100, step: 1 },
      { name: 'customCss', label: 'Custom CSS (Inject <style>)', type: 'text', default: '' },
      { name: 'rowSpan', label: 'Grid Row Span', type: 'number', default: 1 },
      { name: 'rowStart', label: 'Grid Row Start', type: 'number', default: 1 } 
    ],
    bindings: {}
  },
  render: (p, ctx) => {
      const isVertical = p.layoutPosition === 'left' || p.layoutPosition === 'right';
      const brand = ctx.siteSettings.brand;
      const menu = ctx.menu;
      const transparency = p.transparency ?? 0.85;
      const blur = p.blur ?? 20;
      const radius = p.radius ?? 0;
      const bgColor = p.bgColor || '#09090b';
      const logoHtml = brand.type === 'image' && brand.imageUrl 
            ? `<img src="${brand.imageUrl}" class="h-8 w-auto object-contain"/>` 
            : `<div class="w-9 h-9 rounded-xl flex items-center justify-center text-white text-lg" style="background-color: var(--primary); box-shadow: 0 10px 20px -5px var(--primary);"><span style="font-family: monospace; font-weight: 900;">${brand.iconClass ? brand.iconClass[0].toUpperCase() : '7'}</span></div>`;

      const labels = navLinks => navLinks ? navLinks.split(',').map((s:string) => s.trim()) : [];
      const linksHtml = labels(p.navLinks).map((label: string) => {
          const findNodeByLabel = (nodes: MenuNode[]): MenuNode | null => {
              for (const n of nodes) {
                  if (n.label.toLowerCase() === label.toLowerCase()) return n;
                  if (n.children) { const f = findNodeByLabel(n.children); if (f) return f; }
              }
              return null;
          };
          const node = findNodeByLabel(menu);
          const href = (node && ctx.getHref) ? ctx.getHref(node.id) : '#';
          const isActive = node?.id === ctx.activePageId;
          const hasChildren = node && node.children && node.children.length > 0;
          const dropdownHtml = hasChildren ? `<div class="submenu absolute opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200" style="${isVertical ? 'left: 100%; top: 0; padding-left: 10px;' : 'top: 100%; left: 0; padding-top: 8px;'} min-width: 180px; z-index: 1000;"><div style="background: rgba(18,18,22,0.95); border: 1px solid var(--border); border-radius: 8px; backdrop-filter: blur(20px); padding: 6px; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">${node.children!.map(child => `<a href="${ctx.getHref ? ctx.getHref(child.id) : '#'}" style="display: block; padding: 8px 12px; color: #a1a1aa; font-size: 11px; text-decoration: none; border-radius: 6px; transition: all 0.2s; font-family: sans-serif;" onmouseover="this.style.background='rgba(255,255,255,0.05)'; this.style.color='white'" onmouseout="this.style.background='transparent'; this.style.color='#a1a1aa'">${child.label}</a>`).join('')}</div></div>` : '';
          return `<li class="group relative" style="list-style: none;"><a href="${href}" class="transition-all" style="display: flex; align-items: center; gap: 4px; text-decoration: none; color: var(--text); font-size: 11px; text-transform: uppercase; font-weight: 800; opacity: ${isActive ? '1' : '0.6'}; padding: 8px 0; white-space: nowrap;">${label}${hasChildren ? `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="opacity: 0.5; transition: transform 0.2s;" class="chevron"><path d="m6 9 6 6 6-6"/></svg>` : ''}</a>${dropdownHtml}</li>`;
      }).join('');

      const bgRgb = bgColor.startsWith('#') ? `${parseInt(bgColor.slice(1,3),16)}, ${parseInt(bgColor.slice(3,5),16)}, ${parseInt(bgColor.slice(5,7),16)}` : '9,9,11';

      return `
        <style>
            ${p.customCss || ''}
            header.custom-header {
                background-color: rgba(${bgRgb}, ${transparency});
                backdrop-filter: blur(${blur}px);
                -webkit-backdrop-filter: blur(${blur}px);
                border-radius: ${isVertical ? '0' : radius + 'px'};
                ${p.bgImage ? `background-image: url('${p.bgImage}'); background-size: cover; background-position: center;` : ''}
                border: none;
                border-${isVertical ? 'right' : 'bottom'}: 1px solid var(--border);
                transition: all 0.3s ease;
                width: 100%;
                height: ${isVertical ? '100%' : '72px'};
                display: flex;
            }
            .header-inner {
                width: 100%;
                max-width: 1200px;
                margin: 0 auto;
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 32px;
                height: 100%;
            }
            .group:hover > a { opacity: 1 !important; color: var(--primary) !important; }
            .group:hover .chevron { transform: rotate(180deg); color: var(--primary); }
            @media (max-width: 1024px) {
                .header-inner { padding: 0 24px; }
            }
            @media (max-width: 768px) {
                header.custom-header {
                    flex-direction: row !important;
                    justify-content: space-between !important;
                    padding: 0 !important;
                    height: auto !important;
                    border-right: none !important;
                    border-bottom: 1px solid var(--border) !important;
                }
                .header-inner {
                    flex-direction: row !important;
                    padding: 12px 16px !important;
                    gap: 8px;
                }
                header.custom-header .brand { flex-direction: row !important; gap: 8px !important; margin-bottom: 0 !important; }
                header.custom-header nav { width: auto !important; }
                header.custom-header nav ul { flex-direction: row !important; gap: 16px !important; margin: 0 !important; }
                header.custom-header .submenu { display: none !important; }
                header.custom-header .chevron { display: none !important; }
            }
        </style>
        <header class="custom-header">
            <div class="${isVertical ? 'flex flex-col py-10 items-center gap-12 w-full h-full' : 'header-inner'}">
                <div class="brand flex items-center gap-3 font-black ${isVertical ? 'flex-col text-center' : ''}">
                    ${logoHtml}
                    <span style="letter-spacing: -0.05em; color: var(--text); text-transform: uppercase; font-size: 14px;">${brand.title}</span>
                </div>
                <nav class="${isVertical ? 'w-full' : ''}">
                    <ul class="flex ${isVertical ? 'flex-col gap-4 items-center' : 'flex-row gap-8'}" style="list-style: none; margin: 0; padding: 0;">
                        ${linksHtml}
                    </ul>
                </nav>
            </div>
        </header>`;
  }
};
