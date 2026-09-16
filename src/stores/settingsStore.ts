import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CompressionMode } from '../core/types/engine';

interface SettingsState {
  defaultMode: CompressionMode;
  workerCount: number;
  maxHardwareWorkers: number;
  chunkSizeMB: number;
  useOpfs: boolean;
  performanceMode: boolean; // lowers or disables 3D effects for low-power devices
  show3DVisualization: boolean;
  soundEffects: boolean;
  theme: 'dark' | 'midnight';
  setDefaultMode: (mode: CompressionMode) => void;
  setWorkerCount: (count: number) => void;
  setChunkSizeMB: (size: number) => void;
  setUseOpfs: (enabled: boolean) => void;
  setPerformanceMode: (enabled: boolean) => void;
  setShow3DVisualization: (enabled: boolean) => void;
  setSoundEffects: (enabled: boolean) => void;
  setTheme: (theme: 'dark' | 'midnight') => void;
}

const hardwareConcurrency =
  typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4;
const defaultWorkers = Math.max(1, Math.min(hardwareConcurrency - 1, 8));

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      defaultMode: 'smart',
      workerCount: defaultWorkers,
      maxHardwareWorkers: hardwareConcurrency,
      chunkSizeMB: 64,
      useOpfs: true,
      performanceMode: false,
      show3DVisualization: true,
      soundEffects: false,
      theme: 'dark',

      setDefaultMode: (defaultMode) => set({ defaultMode }),
      setWorkerCount: (workerCount) => set({ workerCount }),
      setChunkSizeMB: (chunkSizeMB) => set({ chunkSizeMB }),
      setUseOpfs: (useOpfs) => set({ useOpfs }),
      setPerformanceMode: (performanceMode) => set({ performanceMode }),
      setShow3DVisualization: (show3DVisualization) => set({ show3DVisualization }),
      setSoundEffects: (soundEffects) => set({ soundEffects }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'hyperzip-settings-v1',
    }
  )
);
