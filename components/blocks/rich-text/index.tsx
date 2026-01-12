
import React from 'react';
import { ComponentDefinition } from '../../../types';
import { COMMON_GRID_FIELDS, getCommonBlockStyle, BlockBackground, renderStaticBackground, getCommonStaticStyleString } from '../common';

export const RichText: React.FC<any> = (props) => {
  const { content } = props;
  
  const style = {
      color: 'var(--text)',
      ...getCommonBlockStyle(props)
  };

  return (
    <div 
        className="relative h-full overflow-hidden" 
        style={style}
    >
        <BlockBackground props={props} />
        
        <div 
            className="relative z-10 prose prose-invert prose-sm max-w-none p-6 h-full overflow-y-auto custom-scrollbar"
            dangerouslySetInnerHTML={{ __html: content }} 
        />
    </div>
  );
};

export const RichTextDef: ComponentDefinition = {
  name: 'Rich Text',
  slug: 'rich-text',
  category: 'Content',
  icon: 'align-left',
  enabled: true,
  version: '1.0',
  schema: {
    fields: [
      { name: 'content', label: 'Content', type: 'richtext', default: '<p>Content...</p>' },
      ...COMMON_GRID_FIELDS as any
    ],
    bindings: {
      content: { mode: 'html', selector: '.content' }
    }
  },
  render: (p) => {
      return `
        <div class="glass-panel relative w-full h-full overflow-hidden" style="color: var(--text); ${getCommonStaticStyleString(p)}">
             ${renderStaticBackground(p)}
             <div class="relative z-10 prose prose-invert prose-sm max-w-none p-6 h-full overflow-y-auto custom-scrollbar">
                ${p.content}
             </div>
        </div>
      `;
  }
};
