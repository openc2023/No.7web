
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Menu, 
  Box, 
  Layers, 
  Settings, 
  Play, 
  Monitor, 
  Smartphone, 
  Tablet,
  Download,
  Save,
  Plus
} from 'lucide-react';
import { Canvas } from './components/Canvas';
import { StructureTree } from './components/StructureTree';
import { ComponentLibrary } from './components/ComponentLibrary';
import { PropertyPanel } from './components/PropertyPanel';
import { TopBar } from './components/TopBar';
import { EditorState, Block, ComponentDefinition, Page, MenuNode, SiteSettings } from './types';
import { MOCK_COMPONENTS, MOCK_MENU, DEFAULT_SITE_SETTINGS } from './constants';

const App: React.FC = () => {
  // --- Helpers ---
  const getNavLinksString = (currentMenu: MenuNode[]) => {
    return currentMenu.map(node => node.label).join(', ');
  };

  // --- State ---
  const [menu, setMenu] = useState<MenuNode[]>(MOCK_MENU);
  
  const initialNavLinks = getNavLinksString(MOCK_MENU);
  
  const [activePageId, setActivePageId] = useState<string>('home');
  const [pages, setPages] = useState<Record<string, Page>>({
    home: {
      id: 'home',
      title: 'Home',
      blocks: [
        // Header at Top (Default)
        { id: 'h1', type: 'page-header', props: { navLinks: 'Home, Works, About', sticky: true, layoutPosition: 'top' } },
        
        // Row 2 (Shifted down so Header can occupy Row 1)
        { id: 'p1', type: 'profile-section', props: { name: 'Yysuni Clone', bio: 'Frontend Developer & UI Designer.', avatar: 'https://github.com/shadcn.png', showSocials: true, colSpan: 6, rowSpan: 4, colStart: 1, rowStart: 2 } },
        { id: 'l1', type: 'link-card', props: { label: 'Twitter', sublabel: '@yysuni', icon: 'twitter', url: '#', colSpan: 3, rowSpan: 2, colStart: 7, rowStart: 2 } },
        { id: 'l2', type: 'link-card', props: { label: 'GitHub', sublabel: 'Open Source', icon: 'github', url: '#', colSpan: 3, rowSpan: 2, colStart: 10, rowStart: 2 } },
        
        // Row 4
        { id: 'ts1', type: 'tech-stack', props: { title: 'My Stack', items: 'React, Next.js, Tailwind, Node.js, TypeScript, Figma', colSpan: 6, rowSpan: 2, colStart: 7, rowStart: 4 } },
        
        // Row 6
        { id: 'b1', type: 'bento-item', props: { title: 'Project Alpha', image: 'https://picsum.photos/600/600', colSpan: 6, rowSpan: 4, colStart: 1, rowStart: 6 } },
        { id: 'b2', type: 'bento-item', props: { title: 'Photography', image: 'https://picsum.photos/600/400', colSpan: 3, rowSpan: 2, colStart: 7, rowStart: 6 } },
        { id: 'b3', type: 'bento-item', props: { title: 'Map', image: 'https://picsum.photos/600/402', colSpan: 3, rowSpan: 2, colStart: 10, rowStart: 6 } },
        { id: 'b4', type: 'bento-item', props: { title: 'Design System', image: 'https://picsum.photos/600/403', colSpan: 6, rowSpan: 2, colStart: 7, rowStart: 8 } },
      ]
    },
    projects: {
      id: 'projects',
      title: 'Projects',
      blocks: [
        { id: 'h2', type: 'page-header', props: { navLinks: initialNavLinks, sticky: true, layoutPosition: 'top' } },
        
        // Row 2: Header (Left) + Tech Stack (Right)
        { id: 'rt1', type: 'rich-text', props: { content: '<h1>My Work</h1><p>Selected projects from 2023-2024.</p>', colSpan: 8, rowSpan: 1, colStart: 1, rowStart: 2 } },
        { id: 'ts1', type: 'tech-stack', props: { title: 'Expertise', items: 'React, Next.js, TypeScript, Tailwind CSS', colSpan: 4, rowSpan: 2, colStart: 9, rowStart: 2 } },
        
        // Row 3: Child Pages Grid (Left) + Link Card (Right)
        { id: 'cp1', type: 'child-pages-grid', props: { layout: 'grid', showThumbnail: true, showDescription: true, colSpan: 8, rowSpan: 5, colStart: 1, rowStart: 3 } },
        { id: 'l_proj', type: 'link-card', props: { label: 'Contact Me', sublabel: 'Available for hire', icon: 'mail', url: '#', colSpan: 4, rowSpan: 2, colStart: 9, rowStart: 4 } }
      ]
    },
    'saas-dashboard': {
        id: 'saas-dashboard',
        title: 'SaaS Dashboard',
        blocks: [
             { id: 'h_sd', type: 'page-header', props: { navLinks: initialNavLinks, sticky: true, layoutPosition: 'top' } },
             
             // Content: Split Layout (Text Left, Meta Right)
             { id: 'rt_sd', type: 'rich-text', props: { content: '<h1>SaaS Dashboard</h1><p>This is a detailed case study about the dashboard project. We focused on high performance data visualization and a clean, accessible user interface.</p><h3>Key Features</h3><ul><li>Real-time analytics</li><li>Role-based access control</li><li>Dark mode support</li></ul>', colSpan: 8, rowSpan: 4, colStart: 1, rowStart: 2 } },
             
             { id: 'ts_sd', type: 'tech-stack', props: { title: 'Technologies', items: 'React, Next.js, Supabase, Tailwind', colSpan: 4, rowSpan: 2, colStart: 9, rowStart: 2 } },
             { id: 'lc_sd', type: 'link-card', props: { label: 'Live Demo', sublabel: 'app.dashboard.com', icon: 'globe', url: '#', colSpan: 4, rowSpan: 2, colStart: 9, rowStart: 4 } },

             // Full Width Image
             { id: 'bi_sd', type: 'bento-item', props: { title: 'Dashboard Preview', image: 'https://picsum.photos/800/600', colSpan: 12, rowSpan: 5, colStart: 1, rowStart: 6 } }
        ]
    },
    'ecommerce': {
        id: 'ecommerce',
        title: 'E-commerce',
        blocks: [
             { id: 'h_ec', type: 'page-header', props: { navLinks: initialNavLinks, sticky: true, layoutPosition: 'top' } },
             
             { id: 'rt_ec', type: 'rich-text', props: { content: '<h1>E-commerce Platform</h1><p>A full-stack shopping experience built with Next.js. Includes cart functionality, checkout flow, and admin panel.</p>', colSpan: 8, rowSpan: 4, colStart: 1, rowStart: 2 } },
             
             { id: 'ts_ec', type: 'tech-stack', props: { title: 'Stack', items: 'Next.js, Stripe, Prisma, PostgreSQL', colSpan: 4, rowSpan: 2, colStart: 9, rowStart: 2 } },
             { id: 'lc_ec', type: 'link-card', props: { label: 'Source Code', sublabel: 'GitHub', icon: 'github', url: '#', colSpan: 4, rowSpan: 2, colStart: 9, rowStart: 4 } },

             { id: 'bi_ec', type: 'bento-item', props: { title: 'Shop Preview', image: 'https://picsum.photos/800/601', colSpan: 12, rowSpan: 5, colStart: 1, rowStart: 6 } }
        ]
    }
  });
  
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [viewDevice, setViewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // --- Derived State ---
  const activePage = pages[activePageId] || pages['home'];
  const selectedBlock = activePage.blocks.find(b => b.id === selectedBlockId) || null;
  
  const selectedComponentDef = selectedBlock 
    ? MOCK_COMPONENTS.find(c => c.slug === selectedBlock.type) 
    : null;

  // --- Block Actions ---

  const handleBlockSelect = (blockId: string | null) => {
    setSelectedBlockId(blockId);
  };

  const handleUpdateBlockProps = (blockId: string, newProps: Record<string, any>) => {
    setPages(prev => ({
      ...prev,
      [activePageId]: {
        ...prev[activePageId],
        blocks: prev[activePageId].blocks.map(b => 
          b.id === blockId ? { ...b, props: { ...b.props, ...newProps } } : b
        )
      }
    }));
  };

  const handleReorderBlocks = (draggedId: string, targetId: string) => {
    setPages(prev => {
        const page = prev[activePageId];
        const blocks = [...page.blocks];
        const draggedIndex = blocks.findIndex(b => b.id === draggedId);
        const targetIndex = blocks.findIndex(b => b.id === targetId);

        if (draggedIndex === -1 || targetIndex === -1) return prev;

        const [draggedBlock] = blocks.splice(draggedIndex, 1);
        blocks.splice(targetIndex, 0, draggedBlock);

        return {
            ...prev,
            [activePageId]: {
                ...page,
                blocks
            }
        };
    });
  };

  const handleAddComponent = (componentSlug: string) => {
    const compDef = MOCK_COMPONENTS.find(c => c.slug === componentSlug);
    if (!compDef) return;

    const defaultProps: Record<string, any> = {};
    compDef.schema.fields.forEach(field => {
      if (field.default !== undefined) {
        defaultProps[field.name] = field.default;
      }
    });

    if (componentSlug === 'page-header') {
        defaultProps.navLinks = getNavLinksString(menu);
        defaultProps.layoutPosition = 'top';
    }
    
    // Auto-placement logic: Find the first available row at column 1 (naive)
    const maxRow = activePage.blocks.reduce((max, b) => {
        const rowEnd = (b.props.rowStart || 1) + (b.props.rowSpan || 1);
        return Math.max(max, rowEnd);
    }, 1);

    if (componentSlug !== 'page-header') {
        defaultProps.colStart = 1;
        defaultProps.rowStart = maxRow;
    }

    const newBlock: Block = {
      id: `blk_${Date.now()}`,
      type: componentSlug,
      props: defaultProps
    };

    setPages(prev => {
        const currentBlocks = prev[activePageId].blocks;
        let newBlocks = [...currentBlocks, newBlock];
        return {
          ...prev,
          [activePageId]: {
            ...prev[activePageId],
            blocks: newBlocks
          }
        };
    });
    
    setSelectedBlockId(newBlock.id);
  };

  const handleDeleteBlock = (blockId: string) => {
    setPages(prev => ({
      ...prev,
      [activePageId]: {
        ...prev[activePageId],
        blocks: prev[activePageId].blocks.filter(b => b.id !== blockId)
      }
    }));
    setSelectedBlockId(null);
  };

  const handleDuplicateBlock = (blockId: string) => {
    setPages(prev => {
      const page = prev[activePageId];
      const index = page.blocks.findIndex(b => b.id === blockId);
      if (index === -1) return prev;

      const blockToCopy = page.blocks[index];
      const newProps = JSON.parse(JSON.stringify(blockToCopy.props));
      if (newProps.rowStart) newProps.rowStart += 1; 

      const newBlock = {
        ...blockToCopy,
        id: `blk_${Date.now()}`,
        props: newProps
      };

      const newBlocks = [...page.blocks];
      newBlocks.splice(index + 1, 0, newBlock);

      return {
        ...prev,
        [activePageId]: {
          ...page,
          blocks: newBlocks
        }
      };
    });
  };

  const handleMoveBlock = (blockId: string, direction: 'up' | 'down') => {
    handleLayerBlock(blockId, direction === 'up' ? 'backward' : 'forward');
  };

  const handleLayerBlock = (blockId: string, action: 'front' | 'back' | 'forward' | 'backward') => {
    setPages(prev => {
      const page = prev[activePageId];
      const blocks = [...page.blocks];
      const index = blocks.findIndex(b => b.id === blockId);
      if (index === -1) return prev;

      const block = blocks[index];
      // Remove from current pos
      blocks.splice(index, 1);

      if (action === 'front') {
        blocks.push(block);
      } else if (action === 'back') {
        blocks.unshift(block);
      } else if (action === 'forward') {
        const newIndex = Math.min(blocks.length, index + 1);
        blocks.splice(newIndex, 0, block);
      } else if (action === 'backward') {
        const newIndex = Math.max(0, index - 1);
        blocks.splice(newIndex, 0, block);
      }

      return {
        ...prev,
        [activePageId]: {
          ...page,
          blocks
        }
      };
    });
  };

  // --- Page Actions ---

  const syncHeaders = (currentMenu: MenuNode[]) => {
      const newNavLinks = getNavLinksString(currentMenu);
      setPages(prev => {
          const nextPages = { ...prev };
          let hasChanges = false;
          Object.keys(nextPages).forEach(key => {
              const page = nextPages[key];
              const needsUpdate = page.blocks.some(b => 
                  b.type === 'page-header' && b.props.navLinks !== newNavLinks
              );
              if (needsUpdate) {
                  hasChanges = true;
                  nextPages[key] = {
                      ...page,
                      blocks: page.blocks.map(b => {
                          if (b.type === 'page-header' && b.props.navLinks !== newNavLinks) {
                              return { ...b, props: { ...b.props, navLinks: newNavLinks } };
                          }
                          return b;
                      })
                  };
              }
          });
          return hasChanges ? nextPages : prev;
      });
  };

  const handleAddPage = (title: string) => {
      const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      if (pages[id]) {
          alert("Page already exists");
          setActivePageId(id);
          return;
      }

      const newMenuNode: MenuNode = {
          id,
          label: title,
          type: 'page',
          filename: `${id}.json`,
          children: []
      };

      let newMenu = [...menu];

      // Logic: If active page is NOT home, add as child of active page
      if (activePageId && activePageId !== 'home') {
          const addAsChild = (nodes: MenuNode[]): MenuNode[] => {
              return nodes.map(node => {
                  if (node.id === activePageId) {
                      return {
                          ...node,
                          collapsed: false,
                          children: [...(node.children || []), newMenuNode]
                      };
                  }
                  if (node.children) {
                      return { ...node, children: addAsChild(node.children) };
                  }
                  return node;
              });
          };
          newMenu = addAsChild(newMenu);
      } else {
          // Add to root
          newMenu.push(newMenuNode);
      }

      setMenu(newMenu);
      
      const newNavLinks = getNavLinksString(newMenu);
      const now = Date.now();

      // Create new page with a robust default layout (8+4 grid)
      // This prevents visual issues on desktop where a single block might look unbalanced
      const newPage: Page = {
          id,
          title,
          blocks: [
              { 
                  id: `h_${now}`, 
                  type: 'page-header', 
                  props: { 
                      navLinks: newNavLinks, 
                      sticky: true,
                      layoutPosition: 'top'
                  } 
              },
              // Content Area (8 Columns)
              {
                  id: `b_${now + 1}`,
                  type: 'rich-text',
                  props: { 
                      content: `<h1>${title}</h1><p>Start editing...</p>`,
                      colSpan: 8, rowSpan: 3, colStart: 1, rowStart: 2
                  }
              },
              // Sidebar Area (4 Columns) - Adds immediate structure
              {
                  id: `s_${now + 2}`,
                  type: 'tech-stack',
                  props: { 
                      title: 'Info', 
                      items: 'Draft, New Page',
                      colSpan: 4, rowSpan: 2, colStart: 9, rowStart: 2 
                  }
              }
          ]
      };

      setPages(prev => {
          const nextPages = { ...prev, [id]: newPage };
          // Update all headers
          Object.keys(nextPages).forEach(key => {
              const page = nextPages[key];
              const needsUpdate = page.blocks.some(b => b.type === 'page-header' && b.props.navLinks !== newNavLinks);
              if (needsUpdate) {
                  nextPages[key] = {
                      ...page,
                      blocks: page.blocks.map(b => {
                          if (b.type === 'page-header') {
                              return { ...b, props: { ...b.props, navLinks: newNavLinks } };
                          }
                          return b;
                      })
                  };
              }
          });
          return nextPages;
      });

      setActivePageId(id);
      setSelectedBlockId(null);
  };

  const handleDeletePage = (pageId: string) => {
     if (pageId === 'home') {
         alert("Cannot delete home page");
         return;
     }
     if (!window.confirm("Delete this page?")) return;
     
     // 1. Remove from menu (Immutable)
     const removeNode = (nodes: MenuNode[]): MenuNode[] => {
         return nodes.filter(n => n.id !== pageId).map(n => {
             if (n.children) {
                 return { ...n, children: removeNode(n.children) };
             }
             return n;
         });
     };
     const newMenu = removeNode(menu);
     setMenu(newMenu);
     syncHeaders(newMenu);
     
     // 2. Remove from pages
     setPages(prev => {
         const next = { ...prev };
         delete next[pageId];
         return next;
     });
     
     // 3. Reset active page if needed
     if (activePageId === pageId) setActivePageId('home');
  };

  const handleMoveNode = (draggedId: string, targetId: string) => {
    if (draggedId === targetId) return;

    // 1. Find and Remove Dragged Node (Immutable)
    let draggedNode: MenuNode | null = null;

    const removeNodeRecursive = (nodes: MenuNode[]): MenuNode[] => {
        const result: MenuNode[] = [];
        for (const node of nodes) {
            if (node.id === draggedId) {
                draggedNode = node;
                continue; // Skip (remove)
            }
            if (node.children) {
                const newChildren = removeNodeRecursive(node.children);
                if (newChildren !== node.children) {
                    result.push({ ...node, children: newChildren });
                } else {
                    result.push(node);
                }
            } else {
                result.push(node);
            }
        }
        return result;
    };

    const menuWithoutDragged = removeNodeRecursive(menu);
    
    if (!draggedNode) return;

    // 2. Insert into Target (Immutable)
    let finalMenu: MenuNode[] = [];

    if (targetId === 'root') {
        // Move to root level
        finalMenu = [...menuWithoutDragged, draggedNode];
    } else {
        // Insert into specific target node
        const insertNodeRecursive = (nodes: MenuNode[]): MenuNode[] => {
            return nodes.map(node => {
                if (node.id === targetId) {
                    return {
                        ...node,
                        collapsed: false,
                        children: [...(node.children || []), draggedNode!]
                    };
                }
                if (node.children) {
                    const newChildren = insertNodeRecursive(node.children);
                    if (newChildren !== node.children) {
                        return { ...node, children: newChildren };
                    }
                }
                return node;
            });
        };
        finalMenu = insertNodeRecursive(menuWithoutDragged);
    }
    
    setMenu(finalMenu);
    syncHeaders(finalMenu);
  };

  const handlePageChange = (pageId: string) => {
    if (pages[pageId]) {
        setActivePageId(pageId);
        setSelectedBlockId(null);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-zinc-950 text-zinc-200 font-sans overflow-hidden">
      
      <TopBar 
        activePage={activePage}
        viewDevice={viewDevice}
        setViewDevice={setViewDevice}
        onSave={() => alert('Saved site.json with current theme and pages.')}
        onPublish={() => alert('Exporting static site...')}
      />

      <div className="flex flex-1 overflow-hidden relative">
        
        <div className="w-64 border-r border-zinc-800 bg-zinc-900 flex flex-col">
          <div className="h-full overflow-y-auto">
             <StructureTree 
                menu={menu} 
                activePageId={activePageId}
                onSelectPage={handlePageChange}
                onAddPage={handleAddPage}
                onDeletePage={handleDeletePage}
                onMoveNode={handleMoveNode}
                blocks={activePage.blocks}
                selectedBlockId={selectedBlockId}
                onSelectBlock={handleBlockSelect}
             />
          </div>
        </div>

        <div className="flex-1 bg-zinc-950 relative flex flex-col items-center justify-start overflow-hidden">
           <Canvas 
              blocks={activePage.blocks}
              viewDevice={viewDevice}
              selectedBlockId={selectedBlockId}
              onSelectBlock={handleBlockSelect}
              onDeleteBlock={handleDeleteBlock}
              onDuplicateBlock={handleDuplicateBlock}
              onMoveBlock={handleMoveBlock}
              onLayerBlock={handleLayerBlock}
              onReorderBlock={handleReorderBlocks}
              onUpdateBlockProps={handleUpdateBlockProps}
              componentDefs={MOCK_COMPONENTS}
              siteSettings={siteSettings}
              // Pass Global State for Context-Aware Blocks
              menu={menu}
              pages={pages}
              activePageId={activePageId}
              onSelectPage={handlePageChange}
           />
        </div>

        <div className="w-72 border-l border-zinc-800 bg-zinc-900 flex flex-col">
          <ComponentLibrary 
            components={MOCK_COMPONENTS} 
            onAddComponent={handleAddComponent} 
          />
        </div>

      </div>

      <div className="h-72 border-t border-zinc-800 bg-zinc-900 w-full z-10 flex flex-col shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.3)]">
         <PropertyPanel 
            selectedBlock={selectedBlock}
            componentDef={selectedComponentDef}
            onUpdateProps={handleUpdateBlockProps}
            siteSettings={siteSettings}
            onUpdateSiteSettings={setSiteSettings}
         />
      </div>

    </div>
  );
};

export default App;
