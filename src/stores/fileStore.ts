import { create } from 'zustand';
import { FileItem } from '../core/types/engine';
import { FileAnalyzer } from '../core/analyzers/FileAnalyzer';

interface FileState {
  files: FileItem[];
  totalBytes: number;
  totalFiles: number;
  isAnalyzing: boolean;
  addFiles: (newFiles: File[], relativePaths?: Record<string, string>) => void;
  removeFile: (id: string) => void;
  clearFiles: () => void;
  updateFileStatus: (id: string, status: FileItem['status'], bytesCompressed?: number) => void;
}

export const useFileStore = create<FileState>((set, get) => ({
  files: [],
  totalBytes: 0,
  totalFiles: 0,
  isAnalyzing: false,

  addFiles: (newFiles: File[], relativePaths: Record<string, string> = {}) => {
    let batchBytes = 0;
    const currentLength = get().files.length;

    const newItems: FileItem[] = new Array(newFiles.length);
    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      batchBytes += file.size;

      const relPath =
        (file as any).webkitRelativePath ||
        relativePaths[file.name] ||
        file.name;

      const analysis = FileAnalyzer.analyzeFile(file, relPath);

      newItems[i] = {
        id: `f-${currentLength + i}`,
        file,
        relativePath: relPath,
        analysis,
        status: 'pending',
      };
    }

    const prevFiles = get().files;
    const combined = prevFiles.length === 0 ? newItems : prevFiles.concat(newItems);

    set({
      files: combined,
      totalBytes: get().totalBytes + batchBytes,
      totalFiles: combined.length,
      isAnalyzing: false,
    });
  },

  removeFile: (id: string) => {
    const prev = get().files;
    const target = prev.find((f) => f.id === id);
    if (!target) return;

    const filtered = prev.filter((f) => f.id !== id);
    set({
      files: filtered,
      totalBytes: Math.max(0, get().totalBytes - target.file.size),
      totalFiles: filtered.length,
    });
  },

  clearFiles: () => {
    set({
      files: [],
      totalBytes: 0,
      totalFiles: 0,
    });
  },

  updateFileStatus: (id: string, status: FileItem['status'], bytesCompressed?: number) => {
    set((state) => ({
      files: state.files.map((f) =>
        f.id === id ? { ...f, status, bytesCompressed } : f
      ),
    }));
  },
}));
