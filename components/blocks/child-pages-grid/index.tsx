
import React from 'react';
import { ComponentDefinition, MenuNode, Page } from '../../../types';
import { COMMON_GRID_FIELDS } from '../common';
import { Folder, FileText, ArrowRight } from 'lucide-react';

interface Context {
  menu: MenuNode[];
  pages: Record<string, Page>;
  activePageId: string;
  onSelectPage?: (id: string) => void;
}

export const ChildPagesGrid: React.FC<any> = ({ 
    layout, 
    showThumbnail, 
    showDescription,
    filterIds,
    _context 
}: { 
    layout: 'grid' | 'list'; 
    showThumbnail: boolean;
    showDescription: boolean;
    filterIds?: string[];
    _context: Context 
}) => {
    const { menu, activePageId, onSelectPage } = _context || {};
    
    // Recursive helper to find the current menu node
    const findNode = (nodes: MenuNode[], id: string): MenuNode | null => {
        for (const node of nodes) {
            if (node.id === id) return node;
            if (node.children) {
                const found = findNode(node.children, id);
                if (found) return found;
            }
        }
        return null;
    };

    const currentNode = menu ? findNode(menu, activePageId) : null;
    let children = currentNode?.children || [];

    // Filter children if filterIds is provided and not empty
    if (filterIds && filterIds.length > 0) {
        children = children.filter(child => filterIds.includes(child.id));
    }

    if (children.length === 0) {
        return (
            <div 
                className="flex flex-col items-center justify-center h-full p-6 border-2 border-dashed border-zinc-800 rounded-[var(--radius)] text-zinc-600"
                style={{ 
                    backgroundColor: 'var(--surface)', 
                    backdropFilter: 'blur(var(--blur))',
                    WebkitBackdropFilter: 'blur(var(--blur))' 
                }}
            >
                <Folder size={32} className="mb-2 opacity-30"/>
                <span className="text-xs font-medium">No sub-pages found.</span>
                <span className="text-[10px] mt-1 opacity-70">
                    {filterIds && filterIds.length > 0 ? "Check your filter selection." : `Add pages inside "${currentNode?.label}" structure.`}
                </span>
            </div>
        );
    }

    // Dynamic grid columns using auto-fit for better responsiveness in various container sizes
    const gridStyle = layout === 'grid' 
        ? { gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }
        : { gridTemplateColumns: '1fr' };

    return (
        <div 
            className="grid gap-4 h-full overflow-y-auto custom-scrollbar p-1"
            style={gridStyle}
        >
            {children.map((child) => {
                return (
                    <div 
                        key={child.id}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onSelectPage) onSelectPage(child.id);
                        }}
                        className="group flex flex-col border border-[var(--border)] rounded-[var(--radius)] overflow-hidden hover:border-[var(--primary)] transition-all cursor-pointer shadow-[var(--shadow)] relative min-h-[140px]"
                        style={{ 
                            backgroundColor: 'var(--surface)', 
                            backdropFilter: 'blur(var(--blur))',
                            WebkitBackdropFilter: 'blur(var(--blur))' 
                        }}
                    >
                         {/* Thumbnail Placeholder */}
                        {showThumbnail && (
                             <div className="h-28 bg-zinc-900/50 w-full flex items-center justify-center border-b border-[var(--border)] relative overflow-hidden pointer-events-none shrink-0">
                                 <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                 {child.type === 'folder' ? (
                                    <Folder size={24} className="text-zinc-700 group-hover:text-purple-500 transition-colors"/>
                                 ) : (
                                    <FileText size={24} className="text-zinc-700 group-hover:text-blue-500 transition-colors"/>
                                 )}
                             </div>
                        )}
                        
                        <div className="p-4 flex flex-col flex-1 pointer-events-none">
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="text-sm font-bold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors line-clamp-1">
                                    {child.label}
                                </h3>
                                {layout === 'list' && <ArrowRight size={14} className="text-zinc-600 group-hover:text-[var(--primary)] -rotate-45 group-hover:rotate-0 transition-transform" />}
                            </div>
                            
                            {showDescription && (
                                <p className="text-[10px] text-[var(--muted)] line-clamp-2 leading-relaxed">
                                    {child.type === 'folder' ? 'Folder collection' : 'Read more about this topic...'}
                                </p>
                            )}

                            {/* Badge */}
                            <div className="mt-3 flex mt-auto">
                                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[var(--bg)] border border-[var(--border)] text-[var(--muted)] uppercase">
                                    {child.type}
                                </span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export const ChildPagesGridDef: ComponentDefinition = {
    name: 'Child Pages',
    slug: 'child-pages-grid',
    category: 'Content',
    icon: 'layout-grid',
    enabled: true,
    version: '1.0.0',
    schema: {
        fields: [
            { name: 'filterIds', label: 'Select Pages', type: 'multiselect', dynamicOptionsSource: 'children', default: [] },
            { name: 'layout', label: 'Layout', type: 'select', options: ['grid', 'list'], default: 'grid' },
            { name: 'showThumbnail', label: 'Show Thumbnail', type: 'boolean', default: true },
            { name: 'showDescription', label: 'Show Desc', type: 'boolean', default: true },
            ...COMMON_GRID_FIELDS as any
        ],
        bindings: {}
    }
};
