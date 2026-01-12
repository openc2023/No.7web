
import React from 'react';
import { ComponentDefinition } from '../../../types';
import { getIcon } from '../../../lib/icons';
import { COMMON_GRID_FIELDS, getCommonBlockStyle, BlockBackground, renderStaticBackground, getCommonStaticStyleString } from '../common';

export const ProfileSection: React.FC<any> = (props) => {
  const { name, bio, avatar, showSocials } = props;
  
  return (
    <section 
        className="relative w-full h-full overflow-hidden flex flex-col items-center justify-center text-center p-6"
        style={getCommonBlockStyle(props)}
    >
      <BlockBackground props={props} />
      
      <div className="relative z-10 flex flex-col items-center w-full h-full justify-center">
          <div className="relative mb-4 group cursor-pointer shrink-0">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-1000 animate-tilt"></div>
            <img src={avatar} alt={name} className="relative w-20 h-20 rounded-full object-cover border-2 border-[var(--bg)]" />
          </div>
          <h1 className="text-xl font-bold mb-1 profile-name tracking-tight" style={{ color: 'var(--text)' }}>{name}</h1>
          <p className="text-xs opacity-60 profile-bio leading-relaxed mb-4 line-clamp-3" style={{ color: 'var(--text)' }}>{bio}</p>
          {showSocials && (
            <div className="flex gap-2 mt-auto">
               {['github', 'twitter', 'mail'].map(i => (
                 <div key={i} className="p-1.5 rounded-full bg-[var(--bg)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--primary)] transition-all cursor-pointer">
                   {getIcon(i, 14)}
                 </div>
               ))}
            </div>
          )}
      </div>
    </section>
  );
};

export const ProfileSectionDef: ComponentDefinition = {
  name: 'Profile Header',
  slug: 'profile-section',
  category: 'Personal',
  icon: 'user',
  enabled: true,
  version: '1.0.0',
  schema: {
    fields: [
      { name: 'name', label: 'Name', type: 'string', default: 'Yysuni Clone' },
      { name: 'bio', label: 'Bio', type: 'text', default: 'Frontend Engineer & UI Designer' },
      { name: 'avatar', label: 'Avatar URL', type: 'image', default: 'https://github.com/shadcn.png' },
      { name: 'showSocials', label: 'Show Socials', type: 'boolean', default: true },
      ...COMMON_GRID_FIELDS as any
    ],
    bindings: {
      name: { mode: 'text', selector: '.profile-name' },
      bio: { mode: 'text', selector: '.profile-bio' },
      avatar: { mode: 'attr', attr: 'src', selector: 'img' }
    }
  },
  render: (p) => {
      // Simplified static render
      return `
        <div class="glass-panel relative w-full h-full overflow-hidden flex flex-col items-center justify-center text-center p-6" style="${getCommonStaticStyleString(p)}">
            ${renderStaticBackground(p)}
            <div class="relative z-10 flex flex-col items-center">
                <div class="relative mb-4">
                    <div class="absolute -inset-0.5 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-full blur opacity-50"></div>
                    <img src="${p.avatar}" class="relative w-20 h-20 rounded-full object-cover border-2 border-zinc-900" />
                </div>
                <h1 class="text-xl font-bold mb-1 tracking-tight" style="color: var(--text)">${p.name}</h1>
                <p class="text-xs opacity-60 leading-relaxed mb-4 line-clamp-3 max-w-[80%]" style="color: var(--text)">${p.bio}</p>
            </div>
        </div>
      `;
  }
};
