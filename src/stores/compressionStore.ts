import { create } from 'zustand';
import {
  CompressionEngine,
  CompressionMode,
  CompressionResult,
} from '../core/types/engine';
import { EngineRegistry } from '../core/engines/EngineRegistry';
import { useFileStore } from './fileStore';
import { usePerformanceStore } from './performanceStore';
import { useSettingsStore } from './settingsStore';
import { useHistoryStore } from './historyStore';
import confetti from 'canvas-confetti';

export type CompressionStatus =
  | 'idle'
  | 'preparing'
  | 'compressing'
  | 'paused'
  | 'completed'
  | 'cancelled'
  | 'error';

// Retain all downloaded Blobs in memory so Chromium's background download manager
// can finish flushing large archives to disk without the stream being severed or garbage collected!
const retainedBlobsRegistry = new Set<Blob>();
const retainedBlobUrls = new Set<string>();

interface CompressionState {
  status: CompressionStatus;
  selectedMode: CompressionMode;
  currentEngine: CompressionEngine | null;
  result: CompressionResult | null;
  errorMessage: string | null;
  abortController: AbortController | null;

  setMode: (mode: CompressionMode) => void;
  setArchiveName: (name: string) => void;
  startCompression: () => Promise<void>;
  pauseCompression: () => void;
  resumeCompression: () => void;
  cancelCompression: () => void;
  resetCompression: () => void;
  downloadArchive: () => Promise<void>;
  saveArchiveAs: () => Promise<void>;
}

export const useCompressionStore = create<CompressionState>((set, get) => ({
  status: 'idle',
  selectedMode: 'smart',
  currentEngine: null,
  result: null,
  errorMessage: null,
  abortController: null,

  setMode: (selectedMode: CompressionMode) => {
    set({ selectedMode });
  },

  setArchiveName: (name: string) => {
    const { result } = get();
    if (!result) return;
    const cleanName = name.endsWith('.zip') ? name : `${name}.zip`;
    set({
      result: {
        ...result,
        archiveName: cleanName,
      },
    });
  },

  startCompression: async () => {
    const { files } = useFileStore.getState();
    if (files.length === 0) return;

    const { selectedMode } = get();
    const settings = useSettingsStore.getState();
    const performanceStore = usePerformanceStore.getState();

    // Reset performance tracking
    performanceStore.resetPerformance(files.length, files.reduce((acc, f) => acc + f.file.size, 0));

    const engine = EngineRegistry.getEngineForMode(selectedMode);
    const abortController = new AbortController();

    set({
      status: 'compressing',
      currentEngine: engine,
      result: null,
      errorMessage: null,
      abortController,
    });

    try {
      await engine.initialize({
        mode: selectedMode,
        workerCount: settings.workerCount,
        chunkSize: settings.chunkSizeMB * 1024 * 1024,
        useOpfs: settings.useOpfs,
        smartAnalysis: selectedMode === 'smart',
      });

      const result = await engine.compress(
        files,
        (progress) => {
          usePerformanceStore.getState().updateProgress(progress);
        },
        abortController.signal
      );

      // Trigger celebratory confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#34d399', '#38bdf8', '#818cf8'],
        });
      } catch {
        // Safe fallback if confetti isn't rendered
      }

      // Record in local history
      useHistoryStore.getState().addRecord({
        archiveName: result.archiveName,
        fileCount: result.fileCount,
        inputBytes: result.totalInputBytes,
        outputBytes: result.totalOutputBytes,
        savedBytes: result.bytesSaved,
        compressionRatio: result.compressionRatio,
        durationSeconds: result.durationSeconds,
        throughputMBps: result.throughputMBps,
        mode: selectedMode,
      });

      set({
        status: 'completed',
        result,
      });
    } catch (err: any) {
      if (abortController.signal.aborted || err.message?.includes('cancelled')) {
        set({ status: 'cancelled', errorMessage: 'Compression was cancelled.' });
      } else {
        set({ status: 'error', errorMessage: err?.message || 'Compression failed' });
      }
    }
  },

  pauseCompression: () => {
    const { currentEngine, status } = get();
    if (currentEngine && status === 'compressing') {
      currentEngine.pause();
      set({ status: 'paused' });
    }
  },

  resumeCompression: () => {
    const { currentEngine, status } = get();
    if (currentEngine && status === 'paused') {
      currentEngine.resume();
      set({ status: 'compressing' });
    }
  },

  cancelCompression: () => {
    const { currentEngine, abortController } = get();
    if (abortController) {
      abortController.abort();
    }
    if (currentEngine) {
      currentEngine.cancel();
    }
    set({ status: 'cancelled' });
  },

  resetCompression: () => {
    const { currentEngine, result } = get();
    // Preserve the current archiveBlob in our persistent registry before resetting state
    // so Chrome can continue reading and saving it without the browser marking it "Deleted"
    if (result?.archiveBlob) {
      retainedBlobsRegistry.add(result.archiveBlob);
    }
    if (currentEngine) {
      currentEngine.cleanup();
    }
    set({
      status: 'idle',
      currentEngine: null,
      result: null,
      errorMessage: null,
      abortController: null,
    });
  },

  downloadArchive: async () => {
    const { result } = get();
    if (!result || !result.archiveBlob) return;

    // Pin the blob in memory so it cannot be garbage collected while downloading
    retainedBlobsRegistry.add(result.archiveBlob);

    const blobUrl = URL.createObjectURL(result.archiveBlob);
    retainedBlobUrls.add(blobUrl);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = result.archiveName || 'HyperZip_Archive.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Keep the URL alive across compression cycles. Clean up only when page unloads
    // or keep an LRU of at most 10 active blob URLs
    if (retainedBlobUrls.size > 15) {
      const oldestUrl = retainedBlobUrls.values().next().value;
      if (oldestUrl) {
        retainedBlobUrls.delete(oldestUrl);
        try {
          URL.revokeObjectURL(oldestUrl);
        } catch {}
      }
    }
  },

  saveArchiveAs: async () => {
    const { result } = get();
    if (!result || !result.archiveBlob) return;

    // Pin the blob in memory
    retainedBlobsRegistry.add(result.archiveBlob);

    // Use File System Access API if supported for direct atomic stream write to destination file
    if ('showSaveFilePicker' in window) {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: result.archiveName || 'HyperZip_Archive.zip',
          types: [
            {
              description: 'ZIP Archive',
              accept: { 'application/zip': ['.zip'] },
            },
          ],
        });
        const writable = await handle.createWritable();
        await writable.write(result.archiveBlob);
        await writable.close();
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        console.warn('File System Access API failed, falling back to download:', err);
      }
    }

    // Fallback
    await get().downloadArchive();
  },
}));
