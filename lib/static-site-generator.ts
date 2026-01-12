import JSZip from 'jszip';
import { MenuNode, Page, SiteSettings, Block } from '../types';
import { BLOCK_DEFINITIONS } from './blocks'; 

// --- HTML Template Generators ---

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
      }
      body {
        background-color: var(--bg);
        color: var(--text);
        font-family: ${theme['--font-sans'].replace(/"/g, "'")};
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
      /* Grid System mirror */
      .bento-grid {
        display: grid;
        grid-template-columns: repeat(12, minmax(0, 1fr));
        gap: 16px;
        grid-auto-rows: 140px; /* Fixed row height to match editor roughly */
        max-width: 1152px;
        margin: 0 auto;
        padding: 16px;
      }
      @media (max-width: 768px) {
        .bento-grid {
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          padding: 12px;
        }
      }
    </style>
  </head>
`;

// Helper to get grid styles for a block (Layout Wrapper)
const getBlockWrapperStyle = (props: any) => {
    const colSpan = props.colSpan || 4;
    const rowSpan = props.rowSpan || 2;
    const colStart = props.colStart;
    const rowStart = props.rowStart;

    let style = `grid-column: span ${colSpan}; grid-row: span ${rowSpan};`;
    
    if (colStart && rowStart) {
        style = `grid-column: ${colStart} / span ${colSpan}; grid-row: ${rowStart} / span ${rowSpan};`;
    }
    
    return style;
};

// --- Block Renderer Delegate ---

const renderBlock = (block: Block, context: any) => {
    const def = BLOCK_DEFINITIONS.find(d => d.slug === block.type);
    if (def && def.render) {
        // Delegate to the component's own render function
        return def.render(block.props, context);
    }
    // Fallback for missing renderers
    return `<div style="border: 1px dashed red; padding: 10px;">Missing Renderer for ${block.type}</div>`;
};

const generatePageHtml = (page: Page, siteSettings: SiteSettings, menu: MenuNode[], pages: Record<string, Page>) => {
    const context = { siteSettings, menu, pages, activePageId: page.id };
    
    const blocksHtml = page.blocks.map(block => {
        const style = getBlockWrapperStyle(block.props);
        const content = renderBlock(block, context);
        return `<div style="${style}; position: relative;">${content}</div>`;
    }).join('\n');

    return `
<!DOCTYPE html>
<html lang="en">
${generateHead(page.title, siteSettings.theme)}
<body class="antialiased selection:bg-purple-500/30">
    <div class="min-h-screen w-full flex justify-center py-12">
        <div class="bento-grid w-full">
            ${blocksHtml}
        </div>
    </div>
</body>
</html>`;
};

// --- Export Function ---

export const generateStaticSite = async (
    siteSettings: SiteSettings, 
    menu: MenuNode[], 
    pages: Record<string, Page>
) => {
    const zip = new JSZip();

    // Helper to traverse and write
    const processNode = (node: MenuNode, currentPath: string) => {
        const safeName = node.label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        
        let myPath = currentPath;
        let fileName = 'index.html';

        if (node.id === 'home') {
            fileName = 'index.html';
            myPath = ''; 
        } else {
            myPath = currentPath ? `${currentPath}/${safeName}` : safeName;
            fileName = `${safeName}.html`;
        }

        const page = pages[node.id];
        if (page) {
            // Pass full context to generation for linking
            const html = generatePageHtml(page, siteSettings, menu, pages);
            if (myPath === '') {
                zip.file(fileName, html);
            } else {
                const folder = zip.folder(myPath);
                if (folder) folder.file(fileName, html);
            }
        }

        if (node.children && node.children.length > 0) {
            node.children.forEach(child => {
                processNode(child, myPath);
            });
        }
    };

    menu.forEach(node => processNode(node, ''));

    const content = await zip.generateAsync({ type: 'blob' });
    return content;
};