
import React, { useRef, useState, useEffect } from 'react';
import { Block, ComponentDefinition, SchemaField, SiteSettings, MenuNode, BackgroundType } from '../types';
import { 
  Settings2, XCircle, Bold, Italic, 
  Type, Code, Eye, 
  AlignLeft, AlignCenter, Palette,
  Globe, LayoutTemplate, 
  Box, Droplets, Move, CheckSquare, Square, Upload, FileUp,
  LayoutList, Columns2, LayoutGrid, Grid3X3, Paintbrush, FileCode, Loader2,
  MousePointer2, Sparkles, Layers, PencilRuler, Type as FontIcon,
  Smartphone, Tablet, Monitor, Info, List, Link as LinkIcon,
  AlignJustify, ListOrdered
} from 'lucide-react';

// --- Reusable Numeric Input with Slider ---
const NumericControl: React.FC<{
    label: string;
    value: string | number;
    onChange: (val: string) => void;
    min?: number;
    max?: number;
    step?: number;
    suffix?: string;
    icon?: React.ReactNode;
}> = ({ label, value, onChange, min = 0, max = 100, step = 1, suffix = '', icon }) => {
    const parseValue = (v: any): number => {
        if (typeof v === 'number') return v;
        if (!v) return 0;
        const parsed = parseFloat(v);
        return isNaN(parsed) ? 0 : parsed;
    };

    const numValue = parseValue(value);

    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
                <label className="text-[10px] text-zinc-500 uppercase font-bold flex items-center gap-1">
                    {icon} {label}
                </label>
                <span className="text-[10px] font-mono text-zinc-400">{numValue}{suffix}</span>
            </div>
            <div className="flex items-center gap-3">
                <input 
                    type="range" 
                    min={min} 
                    max={max} 
                    step={step} 
                    value={numValue} 
                    onChange={e => onChange(`${e.target.value}${suffix}`)} 
                    className="flex-1 accent-purple-600 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer" 
                />
                <input 
                    type="number" 
                    step={step}
                    value={numValue} 
                    onChange={e => onChange(`${e.target.value}${suffix}`)} 
                    className="w-16 bg-zinc-950 border border-zinc-700 rounded px-1 py-1 text-[10px] text-center text-zinc-300 focus:border-purple-500 outline-none" 
                />
            </div>
        </div>
    );
};

// --- Color Field with Hex Input ---
const ColorControl: React.FC<{ label: string; value: string; onChange: (v: string) => void }> = ({ label, value, onChange }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-[10px] text-zinc-500 uppercase font-bold">{label}</label>
        <div className="flex gap-2">
            <div className="relative w-9 h-9 rounded-lg border border-zinc-700 overflow-hidden shrink-0">
                <input 
                    type="color" 
                    value={value?.startsWith('#') ? value.substring(0, 7) : '#000000'} 
                    onChange={e => onChange(e.target.value)} 
                    className="absolute inset-0 w-[200%] h-[200%] cursor-pointer translate-x-[-25%] translate-y-[-25%]" 
                />
            </div>
            <input 
                type="text" 
                value={value || ''} 
                onChange={e => onChange(e.target.value)} 
                placeholder="Hex or RGBA"
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 text-[10px] font-mono text-zinc-300 focus:border-purple-500 outline-none" 
            />
        </div>
    </div>
);

