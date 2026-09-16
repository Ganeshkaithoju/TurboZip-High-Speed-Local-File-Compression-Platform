# HyperZip Performance Engineering Guide

## 1. Zero-Copy Memory Management

In standard browser code:
```javascript
worker.postMessage({ data: hugeArrayBuffer }); // CLONES entire buffer into worker
```
Cloning a 2GB file causes high garbage collection pressure and memory duplication. HyperZip utilizes **Transferable Objects**:
```javascript
worker.postMessage(task, [task.buffer]); // Transfers ownership instantly with 0ms copy overhead
```

---

## 2. Smart Entropy Analysis

Running Deflate on pre-compressed data (such as `.mp4`, `.zip`, `.gz`, or `.png`) consumes significant CPU cycles while yielding near 0% size reduction.

HyperZip evaluates Shannon entropy:
$$H(X) = -\sum_{i=1}^n P(x_i) \log_2 P(x_i)$$
- **Entropy > 7.3 bits/byte**: Classified as high-randomness/already-compressed. Routed to `STORE` (Level 0).
- **Entropy < 7.0 bits/byte**: Highly compressible. Routed to `COMPRESS` (Deflate Level 6 or 1).

---

## 3. UI Thread Protection & 3D Throttling

To guarantee 60 FPS UI responsiveness:
1. Progress events from workers are throttled before triggering Zustand re-renders.
2. The 3D scene decouples particle simulation from the compression pipeline.
3. A **Performance Mode** switch allows users to run in 2D mode, dedicating 100% of compute and GPU resources to compression.
