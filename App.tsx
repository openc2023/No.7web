
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
  const getNavLinksString = (currentMenu: MenuNode[]) => {
    return currentMenu.map(node => node.label).join(', ');
  };

  const [menu, setMenu] = useState<MenuNode[]>(() => {
      const saved = localStorage.getItem(STORAGE_KEY_MENU);
      return saved ? JSON.parse(saved) : MOCK_MENU;
  });
  
  const { 
    state: pages, 
    set: setPages, 
    replace: replacePages, 
    reset: resetPages,
    undo, redo, canUndo, canRedo 
  } = useHistory<Record<string, Page>>(() => {
      const saved = localStorage.getItem(STORAGE_KEY_PAGES);
      if (saved) return JSON.parse(saved);
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
  const [showGitHubSettings, setShowGitHubSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [adapter, setAdapter] = useState<GitHubAdapter | null>(null);
  const [githubError, setGithubError] = useState<string | null>(null);

  const activePage = pages[activePageId] || { id: activePageId, title: 'Loading...', blocks: [] };
  const selectedBlock = activePage.blocks.find(b => b.id === selectedBlockId) || null;
  const selectedComponentDef = selectedBlock ? MOCK_COMPONENTS.find(c => c.slug === selectedBlock.type) : null;

  useEffect(() => { localStorage.setItem(STORAGE_KEY_MENU, JSON.stringify(menu)); }, [menu]);
  useEffect(() => { localStorage.setItem(STORAGE_KEY_PAGES, JSON.stringify(pages)); }, [pages]);
  useEffect(() => { localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(siteSettings)); }, [siteSettings]);

  useEffect(() => {
      if (siteSettings.github?.token && siteSettings.github.owner && siteSettings.github.repo) {
          setAdapter(new GitHubAdapter(siteSettings.github));
      }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName) || (e.target as HTMLElement).isContentEditable) return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) { if (canRedo) redo(); } else { if (canUndo) undo(); }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        if (selectedBlockId) handleDuplicateBlock(selectedBlockId);
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
         if (selectedBlockId) { e.preventDefault(); handleDeleteBlock(selectedBlockId); }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedBlockId, canUndo, canRedo, activePageId, pages]);

  const handleGitHubConnect = async (config: GitHubConfig) => {
      setIsLoading(true);
      setGithubError(null);
      try {
          const newAdapter = new GitHubAdapter(config);
          const [menuTree, cloudConfig] = await Promise.all([
              newAdapter.loadSiteMap().catch(() => []), // Allow empty repo
              newAdapter.loadConfig().catch(() => null)
          ]);
          
          setAdapter(newAdapter);
          
          if (cloudConfig) {
              if (cloudConfig.settings) setSiteSettings(prev => ({ ...prev, ...cloudConfig.settings, github: config }));
              if (cloudConfig.menu) setMenu(cloudConfig.menu);
              else if (menuTree.length > 0) setMenu(menuTree);
          } else if (menuTree.length > 0) {
              setMenu(menuTree);
          }
          
          // Initial load
          if (menuTree.length > 0) {
             const findFirstPage = (nodes: MenuNode[]): MenuNode | null => {
                 for(const n of nodes) {
                     if (n.type === 'page') return n;
                     if (n.children) { const f = findFirstPage(n.children); if (f) return f; }
                 }
                 return null;
             };
             const firstNode = findFirstPage(menuTree);
             if (firstNode && firstNode.path) {
                 const pageData = await newAdapter.loadPage(firstNode.path);
                 resetPages({ [firstNode.id]: pageData });
                 setActivePageId(firstNode.id);
             }
          } else {
              // EMPTY REPO CASE: Setup a local workspace ready for the first push
              console.log("Empty repository detected. Workspace initialized for first push.");
          }
          setShowGitHubSettings(false);
      } catch (err: any) {
          setGithubError(err.message || "Connection failed");
      } finally {
          setIsLoading(false);
      }
  };

  const handleSavePage = async () => {
     if (!adapter) { setShowGitHubSettings(true); return; }
     const page = pages[activePageId];
     if (!page) return;

     setIsLoading(true);
     try {
         // 1. Determine Paths
         const prefix = siteSettings.github?.pathPrefix || 'content';
         const configPath = `${prefix}/config.json`.replace('//', '/');
         
         let pageToSave = { ...page };
         if (!pageToSave._path) {
             const findPath = (nodes: MenuNode[]): string | undefined => {
                 for(const n of nodes) {
                     if (n.id === page.id) return n.path;
                     if (n.children) { const f = findPath(n.children); if (f) return f; }
                 }
                 return undefined;
             };
             const foundPath = findPath(menu);
             pageToSave._path = foundPath || `${prefix}/${page.id}.json`.replace('//', '/');
         }

         // 2. Multi-file push (Sequential for MVP reliability)
         // First, push the page
         const pageResult = await adapter.savePage(pageToSave, `Update ${page.title}`);
         
         // Second, push the global config
         const configContent = { settings: siteSettings, menu: menu };
         // Try to get existing SHA for config if we loaded it
         await adapter.saveFile(configPath, configContent, 'Update site config');

         replacePages({
             ...pages,
             [activePageId]: { ...pages[activePageId], _sha: pageResult.newSha, _path: pageToSave._path }
         });

         alert("Cloud Sync Complete!");
     } catch (err: any) {
         alert(`Sync error: ${err.message}`);
     } finally {
         setIsLoading(false);
     }
  };

  const handleClearCache = () => {
      if(confirm("Reset all local data?")) {
          localStorage.clear();
          window.location.reload();
      }
  };

  const handleBlockSelect = (blockId: string | null) => { setSelectedBlockId(blockId); };

  const handleUpdateBlockProps = (blockId: string, newProps: Record<string, any>) => {
    setPages(prev => ({
      ...prev,
      [activePageId]: {
        ...prev[activePageId],
        blocks: prev[activePageId].blocks.map(b => b.id === blockId ? { ...b, props: { ...b.props, ...newProps } } : b)
      }
    }));
  };

  const handleReorderBlocks = (draggedId: string, targetId: string) => {
    setPages(prev => {
        const page = prev[activePageId];
        const blocks = [...page.blocks];
        const dIdx = blocks.findIndex(b => b.id === draggedId);
        const tIdx = blocks.findIndex(b => b.id === targetId);
        if (dIdx === -1 || tIdx === -1) return prev;
        const [dragged] = blocks.splice(dIdx, 1);
        blocks.splice(tIdx, 0, dragged);
        return { ...prev, [activePageId]: { ...page, blocks } };
    });
  };

  const handleAddComponent = (slug: string) => {
    const def = MOCK_COMPONENTS.find(c => c.slug === slug);
    if (!def) return;
    const props: any = {};
    def.schema.fields.forEach(f => { if (f.default !== undefined) props[f.name] = f.default; });
    if (slug === 'page-header') { props.navLinks = getNavLinksString(menu); props.layoutPosition = 'top'; }
    const maxRow = activePage.blocks.reduce((max, b) => Math.max(max, (b.props.rowStart || 1) + (b.props.rowSpan || 1)), 1);
    if (slug !== 'page-header') { props.colStart = 1; props.rowStart = maxRow; }
    const newBlock: Block = { id: `blk_${Date.now()}`, type: slug, props };
    setPages(prev => ({ ...prev, [activePageId]: { ...prev[activePageId], blocks: [...prev[activePageId].blocks, newBlock] } }));
    setSelectedBlockId(newBlock.id);
  };

  const handleDeleteBlock = (id: string) => {
    setPages(prev => ({ ...prev, [activePageId]: { ...prev[activePageId], blocks: prev[activePageId].blocks.filter(b => b.id !== id) } }));
    setSelectedBlockId(null);
  };

  const handleDuplicateBlock = (id: string) => {
    const page = pages[activePageId];
    const idx = page.blocks.findIndex(b => b.id === id);
    if (idx === -1) return;
    const copy = JSON.parse(JSON.stringify(page.blocks[idx]));
    if (copy.props.rowStart) copy.props.rowStart += 1; 
    copy.id = `blk_${Date.now()}`;
    const newBlocks = [...page.blocks];
    newBlocks.splice(idx + 1, 0, copy);
    setPages(prev => ({ ...prev, [activePageId]: { ...prev[activePageId], blocks: newBlocks } }));
    setSelectedBlockId(copy.id);
  };

  const handleLayerBlock = (id: string, action: 'front' | 'back' | 'forward' | 'backward') => {
    setPages(prev => {
      const page = prev[activePageId];
      const blocks = [...page.blocks];
      const idx = blocks.findIndex(b => b.id === id);
      if (idx === -1) return prev;
      const b = blocks.splice(idx, 1)[0];
      if (action === 'front') blocks.push(b);
      else if (action === 'back') blocks.unshift(b);
      else if (action === 'forward') blocks.splice(Math.min(blocks.length, idx + 1), 0, b);
      else if (action === 'backward') blocks.splice(Math.max(0, idx - 1), 0, b);
      return { ...prev, [activePageId]: { ...page, blocks } };
    });
  };

  const syncHeaders = (currentMenu: MenuNode[]) => {
      const links = getNavLinksString(currentMenu);
      setPages(prev => {
          const next = { ...prev };
          Object.keys(next).forEach(k => {
              next[k] = { ...next[k], blocks: next[k].blocks.map(b => b.type === 'page-header' ? { ...b, props: { ...b.props, navLinks: links } } : b) };
          });
          return next;
      });
  };

  const handleAddPage = (title: string) => {
      const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      if (pages[id]) { setActivePageId(id); return; }
      const newNode: MenuNode = { id, label: title, type: 'page', filename: `${id}.json` };
      let newMenu = [...menu];
      if (activePageId && activePageId !== 'home') {
          const add = (ns: MenuNode[]): MenuNode[] => ns.map(n => n.id === activePageId ? { ...n, collapsed: false, children: [...(n.children || []), newNode] } : { ...n, children: n.children ? add(n.children) : undefined });
          newMenu = add(newMenu);
      } else { newMenu.push(newNode); }
      setMenu(newMenu);
      const links = getNavLinksString(newMenu);
      const newPage: Page = { id, title, blocks: [ { id: `h_${Date.now()}`, type: 'page-header', props: { navLinks: links, sticky: true, layoutPosition: 'top' } } ] };
      setPages(prev => ({ ...prev, [id]: newPage }));
      syncHeaders(newMenu);
      setActivePageId(id);
  };

  const handleDeletePage = (id: string) => {
     if (id === 'home' || !confirm("Delete page?")) return;
     const remove = (ns: MenuNode[]): MenuNode[] => ns.filter(n => n.id !== id).map(n => ({ ...n, children: n.children ? remove(n.children) : undefined }));
     const newMenu = remove(menu);
     setMenu(newMenu);
     syncHeaders(newMenu);
     setPages(prev => { const n = { ...prev }; delete n[id]; return n; });
     if (activePageId === id) setActivePageId('home');
  };

  const handleMoveNode = (dId: string, tId: string) => {
    if (dId === tId) return;
    const clone = JSON.parse(JSON.stringify(menu));
    let dragged: MenuNode | null = null;
    const remove = (ns: MenuNode[]): MenuNode[] => {
        const res = [];
        for(const n of ns) {
            if(n.id === dId) { dragged = n; continue; }
            if(n.children) n.children = remove(n.children);
            res.push(n);
        }
        return res;
    };
    const menuWithout = remove(clone);
    if(!dragged) return;
    if(tId === 'root') setMenu([...menuWithout, dragged]);
    else {
        const insert = (ns: MenuNode[]): MenuNode[] => ns.map(n => n.id === tId ? { ...n, collapsed: false, children: [...(n.children||[]), dragged!] } : { ...n, children: n.children ? insert(n.children) : undefined });
        setMenu(insert(menuWithout));
    }
  };

  const handlePageChange = async (id: string) => {
    if (pages[id]) { setActivePageId(id); setSelectedBlockId(null); return; }
    if (adapter) {
        const find = (ns: MenuNode[]): string | undefined => {
             for(const n of ns) { if(n.id === id) return n.path; if(n.children) { const f = find(n.children); if(f) return f; } }
        };
        const path = find(menu);
        if(path) {
            setIsLoading(true);
            try {
                const data = await adapter.loadPage(path);
                replacePages({ ...pages, [id]: data });
                setActivePageId(id);
            } catch(e) { alert("Load failed"); }
            finally { setIsLoading(false); }
            return;
        }
    }
    setActivePageId(id); 
    if (!pages[id]) replacePages({ ...pages, [id]: { id, title: id, blocks: [] } });
  };

  return (
    <div className="flex flex-col h-screen w-full bg-zinc-950 text-zinc-200 font-sans overflow-hidden">
      {showGitHubSettings && <GitHubSettings settings={siteSettings} onUpdate={setSiteSettings} onConnect={handleGitHubConnect} isConnected={!!adapter} error={githubError} onClearCache={handleClearCache} />}
      {isLoading && <div className="absolute inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center"><div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 flex items-center gap-3"><Loader2 className="animate-spin text-purple-500" size={20} /><span className="text-sm font-medium">Connecting Cloud...</span></div></div>}
      <TopBar activePage={activePage} viewDevice={viewDevice} setViewDevice={setViewDevice} onSave={handleSavePage} onPublish={async () => { setIsLoading(true); try { const blob = await generateStaticSite(siteSettings, menu, pages); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${siteSettings.brand.title.toLowerCase().replace(/\s+/g, '-')}.zip`; a.click(); URL.revokeObjectURL(url); } finally { setIsLoading(false); } }} onOpenSettings={() => setShowGitHubSettings(true)} isGitHubConnected={!!adapter} canUndo={canUndo} canRedo={canRedo} onUndo={undo} onRedo={redo} />
      <div className="flex flex-1 overflow-hidden relative">
        <div className="w-64 border-r border-zinc-800 bg-zinc-900 flex flex-col"><div className="h-full overflow-y-auto"><StructureTree menu={menu} activePageId={activePageId} onSelectPage={handlePageChange} onAddPage={handleAddPage} onDeletePage={handleDeletePage} onMoveNode={handleMoveNode} blocks={activePage.blocks} selectedBlockId={selectedBlockId} onSelectBlock={handleBlockSelect} /></div></div>
        <div className="flex-1 bg-zinc-950 relative flex flex-col items-center justify-start overflow-hidden"><Canvas blocks={activePage.blocks} viewDevice={viewDevice} selectedBlockId={selectedBlockId} onSelectBlock={handleBlockSelect} onDeleteBlock={handleDeleteBlock} onDuplicateBlock={handleDuplicateBlock} onMoveBlock={(id, d) => handleLayerBlock(id, d === 'up' ? 'backward' : 'forward')} onLayerBlock={handleLayerBlock} onReorderBlock={handleReorderBlocks} onUpdateBlockProps={handleUpdateBlockProps} componentDefs={MOCK_COMPONENTS} siteSettings={siteSettings} menu={menu} pages={pages} activePageId={activePageId} onSelectPage={handlePageChange} /></div>
        <div className="w-72 border-l border-zinc-800 bg-zinc-900 flex flex-col"><ComponentLibrary components={MOCK_COMPONENTS} onAddComponent={handleAddComponent} /></div>
      </div>
      <div className="h-72 border-t border-zinc-800 bg-zinc-900 w-full z-10 flex flex-col shadow-2xl"><PropertyPanel selectedBlock={selectedBlock} componentDef={selectedComponentDef} onUpdateProps={handleUpdateBlockProps} siteSettings={siteSettings} onUpdateSiteSettings={setSiteSettings} menu={menu} activePageId={activePageId} /></div>
    </div>
  );
};

export default App;
