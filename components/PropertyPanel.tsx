
import React, { useRef, useState, useEffect } from 'react';
import { Block, ComponentDefinition, SchemaField, SiteSettings } from '../types';
import { 
  Settings2, XCircle, Bold, Italic, 
  Heading as HeadingIcon, Type, List, Link as LinkIcon,
  Code, Eye, Underline,
  AlignLeft, AlignCenter, AlignRight, Palette,
  Globe, LayoutTemplate, Type as TypeIcon, Image as ImageIcon,
  Box, Droplets, Gauge, Move
} from 'lucide-react';

interface PropertyPanelProps {
  selectedBlock: Block | null;
  componentDef: ComponentDefinition | null;
  onUpdateProps: (blockId: string, props: Record<string, any>) => void;
  siteSettings: SiteSettings;
  onUpdateSiteSettings: (settings: SiteSettings) => void;
}

// --- Rich Text Editor Component (Unchanged) ---
const RichTextInput: React.FC<{ value: string; onChange: (val: string) => void }> = ({ value, onChange }) => {
  const [isSourceMode, setIsSourceMode] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    if (!['foreColor', 'fontSize'].includes(command)) editorRef.current?.focus();
  };

  const addLink = () => {
    const url = prompt('Enter URL:', '#');
    if (url) exec('createLink', url);
  };

  const ToolbarButton = ({ onClick, icon: Icon, active = false, title }: any) => (
    <button type="button" onClick={onClick} disabled={isSourceMode} className={`p-1.5 rounded transition-colors shrink-0 ${active ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700'} ${isSourceMode ? 'opacity-30 cursor-not-allowed' : ''}`} title={title}>
        <Icon size={13} />
    </button>
  );

  return (
    <div className="flex flex-col border border-zinc-700 rounded overflow-hidden">
       <div className="flex items-center gap-0.5 bg-zinc-800 p-1 border-b border-zinc-700 overflow-x-auto shrink-0 scrollbar-hide">
          <ToolbarButton onClick={() => exec('bold')} icon={Bold} title="Bold" />
          <ToolbarButton onClick={() => exec('italic')} icon={Italic} title="Italic" />
          <ToolbarButton onClick={() => exec('underline')} icon={Underline} title="Underline" />
          <div className="w-px h-4 bg-zinc-600 mx-1 self-center shrink-0" />
          <ToolbarButton onClick={() => exec('justifyLeft')} icon={AlignLeft} title="Align Left" />
          <ToolbarButton onClick={() => exec('justifyCenter')} icon={AlignCenter} title="Align Center" />
          <ToolbarButton onClick={() => exec('justifyRight')} icon={AlignRight} title="Align Right" />
          <div className="w-px h-4 bg-zinc-600 mx-1 self-center shrink-0" />
          <ToolbarButton onClick={() => exec('formatBlock', '<h2>')} icon={HeadingIcon} title="Heading 2" />
          <ToolbarButton onClick={() => exec('formatBlock', '<p>')} icon={Type} title="Paragraph" />
          <ToolbarButton onClick={() => exec('insertUnorderedList')} icon={List} title="Bullet List" />
          <ToolbarButton onClick={addLink} icon={LinkIcon} title="Link" />
          <div className="w-px h-4 bg-zinc-600 mx-1 self-center shrink-0" />
          <div className="relative flex items-center justify-center p-1.5 rounded hover:bg-zinc-700 cursor-pointer text-zinc-400 hover:text-zinc-100 shrink-0" title="Text Color">
            <Palette size={13} />
            <input type="color" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" onChange={(e) => exec('foreColor', e.target.value)} disabled={isSourceMode} />
          </div>
          <select className="h-6 bg-zinc-800 text-[10px] text-zinc-300 border border-zinc-700 rounded px-1 outline-none w-16 shrink-0 disabled:opacity-30" onChange={(e) => exec('fontSize', e.target.value)} defaultValue="3" title="Font Size" disabled={isSourceMode}>
            <option value="1">Small</option>
            <option value="3">Normal</option>
            <option value="4">Large</option>
            <option value="5">Huge</option>
          </select>
          <div className="flex-1" />
          <button type="button" onClick={() => setIsSourceMode(!isSourceMode)} className={`p-1.5 rounded transition-colors flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider shrink-0 ${isSourceMode ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`} title={isSourceMode ? "Switch to Visual" : "Switch to Source"}>
            {isSourceMode ? <Eye size={13} /> : <Code size={13} />}
          </button>
       </div>
       <div className="bg-zinc-950 relative min-h-[160px]">
          {isSourceMode ? (
             <textarea ref={textareaRef} rows={8} value={value || ''} onChange={(e) => onChange(e.target.value)} className="w-full h-full bg-zinc-950 p-3 text-xs text-zinc-300 focus:outline-none font-mono leading-relaxed resize-y" placeholder="Enter HTML..." />
          ) : (
             <div ref={editorRef} contentEditable onInput={(e) => onChange(e.currentTarget.innerHTML)} onBlur={() => { if (editorRef.current) onChange(editorRef.current.innerHTML); }} className="w-full h-full p-3 text-sm text-zinc-200 focus:outline-none prose prose-invert prose-sm max-w-none [&>h2]:mt-0 [&>h3]:mt-0 [&>p]:mb-2 [&>p]:mt-0 [&>ul]:mt-0 [&>li]:m-0" style={{ minHeight: '160px' }} />
          )}
       </div>
    </div>
  );
}

