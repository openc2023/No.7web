
import React, { useState } from 'react';
import { Github, Save, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { SiteSettings, GitHubConfig } from '../types';

interface GitHubSettingsProps {
    settings: SiteSettings;
    onUpdate: (s: SiteSettings) => void;
    onConnect: (config: GitHubConfig) => void;
    isConnected: boolean;
    error: string | null;
}

export const GitHubSettings: React.FC<GitHubSettingsProps> = ({ settings, onUpdate, onConnect, isConnected, error }) => {
    const [config, setConfig] = useState<GitHubConfig>(settings.github || {
        owner: '',
        repo: '',
        branch: 'main',
        token: '',
        pathPrefix: 'content',
        isProxy: false
    });

    const handleChange = (key: keyof GitHubConfig, value: any) => {
        const newConfig = { ...config, [key]: value };
        setConfig(newConfig);
    };

    const handleSave = () => {
        onUpdate({ ...settings, github: config });
        onConnect(config);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-[480px] shadow-2xl overflow-hidden">
                <div className="p-4 border-b border-zinc-800 bg-zinc-850 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-zinc-100">
                        <Github size={18} />
                        GitHub Storage Adapter
                    </div>
                    {isConnected ? (
                        <span className="flex items-center gap-1 text-[10px] text-green-400 bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20">
                            <Wifi size={12} /> Connected
                        </span>
                    ) : (
                        <span className="flex items-center gap-1 text-[10px] text-zinc-500">
                            <WifiOff size={12} /> Disconnected
                        </span>
                    )}
                </div>

                <div className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded p-3 text-red-400 text-xs flex gap-2 items-start">
                             <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                             {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[11px] font-medium text-zinc-400 uppercase">Owner / Org</label>
                            <input 
                                type="text" 
                                placeholder="e.g. facebook"
                                className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm text-white focus:border-purple-500 outline-none"
                                value={config.owner}
                                onChange={e => handleChange('owner', e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[11px] font-medium text-zinc-400 uppercase">Repository</label>
                            <input 
                                type="text" 
                                placeholder="e.g. react"
                                className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm text-white focus:border-purple-500 outline-none"
                                value={config.repo}
                                onChange={e => handleChange('repo', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[11px] font-medium text-zinc-400 uppercase">Branch</label>
                            <input 
                                type="text" 
                                placeholder="main"
                                className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm text-white focus:border-purple-500 outline-none"
                                value={config.branch}
                                onChange={e => handleChange('branch', e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[11px] font-medium text-zinc-400 uppercase">Content Root</label>
                            <input 
                                type="text" 
                                placeholder="path/to/json"
                                className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm text-white focus:border-purple-500 outline-none"
                                value={config.pathPrefix}
                                onChange={e => handleChange('pathPrefix', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[11px] font-medium text-zinc-400 uppercase flex justify-between">
                            <span>Personal Access Token (PAT)</span>
                            <span className="text-[10px] text-zinc-500 normal-case opacity-70">
                                Required for private repos
                            </span>
                        </label>
                        <input 
                            type="password" 
                            placeholder="ghp_xxxxxxxxxxxx"
                            className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm text-white focus:border-purple-500 outline-none font-mono"
                            value={config.token}
                            onChange={e => handleChange('token', e.target.value)}
                        />
                         <p className="text-[10px] text-zinc-500 mt-1">
                            ⚠️ Tokens are stored in browser memory only. For production, use a proxy backend.
                        </p>
                    </div>
                </div>

                <div className="p-4 bg-zinc-850 border-t border-zinc-800 flex justify-end gap-2">
                    <button 
                        onClick={handleSave}
                        className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded text-xs font-medium flex items-center gap-2 transition-colors"
                    >
                        <Save size={14} />
                        Connect & Load
                    </button>
                </div>
            </div>
        </div>
    );
};
