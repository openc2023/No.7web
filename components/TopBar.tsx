
import React from 'react';
import { Monitor, Tablet, Smartphone, Download, Save, Share2, Box, Github, Cloud, Undo2, Redo2 } from 'lucide-react';
import { Page } from '../types';

interface TopBarProps {
  activePage: Page;
  viewDevice: 'desktop' | 'tablet' | 'mobile';
  setViewDevice: (d: 'desktop' | 'tablet' | 'mobile') => void;
  onSave: () => void;
  onPublish: () => void;
  onOpenSettings: () => void;
  isGitHubConnected: boolean;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ 
    activePage, 
    viewDevice, 
    setViewDevice, 
    onSave, 
    onPublish, 
    onOpenSettings,
    isGitHubConnected,
    canUndo,
    canRedo,
    onUndo,
    onRedo
}) => {
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
            <span className={`w-2 h-2 rounded-full ${isGitHubConnected ? 'bg-green-500' : 'bg-orange-500'}`} title={isGitHubConnected ? "Connected to GitHub" : "Local Mode"}></span>
            {activePage.title}
          </div>
        </div>
      </div>

      {/* Center Group: Device & History */}
      <div className="flex items-center gap-4">
        <div className="flex items-center bg-zinc-950 rounded-lg p-1 border border-zinc-800">
            <button 
            onClick={() => setViewDevice('desktop')}
            className={`p-1.5 rounded transition-colors ${viewDevice === 'desktop' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}
            title="Desktop View"
            >
            <Monitor size={16} />
            </button>
            <button 
            onClick={() => setViewDevice('tablet')}
            className={`p-1.5 rounded transition-colors ${viewDevice === 'tablet' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}
            title="Tablet View"
            >
            <Tablet size={16} />
            </button>
            <button 
            onClick={() => setViewDevice('mobile')}
            className={`p-1.5 rounded transition-colors ${viewDevice === 'mobile' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}
            title="Mobile View"
            >
            <Smartphone size={16} />
            </button>
        </div>

        <div className="h-6 w-px bg-zinc-800"></div>

        <div className="flex items-center gap-1">
            <button 
                onClick={onUndo}
                disabled={!canUndo}
                className={`p-1.5 rounded transition-colors ${canUndo ? 'text-zinc-300 hover:bg-zinc-800 hover:text-white' : 'text-zinc-700 cursor-not-allowed'}`}
                title="Undo (Ctrl+Z)"
            >
                <Undo2 size={16} />
            </button>
            <button 
                onClick={onRedo}
                disabled={!canRedo}
                className={`p-1.5 rounded transition-colors ${canRedo ? 'text-zinc-300 hover:bg-zinc-800 hover:text-white' : 'text-zinc-700 cursor-not-allowed'}`}
                title="Redo (Ctrl+Shift+Z)"
            >
                <Redo2 size={16} />
            </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 w-72 justify-end">
         <button 
            onClick={onOpenSettings}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium border rounded transition-colors ${isGitHubConnected ? 'text-zinc-300 border-zinc-800 hover:bg-zinc-800' : 'text-purple-400 border-purple-500/50 bg-purple-500/10'}`}
            title="GitHub Settings"
         >
            <Github size={14} />
         </button>
         
         <div className="h-6 w-px bg-zinc-800 mx-1"></div>

         <button 
            onClick={onSave}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded transition-colors ${isGitHubConnected ? 'text-green-400 hover:bg-zinc-800 border border-transparent hover:border-zinc-700' : 'text-zinc-500 cursor-not-allowed'}`}
            title={isGitHubConnected ? "Push changes to GitHub" : "Connect GitHub to save"}
         >
            <Cloud size={14} />
            Save Cloud
         </button>
         <button 
            onClick={onPublish}
            className="flex items-center gap-2 px-4 py-1.5 text-xs font-medium bg-zinc-100 text-zinc-900 hover:bg-white rounded transition-colors"
            title="Download ZIP"
         >
            <Download size={14} />
            Export
         </button>
      </div>
    </div>
  );
};
