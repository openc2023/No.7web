import React from 'react';
import { Monitor, Tablet, Smartphone, Download, Save, Share2, Box } from 'lucide-react';
import { Page } from '../types';

interface TopBarProps {
  activePage: Page;
  viewDevice: 'desktop' | 'tablet' | 'mobile';
  setViewDevice: (d: 'desktop' | 'tablet' | 'mobile') => void;
  onSave: () => void;
  onPublish: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ activePage, viewDevice, setViewDevice, onSave, onPublish }) => {
  return (
    <div className="h-14 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-4 select-none shrink-0">
      
      {/* Brand & Page Info */}
      <div className="flex items-center gap-3 w-64">
        <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center text-white font-bold text-lg">
          7
        </div>
        <div>
          <h1 className="text-sm font-semibold text-zinc-100">No.7 Web Studio</h1>
          <div className="text-xs text-zinc-500 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            {activePage.title}
          </div>
        </div>
      </div>

      {/* Device Toggle */}
      <div className="flex items-center bg-zinc-950 rounded-lg p-1 border border-zinc-800">
        <button 
          onClick={() => setViewDevice('desktop')}
          className={`p-1.5 rounded transition-colors ${viewDevice === 'desktop' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}
          title="Desktop View"
        >
          <Monitor size={18} />
        </button>
        <button 
          onClick={() => setViewDevice('tablet')}
          className={`p-1.5 rounded transition-colors ${viewDevice === 'tablet' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}
          title="Tablet View"
        >
          <Tablet size={18} />
        </button>
        <button 
          onClick={() => setViewDevice('mobile')}
          className={`p-1.5 rounded transition-colors ${viewDevice === 'mobile' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}
          title="Mobile View"
        >
          <Smartphone size={18} />
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 w-72 justify-end">
         <button 
            onClick={onSave}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-colors"
         >
            <Save size={14} />
            Save Draft
         </button>
         <button 
            onClick={onPublish}
            className="flex items-center gap-2 px-4 py-1.5 text-xs font-medium bg-zinc-100 text-zinc-900 hover:bg-white rounded transition-colors"
         >
            <Share2 size={14} />
            Publish
         </button>
      </div>
    </div>
  );
};