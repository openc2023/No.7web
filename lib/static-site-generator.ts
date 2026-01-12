
import JSZip from 'jszip';
import { MenuNode, Page, SiteSettings, Block } from '../types';
import { BLOCK_DEFINITIONS } from './blocks'; 

interface PathInfo {
    fullPath: string;
    depth: number;
}

interface AssetRegistry {
    [dataUrl: string]: string; // map of DataURL to relative path in ZIP
}

const buildPathMap = (nodes: MenuNode[], currentDir: string = '', depth: number = 0): Record<string, PathInfo> => {
    let map: Record<string, PathInfo> = {};
    nodes.forEach(node => {
        const safeLabel = node.label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const filename = node.id === 'home' ? 'index.html' : `${safeLabel}.html`;
        const fullPath = currentDir ? `${currentDir}/${filename}` : filename;
        if (node.type === 'page') map[node.id] = { fullPath, depth };
        if (node.children && node.children.length > 0) {
            const subfolder = currentDir ? `${currentDir}/${safeLabel}` : safeLabel;
            Object.assign(map, buildPathMap(node.children, subfolder, depth + 1));
        }
    });
    return map;
};

const getRelativePath = (fromDepth: number, toPath: string) => '../'.repeat(fromDepth) + toPath;

const processAssets = (data: any, registry: AssetRegistry): any => {
    if (!data) return data;
    if (typeof data === 'string' && data.startsWith('data:')) {
        if (!registry[data]) {
            const ext = data.split(';')[0].split('/')[1] || 'png';
            const name = `asset_${Object.keys(registry).length + 1}.${ext}`;
            registry[data] = `assets/${name}`;
        }
        return registry[data];
    }
    if (Array.isArray(data)) return data.map(item => processAssets(item, registry));
    if (typeof data === 'object') {
        const next: any = {};
        for (const k in data) next[k] = processAssets(data[k], registry);
        return next;
    }
    return data;
};

const getBlockResponsiveStyles = (block: Block) => {
    const props = block.props;
    if (block.type === 'page-header') return '';
    const generateCSS = (device: 'desktop' | 'tablet' | 'mobile') => {
        const prefix = device === 'desktop' ? '' : `${device}_`;
        const maxCols = device === 'mobile' ? 4 : device === 'tablet' ? 8 : 12;
        let colSpan = props[`${prefix}colSpan`] ?? (device === 'mobile' ? (props.colSpan <= 3 ? 2 : 4) : device === 'tablet' ? Math.max(1, Math.round((props.colSpan||4) * (8/12))) : (props.colSpan||4));
        const rowSpan = props[`${prefix}rowSpan`] || props.rowSpan || 1;
        const colStart = props[`${prefix}colStart`];
        const rowStart = props[`${prefix}rowStart`];
        return (colStart && rowStart) ? `grid-column: ${colStart} / span ${colSpan}; grid-row: ${rowStart} / span ${rowSpan};` : `grid-column: span ${colSpan}; grid-row: span ${rowSpan};`;
    };
    return `#${block.id} { ${generateCSS('desktop')} } @media (max-width: 1024px) { #${block.id} { ${generateCSS('tablet')} } } @media (max-width: 768px) { #${block.id} { ${generateCSS('mobile')} } }`;
};

const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0, 0, 0';
};

