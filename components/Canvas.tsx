
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Block, ComponentDefinition, SiteSettings, MenuNode, Page } from '../types';
import { 
  ArrowUp, ArrowDown, Copy, Trash2, MoveDiagonal,
  ChevronsUp, ChevronsDown
} from 'lucide-react';
import { BLOCK_REGISTRY } from '../lib/blocks';

interface CanvasProps {
  blocks: Block[];
  viewDevice: 'desktop' | 'tablet' | 'mobile';
  selectedBlockId: string | null;
  onSelectBlock: (id: string | null) => void;
  onDeleteBlock: (id: string) => void;
  onDuplicateBlock: (id: string) => void;
  onMoveBlock: (id: string, direction: 'up' | 'down') => void;
  onLayerBlock: (id: string, action: 'front' | 'back' | 'forward' | 'backward') => void;
  onReorderBlock: (draggedId: string, targetId: string) => void;
  onUpdateBlockProps: (id: string, props: any) => void;
  componentDefs: ComponentDefinition[];
  siteSettings: SiteSettings;
  // Context Props for dynamic blocks
  menu: MenuNode[];
  pages: Record<string, Page>;
  activePageId: string;
  onSelectPage: (id: string) => void;
}

// Extracted FrameWrapper to prevent re-mounting on every render
const FrameWrapper: React.FC<{ children: React.ReactNode; viewDevice: 'desktop' | 'tablet' | 'mobile' }> = ({ children, viewDevice }) => {
     if (viewDevice === 'desktop') return <>{children}</>;
     
     return (
        <div className={`
             relative bg-black rounded-[40px] shadow-2xl border-4 border-zinc-800 ring-1 ring-zinc-950/50
             ${viewDevice === 'mobile' ? 'p-3' : 'p-4'}
             h-full flex flex-col
        `}>
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-32 bg-black rounded-b-xl z-50 pointer-events-none"></div>
            <div className="bg-zinc-950 rounded-[32px] overflow-hidden flex-1 w-full relative custom-scrollbar overflow-y-auto">
                {children}
            </div>
        </div>
     );
};

