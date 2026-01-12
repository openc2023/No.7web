
import React from 'react';

export const COMMON_GRID_FIELDS = [
  // --- DESKTOP LAYOUT ---
  { name: 'colSpan', label: 'Width (12)', type: 'number', default: 4, min: 1, max: 12 },
  { name: 'rowSpan', label: 'Height (Row)', type: 'number', default: 4, min: 1, max: 24 },
  { name: 'colStart', label: 'X Pos', type: 'number', default: 'auto', min: 1, max: 12 },
  { name: 'rowStart', label: 'Y Pos', type: 'number', default: 'auto', min: 1, max: 50 },

  // --- TABLET OVERRIDES (8 COLS) ---
  { name: 'tablet_colSpan', label: 'Width (8)', type: 'number', default: 4, min: 1, max: 8 },
  { name: 'tablet_rowSpan', label: 'Height', type: 'number', default: 4, min: 1, max: 24 },
  { name: 'tablet_colStart', label: 'X Pos', type: 'number', default: 'auto', min: 1, max: 8 },
  { name: 'tablet_rowStart', label: 'Y Pos', type: 'number', default: 'auto', min: 1, max: 50 },

  // --- MOBILE OVERRIDES (4 COLS) ---
  { name: 'mobile_colSpan', label: 'Width (4)', type: 'number', default: 4, min: 1, max: 4 },
  { name: 'mobile_rowSpan', label: 'Height', type: 'number', default: 4, min: 1, max: 24 },
  { name: 'mobile_colStart', label: 'X Pos', type: 'number', default: 'auto', min: 1, max: 4 },
  { name: 'mobile_rowStart', label: 'Y Pos', type: 'number', default: 'auto', min: 1, max: 50 },

  // --- VISUAL STYLE ---
  { name: 'backgroundColor', label: 'Card Bg', type: 'color', default: '' },
  { name: 'backgroundImage', label: 'Card Image', type: 'image', default: '' },
  { name: 'backgroundMode', label: 'Mode', type: 'select', options: ['cover', 'contain', 'tile'], default: 'cover' },
  { name: 'backgroundImageOpacity', label: 'Opacity', type: 'number', default: 0.6, min: 0, max: 1, step: 0.05 },
];

export const BlockBackground: React.FC<{ props: any }> = ({ props }) => {
    if (!props.backgroundImage) return null;
    return React.createElement('div', {
        className: "absolute inset-0 z-0 pointer-events-none transition-opacity duration-300",
        style: {
            backgroundImage: `url(${props.backgroundImage})`,
            opacity: props.backgroundImageOpacity ?? 1,
            backgroundSize: props.backgroundMode || 'cover',
            backgroundRepeat: props.backgroundMode === 'tile' ? 'repeat' : 'no-repeat',
            backgroundPosition: 'center',
        }
    });
};

const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0, 0, 0';
};

export const getCommonBlockStyle = (props: any) => {
    // Priority: Individual Block Style -> Global Surface Style
    const bg = props.backgroundColor || 'var(--surface)';
    return {
        backgroundColor: bg,
        backdropFilter: 'blur(var(--blur))',
        WebkitBackdropFilter: 'blur(var(--blur))',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow)',
        color: 'var(--text)',
        position: 'relative' as const,
        overflow: 'hidden' as const
    };
};

export const renderStaticBackground = (p: any) => p.backgroundImage ? `<div style="position:absolute;inset:0;background-image:url('${p.backgroundImage}');opacity:${p.backgroundImageOpacity??1};background-size:${p.backgroundMode||'cover'};background-position:center;z-index:0"></div>` : '';
export const getCommonStaticStyleString = (p: any) => `background-color:${p.backgroundColor || 'var(--surface)'};backdrop-filter:blur(var(--blur));border-radius:var(--radius);border:1px solid var(--border);box-shadow:var(--shadow);position:relative;overflow:hidden;`;
