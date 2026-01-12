
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  MenuNode, SiteSettings, GitHubConfig, Page, Block
} from './types';
import { 
  Loader2,
} from 'lucide-react';
import { Canvas } from './components/Canvas';
import { StructureTree } from './components/StructureTree';
import { ComponentLibrary } from './components/ComponentLibrary';
import { PropertyPanel } from './components/PropertyPanel';
import { TopBar } from './components/TopBar';
import { GitHubSettings } from './components/GitHubSettings';
import { MOCK_COMPONENTS, MOCK_MENU, DEFAULT_SITE_SETTINGS } from './constants';
import { GitHubAdapter } from './lib/github-adapter';
import { generateStaticSite } from './lib/static-site-generator';
import { useHistory } from './hooks/use-history';

const STORAGE_KEY_PAGES = 'no7_studio_pages';
const STORAGE_KEY_MENU = 'no7_studio_menu';
const STORAGE_KEY_SETTINGS = 'no7_studio_settings';

const App: React.FC = () => {
  // --- Helpers ---
  const getNavLinksString = (currentMenu: MenuNode[]) => {
    return currentMenu.map(node => node.label).join(', ');
  };

  // --- State Initialization with LocalStorage ---
  const [menu, setMenu] = useState<MenuNode[]>(() => {
      const saved = localStorage.getItem(STORAGE_KEY_MENU);
      return saved ? JSON.parse(saved) : MOCK_MENU;
  });
  
  // Use History Hook for Pages (Core Content)
  const { 
    state: pages, 
    set: setPages, 
    replace: replacePages, 
    reset: resetPages,
    undo, 
    redo, 
    canUndo, 
    canRedo 
  } = useHistory<Record<string, Page>>(() => {
      const saved = localStorage.getItem(STORAGE_KEY_PAGES);
      if (saved) return JSON.parse(saved);
      // Default Mock Data
      return {
        home: {
            id: 'home',
            title: 'Home',
            blocks: [
                { id: 'h1', type: 'page-header', props: { navLinks: 'Home, Works, About', sticky: true, layoutPosition: 'top' } },
                { id: 'p1', type: 'profile-section', props: { name: 'MVP User', bio: 'Welcome to your local editor.', avatar: 'https://github.com/shadcn.png', showSocials: true, colSpan: 6, rowSpan: 4, colStart: 1, rowStart: 2 } },
                { id: 'b1', type: 'bento-item', props: { title: 'Start Building', image: 'https://picsum.photos/600/600', colSpan: 6, rowSpan: 4, colStart: 7, rowStart: 2 } },
            ]
        }
      };
  });
  
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      return saved ? JSON.parse(saved) : DEFAULT_SITE_SETTINGS;
  });

  const [activePageId, setActivePageId] = useState<string>('home');
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

  // --- Persistence Effects ---
  useEffect(() => {
      localStorage.setItem(STORAGE_KEY_MENU, JSON.stringify(menu));
  }, [menu]);

  useEffect(() => {
      localStorage.setItem(STORAGE_KEY_PAGES, JSON.stringify(pages));
  }, [pages]);

  useEffect(() => {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(siteSettings));
  }, [siteSettings]);

  // Auto-connect GitHub if token exists on load
  useEffect(() => {
      if (siteSettings.github?.token && siteSettings.github.owner && siteSettings.github.repo) {
          const newAdapter = new GitHubAdapter(siteSettings.github);
          setAdapter(newAdapter);
      }
  }, []);

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName) || (e.target as HTMLElement).isContentEditable) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          if (canRedo) redo();
        } else {
          if (canUndo) undo();
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        if (selectedBlockId) handleDuplicateBlock(selectedBlockId);
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
         if (selectedBlockId) {
             e.preventDefault();
             handleDeleteBlock(selectedBlockId);
         }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedBlockId, canUndo, canRedo, activePageId, pages]); // dependencies for closure freshness

  // --- Actions ---

  const handlePublish = async () => {
      setIsLoading(true);
      try {
          const blob = await generateStaticSite(siteSettings, menu, pages);
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${siteSettings.brand.title.toLowerCase().replace(/\s+/g, '-')}-static-site.zip`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
      } catch (e: any) {
          console.error(e);
          alert("Failed to generate static site: " + e.message);
      } finally {
          setIsLoading(false);
      }
  };

  const handleGitHubConnect = async (config: GitHubConfig) => {
      setIsLoading(true);
      setGithubError(null);
      try {
          const newAdapter = new GitHubAdapter(config);
          
          // Verify connection by loading tree
          const menuTree = await newAdapter.loadSiteMap();
          
          setAdapter(newAdapter);
          setMenu(menuTree);
          
          // Reset pages cache cleanly for new project
          resetPages({}); 
          
          if (menuTree.length > 0) {
             const findFirstPage = (nodes: MenuNode[]): MenuNode | null => {
                 for(const n of nodes) {
                     if (n.type === 'page') return n;
                     if (n.children) {
                         const found = findFirstPage(n.children);
                         if (found) return found;
                     }
                 }
                 return null;
             };
             
             const firstNode = findFirstPage(menuTree);
             if (firstNode && firstNode.path) {
                 const pageData = await newAdapter.loadPage(firstNode.path);
                 // We use reset here to establish the initial state of the loaded project
                 resetPages({ [firstNode.id]: pageData });
                 setActivePageId(firstNode.id);
             }
          } else {
              // Handle empty repo: Create a default home page so user isn't stuck
              const defaultHome: Page = { id: 'home', title: 'Home', blocks: [] };
              resetPages({ home: defaultHome });
              setMenu([{ id: 'home', label: 'Home', type: 'page', filename: 'home.json' }]);
              setActivePageId('home');
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
         setShowGitHubSettings(true);
         return;
     }

     const page = pages[activePageId];
     if (!page) return;

     setIsLoading(true);
     try {
         let pageToSave = { ...page };
         if (!pageToSave._path) {
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
                 const safeId = page.id.replace(/[^a-z0-9-]/g, '');
                 pageToSave._path = `${siteSettings.github?.pathPrefix || 'content'}/${safeId}.json`;
             }
         }

         const result = await adapter.savePage(pageToSave, `Update ${page.title} via No.7 Studio`);
         
         // Update SHA silently without triggering undo history
         replacePages({
             ...pages,
             [activePageId]: {
                 ...pages[activePageId],
                 _sha: result.newSha,
                 _path: pageToSave._path
             }
         });

         alert("Synced to GitHub successfully!");
     } catch (err: any) {
         console.error(err);
         alert(`Error saving to GitHub: ${err.message}`);
     } finally {
         setIsLoading(false);
     }
  };

  const handleClearCache = () => {
      if(confirm("Clear local cache? This will remove unsaved local changes and reset to defaults.")) {
          localStorage.removeItem(STORAGE_KEY_PAGES);
          localStorage.removeItem(STORAGE_KEY_MENU);
          localStorage.removeItem(STORAGE_KEY_SETTINGS);
          window.location.reload();
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
    
    // Auto-placement logic
    const currentBlocks = activePage.blocks;
    const maxRow = currentBlocks.reduce((max, b) => {
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

    setPages(prev => ({
      ...prev,
      [activePageId]: {
        ...prev[activePageId],
        blocks: [...prev[activePageId].blocks, newBlock]
      }
    }));
    
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
    // Need to use current state, not stale closure in keydown
    // But since handleDuplicateBlock is called inside useEffect (which depends on pages), it's fine
    // Or simpler: access functional update state if we just needed indices, but we need props.
    // The useEffect dependency ensures freshness.
    
    const page = pages[activePageId];
    if (!page) return;
    
    const index = page.blocks.findIndex(b => b.id === blockId);
    if (index === -1) return;

    const blockToCopy = page.blocks[index];
    const newProps = JSON.parse(JSON.stringify(blockToCopy.props));
    
    // Slight offset for visibility or auto-flow will handle it
    if (newProps.rowStart) newProps.rowStart += 1; 

    const newBlock = {
      ...blockToCopy,
      id: `blk_${Date.now()}`,
      props: newProps
    };

    const newBlocks = [...page.blocks];
    newBlocks.splice(index + 1, 0, newBlock);

    setPages(prev => ({
      ...prev,
      [activePageId]: {
        ...prev[activePageId],
        blocks: newBlocks
      }
    }));
    
    setSelectedBlockId(newBlock.id);
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
      blocks.splice(index, 1);

      if (action === 'front') blocks.push(block);
      else if (action === 'back') blocks.unshift(block);
      else if (action === 'forward') blocks.splice(Math.min(blocks.length, index + 1), 0, block);
      else if (action === 'backward') blocks.splice(Math.max(0, index - 1), 0, block);

      return {
        ...prev,
        [activePageId]: { ...page, blocks }
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
          alert("Page already exists locally.");
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
                      return { ...node, collapsed: false, children: [...(node.children || []), newMenuNode] };
                  }
                  if (node.children) return { ...node, children: addAsChild(node.children) };
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
              { id: `h_${now}`, type: 'page-header', props: { navLinks: newNavLinks, sticky: true, layoutPosition: 'top' } },
              { id: `b_${now + 1}`, type: 'rich-text', props: { content: `<h1>${title}</h1><p>Start editing...</p>`, colSpan: 8, rowSpan: 3, colStart: 1, rowStart: 2 } }
          ]
      };

      setPages(prev => ({ ...prev, [id]: newPage }));
      syncHeaders(newMenu);
      setActivePageId(id);
  };

  const handleDeletePage = (pageId: string) => {
     if (pageId === 'home') { alert("Cannot delete home page"); return; }
     if (!window.confirm("Delete this page?")) return;
     
     const removeNode = (nodes: MenuNode[]): MenuNode[] => {
         return nodes.filter(n => n.id !== pageId).map(n => ({ ...n, children: n.children ? removeNode(n.children) : undefined }));
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
    
    // Menu logic remains complex, we do simple deep clone for MVP safety
    const clone = JSON.parse(JSON.stringify(menu));
    let draggedNode: MenuNode | null = null;
    
    const remove = (nodes: MenuNode[]): MenuNode[] => {
        const res = [];
        for(const n of nodes) {
            if(n.id === draggedId) { draggedNode = n; continue; }
            if(n.children) n.children = remove(n.children);
            res.push(n);
        }
        return res;
    };
    
    const menuWithout = remove(clone);
    
    if(!draggedNode) return;

    if(targetId === 'root') {
        setMenu([...menuWithout, draggedNode]);
    } else {
        const insert = (nodes: MenuNode[]): MenuNode[] => {
            return nodes.map(n => {
                if(n.id === targetId) {
                    return { ...n, collapsed: false, children: [...(n.children||[]), draggedNode!] };
                }
                if(n.children) n.children = insert(n.children);
                return n;
            });
        };
        setMenu(insert(menuWithout));
    }
  };

  const handlePageChange = async (pageId: string) => {
    // 1. Try Cache
    if (pages[pageId]) {
        setActivePageId(pageId);
        setSelectedBlockId(null);
        return;
    }

    // 2. Try GitHub
    if (adapter) {
        const findPath = (nodes: MenuNode[]): string | undefined => {
             for(const n of nodes) {
                 if(n.id === pageId) return n.path;
                 if(n.children) { const f = findPath(n.children); if(f) return f; }
             }
        };
        const path = findPath(menu);
        if(path) {
            setIsLoading(true);
            try {
                const pageData = await adapter.loadPage(path);
                // Load without history trigger? Or with? 
                // Usually loading a page is not an "action" to undo, but a navigation.
                // However, adding it to the 'pages' cache IS a state change.
                // We use replacePages to update the cache without making "loading" an undo step.
                replacePages({ ...pages, [pageId]: pageData });
                setActivePageId(pageId);
            } catch(e) {
                console.error(e);
                alert("Could not load page from GitHub.");
            } finally {
                setIsLoading(false);
            }
            return;
        }
    }

    // 3. Fallback
    setActivePageId(pageId); 
    if (!pages[pageId]) {
         const newPage = { id: pageId, title: pageId, blocks: [] };
         replacePages({ ...pages, [pageId]: newPage });
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
            onClearCache={handleClearCache}
         />
      )}

      {isLoading && (
          <div className="absolute inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center pointer-events-none">
              <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 flex items-center gap-3 shadow-xl">
                  <Loader2 className="animate-spin text-purple-500" size={20} />
                  <span className="text-sm font-medium">Processing...</span>
              </div>
          </div>
      )}

      <TopBar 
        activePage={activePage}
        viewDevice={viewDevice}
        setViewDevice={setViewDevice}
        onSave={handleSavePage}
        onPublish={handlePublish}
        onOpenSettings={() => setShowGitHubSettings(true)}
        isGitHubConnected={!!adapter}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
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
            menu={menu}
            activePageId={activePageId}
         />
      </div>
    </div>
  );
};

export default App;
