
import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Plus,
  Loader2
} from 'lucide-react';
import { Canvas } from './components/Canvas';
import { StructureTree } from './components/StructureTree';
import { ComponentLibrary } from './components/ComponentLibrary';
import { PropertyPanel } from './components/PropertyPanel';
import { TopBar } from './components/TopBar';
import { GitHubSettings } from './components/GitHubSettings';
import { EditorState, Block, ComponentDefinition, Page, MenuNode, SiteSettings, GitHubConfig } from './types';
import { MOCK_COMPONENTS, MOCK_MENU, DEFAULT_SITE_SETTINGS } from './constants';
import { GitHubAdapter } from './lib/github-adapter';

const App: React.FC = () => {
  // --- Helpers ---
  const getNavLinksString = (currentMenu: MenuNode[]) => {
    return currentMenu.map(node => node.label).join(', ');
  };

  // --- State ---
  const [menu, setMenu] = useState<MenuNode[]>(MOCK_MENU);
  
  const [activePageId, setActivePageId] = useState<string>('home');
  // Pages cache (loaded pages are stored here)
  const [pages, setPages] = useState<Record<string, Page>>({
    // Keep initial mock data for "Demo Mode" until GitHub connects
    home: {
      id: 'home',
      title: 'Home',
      blocks: [
        { id: 'h1', type: 'page-header', props: { navLinks: 'Home, Works, About', sticky: true, layoutPosition: 'top' } },
        { id: 'p1', type: 'profile-section', props: { name: 'Yysuni Clone', bio: 'Frontend Developer & UI Designer.', avatar: 'https://github.com/shadcn.png', showSocials: true, colSpan: 6, rowSpan: 4, colStart: 1, rowStart: 2 } },
        { id: 'ts1', type: 'tech-stack', props: { title: 'My Stack', items: 'React, Next.js, Tailwind, Node.js, TypeScript, Figma', colSpan: 6, rowSpan: 2, colStart: 7, rowStart: 4 } },
        { id: 'b1', type: 'bento-item', props: { title: 'Project Alpha', image: 'https://picsum.photos/600/600', colSpan: 6, rowSpan: 4, colStart: 1, rowStart: 6 } },
      ]
    }
  });
  
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [viewDevice, setViewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // --- GitHub Adapter State ---
  const [showGitHubSettings, setShowGitHubSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [adapter, setAdapter] = useState<GitHubAdapter | null>(null);
  const [githubError, setGithubError] = useState<string | null>(null);

  // --- Derived State ---
  const activePage = pages[activePageId] || { id: activePageId, title: 'Loading...', blocks: [] };
  const selectedBlock = activePage.blocks.find(b => b.id === selectedBlockId) || null;
  
  const selectedComponentDef = selectedBlock 
    ? MOCK_COMPONENTS.find(c => c.slug === selectedBlock.type) 
    : null;

  // --- GitHub Actions ---

  const handleGitHubConnect = async (config: GitHubConfig) => {
      setIsLoading(true);
      setGithubError(null);
      try {
          const newAdapter = new GitHubAdapter(config);
          const menuTree = await newAdapter.loadSiteMap();
          
          setAdapter(newAdapter);
          setMenu(menuTree);
          setPages({}); // Clear mock cache
          
          // Try to load the first page if available
          if (menuTree.length > 0) {
             const firstPageId = menuTree[0].id;
             // Trigger load via handlePageChange (but we need to wait for state, so calling internal loader directly)
             if (menuTree[0].path) {
                 const pageData = await newAdapter.loadPage(menuTree[0].path);
                 setPages({ [firstPageId]: pageData });
                 setActivePageId(firstPageId);
             }
          }

          setShowGitHubSettings(false);
      } catch (err: any) {
          console.error(err);
          setGithubError(err.message || "Failed to connect to GitHub");
      } finally {
          setIsLoading(false);
      }
  };

  const handleSavePage = async () => {
     if (!adapter) {
         alert("Please connect to GitHub first.");
         setShowGitHubSettings(true);
         return;
     }

     const page = pages[activePageId];
     if (!page) return;

     setIsLoading(true);
     try {
         // Determine path if new
         let pageToSave = { ...page };
         if (!pageToSave._path) {
             // Find path from menu or generate default
             const findPath = (nodes: MenuNode[]): string | undefined => {
                 for(const n of nodes) {
                     if (n.id === page.id) return n.path;
                     if (n.children) {
                         const found = findPath(n.children);
                         if (found) return found;
                     }
                 }
                 return undefined;
             };
             const foundPath = findPath(menu);
             if (foundPath) {
                 pageToSave._path = foundPath;
             } else {
                 // Fallback for root pages
                 pageToSave._path = `${siteSettings.github?.pathPrefix}/${page.id}.json`;
             }
         }

         const result = await adapter.savePage(pageToSave, `Update ${page.title}`);
         
         // Update SHA locally
         setPages(prev => ({
             ...prev,
             [activePageId]: {
                 ...prev[activePageId],
                 _sha: result.newSha,
                 _path: pageToSave._path
             }
         }));

         alert("Saved successfully to GitHub!");
     } catch (err: any) {
         alert(`Error saving: ${err.message}`);
     } finally {
         setIsLoading(false);
     }
  };


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
          alert("Page already exists locally. (Check cached pages)");
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
          newMenu.push(newMenuNode);
      }

      setMenu(newMenu);
      
      const newNavLinks = getNavLinksString(newMenu);
      const now = Date.now();

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
              {
                  id: `b_${now + 1}`,
                  type: 'rich-text',
                  props: { 
                      content: `<h1>${title}</h1><p>Start editing...</p>`,
                      colSpan: 8, rowSpan: 3, colStart: 1, rowStart: 2
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
     if (!window.confirm("Delete this page? This will only remove it from the menu until you save.")) return;
     
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
     
     setPages(prev => {
         const next = { ...prev };
         delete next[pageId];
         return next;
     });
     
     if (activePageId === pageId) setActivePageId('home');
  };

  const handleMoveNode = (draggedId: string, targetId: string) => {
    if (draggedId === targetId) return;

    // --- Circular Dependency Check ---
    let draggedNode: MenuNode | null = null;

    // 1. Find the dragged node first to check its children
    const findDragged = (nodes: MenuNode[]) => {
        for(const n of nodes) {
            if (n.id === draggedId) { draggedNode = n; return; }
            if (n.children) findDragged(n.children);
        }
    };
    findDragged(menu);
    
    // 2. Recursively check if targetId is inside draggedNode's subtree
    const isDescendant = (parent: MenuNode | null, target: string): boolean => {
        if (!parent || !parent.children) return false;
        for (const child of parent.children) {
            if (child.id === target) return true;
            if (isDescendant(child, target)) return true;
        }
        return false;
    };

    if (draggedNode && isDescendant(draggedNode, targetId)) {
        console.warn("Cannot move a node into its own descendant.");
        return;
    }
    // ---------------------------------

    const removeNodeRecursive = (nodes: MenuNode[]): MenuNode[] => {
        const result: MenuNode[] = [];
        for (const node of nodes) {
            if (node.id === draggedId) {
                // draggedNode is already captured above
                continue;
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

    let finalMenu: MenuNode[] = [];

    if (targetId === 'root') {
        finalMenu = [...menuWithoutDragged, draggedNode];
    } else {
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

  const handlePageChange = async (pageId: string) => {
    // If we have the page in cache, just switch
    if (pages[pageId]) {
        setActivePageId(pageId);
        setSelectedBlockId(null);
        return;
    }

    // Helper to find node in menu
    const findNode = (nodes: MenuNode[]): MenuNode | null => {
        for(const n of nodes) {
            if (n.id === pageId) return n;
            if (n.children) {
                const found = findNode(n.children);
                if (found) return found;
            }
        }
        return null;
    };

    const node = findNode(menu);

    // If we have an adapter and the node exists with a path, fetch it
    if (adapter && node && node.path) {
        setIsLoading(true);
        try {
            const pageData = await adapter.loadPage(node.path);
            setPages(prev => ({ ...prev, [pageId]: pageData }));
            setActivePageId(pageId);
            setSelectedBlockId(null);
        } catch (err) {
            console.error(err);
            alert("Failed to load page content.");
        } finally {
            setIsLoading(false);
        }
        return;
    }

    // Mock Mode / Fallback: If page exists in menu but not in pages (and no adapter), generate it
    if (node) {
         // Create a temporary page entry so we can navigate to it
         const newPage: Page = {
             id: pageId,
             title: node.label,
             blocks: [
                 { 
                    id: `ph_${Date.now()}`, 
                    type: 'page-header', 
                    props: { 
                        navLinks: getNavLinksString(menu), 
                        sticky: true,
                        layoutPosition: 'top' 
                    } 
                 },
                 {
                    id: `txt_${Date.now()}`,
                    type: 'rich-text',
                    props: {
                        content: `<h1>${node.label}</h1><p>Start adding blocks...</p>`
                    }
                 }
             ]
         };
         setPages(prev => ({ ...prev, [pageId]: newPage }));
         setActivePageId(pageId);
         setSelectedBlockId(null);
    } else {
         console.warn("Page not found in menu.");
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-zinc-950 text-zinc-200 font-sans overflow-hidden">
      
      {showGitHubSettings && (
         <GitHubSettings 
            settings={siteSettings} 
            onUpdate={setSiteSettings}
            onConnect={handleGitHubConnect}
            isConnected={!!adapter}
            error={githubError}
         />
      )}

      {isLoading && (
          <div className="absolute inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center pointer-events-none">
              <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 flex items-center gap-3 shadow-xl">
                  <Loader2 className="animate-spin text-purple-500" size={20} />
                  <span className="text-sm font-medium">Syncing with GitHub...</span>
              </div>
          </div>
      )}

      <TopBar 
        activePage={activePage}
        viewDevice={viewDevice}
        setViewDevice={setViewDevice}
        onSave={handleSavePage}
        onPublish={() => alert('Exporting static site...')}
        onOpenSettings={() => setShowGitHubSettings(true)}
        isGitHubConnected={!!adapter}
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
            // Pass global state for dynamic properties
            menu={menu}
            activePageId={activePageId}
         />
      </div>

    </div>
  );
};

export default App;