// --- Advanced Rich Text Editor ---
const RichTextInput: React.FC<{ value: string; onChange: (val: string) => void }> = ({ value, onChange }) => {
  const [isSourceMode, setIsSourceMode] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isSourceMode && editorRef.current && editorRef.current.innerHTML !== value) {
      if (document.activeElement !== editorRef.current) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value, isSourceMode]);

  const exec = (command: string, val?: string) => {
    document.execCommand('styleWithCSS', false, 'true');
    document.execCommand(command, false, val);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const ToolbarButton = ({ onClick, icon: Icon, active = false, title }: any) => (
    <button 
      type="button" 
      onMouseDown={(e) => { e.preventDefault(); onClick(); }} 
      className={`p-1.5 rounded transition-colors ${active ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700'}`}
      title={title}
    >
      <Icon size={13} />
    </button>
  );

  return (
    <div className="flex flex-col border border-zinc-700 rounded-lg overflow-hidden bg-zinc-900">
       <div className="flex items-center gap-0.5 bg-zinc-800 p-1 border-b border-zinc-700 overflow-x-auto shrink-0 scrollbar-hide">
          <ToolbarButton onClick={() => exec('bold')} icon={Bold} title="Bold" />
          <ToolbarButton onClick={() => exec('italic')} icon={Italic} title="Italic" />
          <div className="w-px h-4 bg-zinc-600 mx-1 shrink-0" />
          <ToolbarButton onClick={() => exec('insertUnorderedList')} icon={List} title="List" />
          <ToolbarButton onClick={() => exec('justifyLeft')} icon={AlignLeft} title="Left" />
          <ToolbarButton onClick={() => exec('justifyCenter')} icon={AlignCenter} title="Center" />
          <div className="flex-1" />
          <button 
            type="button" 
            onClick={() => setIsSourceMode(!isSourceMode)} 
            className="p-1.5 text-zinc-500 hover:text-zinc-300 flex items-center gap-1 px-2"
          >
            {isSourceMode ? <Eye size={13} /> : <Code size={13} />}
            <span className="text-[9px] font-bold uppercase">{isSourceMode ? 'Visual' : 'Code'}</span>
          </button>
       </div>
       <div className="bg-zinc-950">
          {isSourceMode ? (
            <textarea 
              rows={10} 
              value={value || ''} 
              onChange={(e) => onChange(e.target.value)} 
              className="w-full h-full bg-zinc-950 p-3 text-[11px] text-zinc-300 outline-none font-mono resize-y min-h-[160px]" 
            />
          ) : (
            <div 
              ref={editorRef} 
              contentEditable 
              onInput={(e) => onChange(e.currentTarget.innerHTML)} 
              className="w-full h-full p-4 text-sm text-zinc-200 outline-none prose prose-invert prose-sm max-w-none min-h-[160px]" 
            />
          )}
       </div>
    </div>
  );
};

