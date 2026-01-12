import React, { useMemo } from 'react';
import { ComponentDefinition } from '../types';
import { 
  Layout, 
  CreditCard, 
  Type, 
  Image as ImageIcon, 
  Box, 
  MousePointer 
} from 'lucide-react';

interface ComponentLibraryProps {
  components: ComponentDefinition[];
  onAddComponent: (slug: string) => void;
}

const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'layout': return <Layout size={20} />;
    case 'credit-card': return <CreditCard size={20} />;
    case 'align-left': return <Type size={20} />;
    case 'image': return <ImageIcon size={20} />;
    case 'mouse-pointer': return <MousePointer size={20} />;
    default: return <Box size={20} />;
  }
};

export const ComponentLibrary: React.FC<ComponentLibraryProps> = ({ components, onAddComponent }) => {
  
  // Group by category
  const grouped = useMemo(() => {
    const groups: Record<string, ComponentDefinition[]> = {};
    components.forEach(c => {
      if (!groups[c.category]) groups[c.category] = [];
      groups[c.category].push(c);
    });
    return groups;
  }, [components]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-zinc-800">
        <h2 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">Components</h2>
        <p className="text-[10px] text-zinc-500 mt-1">Drag or click to add to page</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-6">
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category}>
            <h3 className="text-[11px] font-semibold text-zinc-500 mb-2 uppercase px-1">{category}</h3>
            <div className="grid grid-cols-2 gap-2">
              {(items as ComponentDefinition[]).map(comp => (
                <button
                  key={comp.slug}
                  onClick={() => onAddComponent(comp.slug)}
                  className="flex flex-col items-center justify-center p-3 rounded bg-zinc-800 border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-750 hover:text-white text-zinc-400 transition-all group"
                  title={`Add ${comp.name}`}
                >
                  <div className="mb-2 group-hover:scale-110 transition-transform text-zinc-500 group-hover:text-purple-400">
                    {getIcon(comp.icon)}
                  </div>
                  <span className="text-[10px] text-center leading-tight">{comp.name}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};