import {
  CompressionEngine,
  EngineConfig,
  CompressionProgress,
  CompressionResult,
  FileItem,
  CompressionMode,
} from '../types/engine';
import { WorkerPool } from '../workers/WorkerPool';

export abstract class BaseEngine implements CompressionEngine {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly supportedModes: CompressionMode[];

  protected config: EngineConfig = {
    mode: 'balanced',
    workerCount: 4,
    chunkSize: 64 * 1024 * 1024,
    useOpfs: true,
    smartAnalysis: true,
  };

  protected workerPool: WorkerPool | null = null;
  protected isPaused = false;
  protected isCancelled = false;
  protected currentProgress: CompressionProgress = {
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

  public async initialize(config: EngineConfig): Promise<void> {
    this.config = { ...this.config, ...config };
    if (this.workerPool) {
      this.workerPool.terminateAll();
    }
    this.workerPool = new WorkerPool(this.config.workerCount);
    this.isPaused = false;
    this.isCancelled = false;
  }

  public pause(): void {
    this.isPaused = true;
  }

  public resume(): void {
    this.isPaused = false;
  }

  public cancel(): void {
    this.isCancelled = true;
    if (this.workerPool) {
      this.workerPool.cancelPending();
    }
  }

  public getProgress(): CompressionProgress {
    return { ...this.currentProgress };
  }

  public async cleanup(): Promise<void> {
    if (this.workerPool) {
      this.workerPool.terminateAll();
      this.workerPool = null;
    }
  }

  abstract compress(
    files: FileItem[],
    onProgress: (progress: CompressionProgress) => void,
    signal?: AbortSignal
  ): Promise<CompressionResult>;

  protected calculateMetrics(
    bytesProcessed: number,
    totalBytes: number,
    compressedBytes: number,
    startTime: number,
    filesProcessed: number,
    totalFiles: number
  ): CompressionProgress {
    const elapsedSeconds = Math.max(0.1, (performance.now() - startTime) / 1000);
    const throughputMBps = Math.round((bytesProcessed / (1024 * 1024) / elapsedSeconds) * 10) / 10;
    const ratio = bytesProcessed > 0
      ? Math.round((1 - compressedBytes / bytesProcessed) * 1000) / 10
      : 0;
    
    const remainingBytes = Math.max(0, totalBytes - bytesProcessed);
    const speedBytesPerSec = bytesProcessed / elapsedSeconds;
    const estimatedRemainingSeconds = speedBytesPerSec > 0
      ? Math.round(remainingBytes / speedBytesPerSec)
      : 0;

    return {
      phase: 'compressing',
      filesProcessed,
      totalFiles,
      bytesProcessed,
      totalBytes,
      compressedBytes,
      ratio: Math.max(0, ratio),
      throughputMBps,
      elapsedSeconds: Math.round(elapsedSeconds * 10) / 10,
      estimatedRemainingSeconds,
      activeWorkers: this.workerPool ? this.workerPool.getActiveCount() : 0,
    };
  }
}
