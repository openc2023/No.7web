
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ComponentDefinition } from '../../../types';
import { getIcon } from '../../../lib/icons';
import { COMMON_GRID_FIELDS } from '../common';

export const LinkCard: React.FC<any> = ({ label, sublabel, url, icon }) => {
  return (
    <a 
        href={url} 
        onClick={e => e.preventDefault()} 
        className="flex flex-col justify-between p-4 h-full border border-[var(--border)] rounded-[var(--radius)] hover:bg-[var(--surface-hover)] hover:border-[var(--primary)] transition-all group shadow-[var(--shadow)] overflow-hidden"
        style={{ 
            backgroundColor: 'var(--surface)', 
            backdropFilter: 'blur(var(--blur))',
            WebkitBackdropFilter: 'blur(var(--blur))' 
        }}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="p-2 rounded-xl bg-[var(--bg)] text-[var(--primary)] border border-[var(--border)] group-hover:scale-110 transition-transform">{getIcon(icon || 'globe', 18)}</div>
        <ArrowRight size={16} className="text-[var(--muted)] -rotate-45 group-hover:rotate-0 transition-transform" />
      </div>
      <div>
         <div className="font-bold text-sm link-title text-[var(--text)] truncate">{label}</div>
         <div className="text-[10px] opacity-50 link-sub text-[var(--text)] truncate">{sublabel}</div>
      </div>
    </a>
  );
};

export const LinkCardDef: ComponentDefinition = {
  name: 'Link Card',
  slug: 'link-card',
  category: 'Personal',
  icon: 'link',
  enabled: true,
  version: '1.0.0',
  schema: {
    fields: [
      { name: 'label', label: 'Title', type: 'string', default: 'GitHub' },
      { name: 'sublabel', label: 'Subtitle', type: 'string', default: '@username' },
      { name: 'url', label: 'URL', type: 'string', default: '#' },
      { name: 'icon', label: 'Icon', type: 'select', options: ['github', 'twitter', 'linkedin', 'instagram', 'mail', 'globe'], default: 'github' },
      ...COMMON_GRID_FIELDS as any
    ],
    bindings: {
      label: { mode: 'text', selector: '.link-title' },
      sublabel: { mode: 'text', selector: '.link-sub' }
    }
  }
};
