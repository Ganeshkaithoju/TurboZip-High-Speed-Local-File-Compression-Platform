import React from 'react';
import { useFileStore } from '../stores/fileStore';
import { useCompressionStore } from '../stores/compressionStore';
import { useSettingsStore } from '../stores/settingsStore';
import { FileDropZone } from '../components/upload/FileDropZone';
import { FileList } from '../components/files/FileList';
import { ModeSelector } from '../components/compression/ModeSelector';
import { PerformancePanel } from '../components/compression/PerformancePanel';
import { CompressionScene } from '../components/three/CompressionScene';
import { ArchiveCompleteModal } from '../components/modal/ArchiveCompleteModal';
import { Zap, Play, AlertCircle } from 'lucide-react';

export const Compressor: React.FC = () => {
  const { files, totalBytes, totalFiles } = useFileStore();
  const { status, startCompression, errorMessage } = useCompressionStore();
  const { workerCount } = useSettingsStore();

  const isCompressing = status === 'compressing' || status === 'paused';
  const hasFiles = files.length > 0;

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Modal on completion */}
      <ArchiveCompleteModal />

      {/* Error alert banner */}
      {status === 'error' && errorMessage && (
        <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main 3-Column Studio Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: File Manager & Selection (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {hasFiles ? (
            <div className="space-y-4">
              <FileList />
              {!isCompressing && <FileDropZone compact />}
            </div>
          ) : (
            <div className="space-y-4">
              <FileDropZone />
              <div className="rounded-2xl bg-surface border border-surface-border p-4 space-y-3">
                <div className="text-xs font-semibold uppercase font-mono text-slate-300">
                  Engine Architecture
                </div>
                <ul className="text-xs text-slate-400 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>Multi-threaded Web Workers reserve CPU cores for fluid UI.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>Smart Heuristics detect pre-compressed media to save CPU time.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>Zero server uploads. Everything stays inside your browser.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Center Column: 3D Visualization Layer (4 cols) */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          <div className="h-[380px] sm:h-[420px] w-full">
            <CompressionScene className="h-full w-full" />
          </div>

          {/* Quick Engine Status Bar */}
          <div className="p-3 rounded-xl bg-surface border border-surface-border flex items-center justify-between text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Status: {status.toUpperCase()}</span>
            </div>
            <div>
              <span>Threads: {workerCount} cores</span>
            </div>
          </div>
        </div>

        {/* Right Column: Engine Settings & Compression Action (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <ModeSelector />

          {/* Performance Panel */}
          <PerformancePanel />

          {/* Primary Action Button */}
          {!isCompressing && (
            <button
              onClick={startCompression}
              disabled={!hasFiles}
              className={`w-full py-3.5 rounded-xl font-bold text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 shadow-glow-sm transition-all ${
                hasFiles
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 hover:scale-[1.01]'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-surface-border'
              }`}
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>
                {hasFiles
                  ? `Compress ${totalFiles} Files (${formatSize(totalBytes)})`
                  : 'Select Files to Compress'}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