// --- Global Settings Panel ---
const GlobalSettingsPanel: React.FC<{ settings: SiteSettings; onUpdate: (s: SiteSettings) => void; cols: number }> = ({ settings, onUpdate, cols }) => {
    const updateTheme = (key: string, val: string) => onUpdate({ ...settings, theme: { ...settings.theme, [key]: val } });
    const updateBrand = (key: string, val: any) => onUpdate({ ...settings, brand: { ...settings.brand, [key]: val } });
    const gridCols = cols === 1 ? 'grid-cols-1' : cols === 2 ? 'grid-cols-2' : cols === 3 ? 'grid-cols-3' : 'grid-cols-4';

    return (
        <div className={`p-6 grid ${gridCols} gap-x-8 gap-y-10 items-start pb-24`}>
            {/* Identity */}
            <div className={`${cols > 1 ? 'col-span-full' : ''}`}>
                <h3 className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-6 border-b border-zinc-800 pb-2 flex items-center gap-2">
                    <LayoutTemplate size={12}/> 1. Identity
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] text-zinc-500 uppercase font-bold">Project Title</label>
                        <input type="text" className="bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:border-purple-500 outline-none" value={settings.brand.title} onChange={e => updateBrand('title', e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] text-zinc-500 uppercase font-bold">Logo Icon/URL</label>
                        <input type="text" className="bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-purple-500" value={settings.brand.type === 'icon' ? settings.brand.iconClass : settings.brand.imageUrl} onChange={e => updateBrand(settings.brand.type === 'icon' ? 'iconClass' : 'imageUrl', e.target.value)} />
                    </div>
                </div>
            </div>

            {/* Colors & Glass */}
            <div className="space-y-6">
                 <h3 className="text-[10px] font-bold text-purple-400 uppercase tracking-widest border-b border-zinc-800 pb-2 flex items-center gap-2">
                    <Sparkles size={12}/> 2. Global Styles
                 </h3>
                 <div className="space-y-5">
                    <ColorControl label="Primary Color" value={settings.theme['--primary']} onChange={v => updateTheme('--primary', v)} />
                    <ColorControl label="Surface Color" value={settings.theme['--surface']} onChange={v => updateTheme('--surface', v)} />
                    <NumericControl label="Surface Opacity" value={settings.theme['--surface-opacity'] || '0.6'} onChange={v => updateTheme('--surface-opacity', v)} min={0} max={1} step={0.01} />
                    <NumericControl label="Corner Radius" value={settings.theme['--radius']} onChange={v => updateTheme('--radius', v)} suffix="px" max={80} />
                    <NumericControl label="Backdrop Blur" value={settings.theme['--blur']} onChange={v => updateTheme('--blur', v)} suffix="px" max={60} />
                 </div>
            </div>

             {/* Grid Controls */}
             <div className="space-y-6">
                 <h3 className="text-[10px] font-bold text-purple-400 uppercase tracking-widest border-b border-zinc-800 pb-2 flex items-center gap-2">
                    <LayoutGrid size={12}/> 3. Responsive Grid
                 </h3>
                 <div className="space-y-5">
                    <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 space-y-4">
                        <div className="text-[10px] font-black text-zinc-600 uppercase flex items-center gap-2 mb-2"><Monitor size={10}/> Monitor</div>
                        <NumericControl label="Grid Gap" value={settings.theme['--gap']} onChange={v => updateTheme('--gap', v)} suffix="px" max={60} />
                        <NumericControl label="Row Height" value={settings.theme['--cell-size']} onChange={v => updateTheme('--cell-size', v)} suffix="px" min={40} max={300} />
                    </div>
                    
                    <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 space-y-4">
                        <div className="text-[10px] font-black text-zinc-600 uppercase flex items-center gap-2 mb-2"><Tablet size={10}/> Tablet</div>
                        <NumericControl label="Grid Gap" value={settings.theme['--tablet-gap'] || '12px'} onChange={v => updateTheme('--tablet-gap', v)} suffix="px" max={60} />
                        <NumericControl label="Row Height" value={settings.theme['--tablet-cell-size'] || '115px'} onChange={v => updateTheme('--tablet-cell-size', v)} suffix="px" min={40} max={300} />
                    </div>

                    <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 space-y-4">
                        <div className="text-[10px] font-black text-zinc-600 uppercase flex items-center gap-2 mb-2"><Smartphone size={10}/> Smartphone</div>
                        <NumericControl label="Grid Gap" value={settings.theme['--mobile-gap'] || '10px'} onChange={v => updateTheme('--mobile-gap', v)} suffix="px" max={60} />
                        <NumericControl label="Row Height" value={settings.theme['--mobile-cell-size'] || '100px'} onChange={v => updateTheme('--mobile-cell-size', v)} suffix="px" min={40} max={300} />
                    </div>
                 </div>
            </div>
        </div>
    );
};

