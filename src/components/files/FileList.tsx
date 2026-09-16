import React, { useState, useRef, useMemo, UIEvent } from 'react';
import { Trash2, Files, Sparkles, Search } from 'lucide-react';
import { useFileStore } from '../../stores/fileStore';
import { useCompressionStore } from '../../stores/compressionStore';
import { FileRow } from './FileRow';

const ITEM_HEIGHT = 52; // Height of each FileRow in pixels
const CONTAINER_HEIGHT = 420; // Height of the scroll container

export const FileList: React.FC = () => {
  const { files, totalBytes, totalFiles, removeFile, clearFiles } = useFileStore();
  const { status } = useCompressionStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [scrollTop, setScrollTop] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const isLocked = status === 'compressing';

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  // Filtered files for search
  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return files;
    const q = searchQuery.toLowerCase();
    return files.filter((f) => f.relativePath.toLowerCase().includes(q));
  }, [files, searchQuery]);

  // Strategy breakdown (computed efficiently)
  const { storeCount, compressCount } = useMemo(() => {
    let store = 0;
    let compress = 0;
    for (let i = 0; i < files.length; i++) {
      if (files[i].analysis.recommendedStrategy === 'store') store++;
      else compress++;
    }
    return { storeCount: store, compressCount: compress };
  }, [files]);

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  // Virtual windowing calculations: only render ~15-25 items in DOM
  const totalItems = filteredFiles.length;
  const totalContentHeight = totalItems * ITEM_HEIGHT;

  const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - 3);
  const visibleCount = Math.ceil(CONTAINER_HEIGHT / ITEM_HEIGHT) + 6;
  const endIndex = Math.min(totalItems, startIndex + visibleCount);

  const visibleItems = useMemo(() => {
    return filteredFiles.slice(startIndex, endIndex);
  }, [filteredFiles, startIndex, endIndex]);

  const offsetY = startIndex * ITEM_HEIGHT;

  if (files.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col h-full rounded-2xl bg-surface border border-surface-border p-4 space-y-3">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-2 border-b border-surface-border">
        <div className="flex items-center gap-2">
          <Files className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-semibold text-slate-200 tracking-wide uppercase font-mono">
            Files ({totalFiles.toLocaleString()})
          </h3>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-surface-subtle text-slate-300 border border-surface-border">
            {formatSize(totalBytes)}
          </span>
        </div>

        {!isLocked && (
          <button
            onClick={clearFiles}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* Heuristic Breakdown Pills */}
      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-emerald-400 font-semibold">
            <Sparkles className="w-3 h-3" />
            <span>{compressCount.toLocaleString()} Compress</span>
          </div>
          <span>•</span>
          <div className="text-purple-400 font-semibold">
            <span>{storeCount.toLocaleString()} Store</span>
          </div>
        </div>

        {totalFiles > 1000 && (
          <span className="text-[10px] text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20">
            Virtualized 60 FPS
          </span>
        )}
      </div>

      {/* Quick Search Filter for large file lists */}
      {totalFiles > 10 && (
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Filter ${totalFiles.toLocaleString()} files...`}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-surface-subtle border border-surface-border text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-400/50 font-mono"
          />
        </div>
      )}

      {/* Virtualized Scroll Container */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        style={{ height: CONTAINER_HEIGHT }}
        className="overflow-y-auto relative rounded-xl pr-1"
      >
        {/* Virtual spacer giving full scrollbar height */}
        <div style={{ height: totalContentHeight, position: 'relative', width: '100%' }}>
          {/* Absolutely positioned window of currently visible items */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              transform: `translateY(${offsetY}px)`,
            }}
            className="space-y-1.5"
          >
            {visibleItems.map((item) => (
              <FileRow
                key={item.id}
                item={item}
                onRemove={removeFile}
                disabled={isLocked}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
