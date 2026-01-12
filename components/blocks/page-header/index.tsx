
import React from 'react';
import { ComponentDefinition } from '../../../types';
import { COMMON_GRID_FIELDS } from '../common';

export const PageHeader: React.FC<any> = ({ navLinks, sticky, _brand, layoutPosition }) => {
  const links = navLinks ? navLinks.split(',').map((s: string) => s.trim()) : [];
  const brand = _brand || { title: 'No.7', type: 'icon', iconClass: 'box' };
  const isVertical = layoutPosition === 'left' || layoutPosition === 'right';

  return (
    <header 
      className={`
         flex backdrop-blur-xl z-50 border-[var(--border)]
         ${isVertical ? 'flex-col w-full h-full border-r items-center py-6 px-2 gap-8' : 'w-full flex-row items-center justify-between px-6 py-4 border-b rounded-b-[var(--radius)]'}
         ${sticky ? 'sticky top-0' : 'relative'}
      `}
      style={{ backgroundColor: 'rgba(9, 9, 11, 0.8)' }}
    >
       <div className={`font-bold text-lg brand flex items-center gap-3 ${isVertical ? 'flex-col text-center' : ''}`}>
          {brand.type === 'image' && brand.imageUrl ? (
              <img src={brand.imageUrl} alt="Logo" className="h-8 w-auto object-contain" />
          ) : (
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm shadow-lg shadow-[var(--primary)]/20" style={{ backgroundColor: 'var(--primary)' }}>
                  <span className="font-mono">{brand.iconClass ? brand.iconClass[0].toUpperCase() : '7'}</span>
              </div>
          )}
          <span className="tracking-tight text-[var(--text)] text-sm">{brand.title}</span>
       </div>
       <nav className={`hidden md:block ${isVertical ? 'w-full' : ''}`}>
          <ul className={`flex gap-6 text-sm font-medium opacity-80 text-[var(--text)] ${isVertical ? 'flex-col items-center gap-4' : 'flex-row items-center'}`}>
             {links.map((link: string, i: number) => (
                <li key={i}><a href="#" className="hover:text-[var(--primary)] transition-colors">{link}</a></li>
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
  version: '1.0.0',
  schema: {
    fields: [
      { name: 'navLinks', label: 'Links', type: 'string', default: 'Home, Projects, About' },
      { name: 'layoutPosition', label: 'Position', type: 'select', options: ['top', 'left', 'right'], default: 'top' },
      { name: 'sticky', label: 'Sticky', type: 'boolean', default: true }
    ],
    bindings: {}
  }
};
