import React from 'react';
import { Lock, Zap, Gauge, History, Settings, BookOpen } from 'lucide-react';

export type NavTab = 'compressor' | 'benchmark' | 'history' | 'settings' | 'docs';

interface NavbarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onTabChange }) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-surface-border bg-[#090b10]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={() => onTabChange('compressor')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-surface to-surface-subtle border border-emerald-500/30 flex items-center justify-center shadow-glow-sm group-hover:border-emerald-400/60 transition-all">
            <div className="relative flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-dashed border-emerald-400 rounded-full animate-spin-slow" />
              <Zap className="w-3.5 h-3.5 text-emerald-400 absolute" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                HYPER<span className="text-emerald-400">ZIP</span>
              </span>
              <span className="px-1.5 py-0.5 text-[9px] font-mono uppercase bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded font-semibold">
                v2.4
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block font-mono">
              High-Speed Local Compression
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-surface-subtle/70 p-1 rounded-xl border border-surface-border">
          <button
            onClick={() => onTabChange('compressor')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-2 ${
              currentTab === 'compressor'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-surface-hover'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Workspace</span>
          </button>

          <button
            onClick={() => onTabChange('benchmark')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-2 ${
              currentTab === 'benchmark'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-surface-hover'
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>Benchmark</span>
          </button>

          <button
            onClick={() => onTabChange('history')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-2 ${
              currentTab === 'history'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-surface-hover'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>History</span>
          </button>

          <button
            onClick={() => onTabChange('settings')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-2 ${
              currentTab === 'settings'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-surface-hover'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>

          <button
            onClick={() => onTabChange('docs')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-2 ${
              currentTab === 'docs'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-surface-hover'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Docs</span>
          </button>
        </nav>

        {/* Security & Privacy Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 shadow-sm">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <div className="text-left leading-none">
              <div className="text-[11px] font-semibold tracking-wide">100% LOCAL</div>
              <div className="text-[9px] text-emerald-400/80 font-mono hidden sm:inline">Zero cloud upload</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Tab Row */}
      <div className="md:hidden flex items-center justify-around border-t border-surface-border bg-surface px-2 py-1.5">
        <button
          onClick={() => onTabChange('compressor')}
          className={`px-2 py-1 text-xs rounded ${currentTab === 'compressor' ? 'text-emerald-400 font-semibold' : 'text-slate-400'}`}
        >
          Workspace
        </button>
        <button
          onClick={() => onTabChange('benchmark')}
          className={`px-2 py-1 text-xs rounded ${currentTab === 'benchmark' ? 'text-emerald-400 font-semibold' : 'text-slate-400'}`}
        >
          Benchmark
        </button>
        <button
          onClick={() => onTabChange('history')}
          className={`px-2 py-1 text-xs rounded ${currentTab === 'history' ? 'text-emerald-400 font-semibold' : 'text-slate-400'}`}
        >
          History
        </button>
        <button
          onClick={() => onTabChange('settings')}
          className={`px-2 py-1 text-xs rounded ${currentTab === 'settings' ? 'text-emerald-400 font-semibold' : 'text-slate-400'}`}
        >
          Settings
        </button>
        <button
          onClick={() => onTabChange('docs')}
          className={`px-2 py-1 text-xs rounded ${currentTab === 'docs' ? 'text-emerald-400 font-semibold' : 'text-slate-400'}`}
        >
          Docs
        </button>
      </div>
    </header>
  );
};
