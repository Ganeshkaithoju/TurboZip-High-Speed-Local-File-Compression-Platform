/**
 * HyperZip Core Engine Types & Contracts
 */

export type CompressionMode = 'fast' | 'balanced' | 'maximum' | 'smart';

export type FileCategory =
  | 'text'
  | 'code'
  | 'data'
  | 'media'
  | 'archive'
  | 'document'
  | 'binary'
  | 'unknown';

export type CompressionStrategy = 'compress' | 'store' | 'sample';

export interface FileAnalysis {
  name: string;
  path: string;
  extension: string;
  mimeType: string;
  size: number;
  category: FileCategory;
  recommendedStrategy: CompressionStrategy;
  entropy?: number;
  isAlreadyCompressed: boolean;
  compressionLevelHint?: number;
}

export interface FileItem {
  id: string;
  file: File;
  relativePath: string;
  analysis: FileAnalysis;
  status: 'pending' | 'analyzing' | 'compressing' | 'completed' | 'error';
  bytesCompressed?: number;
  compressedSize?: number;
  error?: string;
}

export interface EngineConfig {
  mode: CompressionMode;
  level?: number; // 0 (store) to 9 (max)
  workerCount: number;
  chunkSize: number; // e.g. 64MB or 128MB
  useOpfs: boolean;
  password?: string;
  smartAnalysis: boolean;
}

export interface CompressionProgress {
  phase: 'analyzing' | 'compressing' | 'finalizing' | 'completed' | 'cancelled' | 'error';
  currentFile?: string;
  filesProcessed: number;
  totalFiles: number;
  bytesProcessed: number;
  totalBytes: number;
  compressedBytes: number;
  ratio: number; // e.g. 42.5 (%)
  throughputMBps: number;
  elapsedSeconds: number;
  estimatedRemainingSeconds: number;
  activeWorkers: number;
}

export interface CompressionResult {
  success: boolean;
  archiveBlob?: Blob;
  archiveFileHandle?: FileSystemFileHandle;
  totalInputBytes: number;
  totalOutputBytes: number;
  bytesSaved: number;
  compressionRatio: number; // %
  durationSeconds: number;
  throughputMBps: number;
  fileCount: number;
  archiveName: string;
  error?: string;
}

export interface WorkerTask {
  taskId: string;
  fileId: string;
  filename: string;
  strategy: CompressionStrategy;
  level: number;
  chunkIndex: number;
  isLastChunk: boolean;
  buffer: ArrayBuffer;
}

export interface WorkerResponse {
  taskId: string;
  fileId: string;
  chunkIndex: number;
  isLastChunk: boolean;
  success: boolean;
  compressedBuffer?: ArrayBuffer;
  crc32: number;
  uncompressedLength: number;
  compressedLength: number;
  error?: string;
}

export interface CompressionEngine {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly supportedModes: CompressionMode[];

  initialize(config: EngineConfig): Promise<void>;
  compress(
    files: FileItem[],
    onProgress: (progress: CompressionProgress) => void,
    signal?: AbortSignal
  ): Promise<CompressionResult>;
  pause(): void;
  resume(): void;
  cancel(): void;
  getProgress(): CompressionProgress;
  cleanup(): Promise<void>;
}

/**
 * Extensibility contracts for future engines
 */
export interface ZstdEngine extends CompressionEngine {
  setZstdLevel(level: number): void;
}

export interface SevenZipEngine extends CompressionEngine {
  setDictionarySize(sizeMB: number): void;
  setThreads(threads: number): void;
}

export interface NativeEngine extends CompressionEngine {
  connectDesktopBridge(port: number): Promise<boolean>;
  getNativeCoreVersion(): Promise<string>;
}
