
import React from 'react';
import { ComponentDefinition } from '../../../types';
import { COMMON_GRID_FIELDS, getCommonBlockStyle, BlockBackground, renderStaticBackground, getCommonStaticStyleString } from '../common';

export const TechStack: React.FC<any> = (props) => {
  const { title, items } = props;
  const list = items ? items.split(',').map((s: string) => s.trim()) : ['React'];
  
  return (
    <div 
        className="relative p-5 h-full flex flex-col justify-center overflow-hidden"
        style={getCommonBlockStyle(props)}
    >
       <BlockBackground props={props} />

       <div className="relative z-10">
           <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-3">{title}</h3>
           <div className="flex flex-wrap gap-1.5 overflow-hidden">
              {list.map((item: string, i: number) => (
                 <span key={i} className="px-2 py-1 rounded-md bg-[var(--bg)] border border-[var(--border)] text-[10px] font-medium text-[var(--text)] hover:border-[var(--primary)] transition-colors cursor-default whitespace-nowrap">{item}</span>
              ))}
           </div>
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
  },
  render: (p) => {
      const items = p.items ? p.items.split(',') : ['Tech'];
      return `
        <div class="glass-panel relative w-full h-full p-5 flex flex-col justify-center overflow-hidden" style="${getCommonStaticStyleString(p)}">
            ${renderStaticBackground(p)}
            <div class="relative z-10">
                <h3 class="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">${p.title}</h3>
                <div class="flex flex-wrap gap-1.5">
                    ${items.map((i: string) => `<span class="px-2 py-1 rounded-md bg-zinc-900/50 border border-white/10 text-[10px] font-medium whitespace-nowrap">${i.trim()}</span>`).join('')}
                </div>
            </div>
        </div>
      `;
  }
};
