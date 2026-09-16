import { deflateSync } from 'fflate';
import { WorkerTask, WorkerResponse } from '../types/engine';
import { computeCrc32 } from '../archive/crc32';

interface DedicatedWorkerScope {
  postMessage(message: any, transfer?: Transferable[]): void;
  onmessage: ((event: MessageEvent<WorkerTask>) => void) | null;
}

const workerScope = self as unknown as DedicatedWorkerScope;

workerScope.onmessage = (event: MessageEvent<WorkerTask>) => {
  const task = event.data;

  try {
    const rawData = new Uint8Array(task.buffer);
    const uncompressedLength = rawData.byteLength;
    const computedCrc = computeCrc32(rawData);

    let outputData: Uint8Array;

    if (task.strategy === 'store' || task.level === 0) {
      // Store: zero-compression copy
      outputData = rawData;
    } else {
      // Deflate with requested level (1 = fast, 6 = balanced, 9 = max)
      const validLevel = (task.level ?? 6) as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
      outputData = deflateSync(rawData, { level: validLevel });
    }

    const compressedLength = outputData.byteLength;
    const response: WorkerResponse = {
      taskId: task.taskId,
      fileId: task.fileId,
      chunkIndex: task.chunkIndex,
      isLastChunk: task.isLastChunk,
      success: true,
      compressedBuffer: outputData.buffer as ArrayBuffer,
      crc32: computedCrc,
      uncompressedLength,
      compressedLength,
    };

    // Transfer the ArrayBuffer back to main thread (zero-copy)
    workerScope.postMessage(response, [outputData.buffer as ArrayBuffer]);
  } catch (err: any) {
    const errorResponse: WorkerResponse = {
      taskId: task.taskId,
      fileId: task.fileId,
      chunkIndex: task.chunkIndex,
      isLastChunk: task.isLastChunk,
      success: false,
      crc32: 0,
      uncompressedLength: 0,
      compressedLength: 0,
      error: err?.message || 'Compression worker error',
    };
    workerScope.postMessage(errorResponse);
  }
};
