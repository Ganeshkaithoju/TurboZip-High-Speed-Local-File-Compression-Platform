# HyperZip Architecture & Engineering Design

This document details the internal architecture, thread scheduling, memory management, and file storage strategies used in HyperZip.

---

## 1. Core Principles & Philosophy

Traditional web archivers follow an inefficient paradigm:
```
User ──► Upload (GBs) ──► Cloud Server ──► Compress ──► Download (GBs)
```
HyperZip replaces this with client-side execution:
```
User Files ──► File System API ──► Web Workers ──► OPFS Temp Spool ──► Local Disk
```

User data remains strictly in local memory and private origin storage. The web server only serves static JS/CSS assets and zero user bytes.

---

## 2. Pluggable Compression Engine Abstraction

HyperZip abstracts compression algorithms through the `CompressionEngine` contract:

```typescript
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
```

### Registered Engines:
1. **`ZipEngine`**: Multi-threaded Deflate & Store engine generating standard PKZip archives.
2. **`SmartEngine`**: Adaptive engine pairing `FileAnalyzer` heuristics with dynamic worker dispatch.
3. **`ZstdEngine` (Roadmap)**: WebAssembly Zstandard real-time streaming engine.
4. **`SevenZipEngine` (Roadmap)**: LZMA2 maximum-compression engine.
5. **`NativeEngine` (Roadmap)**: Tauri/Rust desktop bridge for native C++ multi-core throughput.

---

## 3. Worker Pool & Concurrency Management

HyperZip manages CPU workers via `WorkerPool`:
- Queries `navigator.hardwareConcurrency`.
- By default, reserves 1–2 cores for browser main-thread UI/rendering.
- Implements a dynamic task queue with task cancellation and timeout protection.
- Transfers `ArrayBuffer` instances using Transferable objects so buffers are moved rather than cloned.

---

## 4. Origin Private File System (OPFS) & Output Streaming

For large datasets (10GB+), storing the final archive in browser JavaScript heap memory can cause tab crashes. HyperZip incorporates OPFS:
- Queries `navigator.storage.getDirectory()`.
- Spools archive chunks into an application-private temporary directory (`hyperzip_temp`).
- Cleans up temporary handles on completion or cancellation.
- Offers direct saving via the File System Access API (`window.showSaveFilePicker`).
