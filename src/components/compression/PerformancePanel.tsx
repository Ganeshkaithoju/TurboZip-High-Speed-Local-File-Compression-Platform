import React from 'react';
import {
  Gauge,
  Cpu,
  Clock,
  HardDrive,
  Pause,
  Play,
  Square,
  Activity,
} from 'lucide-react';
import { useCompressionStore } from '../../stores/compressionStore';
import { usePerformanceStore } from '../../stores/performanceStore';
import { useSettingsStore } from '../../stores/settingsStore';

export const PerformancePanel: React.FC = () => {
  const { status, pauseCompression, resumeCompression, cancelCompression } =
    useCompressionStore();
  const { progress, workerStates, speedHistory } = usePerformanceStore();
  const { workerCount } = useSettingsStore();

  const isCompressing = status === 'compressing' || status === 'paused';

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const formatSeconds = (sec: number): string => {
    const mins = Math.floor(sec / 60);
    const remainingSec = Math.floor(sec % 60);
    return `${mins.toString().padStart(2, '0')}:${remainingSec.toString().padStart(2, '0')}`;
  };

  const percent = progress.totalBytes > 0
    ? Math.min(100, Math.round((progress.bytesProcessed / progress.totalBytes) * 100))
    : 0;

  return (
    <div className="rounded-2xl bg-surface border border-surface-border p-4 space-y-4">
      {/* Top Status Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-semibold text-slate-200 font-mono uppercase tracking-wide">
            Engine Telemetry
          </h3>
        </div>

        {isCompressing && (
          <div className="flex items-center gap-1.5">
            {status === 'compressing' ? (
              <button
                onClick={pauseCompression}
                className="px-2.5 py-1 text-xs rounded-lg bg-surface-subtle hover:bg-surface-hover border border-surface-border text-slate-300 flex items-center gap-1"
              >
                <Pause className="w-3 h-3 text-amber-400" />
                <span>Pause</span>
              </button>
            ) : (
              <button
                onClick={resumeCompression}
                className="px-2.5 py-1 text-xs rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 flex items-center gap-1"
              >
                <Play className="w-3 h-3 text-emerald-400" />
                <span>Resume</span>
              </button>
            )}

            <button
              onClick={cancelCompression}
              className="px-2.5 py-1 text-xs rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center gap-1"
            >
              <Square className="w-3 h-3" />
              <span>Cancel</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">
            {progress.phase === 'finalizing'
              ? 'Writing Central Directory...'
              : progress.currentFile
              ? `Processing: ${progress.currentFile}`
              : 'Engine Ready'}
          </span>
          <span className="font-bold text-slate-100">{percent}%</span>
        </div>

        <div className="w-full h-2 rounded-full bg-surface-subtle overflow-hidden border border-surface-border">
          <div
            className={`h-full transition-all duration-300 ${
              status === 'completed'
                ? 'bg-emerald-400'
                : 'bg-gradient-to-r from-emerald-500 to-cyan-400 shadow-glow-sm'
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
        {/* Throughput */}
        <div className="p-3 rounded-xl bg-surface-subtle/70 border border-surface-border flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-mono uppercase">Speed</span>
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-base font-bold font-mono text-slate-100">
            {progress.throughputMBps}{' '}
            <span className="text-[10px] font-normal text-slate-400">MB/s</span>
          </div>
        </div>

        {/* Ratio & Saved */}
        <div className="p-3 rounded-xl bg-surface-subtle/70 border border-surface-border flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-mono uppercase">Ratio</span>
            <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-base font-bold font-mono text-emerald-400">
            {progress.ratio}%{' '}
            <span className="text-[10px] font-normal text-slate-400">saved</span>
          </div>
        </div>

        {/* CPU Workers Active */}
        <div className="p-3 rounded-xl bg-surface-subtle/70 border border-surface-border flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-mono uppercase">Threads</span>
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-base font-bold font-mono text-slate-100">
            {workerCount}{' '}
            <span className="text-[10px] font-normal text-slate-400">workers</span>
          </div>
        </div>

        {/* Elapsed / ETA */}
        <div className="p-3 rounded-xl bg-surface-subtle/70 border border-surface-border flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-mono uppercase">Time / ETA</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xs font-bold font-mono text-slate-100">
            {formatSeconds(progress.elapsedSeconds)}{' '}
            <span className="text-[10px] font-normal text-slate-400">
              / {formatSeconds(progress.estimatedRemainingSeconds)}
            </span>
          </div>
        </div>
      </div>

      {/* Hardware Worker Matrix Visualization */}
      <div className="p-3 rounded-xl bg-surface-subtle/40 border border-surface-border space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Worker Pool Utilization</span>
          <span className="text-emerald-400">
            {progress.filesProcessed} / {progress.totalFiles} files
          </span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
          {Array.from({ length: workerCount }).map((_, i) => {
            const worker = workerStates.find((w) => w.id === i + 1);
            const isBusy = worker?.busy || (isCompressing && i < 2);

            return (
              <div
                key={i}
                className={`p-1.5 rounded-lg border text-center transition-all ${
                  isBusy
                    ? 'bg-cyan-950/60 border-cyan-500/50 shadow-glow-cyan'
                    : 'bg-surface border-surface-border text-slate-600'
                }`}
                title={worker?.filename ? `Processing: ${worker.filename}` : `Worker ${i + 1}`}
              >
                <div className="text-[9px] font-mono font-semibold text-slate-300">
                  W{i + 1}
                </div>
                <div
                  className={`w-1.5 h-1.5 rounded-full mx-auto mt-1 ${
                    isBusy ? 'bg-cyan-400 animate-ping' : 'bg-slate-700'
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
