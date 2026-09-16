import React from 'react';
import { Zap, Shield, HardDrive, Cpu, ArrowRight, CheckCircle2 } from 'lucide-react';
import { FileDropZone } from '../components/upload/FileDropZone';
import { CompressionScene } from '../components/three/CompressionScene';
import { NavTab } from '../components/layout/Navbar';

interface HomeProps {
  onNavigate: (tab: NavTab) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Text */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-mono text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>100% Local Multi-Threaded Engine</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-100 tracking-tight leading-tight">
              Compress at the speed of your{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                hardware.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-400 max-w-lg leading-relaxed">
              Smart, privacy-first local file compression designed for large datasets and folders.
              Your files never leave your computer.
            </p>

            {/* Feature Bullets */}
            <div className="grid grid-cols-2 gap-3 font-mono text-xs text-slate-300 pt-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Zero Cloud Upload</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Multi-Core Workers</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Smart Media Detection</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>OPFS Direct Streaming</span>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="pt-2 flex flex-wrap gap-4">
              <button
                onClick={() => onNavigate('compressor')}
                className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono uppercase tracking-wider flex items-center gap-2 shadow-glow-sm transition-all hover:scale-[1.02]"
              >
                <span>Launch Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('benchmark')}
                className="px-6 py-3 rounded-xl bg-surface-subtle hover:bg-surface-hover border border-surface-border text-slate-200 font-bold text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all hover:border-slate-500"
              >
                <span>Benchmark Hardware</span>
              </button>
            </div>
          </div>

          {/* Right 3D Visualizer Core */}
          <div className="lg:col-span-6 h-[420px] w-full">
            <CompressionScene className="h-full w-full" />
          </div>
        </div>
      </div>

      {/* Instant Drop Zone Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 space-y-1">
          <h2 className="text-xl font-bold text-slate-100 font-mono tracking-tight uppercase">
            Start Instant Compression
          </h2>
          <p className="text-xs text-slate-400">
            Drag and drop files or entire directories below to begin instant local processing.
          </p>
        </div>
        <FileDropZone />
      </div>

      {/* Value Proposition Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-surface border border-surface-border space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-100 font-mono uppercase">
              100% Client-Side Privacy
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Files are processed entirely within browser sandboxed Web Workers. No server uploads,
              no telemetry logging of file contents, and no accounts required.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface border border-surface-border space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-100 font-mono uppercase">
              Hardware-Aware Multi-Threading
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Auto-tunes worker threads based on your processor concurrency while reserving cores
              for the UI thread to ensure zero lag or stutters.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface border border-surface-border space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <HardDrive className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-100 font-mono uppercase">
              Smart File Analyzer
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Eliminates wasted CPU time by detecting pre-compressed videos and archives, storing
              them directly while deeply compressing text, logs, and datasets.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
