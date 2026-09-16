import React, { useState } from 'react';
import {
  CheckCircle2,
  Download,
  Save,
  RotateCcw,
  HardDrive,
  FileCheck,
  Edit3,
  Check,
} from 'lucide-react';
import { useCompressionStore } from '../../stores/compressionStore';
import { useFileStore } from '../../stores/fileStore';

export const ArchiveCompleteModal: React.FC = () => {
  const {
    result,
    status,
    downloadArchive,
    saveArchiveAs,
    resetCompression,
    setArchiveName,
  } = useCompressionStore();
  const { clearFiles } = useFileStore();

  const [isEditingName, setIsEditingName] = useState(false);
  const [customName, setCustomName] = useState('');
  const [downloadStarted, setDownloadStarted] = useState(false);

  if (status !== 'completed' || !result) {
    return null;
  }

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const handleCompressAnother = () => {
    clearFiles();
    resetCompression();
  };

  const handleSaveName = () => {
    if (customName.trim()) {
      setArchiveName(customName.trim());
    }
    setIsEditingName(false);
  };

  const handleDownload = async () => {
    setDownloadStarted(true);
    await downloadArchive();
  };

  const handleSaveAs = async () => {
    setDownloadStarted(true);
    await saveArchiveAs();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-surface border border-emerald-500/40 p-6 shadow-2xl shadow-emerald-500/10 space-y-5">
        {/* Header Icon & Title */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto shadow-glow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">
            Compression Complete
          </h2>

          {/* Editable Archive Name Field */}
          <div className="flex items-center justify-center gap-2 pt-1">
            {isEditingName ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="px-2.5 py-1 text-xs rounded-lg bg-surface-subtle border border-emerald-500/50 text-slate-100 font-mono focus:outline-none"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                />
                <button
                  onClick={handleSaveName}
                  className="p-1 rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group">
                <span className="text-xs text-emerald-300 font-mono font-bold bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                  {result.archiveName}
                </span>
                <button
                  onClick={() => {
                    setCustomName(result.archiveName);
                    setIsEditingName(true);
                  }}
                  className="text-slate-500 hover:text-slate-200 opacity-70 group-hover:opacity-100 transition-opacity"
                  title="Rename archive"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <span className="text-[11px] text-slate-400 font-mono">
              ({result.fileCount.toLocaleString()} {result.fileCount === 1 ? 'file' : 'files'})
            </span>
          </div>
        </div>

        {/* Compression Metrics Banner */}
        <div className="rounded-xl bg-surface-subtle/80 border border-surface-border p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono border-b border-surface-border pb-3">
            <div className="text-slate-400">
              <span className="block text-[10px] uppercase">Input Size</span>
              <span className="text-sm font-semibold text-slate-200">
                {formatSize(result.totalInputBytes)}
              </span>
            </div>
            <div className="text-right text-emerald-400">
              <span className="block text-[10px] uppercase">Output Archive</span>
              <span className="text-sm font-bold">
                {formatSize(result.totalOutputBytes)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center font-mono">
            <div className="p-2 rounded-lg bg-surface border border-surface-border">
              <span className="block text-[9px] uppercase text-slate-400">Space Saved</span>
              <span className="text-xs font-bold text-emerald-400">
                {formatSize(result.bytesSaved)} ({result.compressionRatio}%)
              </span>
            </div>
            <div className="p-2 rounded-lg bg-surface border border-surface-border">
              <span className="block text-[9px] uppercase text-slate-400">Speed</span>
              <span className="text-xs font-bold text-cyan-400">
                {result.throughputMBps} MB/s
              </span>
            </div>
            <div className="p-2 rounded-lg bg-surface border border-surface-border">
              <span className="block text-[9px] uppercase text-slate-400">Duration</span>
              <span className="text-xs font-bold text-slate-200">
                {result.durationSeconds}s
              </span>
            </div>
          </div>
        </div>

        {/* Download Feedback Notice */}
        {downloadStarted && (
          <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono text-center flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Download stream started. Archive remains preserved across sessions.</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              onClick={handleDownload}
              className="px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs flex items-center justify-center gap-2 shadow-glow-sm transition-all hover:scale-[1.02]"
            >
              <Download className="w-4 h-4" />
              <span>Download ZIP</span>
            </button>

            <button
              onClick={handleSaveAs}
              className="px-4 py-3 rounded-xl bg-surface-subtle hover:bg-surface-hover border border-surface-border text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-all hover:border-slate-500"
            >
              <Save className="w-4 h-4 text-cyan-400" />
              <span>Save As (Direct to Disk)</span>
            </button>
          </div>

          <button
            onClick={handleCompressAnother}
            className="w-full py-2.5 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:bg-surface-subtle transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Compress Another Dataset</span>
          </button>
        </div>

        {/* Security Stamp */}
        <div className="text-center text-[10px] text-slate-400 font-mono flex items-center justify-center gap-1.5 pt-1">
          <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>PKZip Compliant • CRC32 Verified • Processed 100% Locally</span>
        </div>
      </div>
    </div>
  );
};
