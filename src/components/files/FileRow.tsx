import React from 'react';
import {
  FileText,
  FileCode,
  FileArchive,
  Film,
  Music,
  Image as ImageIcon,
  Database,
  Binary,
  X,
  Sparkles,
} from 'lucide-react';
import { FileItem, FileCategory } from '../../core/types/engine';

interface FileRowProps {
  item: FileItem;
  onRemove: (id: string) => void;
  disabled?: boolean;
}

export const FileRow: React.FC<FileRowProps> = ({ item, onRemove, disabled }) => {
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const getCategoryIcon = (category: FileCategory) => {
    switch (category) {
      case 'code':
        return <FileCode className="w-4 h-4 text-cyan-400" />;
      case 'data':
        return <Database className="w-4 h-4 text-emerald-400" />;
      case 'media':
        return <Film className="w-4 h-4 text-pink-400" />;
      case 'archive':
        return <FileArchive className="w-4 h-4 text-purple-400" />;
      case 'binary':
        return <Binary className="w-4 h-4 text-amber-400" />;
      default:
        return <FileText className="w-4 h-4 text-slate-400" />;
    }
  };

  const strategy = item.analysis.recommendedStrategy;

  return (
    <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-subtle/50 hover:bg-surface-subtle border border-surface-border/70 transition-all text-xs group">
      <div className="flex items-center gap-3 min-w-0 flex-1 pr-3">
        <div className="w-8 h-8 rounded-lg bg-surface border border-surface-border flex items-center justify-center flex-shrink-0">
          {getCategoryIcon(item.analysis.category)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-medium text-slate-200 truncate" title={item.relativePath}>
            {item.relativePath}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
            <span>{formatSize(item.file.size)}</span>
            <span>•</span>
            <span className="uppercase text-[10px] text-slate-400">{item.analysis.category}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Strategy Pill */}
        <div
          className={`px-2 py-0.5 rounded-md text-[10px] font-mono uppercase font-semibold flex items-center gap-1 ${
            strategy === 'store'
              ? 'bg-purple-950/60 border border-purple-500/30 text-purple-300'
              : strategy === 'compress'
              ? 'bg-emerald-950/60 border border-emerald-500/30 text-emerald-300'
              : 'bg-cyan-950/60 border border-cyan-500/30 text-cyan-300'
          }`}
          title={
            strategy === 'store'
              ? 'Pre-compressed: STORE (Level 0) saves CPU'
              : 'Compressible: Deflate compression'
          }
        >
          {strategy === 'store' ? (
            <span>STORE</span>
          ) : (
            <>
              <Sparkles className="w-3 h-3" />
              <span>COMPRESS</span>
            </>
          )}
        </div>

        {/* Remove Button */}
        {!disabled && (
          <button
            onClick={() => onRemove(item.id)}
            className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 opacity-60 group-hover:opacity-100 transition-all"
            title="Remove file"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
