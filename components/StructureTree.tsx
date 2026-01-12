
import React, { useState } from 'react';
import { 
  Folder, 
  FileJson, 
  ChevronRight, 
  ChevronDown, 
  Layers, 
  Component as ComponentIcon,
  Search,
  Plus,
  Check,
  X,
  Trash2
} from 'lucide-react';
import { MenuNode, Block } from '../types';

interface StructureTreeProps {
  menu: MenuNode[];
  activePageId: string;
  onSelectPage: (id: string) => void;
  onAddPage: (title: string) => void;
  onDeletePage: (id: string) => void;
  onMoveNode: (draggedId: string, targetId: string) => void;
  blocks: Block[];
  selectedBlockId: string | null;
  onSelectBlock: (id: string | null) => void;
}

// Recursive Menu Item with DnD
const MenuItem: React.FC<{ 
  node: MenuNode; 
  activeId: string; 
  depth: number; 
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onMoveNode: (draggedId: string, targetId: string) => void;
}> = ({ node, activeId, depth, onSelect, onDelete, onMoveNode }) => {
  const [expanded, setExpanded] = useState(!node.collapsed);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const isPage = node.type === 'page';
  const hasChildren = node.children && node.children.length > 0;
  const isActive = node.id === activeId;
  const paddingLeft = `${depth * 12 + 12}px`;
  const isHome = node.id === 'home';

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', node.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); 
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const draggedId = e.dataTransfer.getData('text/plain');
    if (draggedId && draggedId !== node.id) {
        onMoveNode(draggedId, node.id);
        setExpanded(true);
    }
  };

  return (
    <div>
      <div 
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          flex items-center py-1.5 pr-2 text-sm cursor-pointer border-l-2 transition-colors select-none group relative
          ${isActive ? 'bg-purple-500/10 text-purple-400 border-purple-500' : 'border-transparent'}
          ${isDragOver ? 'bg-purple-500/20 border-purple-500 outline-dashed outline-1 outline-purple-500 -outline-offset-2' : ''}
          ${!isActive && !isDragOver ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50' : ''}
        `}
        style={{ paddingLeft }}
        onClick={() => {
            if (isPage) onSelect(node.id);
            else setExpanded(!expanded);
        }}
      >
        <span 
            className={`
                mr-1 p-0.5 rounded hover:bg-zinc-700/50 transition-colors
                ${(hasChildren || node.type === 'folder') ? 'opacity-100' : 'opacity-0'}
            `}
            onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
            }}
        >
           {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>

        <span className="opacity-70 mr-2">
           {node.type === 'folder' ? <Folder size={14} /> : <FileJson size={14} />}
        </span>

        <span className="truncate flex-1">{node.label}</span>

        {/* Delete Button (Visible on Hover) */}
        {!isHome && (
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onDelete(node.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1.5 hover:text-red-400 hover:bg-zinc-700 rounded transition-all relative z-10"
                title="Delete Page"
            >
                <Trash2 size={13} />
            </button>
        )}
      </div>
      
      {hasChildren && expanded && (
        <div>
          {node.children!.map(child => (
            <MenuItem 
              key={child.id} 
              node={child} 
              activeId={activeId} 
              depth={depth + 1} 
              onSelect={onSelect} 
              onDelete={onDelete}
              onMoveNode={onMoveNode}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const StructureTree: React.FC<StructureTreeProps> = ({ 
  menu, 
  activePageId, 
  onSelectPage,
  onAddPage,
  onDeletePage,
  onMoveNode,
  blocks,
  selectedBlockId,
  onSelectBlock
}) => {
  const [tab, setTab] = useState<'pages' | 'layers'>('pages');
  const [isCreating, setIsCreating] = useState(false);
  const [newPageName, setNewPageName] = useState('');

  const handleCreateSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (newPageName.trim()) {
        onAddPage(newPageName.trim());
        setNewPageName('');
        setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-zinc-800 text-xs font-medium uppercase tracking-wider text-zinc-500">
        <button 
          onClick={() => setTab('pages')}
          className={`flex-1 py-3 text-center border-b-2 transition-colors hover:text-zinc-300 ${tab === 'pages' ? 'border-purple-500 text-purple-400' : 'border-transparent'}`}
        >
          Files
        </button>
        <button 
          onClick={() => setTab('layers')}
          className={`flex-1 py-3 text-center border-b-2 transition-colors hover:text-zinc-300 ${tab === 'layers' ? 'border-purple-500 text-purple-400' : 'border-transparent'}`}
        >
          Structure
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {tab === 'pages' ? (
          <div>
            <div className="px-3 mb-2 flex gap-2">
               <div className="relative flex-1">
                  <input type="text" placeholder="Search pages..." className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-300 focus:outline-none focus:border-purple-500 pl-7" />
                  <Search size={12} className="absolute left-2 top-1.5 text-zinc-600" />
               </div>
               <button 
                  onClick={() => setIsCreating(!isCreating)}
                  className={`p-1.5 rounded border transition-colors flex items-center justify-center w-8 ${isCreating ? 'bg-purple-600 border-purple-500 text-white' : 'bg-zinc-800 border-zinc-700 text-zinc-100 hover:bg-zinc-700'}`}
                  title="Add New Page"
               >
                  <Plus size={14} className={isCreating ? 'rotate-45 transition-transform' : 'transition-transform'} />
               </button>
            </div>

            {isCreating && (
                <form onSubmit={handleCreateSubmit} className="px-3 mb-2 animate-in slide-in-from-top-2 fade-in duration-200">
                    <div className="flex items-center gap-1">
                        <input 
                            autoFocus
                            type="text" 
                            className="w-full bg-zinc-900 border border-purple-500/50 rounded px-2 py-1 text-sm text-white focus:outline-none placeholder-zinc-600"
                            placeholder="Page name..."
                            value={newPageName}
                            onChange={(e) => setNewPageName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Escape' && setIsCreating(false)}
                        />
                        <button type="submit" className="p-1 text-green-400 hover:text-green-300"><Check size={14}/></button>
                    </div>
                </form>
            )}

            <div className="text-xs font-semibold text-zinc-500 uppercase px-3 py-2 mt-2">Site Map</div>
            
            <div className="pb-10">
                {menu.map(node => (
                <MenuItem 
                    key={node.id} 
                    node={node} 
                    activeId={activePageId} 
                    depth={0} 
                    onSelect={onSelectPage}
                    onDelete={onDeletePage}
                    onMoveNode={onMoveNode}
                />
                ))}

                <div 
                   onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                   }}
                   onDrop={(e) => {
                      e.preventDefault();
                      const draggedId = e.dataTransfer.getData('text/plain');
                      if (draggedId) onMoveNode(draggedId, 'root');
                   }}
                   className="mt-4 mx-3 p-3 border-2 border-dashed border-zinc-800 rounded-lg text-center text-[10px] text-zinc-600 hover:border-zinc-600 hover:text-zinc-400 hover:bg-zinc-900 transition-all cursor-default"
                >
                   Drag here to move to root
                </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-xs font-semibold text-zinc-500 uppercase px-3 py-2">Page Blocks</div>
            <div className="space-y-0.5">
              {blocks.length === 0 && (
                <div className="px-4 py-8 text-center text-xs text-zinc-600 italic">
                  No blocks on this page.
                </div>
              )}
              {blocks.map((block, idx) => (
                <div 
                  key={block.id}
                  onClick={() => onSelectBlock(block.id)}
                  className={`
                    flex items-center gap-2 px-3 py-2 text-xs cursor-pointer
                    ${selectedBlockId === block.id ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'}
                  `}
                >
                  <ComponentIcon size={14} className="opacity-70" />
                  <span className="font-mono opacity-50 text-[10px] mr-1">
                    {idx + 1}.
                  </span>
                  <span className="truncate">{block.type}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
