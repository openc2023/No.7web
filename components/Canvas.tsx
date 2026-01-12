
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
  menu: MenuNode[];
  pages: Record<string, Page>;
  activePageId: string;
  onSelectPage: (id: string) => void;
}

const FrameWrapper: React.FC<{ children: React.ReactNode; viewDevice: 'desktop' | 'tablet' | 'mobile' }> = ({ children, viewDevice }) => {
     if (viewDevice === 'desktop') return <>{children}</>;
     return (
        <div className={`relative bg-black rounded-[40px] shadow-2xl border-4 border-zinc-800 ring-1 ring-zinc-950/50 ${viewDevice === 'mobile' ? 'p-3' : 'p-4'} h-full flex flex-col`}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-32 bg-black rounded-b-xl z-50 pointer-events-none"></div>
            <div className="bg-zinc-950 rounded-[32px] overflow-hidden flex-1 w-full relative custom-scrollbar overflow-y-auto">{children}</div>
        </div>
     );
};

export const Canvas: React.FC<CanvasProps> = ({ 
  blocks, viewDevice, selectedBlockId, onSelectBlock, onDeleteBlock, onDuplicateBlock,
  onMoveBlock, onLayerBlock, onReorderBlock, onUpdateBlockProps, siteSettings,
  menu, pages, activePageId, onSelectPage
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const dragOffset = useRef<{ x: number, y: number }>({ x: 0, y: 0 });
  const [shadow, setShadow] = useState<{col: number, row: number, w: number, h: number, isValid: boolean} | null>(null);
  
  const cellSize = useMemo(() => {
      if (viewDevice === 'mobile') return parseInt(siteSettings.theme['--mobile-cell-size'] || '100');
      if (viewDevice === 'tablet') return parseInt(siteSettings.theme['--tablet-cell-size'] || '115');
      return parseInt(siteSettings.theme['--cell-size'] || '140');
  }, [siteSettings.theme, viewDevice]);

  const gapSize = useMemo(() => {
      if (viewDevice === 'mobile') return parseInt(siteSettings.theme['--mobile-gap'] || '10');
      if (viewDevice === 'tablet') return parseInt(siteSettings.theme['--tablet-gap'] || '12');
      return parseInt(siteSettings.theme['--gap'] || '16');
  }, [siteSettings.theme, viewDevice]);

  const maxCols = viewDevice === 'mobile' ? 4 : viewDevice === 'tablet' ? 8 : 12;

  const getDeviceProps = (props: any, device: 'desktop' | 'tablet' | 'mobile') => {
      const prefix = device === 'desktop' ? '' : `${device}_`;
      
      // Fallback chain: Device-Specific -> Global Prop -> Default
      const colSpan = props[`${prefix}colSpan`] ?? props.colSpan ?? 4;
      const rowSpan = props[`${prefix}rowSpan`] ?? props.rowSpan ?? 4;
      const colStart = props[`${prefix}colStart`] ?? props.colStart;
      const rowStart = props[`${prefix}rowStart`] ?? props.rowStart;
      
      return { 
          colSpan: Math.min(Number(colSpan), maxCols), 
          rowSpan: Number(rowSpan), 
          colStart: colStart === 'auto' ? undefined : Number(colStart), 
          rowStart: rowStart === 'auto' ? undefined : Number(rowStart)
      };
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedId) return;
    const draggedBlock = blocks.find(b => b.id === draggedId);
    if (!draggedBlock || draggedBlock.type === 'page-header') return;
    const { colSpan: w, rowSpan: h } = getDeviceProps(draggedBlock.props, viewDevice);
    const rect = canvasRef.current?.querySelector('.grid-container')?.getBoundingClientRect();
    if (!rect) return;
    const relX = e.clientX - rect.left - dragOffset.current.x;
    const relY = e.clientY - rect.top - dragOffset.current.y;
    const step = cellSize + gapSize;
    let col = Math.round(relX / step) + 1;
    let row = Math.round(relY / step) + 1;
    col = Math.max(1, Math.min(maxCols - w + 1, col));
    row = Math.max(1, row);
    setShadow({ col, row, w, h, isValid: true });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (shadow && draggedId) {
        const prefix = viewDevice === 'desktop' ? '' : `${viewDevice}_`;
        onUpdateBlockProps(draggedId, { 
            [`${prefix}colStart`]: shadow.col, 
            [`${prefix}rowStart`]: shadow.row 
        });
    }
    setDraggedId(null);
    setShadow(null);
  };

  const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '20, 20, 23';
  };

  const theme = siteSettings.theme;
  const surfaceRgb = hexToRgb(theme['--surface'] || '#141417');
  const opacity = theme['--surface-opacity'] || '0.6';

  const canvasStyle: React.CSSProperties = {
      backgroundColor: theme['--bg-type'] === 'color' ? theme['--bg'] : 'transparent',
      backgroundImage: (theme['--bg-type'] === 'image' && theme['--bg-image']) ? `url(${theme['--bg-image']})` : 'none',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      ...theme as any,
      '--surface': `rgba(${surfaceRgb}, ${opacity})`
  };

  return (
    <div className="flex-1 w-full overflow-y-auto bg-zinc-950 flex justify-center py-12 relative custom-scrollbar" onClick={() => onSelectBlock(null)}>
      <div className={`relative z-10 transition-all duration-300 ${viewDevice !== 'desktop' ? 'h-[85vh]' : 'w-full flex justify-center'}`}>
        <FrameWrapper viewDevice={viewDevice}>
          <div 
             ref={canvasRef}
             className={`${viewDevice === 'mobile' ? 'w-[375px]' : viewDevice === 'tablet' ? 'w-[768px]' : 'w-full max-w-[1200px]'} min-h-[90vh] transition-all p-8`}
             style={canvasStyle}
             onDragOver={handleDragOver} 
             onDrop={handleDrop}
             onClick={(e) => e.stopPropagation()}
          >
            <div className="grid-container grid"
                style={{ 
                    gridTemplateColumns: `repeat(${maxCols}, minmax(0, 1fr))`, 
                    gridAutoRows: `${cellSize}px`,
                    gap: `${gapSize}px`
                }}
            >
              {blocks.map((block) => {
                const Renderer = BLOCK_REGISTRY[block.type];
                if (!Renderer) return null;
                const { colSpan, rowSpan, colStart, rowStart } = getDeviceProps(block.props, viewDevice);
                const isHeader = block.type === 'page-header';
                const isSelected = selectedBlockId === block.id;

                const gridStyle = isHeader ? { gridColumn: '1 / -1', gridRow: '1', order: -1 } : { 
                    gridColumn: colStart ? `${colStart} / span ${colSpan}` : `span ${colSpan}`, 
                    gridRow: rowStart ? `${rowStart} / span ${rowSpan}` : `span ${rowSpan}` 
                };

                return (
                  <div key={block.id} 
                    draggable={!isHeader}
                    onDragStart={(e) => { e.dataTransfer.setData('text', block.id); setDraggedId(block.id); onSelectBlock(block.id); }}
                    onClick={(e) => { e.stopPropagation(); onSelectBlock(block.id); }}
                    className={`relative group transition-all ${isSelected ? 'ring-2 ring-purple-500 z-50' : 'hover:ring-1 hover:ring-purple-500/50'}`}
                    style={gridStyle}
                  >
                    {isSelected && (
                       <div className="absolute top-2 right-2 flex bg-purple-600 rounded shadow-lg z-50 p-1 gap-1">
                          <button onClick={() => onDuplicateBlock(block.id)} className="p-1 hover:bg-white/20 rounded"><Copy size={12} /></button>
                          <button onClick={() => onDeleteBlock(block.id)} className="p-1 hover:bg-red-500 rounded"><Trash2 size={12} /></button>
                       </div>
                    )}
                    <Renderer {...block.props} _brand={siteSettings.brand} _context={{ menu, pages, activePageId, onSelectPage }} />
                  </div>
                );
              })}
              {shadow && (
                <div 
                  className="bg-purple-500/20 border-2 border-purple-500 border-dashed rounded-[var(--radius)] z-10 pointer-events-none" 
                  style={{ gridColumn: `${shadow.col} / span ${shadow.w}`, gridRow: `${shadow.row} / span ${shadow.h}` }} 
                />
              )}
            </div>
          </div>
        </FrameWrapper>
      </div>
    </div>
  );
};
