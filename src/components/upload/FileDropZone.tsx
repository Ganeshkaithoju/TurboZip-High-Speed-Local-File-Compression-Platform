import React, { useRef, useState, DragEvent, ChangeEvent } from 'react';
import { UploadCloud, FolderUp, FilePlus, HardDrive, Shield, Loader2 } from 'lucide-react';
import { useFileStore } from '../../stores/fileStore';

interface DropZoneProps {
  compact?: boolean;
}

export const FileDropZone: React.FC<DropZoneProps> = ({ compact = false }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedCount, setScannedCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const { addFiles } = useFileStore();

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const items = e.dataTransfer.items;
    const droppedFiles: File[] = [];
    const relativePaths: Record<string, string> = {};

    setIsScanning(true);
    setScannedCount(0);

    let counter = 0;
    const yieldCheck = async () => {
      counter++;
      if (counter % 120 === 0) {
        setScannedCount(droppedFiles.length);
        // Yield to browser event loop to keep UI 100% fluid
        await new Promise((r) => setTimeout(r, 0));
      }
    };

    try {
      if (items && items.length > 0) {
        const entries: any[] = [];
        for (let i = 0; i < items.length; i++) {
          const item = items[i] as any;
          const entry = typeof item.webkitGetAsEntry === 'function' ? item.webkitGetAsEntry() : null;
          if (entry) entries.push(entry);
        }

        if (entries.length > 0) {
          for (const entry of entries) {
            await scanEntryAsync(entry, '', droppedFiles, relativePaths, yieldCheck);
          }
        } else {
          for (let i = 0; i < e.dataTransfer.files.length; i++) {
            droppedFiles.push(e.dataTransfer.files[i]);
            await yieldCheck();
          }
        }
      } else if (e.dataTransfer.files.length > 0) {
        for (let i = 0; i < e.dataTransfer.files.length; i++) {
          droppedFiles.push(e.dataTransfer.files[i]);
          await yieldCheck();
        }
      }

      if (droppedFiles.length > 0) {
        // Ingest in batches of 1,500 to prevent synchronous Zustand locking
        const BATCH_SIZE = 1500;
        for (let i = 0; i < droppedFiles.length; i += BATCH_SIZE) {
          const batch = droppedFiles.slice(i, i + BATCH_SIZE);
          addFiles(batch, relativePaths);
          if (droppedFiles.length > BATCH_SIZE) {
            await new Promise((r) => setTimeout(r, 0));
          }
        }
      }
    } finally {
      setIsScanning(false);
      setScannedCount(0);
    }
  };

  const scanEntryAsync = async (
    entry: any,
    currentPath: string,
    fileList: File[],
    relativePaths: Record<string, string>,
    yieldCheck: () => Promise<void>
  ): Promise<void> => {
    if (entry.isFile) {
      return new Promise<void>((resolve) => {
        entry.file(
          async (file: File) => {
            const fullPath = currentPath ? `${currentPath}/${file.name}` : file.name;
            relativePaths[file.name] = fullPath;
            fileList.push(file);
            await yieldCheck();
            resolve();
          },
          () => resolve()
        );
      });
    } else if (entry.isDirectory) {
      const dirReader = entry.createReader();
      return new Promise<void>((resolve) => {
        const readEntries = () => {
          dirReader.readEntries(
            async (entries: any[]) => {
              if (entries.length === 0) {
                resolve();
              } else {
                const nextPath = currentPath ? `${currentPath}/${entry.name}` : entry.name;
                for (const childEntry of entries) {
                  await scanEntryAsync(childEntry, nextPath, fileList, relativePaths, yieldCheck);
                }
                readEntries();
              }
            },
            () => resolve()
          );
        };
        readEntries();
      });
    }
  };

  const handleFileInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setIsScanning(true);
      setScannedCount(filesArray.length);
      try {
        const BATCH_SIZE = 1500;
        for (let i = 0; i < filesArray.length; i += BATCH_SIZE) {
          addFiles(filesArray.slice(i, i + BATCH_SIZE));
          if (filesArray.length > BATCH_SIZE) {
            await new Promise((r) => setTimeout(r, 0));
          }
        }
      } finally {
        setIsScanning(false);
        setScannedCount(0);
        e.target.value = '';
      }
    }
  };

  const handleFolderInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setIsScanning(true);
      setScannedCount(filesArray.length);
      try {
        const BATCH_SIZE = 1500;
        for (let i = 0; i < filesArray.length; i += BATCH_SIZE) {
          addFiles(filesArray.slice(i, i + BATCH_SIZE));
          if (filesArray.length > BATCH_SIZE) {
            await new Promise((r) => setTimeout(r, 0));
          }
        }
      } finally {
        setIsScanning(false);
        setScannedCount(0);
        e.target.value = '';
      }
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 text-center flex flex-col items-center justify-center ${
        isDragOver
          ? 'border-emerald-400 bg-emerald-500/10 shadow-glow-sm scale-[1.008]'
          : 'border-surface-border hover:border-slate-600 bg-surface/50 hover:bg-surface-subtle/50'
      } ${compact ? 'p-6' : 'p-10'}`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        multiple
        className="hidden"
      />
      <input
        type="file"
        ref={folderInputRef}
        onChange={handleFolderInputChange}
        {...({ webkitdirectory: '', directory: '' } as any)}
        className="hidden"
      />

      {isScanning ? (
        <div className="py-6 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto shadow-glow-cyan animate-pulse">
            <Loader2 className="w-7 h-7 animate-spin" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100 font-mono">
              Indexing Folder Hierarchy...
            </h3>
            <p className="text-xs text-cyan-400 font-mono mt-1 font-bold">
              {scannedCount.toLocaleString()} files scanned without UI blocking
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="w-14 h-14 rounded-2xl bg-surface-subtle border border-surface-border flex items-center justify-center text-emerald-400 shadow-inner mb-4 group-hover:scale-105 transition-transform">
            <UploadCloud className="w-7 h-7" />
          </div>

          <h3 className="text-base font-semibold text-slate-100 tracking-tight">
            Drop files or folders here
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Optimized for 40,000+ files and 15–20 GB workloads with non-blocking streaming I/O.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 text-xs font-medium rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold flex items-center gap-2 shadow-sm transition-all hover:scale-[1.02]"
            >
              <FilePlus className="w-4 h-4" />
              <span>Select Files</span>
            </button>

            <button
              type="button"
              onClick={() => folderInputRef.current?.click()}
              className="px-4 py-2 text-xs font-medium rounded-xl bg-surface-subtle hover:bg-surface-hover border border-surface-border text-slate-200 flex items-center gap-2 transition-all hover:border-slate-500"
            >
              <FolderUp className="w-4 h-4 text-emerald-400" />
              <span>Select Folder</span>
            </button>
          </div>

          <div className="flex items-center gap-4 mt-6 text-[11px] text-slate-400 border-t border-surface-border/60 pt-4 font-mono">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero Cloud Upload</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-slate-700" />
            <div className="flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
              <span>Memory & OPFS Stream</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
