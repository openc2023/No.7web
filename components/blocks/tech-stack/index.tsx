
import React from 'react';
import { ComponentDefinition } from '../../../types';
import { COMMON_GRID_FIELDS } from '../common';

export const TechStack: React.FC<any> = ({ title, items }) => {
  const list = items ? items.split(',').map((s: string) => s.trim()) : ['React'];
  return (
    <div 
        className="p-5 h-full border border-[var(--border)] rounded-[var(--radius)] shadow-[var(--shadow)] flex flex-col justify-center overflow-hidden"
        style={{ 
            backgroundColor: 'var(--surface)', 
            backdropFilter: 'blur(var(--blur))',
            WebkitBackdropFilter: 'blur(var(--blur))' 
        }}
    >
       <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-3">{title}</h3>
       <div className="flex flex-wrap gap-1.5 overflow-hidden">
          {list.map((item: string, i: number) => (
             <span key={i} className="px-2 py-1 rounded-md bg-[var(--bg)] border border-[var(--border)] text-[10px] font-medium text-[var(--text)] hover:border-[var(--primary)] transition-colors cursor-default whitespace-nowrap">{item}</span>
          ))}
       </div>
    </div>
  );
};

export const TechStackDef: ComponentDefinition = {
  name: 'Tech Stack',
  slug: 'tech-stack',
  category: 'Personal',
  icon: 'cpu',
  enabled: true,
  version: '1.0.0',
  schema: {
    fields: [
      { name: 'title', label: 'Title', type: 'string', default: 'Stack' },
      { name: 'items', label: 'Items (comma sep)', type: 'string', default: 'React, TypeScript, Tailwind, Figma' },
      ...COMMON_GRID_FIELDS as any
    ],
    bindings: {}
  }
};
