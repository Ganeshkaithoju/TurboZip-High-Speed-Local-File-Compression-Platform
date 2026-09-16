import { BaseEngine } from './BaseEngine';
import {
  CompressionMode,
  CompressionProgress,
  CompressionResult,
  FileItem,
  WorkerTask,
} from '../types/engine';
import { ZipWriter } from '../archive/ZipWriter';
import { FileAnalyzer } from '../analyzers/FileAnalyzer';
import { getSuggestedArchiveName } from '../utils/archiveNameUtils';

export class SmartEngine extends BaseEngine {
  readonly id = 'smart-engine';
  readonly name = 'Smart Adaptive Engine';
  readonly description = 'Heuristic file classification: skips re-compressing media/archives, deep-compresses text/data.';
  readonly supportedModes: CompressionMode[] = ['smart'];

  public async compress(
    files: FileItem[],
    onProgress: (progress: CompressionProgress) => void,
    signal?: AbortSignal
  ): Promise<CompressionResult> {
    const startTime = performance.now();
    const totalBytes = files.reduce((acc, f) => acc + f.file.size, 0);
    const totalFiles = files.length;
    let bytesProcessed = 0;
    let totalCompressedBytes = 0;
    let filesProcessed = 0;

    const zipWriter = new ZipWriter();

    this.currentProgress = {
      phase: 'compressing',
      filesProcessed: 0,
      totalFiles,
      bytesProcessed: 0,
      totalBytes,
      compressedBytes: 0,
      ratio: 0,
      throughputMBps: 0,
      elapsedSeconds: 0,
      estimatedRemainingSeconds: 0,
      activeWorkers: 0,
    };
    onProgress(this.currentProgress);

    if (!this.workerPool) {
      throw new Error('Worker pool not initialized');
    }

    // Determine concurrency window: keep all workers busy with backpressure
    const concurrency = Math.max(2, this.workerPool.getWorkerCount() * 2);
    let nextFileIndex = 0;
    let lastProgressTime = 0;

    const emitProgressThrottled = (force = false) => {
      const now = performance.now();
      if (force || now - lastProgressTime > 120) {
        lastProgressTime = now;
        this.currentProgress = this.calculateMetrics(
          bytesProcessed,
          totalBytes,
          totalCompressedBytes,
          startTime,
          filesProcessed,
          totalFiles
        );
        onProgress(this.currentProgress);
      }
    };

    // Worker pipeline task executor for an individual file
    const processSingleFile = async (item: FileItem): Promise<void> => {
      if (this.isCancelled || signal?.aborted) return;

      while (this.isPaused) {
        await new Promise((r) => setTimeout(r, 100));
        if (this.isCancelled || signal?.aborted) return;
      }

      const file = item.file;
      const fileSize = file.size;
      let strategy = item.analysis.recommendedStrategy;

      // Quick entropy sample check for unknown files > 64KB
      if (strategy === 'sample') {
        const entropy = await FileAnalyzer.sampleEntropy(file);
        strategy = entropy > 7.3 ? 'store' : 'compress';
      }

      const level = strategy === 'store' ? 0 : 6;
      const buffer = await file.arrayBuffer();

      const task: WorkerTask = {
        taskId: `task-${item.id}`,
        fileId: item.id,
        filename: item.relativePath,
        strategy,
        level,
        chunkIndex: 0,
        isLastChunk: true,
        buffer,
      };

      const response = await this.workerPool!.execute(task, [buffer]);

      if (!response.success || !response.compressedBuffer) {
        throw new Error(response.error || `Failed to process ${item.relativePath}`);
      }

      const compressedData = new Uint8Array(response.compressedBuffer);
      const method = level === 0 ? 0 : 8;

      zipWriter.addEntry(
        item.relativePath,
        compressedData,
        response.uncompressedLength,
        response.crc32,
        method,
        new Date(file.lastModified || Date.now())
      );

      bytesProcessed += fileSize;
      totalCompressedBytes += response.compressedLength;
      filesProcessed++;

      this.currentProgress.currentFile = item.relativePath;
      emitProgressThrottled();
    };

    // Parallel worker sliding window
    const activePromises: Promise<void>[] = [];

    while (nextFileIndex < totalFiles || activePromises.length > 0) {
      if (this.isCancelled || signal?.aborted) {
        throw new Error('Compression cancelled by user');
      }

      // Fill pipeline up to concurrency limit
      while (activePromises.length < concurrency && nextFileIndex < totalFiles) {
        const fileToProcess = files[nextFileIndex++];
        const promise = processSingleFile(fileToProcess).finally(() => {
          const idx = activePromises.indexOf(promise);
          if (idx !== -1) activePromises.splice(idx, 1);
        });
        activePromises.push(promise);
      }

      // Wait for at least one worker in the window to finish
      if (activePromises.length > 0) {
        await Promise.race(activePromises);
      }
    }

    emitProgressThrottled(true);

    this.currentProgress.phase = 'finalizing';
    onProgress(this.currentProgress);

    const archiveBlob = zipWriter.finalize();
    const durationSeconds = Math.max(0.1, (performance.now() - startTime) / 1000);
    const throughputMBps = Math.round((totalBytes / (1024 * 1024) / durationSeconds) * 10) / 10;
    const bytesSaved = Math.max(0, totalBytes - archiveBlob.size);
    const compressionRatio = totalBytes > 0
      ? Math.round((bytesSaved / totalBytes) * 1000) / 10
      : 0;

    this.currentProgress.phase = 'completed';
    onProgress(this.currentProgress);

    return {
      success: true,
      archiveBlob,
      totalInputBytes: totalBytes,
      totalOutputBytes: archiveBlob.size,
      bytesSaved,
      compressionRatio,
      durationSeconds: Math.round(durationSeconds * 10) / 10,
      throughputMBps,
      fileCount: totalFiles,
      archiveName: getSuggestedArchiveName(files),
    };
  }
}