// --- Field Input Component ---
const FieldInput: React.FC<{ field: SchemaField; value: any; onChange: (val: any) => void; }> = ({ field, value, onChange }) => {
  const commonClasses = "w-full bg-zinc-950 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all";

  switch (field.type) {
    case 'string': return <input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)} className={commonClasses} />;
    case 'number': return <input type="number" value={value || 0} onChange={(e) => onChange(Number(e.target.value))} className={commonClasses} />;
    case 'boolean': return <div className="flex items-center"><input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} className="w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-purple-600 focus:ring-purple-500 focus:ring-offset-zinc-900" /><span className="ml-2 text-xs text-zinc-400">{field.label}</span></div>;
    case 'select': return <select value={value || ''} onChange={(e) => onChange(e.target.value)} className={commonClasses}>{field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select>;
    case 'text': return <textarea rows={3} value={value || ''} onChange={(e) => onChange(e.target.value)} className={`${commonClasses} font-mono`} />;
    case 'richtext': return <RichTextInput value={value} onChange={onChange} />;
    case 'color': return <div className="flex gap-2"><input type="color" value={value || '#000000'} onChange={(e) => onChange(e.target.value)} className="h-8 w-12 bg-transparent border-none p-0 cursor-pointer" /><input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)} className={commonClasses} /></div>;
    case 'image': return <div className="flex flex-col gap-2">{value && <img src={value} alt="Preview" className="w-full h-24 object-cover rounded border border-zinc-700" />}<input type="text" placeholder="Image URL" value={value || ''} onChange={(e) => onChange(e.target.value)} className={commonClasses} /></div>;
    default: return null;
  }
};

// --- Helper Functions for RGBA ---
const parseRgba = (rgba: string) => {
    const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (match) {
        const r = parseInt(match[1]);
        const g = parseInt(match[2]);
        const b = parseInt(match[3]);
        const a = match[4] ? parseFloat(match[4]) : 1;
        const hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        return { hex, r, g, b, alpha: a };
    }
    // Fallback for hex or invalid
    if (rgba.startsWith('#')) {
        return { hex: rgba, r: 0, g: 0, b: 0, alpha: 1 };
    }
    return { hex: '#000000', r: 0, g: 0, b: 0, alpha: 1 };
};

const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
};

