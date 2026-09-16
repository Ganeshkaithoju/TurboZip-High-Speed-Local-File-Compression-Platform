import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Cpu,
  HardDrive,
  Eye,
  Shield,
  Layers,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useSettingsStore } from '../stores/settingsStore';
import { OpfsStorage, StorageQuotaInfo } from '../core/storage/OpfsStorage';

export const Settings: React.FC = () => {
  const {
    defaultMode,
    setDefaultMode,
    workerCount,
    setWorkerCount,
    maxHardwareWorkers,
    chunkSizeMB,
    setChunkSizeMB,
    useOpfs,
    setUseOpfs,
    performanceMode,
    setPerformanceMode,
    show3DVisualization,
    setShow3DVisualization,
  } = useSettingsStore();

  const [storageInfo, setStorageInfo] = useState<StorageQuotaInfo | null>(null);

  useEffect(() => {
    OpfsStorage.getQuota().then(setStorageInfo);
  }, []);

  const formatGB = (bytes: number): string => {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-surface-border pb-6">
        <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase tracking-wider font-semibold">
          <SettingsIcon className="w-4 h-4" />
          <span>System & Engine Tuning</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-1">
          Hardware & Engine Configuration
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Fine-tune concurrency, I/O buffer chunks, visualization performance, and local storage.
        </p>
      </div>

      <div className="space-y-6">
        {/* Section 1: Concurrency & Worker Threads */}
        <div className="p-5 rounded-2xl bg-surface border border-surface-border space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Worker Pool Concurrency</h3>
              <p className="text-xs text-slate-400">
                Number of Web Workers allocated for parallel chunked compression.
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-slate-400">Active Thread Pool Size:</span>
              <span className="font-bold text-slate-100">
                {workerCount} workers{' '}
                <span className="text-slate-500">({maxHardwareWorkers} CPU cores detected)</span>
              </span>
            </div>
            <input
              type="range"
              min="1"
              max={Math.max(2, maxHardwareWorkers)}
              value={workerCount}
              onChange={(e) => setWorkerCount(parseInt(e.target.value))}
              className="w-full h-1.5 bg-surface-subtle rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
            <p className="text-[11px] text-slate-500 font-mono">
              Tip: Reserving 1–2 logical cores ensures the 3D visualization and UI stay smooth during
              heavy jobs.
            </p>
          </div>
        </div>

        {/* Section 2: Storage & OPFS Pipeline */}
        <div className="p-5 rounded-2xl bg-surface border border-surface-border space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-100">
                  Origin Private File System (OPFS)
                </h3>
                <p className="text-xs text-slate-400">
                  Streams huge archive output to optimized browser private disk storage.
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={useOpfs}
                onChange={(e) => setUseOpfs(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-surface-subtle peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          {storageInfo?.supported && (
            <div className="p-3 rounded-xl bg-surface-subtle/50 border border-surface-border font-mono text-xs flex items-center justify-between">
              <span className="text-slate-400">Local Browser Disk Quota Available:</span>
              <span className="text-emerald-400 font-semibold">
                {formatGB(storageInfo.availableBytes)}
              </span>
            </div>
          )}

          <div className="space-y-2 pt-2 border-t border-surface-border/60">
            <label className="text-xs font-mono uppercase text-slate-400 block">
              Chunk I/O Buffer Size
            </label>
            <div className="flex items-center gap-2">
              {[16, 64, 128].map((size) => (
                <button
                  key={size}
                  onClick={() => setChunkSizeMB(size)}
                  className={`px-3 py-1.5 text-xs rounded-xl font-mono transition-all ${
                    chunkSizeMB === size
                      ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold'
                      : 'bg-surface-subtle border border-surface-border text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {size} MB Chunks
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: 3D Visualization & Reduced Motion */}
        <div className="p-5 rounded-2xl bg-surface border border-surface-border space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-100">Performance Mode (2D Canvas)</h3>
                <p className="text-xs text-slate-400">
                  Replaces WebGL 3D rendering with a lightweight 2D monitor to save GPU/battery.
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={performanceMode}
                onChange={(e) => setPerformanceMode(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-surface-subtle peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>
        </div>

        {/* Section 4: Privacy Guarantee Box */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/20 to-surface border border-emerald-500/30 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono uppercase font-bold">
            <Shield className="w-4 h-4" />
            <span>HyperZip Zero-Knowledge Privacy Architecture</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            All files selected in HyperZip are read through direct browser memory handles, sent to
            local Web Workers via Transferable ArrayBuffers, and stored in the Origin Private File
            System or directly saved to your disk. No network packets containing user files are ever
            dispatched.
          </p>
          <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400/90 pt-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Verified 100% Client-Side Engine</span>
          </div>
        </div>
      </div>
    </div>
  );
};