const generateHead = (title: string, theme: SiteSettings['theme'], blocks: Block[], depth: number) => {
    const blockStyles = blocks.map(b => getBlockResponsiveStyles(b)).join('\n');
    const assetPathPrefix = '../'.repeat(depth);
    const bgImage = theme['--bg-type'] === 'image' && theme['--bg-image'] 
        ? (theme['--bg-image'].startsWith('data:') ? `${assetPathPrefix}${theme['--bg-image']}` : theme['--bg-image']) 
        : '';

    const surfaceRgb = hexToRgb(theme['--surface'] || '#141417');
    const surfaceOpacity = theme['--surface-opacity'] || '0.6';

    return `
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <script src="https://cdn.tailwindcss.com?plugins=typography"></script>
    <style>
      :root {
        --bg: ${theme['--bg-type'] === 'color' ? theme['--bg'] : 'transparent'};
        --surface: rgba(${surfaceRgb}, ${surfaceOpacity});
        --text: ${theme['--text']};
        --muted: ${theme['--muted']};
        --border: ${theme['--border']};
        --primary: ${theme['--primary']};
        --radius: ${theme['--radius']};
        --blur: ${theme['--blur']};
        --shadow: ${theme['--shadow']};
        --font-sans: ${theme['--font-sans']};
      }
      body {
        background-color: var(--bg);
        color: var(--text);
        margin: 0; min-height: 100vh;
        font-family: var(--font-sans);
        ${bgImage ? `background-image: url('${bgImage}'); background-size: cover; background-attachment: fixed; background-position: center;` : ''}
      }
      .bento-grid { 
        display: grid; 
        grid-template-columns: repeat(12, minmax(0, 1fr)); 
        gap: ${theme['--gap'] || '16px'}; 
        grid-auto-rows: ${theme['--cell-size'] || '140px'}; 
        width: 100%; 
        max-width: 1200px; 
        margin: 0 auto; 
        padding: 32px; 
      }
      @media (max-width: 1024px) { 
        .bento-grid { 
          grid-template-columns: repeat(8, minmax(0, 1fr)); 
          padding: 24px; 
          gap: ${theme['--tablet-gap'] || '12px'}; 
          grid-auto-rows: ${theme['--tablet-cell-size'] || '115px'}; 
        } 
      }
      @media (max-width: 768px) { 
        .bento-grid { 
          grid-template-columns: repeat(4, minmax(0, 1fr)); 
          gap: ${theme['--mobile-gap'] || '10px'}; 
          grid-auto-rows: ${theme['--mobile-cell-size'] || '100px'}; 
          padding: 16px; 
        } 
      }
      .glass-panel { background-color: var(--surface); backdrop-filter: blur(var(--blur)); -webkit-backdrop-filter: blur(var(--blur)); border-radius: var(--radius); border: 1px solid var(--border); box-shadow: var(--shadow); }
      .block-wrapper { position: relative; width: 100%; height: 100%; }
      ${blockStyles}
    </style>
  </head>`;
};

export const generateStaticSite = async (siteSettings: SiteSettings, menu: MenuNode[], pages: Record<string, Page>) => {
    const zip = new JSZip();
    const assetRegistry: AssetRegistry = {};
    const pathMap = buildPathMap(menu);

    // 1. First pass: Process global assets
    const processedSettings = processAssets(JSON.parse(JSON.stringify(siteSettings)), assetRegistry);

    // 2. Process all pages and blocks
    const renderedPages: Record<string, string> = {};
    for (const [pid, pinfo] of Object.entries(pathMap)) {
        const page = pages[pid];
        if (!page) continue;
        
        const processedPage = processAssets(JSON.parse(JSON.stringify(page)), assetRegistry);
        const context = {
            siteSettings: processedSettings,
            menu, pages, activePageId: pid,
            getHref: (tid: string) => { const t = pathMap[tid]; return t ? getRelativePath(pinfo.depth, t.fullPath) : '#'; }
        };

        const headerBlock = processedPage.blocks.find(b => b.type === 'page-header');
        const gridBlocks = processedPage.blocks.filter(b => b.type !== 'page-header');
        
        const defs = BLOCK_DEFINITIONS;
        const headerHtml = headerBlock ? (defs.find(d => d.slug === 'page-header')?.render?.(headerBlock.props, context) || '') : '';
        const gridHtml = gridBlocks.map(b => `<div id="${b.id}" class="block-wrapper">${defs.find(d => d.slug === b.type)?.render?.(b.props, context) || ''}</div>`).join('\n');

        renderedPages[pid] = `<!DOCTYPE html>
<html lang="en">
${generateHead(page.title, processedSettings.theme, processedPage.blocks, pinfo.depth)}
<body>
    ${processedSettings.theme['--bg-type'] === 'code' ? `<div style="position:fixed;inset:0;z-index:-1">${processedSettings.theme['--bg-code']}</div>` : ''}
    <div class="layout-container">
        <header>${headerHtml}</header>
        <main class="bento-grid">${gridHtml}</main>
    </div>
</body>
</html>`;
    }

    // 3. Add HTML files to ZIP
    for (const pid in renderedPages) zip.file(pathMap[pid].fullPath, renderedPages[pid]);

    // 4. Convert DataURLs to binary files and add to assets/
    for (const [dataUrl, relPath] of Object.entries(assetRegistry)) {
        const parts = dataUrl.split(',');
        const byteString = atob(parts[1]);
        const mimeString = parts[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
        zip.file(relPath, new Blob([ab], { type: mimeString }));
    }

    return await zip.generateAsync({ type: 'blob' });
};