// --- Global Settings Panel ---
const GlobalSettingsPanel: React.FC<{ settings: SiteSettings; onUpdate: (s: SiteSettings) => void }> = ({ settings, onUpdate }) => {
    const updateTheme = (key: string, val: string) => {
        onUpdate({ ...settings, theme: { ...settings.theme, [key]: val } });
    };
    const updateBrand = (key: string, val: any) => {
        onUpdate({ ...settings, brand: { ...settings.brand, [key]: val } });
    };

    // State for Card Style logic
    const { hex: surfaceHex, alpha: surfaceAlpha } = parseRgba(settings.theme['--surface']);
    const blurValue = parseInt(settings.theme['--blur'] || '12');
    const radiusValue = parseInt(settings.theme['--radius'] || '24');

    const handleSurfaceColorChange = (hex: string) => {
        const { r, g, b } = hexToRgb(hex);
        const newRgba = `rgba(${r}, ${g}, ${b}, ${surfaceAlpha})`;
        updateTheme('--surface', newRgba);
    };

    const handleSurfaceAlphaChange = (alpha: number) => {
        const { r, g, b } = parseRgba(settings.theme['--surface']);
        const newRgba = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        updateTheme('--surface', newRgba);
    };

    return (
        <div className="flex flex-col h-full bg-zinc-900">
            <div className="h-10 border-b border-zinc-800 flex items-center px-4 bg-zinc-850 shrink-0 gap-2">
                <Globe size={14} className="text-purple-400" />
                <div className="text-xs font-bold text-zinc-100 uppercase">Global Settings</div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                
                {/* Brand Section */}
                <div>
                    <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-3 border-b border-zinc-800 pb-1 flex items-center gap-2">
                        <LayoutTemplate size={12}/> Brand Identity
                    </h3>
                    <div className="space-y-3">
                        <div className="flex flex-col gap-1">
                            <label className="text-[11px] text-zinc-400">Site Title</label>
                            <input 
                                type="text" 
                                className="bg-zinc-950 border border-zinc-700 rounded px-2 py-1.5 text-xs text-white focus:border-purple-500 outline-none"
                                value={settings.brand.title} 
                                onChange={e => updateBrand('title', e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[11px] text-zinc-400">Logo Type</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                                    <input type="radio" checked={settings.brand.type === 'icon'} onChange={() => updateBrand('type', 'icon')} /> Icon
                                </label>
                                <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                                    <input type="radio" checked={settings.brand.type === 'image'} onChange={() => updateBrand('type', 'image')} /> Image
                                </label>
                            </div>
                        </div>
                        {settings.brand.type === 'icon' ? (
                            <div className="flex flex-col gap-1">
                                <label className="text-[11px] text-zinc-400">Icon Class / Char</label>
                                <input 
                                    type="text" 
                                    className="bg-zinc-950 border border-zinc-700 rounded px-2 py-1.5 text-xs text-white focus:border-purple-500 outline-none"
                                    placeholder="e.g. Layout, Box, 7"
                                    value={settings.brand.iconClass} 
                                    onChange={e => updateBrand('iconClass', e.target.value)}
                                />
                            </div>
                        ) : (
                            <div className="flex flex-col gap-1">
                                <label className="text-[11px] text-zinc-400">Logo URL</label>
                                <input 
                                    type="text" 
                                    className="bg-zinc-950 border border-zinc-700 rounded px-2 py-1.5 text-xs text-white focus:border-purple-500 outline-none"
                                    placeholder="https://..."
                                    value={settings.brand.imageUrl} 
                                    onChange={e => updateBrand('imageUrl', e.target.value)}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Page Appearance Section */}
                <div>
                     <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-3 border-b border-zinc-800 pb-1 flex items-center gap-2">
                        <Palette size={12}/> Page Appearance
                    </h3>
                    <div className="space-y-4">
                        <div>
                             <label className="text-[11px] text-zinc-400 block mb-1">Background Color</label>
                             <div className="flex gap-2">
                                <input type="color" value={settings.theme['--bg']} onChange={e => updateTheme('--bg', e.target.value)} className="h-8 w-12 bg-transparent border-none p-0 cursor-pointer" />
                                <input type="text" value={settings.theme['--bg']} onChange={e => updateTheme('--bg', e.target.value)} className="flex-1 bg-zinc-950 border border-zinc-700 rounded px-2 text-xs font-mono text-zinc-300" />
                             </div>
                        </div>

                        <div>
                             <label className="text-[11px] text-zinc-400 block mb-1 flex items-center justify-between">
                                 <span>Background Image URL</span>
                                 <ImageIcon size={12} className="opacity-50"/>
                             </label>
                             <input 
                                type="text" 
                                placeholder="https://..." 
                                value={settings.theme['--bg-image'] || ''} 
                                onChange={e => updateTheme('--bg-image', e.target.value)} 
                                className="w-full bg-zinc-950 border border-zinc-700 rounded px-2 py-1.5 text-xs text-white focus:border-purple-500 outline-none"
                             />
                             {settings.theme['--bg-image'] && (
                                 <div className="mt-2 h-16 w-full rounded border border-zinc-800 bg-cover bg-center opacity-50" style={{ backgroundImage: `url(${settings.theme['--bg-image']})` }} />
                             )}
                        </div>

                        <div>
                             <label className="text-[11px] text-zinc-400 block mb-1 flex items-center gap-1"><TypeIcon size={12}/> Main Text Color</label>
                             <div className="flex gap-2">
                                <input type="color" value={settings.theme['--text']} onChange={e => updateTheme('--text', e.target.value)} className="h-8 w-12 bg-transparent border-none p-0 cursor-pointer" />
                                <input type="text" value={settings.theme['--text']} onChange={e => updateTheme('--text', e.target.value)} className="flex-1 bg-zinc-950 border border-zinc-700 rounded px-2 text-xs font-mono text-zinc-300" />
                             </div>
                        </div>
                        
                        <div>
                             <label className="text-[11px] text-zinc-400 block mb-1">Primary Accent</label>
                             <div className="flex gap-2">
                                <input type="color" value={settings.theme['--primary']} onChange={e => updateTheme('--primary', e.target.value)} className="h-8 w-12 bg-transparent border-none p-0 cursor-pointer" />
                                <input type="text" value={settings.theme['--primary']} onChange={e => updateTheme('--primary', e.target.value)} className="flex-1 bg-zinc-950 border border-zinc-700 rounded px-2 text-xs font-mono text-zinc-300" />
                             </div>
                        </div>
                    </div>
                </div>

                {/* Card Styling Section */}
                <div>
                     <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-3 border-b border-zinc-800 pb-1 flex items-center gap-2">
                        <Box size={12}/> Card Style
                    </h3>
                    <div className="space-y-4">
                         {/* Card Color */}
                        <div>
                             <label className="text-[11px] text-zinc-400 block mb-1">Card Color</label>
                             <div className="flex gap-2">
                                <input type="color" value={surfaceHex} onChange={e => handleSurfaceColorChange(e.target.value)} className="h-8 w-12 bg-transparent border-none p-0 cursor-pointer" />
                                <input type="text" value={surfaceHex} onChange={e => handleSurfaceColorChange(e.target.value)} className="flex-1 bg-zinc-950 border border-zinc-700 rounded px-2 text-xs font-mono text-zinc-300" />
                             </div>
                        </div>

                        {/* Card Opacity */}
                        <div>
                             <div className="flex justify-between mb-1">
                                <label className="text-[11px] text-zinc-400 flex items-center gap-1"><Droplets size={12}/> Opacity</label>
                                <span className="text-[10px] text-zinc-500">{Math.round(surfaceAlpha * 100)}%</span>
                             </div>
                             <input 
                                type="range" 
                                min="0" max="1" step="0.01" 
                                value={surfaceAlpha} 
                                onChange={e => handleSurfaceAlphaChange(parseFloat(e.target.value))} 
                                className="w-full accent-purple-600 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                             />
                        </div>

                        {/* Card Blur */}
                         <div>
                             <div className="flex justify-between mb-1">
                                <label className="text-[11px] text-zinc-400 flex items-center gap-1"><Gauge size={12}/> Blur</label>
                                <span className="text-[10px] text-zinc-500">{blurValue}px</span>
                             </div>
                             <input 
                                type="range" 
                                min="0" max="40" step="1" 
                                value={blurValue} 
                                onChange={e => updateTheme('--blur', `${e.target.value}px`)} 
                                className="w-full accent-purple-600 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                             />
                        </div>

                        {/* Card Radius */}
                         <div>
                             <div className="flex justify-between mb-1">
                                <label className="text-[11px] text-zinc-400 flex items-center gap-1"><Move size={12}/> Corner Radius</label>
                                <span className="text-[10px] text-zinc-500">{radiusValue}px</span>
                             </div>
                             <input 
                                type="range" 
                                min="0" max="48" step="1" 
                                value={radiusValue} 
                                onChange={e => updateTheme('--radius', `${e.target.value}px`)} 
                                className="w-full accent-purple-600 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                             />
                        </div>

                        <div>
                             <label className="text-[11px] text-zinc-400 block mb-1">Border Color</label>
                             <input type="text" value={settings.theme['--border']} onChange={e => updateTheme('--border', e.target.value)} className="w-full bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-xs font-mono text-zinc-300" />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export const PropertyPanel: React.FC<PropertyPanelProps> = ({ 
  selectedBlock, 
  componentDef, 
  onUpdateProps,
  siteSettings,
  onUpdateSiteSettings
}) => {

  if (!selectedBlock) {
     // Show Global Settings when no block is selected
     return <GlobalSettingsPanel settings={siteSettings} onUpdate={onUpdateSiteSettings} />;
  }

  if (!componentDef) {
    return (
      <div className="p-6 text-center text-red-400 text-sm">
        <XCircle size={24} className="mx-auto mb-2" />
        Component definition not found for type "{selectedBlock.type}"
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-zinc-900">
      {/* Header */}
      <div className="h-10 border-b border-zinc-800 flex items-center px-4 bg-zinc-850 shrink-0">
        <div className="text-xs font-bold text-zinc-100 uppercase flex items-center gap-2">
           <span className="text-purple-400">Properties</span> 
           <span className="text-zinc-600">/</span>
           {componentDef.name}
        </div>
        <div className="ml-auto text-[10px] font-mono text-zinc-600">
           ID: {selectedBlock.id}
        </div>
      </div>

      {/* Form Fields */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 gap-6">
          {componentDef.schema.fields.map(field => (
            <div key={field.name} className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wide">
                {field.label}
              </label>
              <FieldInput 
                field={field} 
                value={selectedBlock.props[field.name]}
                onChange={(val) => onUpdateProps(selectedBlock.id, { [field.name]: val })}
              />
              {field.description && (
                 <p className="text-[10px] text-zinc-600">{field.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Debug Info */}
      <div className="border-t border-zinc-800 p-2 bg-zinc-950/50">
         <details className="text-[10px] text-zinc-600 cursor-pointer">
            <summary>View Raw Data</summary>
            <pre className="mt-2 p-2 bg-black rounded overflow-x-auto text-zinc-500">
               {JSON.stringify(selectedBlock.props, null, 2)}
            </pre>
         </details>
      </div>
    </div>
  );
};
