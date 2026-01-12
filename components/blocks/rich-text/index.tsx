
import React from 'react';
import { ComponentDefinition } from '../../../types';
import { COMMON_GRID_FIELDS } from '../common';

export const RichText: React.FC<any> = ({ content }) => {
  return (
    <div 
        className="prose prose-invert prose-sm max-w-none p-6 border border-[var(--border)] rounded-[var(--radius)] h-full shadow-[var(--shadow)] overflow-y-auto custom-scrollbar" 
        style={{ 
            color: 'var(--text)',
            backgroundColor: 'var(--surface)', 
            backdropFilter: 'blur(var(--blur))',
            WebkitBackdropFilter: 'blur(var(--blur))'
        }} 
        dangerouslySetInnerHTML={{ __html: content }} 
    />
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
  }
};
