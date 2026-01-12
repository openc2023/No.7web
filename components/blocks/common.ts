
import React from 'react';

export const COMMON_GRID_FIELDS = [
  { name: 'colSpan', label: 'W (Desktop)', type: 'number', default: 4 },
  { name: 'rowSpan', label: 'H (Desktop)', type: 'number', default: 4 },
  { name: 'colStart', label: 'X (Desktop)', type: 'number', default: 'auto' },
  { name: 'rowStart', label: 'Y (Desktop)', type: 'number', default: 'auto' },
  { name: 'mobile_colSpan', label: 'W (Mobile)', type: 'number', default: 4 }, 
  { name: 'mobile_rowSpan', label: 'H (Mobile)', type: 'number', default: 2 },
  // Custom Card Styles
  { name: 'backgroundColor', label: 'Bg Color', type: 'color', default: '' },
  { name: 'backgroundImage', label: 'Bg Image', type: 'image', default: '' },
  { name: 'backgroundMode', label: 'Bg Mode', type: 'select', options: ['cover', 'tile'], default: 'cover' },
  { name: 'backgroundImageOpacity', label: 'Img Opacity (0-1)', type: 'number', default: 0.4 }
];

// --- React Helper: Background Layer ---
export const BlockBackground: React.FC<{ props: any }> = ({ props }) => {
    if (!props.backgroundImage) return null;
    
    return React.createElement('div', {
        className: "absolute inset-0 z-0 pointer-events-none transition-opacity duration-300",
        style: {
            backgroundImage: `url(${props.backgroundImage})`,
            opacity: props.backgroundImageOpacity !== undefined ? props.backgroundImageOpacity : 1,
            backgroundSize: props.backgroundMode === 'tile' ? 'auto' : 'cover',
            backgroundRepeat: props.backgroundMode === 'tile' ? 'repeat' : 'no-repeat',
            backgroundPosition: 'center',
        }
    });
};

// --- React Helper: Common Styles ---
export const getCommonBlockStyle = (props: any) => {
    return {
        backgroundColor: props.backgroundColor || 'var(--surface)',
        backdropFilter: 'blur(var(--blur))',
        WebkitBackdropFilter: 'blur(var(--blur))',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow)',
        color: props.backgroundColor ? 'inherit' : 'var(--text)' 
    };
};

// --- Static Generator Helper: Background HTML String ---
export const renderStaticBackground = (props: any) => {
    if (!props.backgroundImage) return '';
    return `
        <div style="
            position: absolute; inset: 0; z-index: 0; pointer-events: none;
            background-image: url('${props.backgroundImage}');
            opacity: ${props.backgroundImageOpacity ?? 0.4};
            background-size: ${props.backgroundMode === 'tile' ? 'auto' : 'cover'};
            background-repeat: ${props.backgroundMode === 'tile' ? 'repeat' : 'no-repeat'};
            background-position: center;
        "></div>
    `;
};

// --- Static Generator Helper: Common CSS String ---
export const getCommonStaticStyleString = (props: any) => {
    const bg = props.backgroundColor || 'var(--surface)';
    const color = props.backgroundColor ? 'inherit' : 'var(--text)';
    
    return `
        background-color: ${bg};
        backdrop-filter: blur(var(--blur));
        -webkit-backdrop-filter: blur(var(--blur));
        border-radius: var(--radius);
        border: 1px solid var(--border);
        box-shadow: var(--shadow);
        color: ${color};
    `;
};
