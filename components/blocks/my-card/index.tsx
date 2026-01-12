
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ComponentDefinition } from '../../../types';
import { getIcon } from '../../../lib/icons';
import { COMMON_GRID_FIELDS, getCommonBlockStyle, BlockBackground, renderStaticBackground, getCommonStaticStyleString } from '../common';

export const LinkCard: React.FC<any> = (props) => {
  const { label, sublabel, url, icon } = props;
  return (
    <a 
        href={url} 
        onClick={e => e.preventDefault()} 
        className="relative flex flex-col justify-between p-4 h-full hover:border-[var(--primary)] transition-all group overflow-hidden"
        style={getCommonBlockStyle(props)}
    >
      <BlockBackground props={props} />

      <div className="relative z-10 flex flex-col h-full justify-between">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 rounded-xl bg-[var(--bg)] text-[var(--primary)] border border-[var(--border)] group-hover:scale-110 transition-transform">{getIcon(icon || 'globe', 18)}</div>
            <ArrowRight size={16} className="text-[var(--muted)] -rotate-45 group-hover:rotate-0 transition-transform" />
          </div>
          <div>
             <div className="font-bold text-sm link-title truncate" style={{ color: 'var(--text)' }}>{label}</div>
             <div className="text-[10px] opacity-50 link-sub truncate" style={{ color: 'var(--text)' }}>{sublabel}</div>
          </div>
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
  },
  render: (p) => {
      // Note: Icons are hard to SSR without an icon font or SVG inlining logic in standard string mode.
      // We will use a generic SVG here for simplicity in static export.
      return `
        <a href="${p.url}" class="glass-panel relative block w-full h-full p-4 hover:border-purple-500 transition-colors group overflow-hidden text-inherit no-underline" style="${getCommonStaticStyleString(p)}">
             ${renderStaticBackground(p)}
             <div class="relative z-10 flex flex-col h-full justify-between">
                <div class="flex justify-between items-start mb-2">
                     <div class="p-2 rounded-xl bg-zinc-900/50 border border-white/10 text-purple-400 group-hover:scale-110 transition-transform">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                     </div>
                     <svg width="16" height="16" class="text-zinc-500 -rotate-45 group-hover:rotate-0 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </div>
                <div>
                     <div class="font-bold text-sm truncate">${p.label}</div>
                     <div class="text-[10px] opacity-50 truncate">${p.sublabel}</div>
                </div>
             </div>
        </a>
      `;
  }
};
