import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CompressionMode } from '../core/types/engine';

export interface HistoryRecord {
  id: string;
  timestamp: number;
  archiveName: string;
  fileCount: number;
  inputBytes: number;
  outputBytes: number;
  savedBytes: number;
  compressionRatio: number;
  durationSeconds: number;
  throughputMBps: number;
  mode: CompressionMode;
}

interface HistoryState {
  records: HistoryRecord[];
  addRecord: (record: Omit<HistoryRecord, 'id' | 'timestamp'>) => void;
  removeRecord: (id: string) => void;
  clearHistory: () => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      records: [],

      addRecord: (record) => {
        const newRecord: HistoryRecord = {
          ...record,
          id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          timestamp: Date.now(),
        };
        set((state) => ({
          records: [newRecord, ...state.records.slice(0, 49)], // Keep last 50
        }));
      },

      removeRecord: (id) => {
        set((state) => ({
          records: state.records.filter((r) => r.id !== id),
        }));
      },

      clearHistory: () => {
        set({ records: [] });
      },
    }),
    {
      name: 'hyperzip-history-v1',
    }
  )
);
