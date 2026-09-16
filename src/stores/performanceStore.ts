import { create } from 'zustand';
import { CompressionProgress } from '../core/types/engine';

export interface WorkerActivity {
  id: number;
  busy: boolean;
  filename?: string;
}

export interface SpeedDataPoint {
  time: string;
  mbps: number;
}

interface PerformanceState {
  progress: CompressionProgress;
  workerStates: WorkerActivity[];
  speedHistory: SpeedDataPoint[];
  lastUpdateTimestamp: number;
  updateProgress: (progress: CompressionProgress) => void;
  updateWorkerActivity: (workerId: number, busy: boolean, filename?: string) => void;
  resetPerformance: (totalFiles?: number, totalBytes?: number) => void;
}

const initialProgress: CompressionProgress = {
  phase: 'analyzing',
  filesProcessed: 0,
  totalFiles: 0,
  bytesProcessed: 0,
  totalBytes: 0,
  compressedBytes: 0,
  ratio: 0,
  throughputMBps: 0,
  elapsedSeconds: 0,
  estimatedRemainingSeconds: 0,
  activeWorkers: 0,
};

export const usePerformanceStore = create<PerformanceState>((set, get) => ({
  progress: initialProgress,
  workerStates: [],
  speedHistory: [],
  lastUpdateTimestamp: 0,

  updateProgress: (progress: CompressionProgress) => {
    const now = Date.now();
    // Throttle speed graph updates to once every 600ms to avoid UI thrashing
    if (now - get().lastUpdateTimestamp > 600) {
      const timeStr = new Date().toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' });
      const currentPoints = get().speedHistory;
      const updatedPoints = [
        ...currentPoints.slice(-14),
        { time: timeStr, mbps: progress.throughputMBps }
      ];

      set({
        progress,
        speedHistory: updatedPoints,
        lastUpdateTimestamp: now,
      });
    } else {
      set({ progress });
    }
  },

  updateWorkerActivity: (workerId: number, busy: boolean, filename?: string) => {
    set((state) => {
      const existing = [...state.workerStates];
      const idx = existing.findIndex((w) => w.id === workerId);
      if (idx !== -1) {
        existing[idx] = { id: workerId, busy, filename };
      } else {
        existing.push({ id: workerId, busy, filename });
      }
      return { workerStates: existing };
    });
  },

  resetPerformance: (totalFiles: number = 0, totalBytes: number = 0) => {
    set({
      progress: {
        ...initialProgress,
        totalFiles,
        totalBytes,
      },
      speedHistory: [],
      workerStates: [],
      lastUpdateTimestamp: 0,
    });
  },
}));