export const Canvas: React.FC<CanvasProps> = ({ 
  blocks, 
  viewDevice, 
  selectedBlockId, 
  onSelectBlock,
  onDeleteBlock,
  onDuplicateBlock,
  onMoveBlock,
  onLayerBlock,
  onReorderBlock,
  onUpdateBlockProps,
  componentDefs,
  siteSettings,
  menu,
  pages,
  activePageId,
  onSelectPage
}) => {
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [shadow, setShadow] = useState<{col: number, row: number, w: number, h: number} | null>(null);
  
  const [cellSize, setCellSize] = useState(140);
  const [gapSize, setGapSize] = useState(16);

  // --- Device Configuration ---
  const maxCols = useMemo(() => {
      switch(viewDevice) {
          case 'mobile': return 4;
          case 'tablet': return 8;
          default: return 12;
      }
  }, [viewDevice]);

  const widthClass = useMemo(() => {
     return viewDevice === 'mobile' ? 'w-[375px]' : 
            viewDevice === 'tablet' ? 'w-[768px]' : 
            'w-full max-w-6xl';
  }, [viewDevice]);

  // --- Helper: Get Device Specific Props (with Smart Scaling) ---
  const getDeviceProps = (props: any, device: 'desktop' | 'tablet' | 'mobile') => {
      const prefix = device === 'desktop' ? '' : `${device}_`;
      
      // 1. Try to get explicit device prop
      let rawColSpan = props[`${prefix}colSpan`];
      
      // 2. If undefined, Smart Scale from Desktop props
      if (rawColSpan === undefined) {
          const desktopSpan = props.colSpan || 4;
          if (device === 'mobile') {
              // Mobile Logic (Max 4):
              // Desktop 1-3 (Small) -> Mobile 2 (Half)
              // Desktop 4+ (Medium/Large) -> Mobile 4 (Full)
              rawColSpan = desktopSpan <= 3 ? 2 : 4;
          } else if (device === 'tablet') {
              // Tablet Logic (Max 8):
              // Scale by 2/3 roughly (8/12)
              // 12 -> 8, 6 -> 4, 3 -> 2
              rawColSpan = Math.max(1, Math.round(desktopSpan * (8/12)));
          } else {
              rawColSpan = desktopSpan;
          }
      }
      
      const rawRowSpan = props[`${prefix}rowSpan`] || props.rowSpan || 1;
      
      const deviceMax = device === 'mobile' ? 4 : device === 'tablet' ? 8 : 12;
      const colSpan = Math.min(Number(rawColSpan), deviceMax);
      const rowSpan = Number(rawRowSpan);
      
      // Start is optional. If undefined, it means "auto flow"
      const colStart = props[`${prefix}colStart`]; 
      const rowStart = props[`${prefix}rowStart`];

      return { colSpan, rowSpan, colStart, rowStart };
  };

  // --- Visual Ordering for Auto-Flow ---
  // On Desktop, order is defined by grid coords. On Mobile/Tablet Auto-Flow, it's defined by Array order.
  // We sort the blocks array based on desktop coordinates to ensure they flow logically on mobile.
  const displayBlocks = useMemo(() => {
      if (viewDevice === 'desktop') return blocks;
      
      // Shallow copy and sort
      return [...blocks].sort((a, b) => {
          // Priority 1: Has explicit mobile/tablet position?
          const prefix = `${viewDevice}_`;
          const aHasPos = a.props[`${prefix}colStart`] !== undefined;
          const bHasPos = b.props[`${prefix}colStart`] !== undefined;
          
          if (aHasPos && !bHasPos) return -1;
          if (!aHasPos && bHasPos) return 1;
          if (aHasPos && bHasPos) {
              // Both have custom positions, sort by custom row/col
              const rowDiff = (a.props[`${prefix}rowStart`] || 0) - (b.props[`${prefix}rowStart`] || 0);
              if (rowDiff !== 0) return rowDiff;
              return (a.props[`${prefix}colStart`] || 0) - (b.props[`${prefix}colStart`] || 0);
          }

          // Priority 2: Fallback to Desktop visual order (Row then Col)
          const aRow = a.props.rowStart || 999;
          const bRow = b.props.rowStart || 999;
          if (aRow !== bRow) return aRow - bRow;
          
          const aCol = a.props.colStart || 999;
          const bCol = b.props.colStart || 999;
          return aCol - bCol;
      });
  }, [blocks, viewDevice]);


  // --- Measure Cell Size ---
  useEffect(() => {
    const measureGrid = () => {
        if (!canvasRef.current) return;
        const gridElement = canvasRef.current.querySelector('.grid-container');
        if (gridElement) {
            const rect = gridElement.getBoundingClientRect();
            const gap = 16;
            setGapSize(gap);
            // Calculate cell size based on current column count
            const calculatedCellSize = (rect.width - ((maxCols - 1) * gap)) / maxCols;
            setCellSize(calculatedCellSize);
        }
    };
    measureGrid();
    const resizeObserver = new ResizeObserver(() => measureGrid());
    if (canvasRef.current) resizeObserver.observe(canvasRef.current);
    return () => resizeObserver.disconnect();
  }, [maxCols, viewDevice]); 

  // --- Grid Generators ---
  const getGridStyle = (type: string, props: any, isShadow = false) => {
    // SPECIAL HANDLING FOR PAGE HEADER
    if (type === 'page-header' && !isShadow) {
       const pos = props.layoutPosition || 'top';
       
       if (viewDevice !== 'desktop') {
           return { gridColumn: '1 / -1', gridRow: 'auto', order: -9999, marginBottom: '16px' }; 
       }
       
       if (pos === 'left') {
           return { gridColumn: '1 / span 3', gridRow: '1 / span 24', zIndex: 40 };
       }
       if (pos === 'right') {
           return { gridColumn: '10 / span 3', gridRow: '1 / span 24', zIndex: 40 };
       }
       return { gridColumn: '1 / -1', gridRow: '1 / span 1', zIndex: 40 };
    }

    // Generic Block Handling
    const { colSpan, rowSpan, colStart, rowStart } = getDeviceProps(props, viewDevice);

    if (colStart && rowStart) {
        // Explicit Positioning (Free Layout)
        return {
            gridColumn: `${colStart} / span ${colSpan}`,
            gridRow: `${rowStart} / span ${rowSpan}`
        };
    } else {
        // Auto Flow
        return {
            gridColumn: `span ${colSpan}`,
            gridRow: `span ${rowSpan}`
        };
    }
  };

  // --- Drag & Reposition Logic ---
  const handleDragStart = (e: React.DragEvent, id: string, props: any) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedId(id);
    onSelectBlock(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (!draggedId) return;

    const draggedBlock = blocks.find(b => b.id === draggedId);
    if (!draggedBlock) return;
    if (draggedBlock.type === 'page-header') return;

    const { colSpan: w, rowSpan: h } = getDeviceProps(draggedBlock.props, viewDevice);

    const gridEl = canvasRef.current?.querySelector('.grid-container');
    if (!gridEl) return;
    
    const rect = gridEl.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;
    
    const step = cellSize + gapSize;
    
    // 1-based index
    let col = Math.floor(relX / step) + 1;
    let row = Math.floor(relY / step) + 1;
    
    // Clamp
    if (col < 1) col = 1;
    if (col > maxCols - w + 1) col = maxCols - w + 1;
    if (row < 1) row = 1;
    
    setShadow({ col, row, w, h });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain');
    
    if (shadow && sourceId === draggedId) {
        const prefix = viewDevice === 'desktop' ? '' : `${viewDevice}_`;
        onUpdateBlockProps(sourceId, { 
            [`${prefix}colStart`]: shadow.col, 
            [`${prefix}rowStart`]: shadow.row 
        });
    }
    
    setDraggedId(null);
    setShadow(null);
  };

  const handleResizeStart = (e: React.MouseEvent, blockId: string) => {
    e.stopPropagation();
    e.preventDefault();

    const draggedBlock = blocks.find(b => b.id === blockId);
    if (!draggedBlock) return;
    
    const { colSpan: currentCols, rowSpan: currentRows } = getDeviceProps(draggedBlock.props, viewDevice);

    const startX = e.clientX;
    const startY = e.clientY;
    const gap = 16;
    
    const onMove = (moveEvent: MouseEvent) => {
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;
        
        const colChange = Math.round(dx / (cellSize + gap));
        const rowChange = Math.round(dy / (cellSize + gap));

        let newCols = Math.max(1, Math.min(maxCols, currentCols + colChange));
        let newRows = Math.max(1, Math.min(24, currentRows + rowChange)); 

        if (newCols !== currentCols || newRows !== currentRows) {
             const prefix = viewDevice === 'desktop' ? '' : `${viewDevice}_`;
             onUpdateBlockProps(blockId, { 
                 [`${prefix}colSpan`]: newCols, 
                 [`${prefix}rowSpan`]: newRows 
             });
        }
    };

    const onUp = () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const renderGridLines = () => {
      return (
          <div className="absolute inset-0 pointer-events-none z-0 grid gap-4 h-full" 
               style={{ 
                   padding: viewDevice === 'mobile' ? '12px' : '16px',
                   gridTemplateColumns: `repeat(${maxCols}, minmax(0, 1fr))`
               }}
          >
              {Array.from({ length: maxCols }).map((_, i) => (
                  <div key={i} className="h-full border-l border-r border-dashed border-white/5 opacity-50 first:border-l last:border-r"></div>
              ))}
          </div>
      );
  };

  // Prepare background image if available
  const bgImage = siteSettings.theme['--bg-image'];
  const canvasStyle: React.CSSProperties = {
      transformOrigin: 'top center',
      backgroundColor: 'var(--bg)',
      color: 'var(--text)',
      backgroundImage: bgImage ? `url(${bgImage})` : 'none',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      ...siteSettings.theme as React.CSSProperties
  };

  const hasTopHeader = displayBlocks.some(b => 
      b.type === 'page-header' && 
      (!b.props.layoutPosition || b.props.layoutPosition === 'top')
  );

  return (
    <div 
      className="flex-1 w-full overflow-y-auto bg-zinc-950 flex justify-center py-12 relative custom-scrollbar"
      onClick={() => onSelectBlock(null)}
    >
      <div className={`relative transition-all duration-300 ${viewDevice !== 'desktop' ? 'mt-4 h-[85vh]' : 'w-full flex justify-center'}`}>
        <FrameWrapper viewDevice={viewDevice}>
          <div 
             ref={canvasRef}
             className={`
               ${widthClass} min-h-[90vh] transition-all duration-300 ease-in-out relative
               ${viewDevice === 'mobile' ? 'p-3' : 'p-4'}
               ${viewDevice === 'desktop' ? 'shadow-2xl' : ''}
             `}
             style={canvasStyle}
             onClick={(e) => e.stopPropagation()} 
             onDragOver={handleDragOver} 
             onDrop={handleDrop}
          >
            {renderGridLines()}
            
            {displayBlocks.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center flex-col gap-4 pointer-events-none" style={{ color: 'var(--muted)' }}>
                 <div className="text-6xl font-black opacity-5">EMPTY</div>
                 <p className="text-sm">Start building your bento grid</p>
              </div>
            )}

            <div 
                className="grid-container grid gap-4"
                style={{
                    gridTemplateColumns: `repeat(${maxCols}, minmax(0, 1fr))`,
                    gridTemplateRows: (hasTopHeader && viewDevice === 'desktop') ? 'min-content' : undefined,
                    gridAutoFlow: viewDevice === 'desktop' ? 'row' : 'dense',
                    gridAutoRows: `${cellSize}px`
                }}
            >
              {displayBlocks.map((block) => {
                const Renderer = BLOCK_REGISTRY[block.type];
                if (!Renderer) return null;

                const isSelected = selectedBlockId === block.id;
                const isDragging = draggedId === block.id;
                const isHeader = block.type === 'page-header';
                const isSpacer = block.type === 'spacer';
                
                // Inject Global Settings and Context for dynamic blocks
                const extraProps = {
                   _brand: siteSettings.brand,
                   _context: { menu, pages, activePageId, onSelectPage }
                };

                const gridStyle = getGridStyle(block.type, block.props);
                const { colSpan, rowSpan } = getDeviceProps(block.props, viewDevice);

                return (
                  <div 
                    key={block.id}
                    draggable={!isHeader}
                    onDragStart={(e) => handleDragStart(e, block.id, block.props)}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectBlock(block.id);
                    }}
                    className={`
                      relative group transition-all duration-200 
                      ${isSelected ? 'ring-2 ring-[var(--primary)] z-20' : isSpacer ? '' : 'hover:ring-1 hover:ring-[var(--primary)]/50'}
                      ${isDragging ? 'opacity-20 grayscale' : 'opacity-100'}
                      ${!isHeader ? 'cursor-grab active:cursor-grabbing' : ''}
                      ${isSpacer && !isSelected ? 'opacity-0 hover:opacity-100 border border-dashed border-zinc-800' : ''}
                    `}
                    style={gridStyle as React.CSSProperties}
                  >
                    {(isSelected) && (
                       <>
                           <div className="absolute top-2 right-2 bg-[var(--primary)] text-white text-[10px] px-1 py-1 rounded-md shadow-lg flex items-center gap-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                              <button onClick={(e) => { e.stopPropagation(); onLayerBlock(block.id, 'front'); }} className="p-1 hover:bg-white/20 rounded"><ChevronsUp size={12} /></button>
                              <button onClick={(e) => { e.stopPropagation(); onLayerBlock(block.id, 'back'); }} className="p-1 hover:bg-white/20 rounded"><ChevronsDown size={12} /></button>
                              <div className="w-px h-3 bg-white/20 mx-0.5"></div>
                              <button onClick={(e) => { e.stopPropagation(); onDuplicateBlock(block.id); }} className="p-1 hover:bg-white/20 rounded"><Copy size={12} /></button>
                              <button onClick={(e) => { e.stopPropagation(); onDeleteBlock(block.id); }} className="p-1 hover:bg-red-500 rounded"><Trash2 size={12} /></button>
                           </div>
                           
                           {!isHeader && (
                               <div 
                                  className="absolute bottom-1 right-1 z-50 cursor-nwse-resize text-white/50 hover:text-white p-1.5 bg-[var(--bg)]/80 rounded-full shadow-sm hover:scale-110 transition-transform"
                                  onMouseDown={(e) => handleResizeStart(e, block.id)}
                               >
                                  <MoveDiagonal size={14} />
                               </div>
                           )}
                           
                           <div className="absolute bottom-2 left-2 text-[9px] font-mono text-white/50 bg-black/50 px-1 rounded pointer-events-none backdrop-blur-sm">
                               {colSpan}x{rowSpan} 
                           </div>
                       </>
                    )}
                    
                    <div className={`h-full ${isSelected ? 'pointer-events-none' : ''}`}>
                       <Renderer {...block.props} {...extraProps} />
                    </div>
                  </div>
                );
              })}
              
              {shadow && (
                  <div 
                     className="border-2 border-dashed border-[var(--primary)] bg-[var(--primary)]/10 rounded-[var(--radius)] z-10 pointer-events-none transition-all duration-75"
                     style={{
                         gridColumn: `${shadow.col} / span ${shadow.w}`,
                         gridRow: `${shadow.row} / span ${shadow.h}`
                     }}
                  />
              )}
            </div>
          </div>
        </FrameWrapper>
      </div>
    </div>
  );
};
