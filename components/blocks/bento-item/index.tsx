
import React from 'react';
import { ComponentDefinition } from '../../../types';
import { COMMON_GRID_FIELDS } from '../common';

export const BentoItem: React.FC<any> = ({ title, image }) => {
  return (
    <div 
        className="relative overflow-hidden rounded-[var(--radius)] group cursor-pointer border border-[var(--border)] h-full min-h-[100px] shadow-[var(--shadow)]" 
        style={{ 
            backgroundColor: 'var(--surface)', 
            backdropFilter: 'blur(var(--blur))',
            WebkitBackdropFilter: 'blur(var(--blur))' 
        }}
    >
       <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100" />
       <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
       <div className="absolute bottom-0 left-0 p-4 w-full">
          <h3 className="text-lg font-bold text-white bento-title translate-y-1 group-hover:translate-y-0 transition-transform duration-300 truncate">{title}</h3>
          <div className="h-0.5 w-0 bg-[var(--primary)] group-hover:w-full transition-all duration-500 mt-1"></div>
       </div>
    </div>
  );
};

export const BentoItemDef: ComponentDefinition = {
  name: 'Bento Card',
  slug: 'bento-item',
  category: 'Layout',
  icon: 'layout-grid',
  enabled: true,
  version: '1.0.0',
  schema: {
    fields: [
      { name: 'title', label: 'Title', type: 'string', default: 'Project Name' },
      { name: 'image', label: 'Image', type: 'image', default: 'https://picsum.photos/600/400' },
      ...COMMON_GRID_FIELDS as any
    ],
    bindings: {
      title: { mode: 'text', selector: '.bento-title' },
      image: { mode: 'attr', attr: 'src', selector: 'img' }
    }
  }
};
