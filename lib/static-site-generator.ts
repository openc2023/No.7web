
import JSZip from 'jszip';
import { MenuNode, Page, SiteSettings, Block } from '../types';
import { BLOCK_DEFINITIONS } from './blocks'; 

// --- Helper: Generate safe filename from menu nodes ---
const getPageFilename = (nodeId: string, menu: MenuNode[]): string => {
    if (nodeId === 'home') return 'index.html';
    
    const findNode = (nodes: MenuNode[]): MenuNode | null => {
        for (const n of nodes) {
            if (n.id === nodeId) return n;
            if (n.children) {
                const found = findNode(n.children);
                if (found) return found;
            }
        }
        return null;
    };

    const node = findNode(menu);
    if (!node) return `${nodeId}.html`;
    return `${node.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.html`;
};

const generateHead = (title: string, theme: any) => `
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <script src="https://cdn.tailwindcss.com?plugins=typography"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;700&display=swap" rel="stylesheet">
    <style>
      :root {
        --bg: ${theme['--bg']};
        --surface: ${theme['--surface']};
        --text: ${theme['--text']};
        --muted: ${theme['--muted']};
        --border: ${theme['--border']};
        --primary: ${theme['--primary']};
        --radius: ${theme['--radius']};
        --blur: ${theme['--blur']};
        --shadow: ${theme['--shadow']};
        --font-sans: ${theme['--font-sans'] || '"Plus Jakarta Sans", sans-serif'};
      }
      * { box-sizing: border-box; }
      body {
        background-color: var(--bg);
        color: var(--text);
        font-family: var(--font-sans);
        margin: 0;
        min-height: 100vh;
        ${theme['--bg-image'] ? `background-image: url('${theme['--bg-image']}'); background-size: cover; background-attachment: fixed; background-position: center;` : ''}
      }
      .glass-panel {
        background-color: var(--surface);
        backdrop-filter: blur(var(--blur));
        -webkit-backdrop-filter: blur(var(--blur));
        border-radius: var(--radius);
        border: 1px solid var(--border);
        box-shadow: var(--shadow);
      }
      .bento-grid {
        display: grid;
        grid-template-columns: repeat(12, minmax(0, 1fr));
        gap: 16px;
        grid-auto-rows: 140px;
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
      }
      .layout-container {
        display: flex;
        min-height: 100vh;
        width: 100%;
      }
      .layout-container.layout-top { flex-direction: column; }
      .layout-container.layout-left { flex-direction: row; }
      .layout-container.layout-right { flex-direction: row-reverse; }

      .side-header { width: 280px; flex-shrink: 0; height: 100vh; position: sticky; top: 0; }
      .top-header { width: 100%; position: sticky; top: 0; z-index: 50; }
      .main-content { flex: 1; padding: 40px 20px; display: flex; justify-content: center; }

      @media (max-width: 768px) {
        .layout-container.layout-left, .layout-container.layout-right { flex-direction: column; }
        .side-header { width: 100%; height: auto; position: relative; }
        .bento-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
      }
    </style>
  </head>
`;

const renderBlock = (block: Block, context: any) => {
    const def = BLOCK_DEFINITIONS.find(d => d.slug === block.type);
    if (def && def.render) {
        return def.render(block.props, context);
    }
    return `<div style="border: 1px dashed red; padding: 10px;">Missing Renderer for ${block.type}</div>`;
};

const getBlockWrapperStyle = (props: any) => {
    const colSpan = props.colSpan || 4;
    const rowSpan = props.rowSpan || 2;
    const colStart = props.colStart;
    const rowStart = props.rowStart;
    let style = `grid-column: span ${colSpan}; grid-row: span ${rowSpan}; position: relative;`;
    if (colStart && rowStart && colStart !== 'auto') {
        style = `grid-column: ${colStart} / span ${colSpan}; grid-row: ${rowStart} / span ${rowSpan}; position: relative;`;
    }
    return style;
};

const generatePageHtml = (page: Page, siteSettings: SiteSettings, menu: MenuNode[], pages: Record<string, Page>) => {
    const headerBlock = page.blocks.find(b => b.type === 'page-header');
    const layoutPos = headerBlock?.props.layoutPosition || 'top';
    const isVertical = layoutPos === 'left' || layoutPos === 'right';

    const context = { siteSettings, menu, pages, activePageId: page.id };

    const gridBlocks = page.blocks.filter(b => b.type !== 'page-header');
    const gridHtml = gridBlocks.map(block => {
        return `<div style="${getBlockWrapperStyle(block.props)}">${renderBlock(block, context)}</div>`;
    }).join('\n');

    const headerHtml = headerBlock ? renderBlock(headerBlock, context) : '';

    return `<!DOCTYPE html>
<html lang="en">
${generateHead(page.title, siteSettings.theme)}
<body class="antialiased">
    <div class="layout-container layout-${layoutPos}">
        ${headerBlock ? `<div class="${isVertical ? 'side-header' : 'top-header'}">${headerHtml}</div>` : ''}
        <main class="main-content">
            <div class="bento-grid">
                ${gridHtml}
            </div>
        </main>
    </div>
</body>
</html>`;
};

export const generateStaticSite = async (
    siteSettings: SiteSettings, 
    menu: MenuNode[], 
    pages: Record<string, Page>
) => {
    const zip = new JSZip();

    // Mapping for links: PageID -> Filename.html
    const linkMap: Record<string, string> = {};
    const traverse = (nodes: MenuNode[]) => {
        nodes.forEach(node => {
            linkMap[node.id] = getPageFilename(node.id, menu);
            if (node.children) traverse(node.children);
        });
    };
    traverse(menu);

    // Process all pages in the pages dictionary
    // We iterate over the pages dictionary to ensure even un-linked pages are exported if they exist
    // But we prioritize pages in the menu for naming
    for (const [id, page] of Object.entries(pages)) {
        const filename = linkMap[id] || `${id}.html`;
        const html = generatePageHtml(page, siteSettings, menu, pages);
        zip.file(filename, html);
    }

    return await zip.generateAsync({ type: 'blob' });
};
