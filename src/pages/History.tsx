import React from 'react';
import { History as HistoryIcon, Trash2, HardDrive, Clock, Gauge, FileCheck } from 'lucide-react';
import { useHistoryStore } from '../stores/historyStore';

export const History: React.FC = () => {
  const { records, removeRecord, clearHistory } = useHistoryStore();

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const formatDate = (ts: number): string => {
    return new Date(ts).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-surface-border pb-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase tracking-wider font-semibold">
            <HistoryIcon className="w-4 h-4" />
            <span>Telemetry Audit Log</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-1">
            Local Compression History
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Metadata records stored strictly in your browser. Raw files are never retained.
          </p>
        </div>

        {records.length > 0 && (
          <button
            onClick={clearHistory}
            className="px-3.5 py-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl border border-rose-500/20 flex items-center gap-1.5 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {records.length === 0 ? (
        <div className="text-center py-16 rounded-2xl bg-surface border border-surface-border p-6 space-y-3">
          <FileCheck className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-300 font-mono uppercase">
            No Compression Records Found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Completed compression jobs will appear here with bit-reduction ratios, speeds, and execution times.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-surface border border-surface-border hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs"
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-200 truncate">{item.archiveName}</span>
                  <span className="px-2 py-0.5 text-[9px] uppercase font-bold rounded bg-surface-subtle text-slate-400 border border-surface-border">
                    {item.mode}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-2">
                  <span>{formatDate(item.timestamp)}</span>
                  <span>•</span>
                  <span>{item.fileCount} {item.fileCount === 1 ? 'file' : 'files'}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0 text-right">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Input / Output</div>
                  <div className="text-slate-200">
                    {formatSize(item.inputBytes)} →{' '}
                    <span className="text-emerald-400 font-semibold">{formatSize(item.outputBytes)}</span>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Reduction</div>
                  <div className="text-emerald-400 font-bold">{item.compressionRatio}%</div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Speed</div>
                  <div className="text-cyan-400 font-bold">{item.throughputMBps} MB/s</div>
                </div>

                <button
                  onClick={() => removeRecord(item.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                  title="Remove record"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