// --- Block Property Panel ---
export const PropertyPanel: React.FC<any> = ({ selectedBlock, componentDef, onUpdateProps, siteSettings, onUpdateSiteSettings }) => {
  const [activeTab, setActiveTab] = useState<'content' | 'layout'>('content');
  const [fieldCols, setFieldCols] = useState(() => parseInt(localStorage.getItem('no7_property_cols') || '1'));

  const handleSetCols = (c: number) => { setFieldCols(c); localStorage.setItem('no7_property_cols', c.toString()); };
  const LayoutButton = ({ n, icon: Icon }: any) => (<button onClick={() => handleSetCols(n)} className={`w-7 h-7 flex items-center justify-center rounded transition-all ${fieldCols === n ? 'bg-purple-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}><Icon size={14} /></button>);

  const renderHeader = () => (
    <div className="h-10 border-b border-zinc-800 flex items-center px-4 bg-zinc-900 shrink-0 gap-4">
      <div className="text-xs font-bold text-zinc-100 uppercase flex items-center gap-2">
        <span className="text-purple-400">{selectedBlock ? 'Block Properties' : 'Global Settings'}</span>
      </div>
      <div className="flex-1" />
      {selectedBlock && (
          <div className="flex bg-zinc-950 rounded-lg p-0.5 border border-zinc-800 mr-2 shadow-inner">
              <button onClick={() => setActiveTab('content')} className={`px-3 py-1 text-[10px] font-bold rounded transition-colors ${activeTab === 'content' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500'}`}>Content</button>
              <button onClick={() => setActiveTab('layout')} className={`px-3 py-1 text-[10px] font-bold rounded transition-colors ${activeTab === 'layout' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500'}`}>Layout & Style</button>
          </div>
      )}
      <div className="flex items-center gap-0.5 bg-zinc-950 p-0.5 rounded-lg border border-zinc-800/50">
        <LayoutButton n={1} icon={LayoutList} /><LayoutButton n={2} icon={Columns2} /><LayoutButton n={3} icon={LayoutGrid} />
      </div>
    </div>
  );

  const FieldInputWrapper: React.FC<{ field: SchemaField; value: any; onChange: (val: any) => void }> = ({ field, value, onChange }) => {
      const commonClasses = "w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:border-purple-500 outline-none transition-all";
      switch (field.type) {
        case 'number': return <NumericControl label={field.label} value={value} onChange={v => onChange(parseFloat(v))} min={field.min} max={field.max} step={field.step} />;
        case 'color': return <ColorControl label={field.label} value={value} onChange={onChange} />;
        case 'string': return <input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)} className={commonClasses} />;
        case 'select': return <select value={value || ''} onChange={(e) => onChange(e.target.value)} className={commonClasses}>{field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select>;
        case 'boolean': return (<div className="flex items-center gap-2 py-1"><input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} className="w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-purple-600" /><span className="text-[11px] text-zinc-400">Enabled</span></div>);
        case 'text': return <textarea rows={3} value={value || ''} onChange={(e) => onChange(e.target.value)} className={`${commonClasses} font-mono`} />;
        case 'richtext': return <RichTextInput value={value} onChange={onChange} />;
        case 'image': return (
            <div className="flex flex-col gap-2">
                <input type="text" placeholder="Image URL" value={value || ''} onChange={(e) => onChange(e.target.value)} className={commonClasses} />
                {value && <div className="h-16 bg-black/40 rounded-lg border border-zinc-800 overflow-hidden"><img src={value} className="w-full h-full object-cover" /></div>}
            </div>
        );
        default: return <input type="text" value={value} onChange={e => onChange(e.target.value)} className={commonClasses} />;
      }
  };

  if (!selectedBlock) return (<div className="flex flex-col h-full bg-zinc-900">{renderHeader()}<div className="flex-1 overflow-y-auto custom-scrollbar"><GlobalSettingsPanel settings={siteSettings} onUpdate={onUpdateSiteSettings} cols={fieldCols} /></div></div>);
  if (!componentDef) return (<div className="p-6 text-center text-red-400 bg-zinc-900 h-full flex flex-col items-center justify-center">Definition Missing</div>);

  const gridCols = fieldCols === 1 ? 'grid-cols-1' : fieldCols === 2 ? 'grid-cols-2' : fieldCols === 3 ? 'grid-cols-3' : 'grid-cols-4';
  const layoutStyleKeys = ['colSpan', 'rowSpan', 'colStart', 'rowStart', 'backgroundColor', 'backgroundImage', 'backgroundMode', 'backgroundImageOpacity', 'tablet_', 'mobile_'];
  const fieldsToShow = componentDef.schema.fields.filter(f => activeTab === 'layout' ? layoutStyleKeys.some(k => f.name.includes(k)) : !layoutStyleKeys.some(k => f.name.includes(k)));

  return (
    <div className="flex flex-col h-full bg-zinc-900">
      {renderHeader()}
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-20">
        <div className={`grid ${gridCols} gap-x-8 gap-y-6 p-6 items-start`}>
          {fieldsToShow.map(field => {
             const isResponsive = field.name.startsWith('mobile_') || field.name.startsWith('tablet_');
             return (
              <div key={field.name} className={`flex flex-col gap-2 ${field.type === 'richtext' ? 'col-span-full' : ''} ${isResponsive ? 'bg-zinc-800/20 p-3 rounded-lg border border-zinc-800/40' : ''}`}>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    {field.name.includes('mobile') ? <Smartphone size={10}/> : field.name.includes('tablet') ? <Tablet size={10}/> : null}
                    {field.label}
                </label>
                <FieldInputWrapper field={field} value={selectedBlock.props[field.name]} onChange={(val) => onUpdateProps(selectedBlock.id, { [field.name]: val })} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
