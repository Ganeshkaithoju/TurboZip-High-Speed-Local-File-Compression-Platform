# HyperZip — High-Speed Local File Compression Platform

> **Compress locally. Compress intelligently. Download instantly.**

HyperZip is a privacy-first, high-throughput file compression platform running directly in your browser. Users can select massive files or nested folder structures, intelligently analyze their contents, compress them locally using optimized multi-threaded compression strategies, monitor real-time performance telemetry, and stream/download the resulting PKZip archives.

---

## Key Principles

- **100% Local Processing**: Your files never leave your computer. The browser provides the UI orchestration, Web Workers do the heavy compression work, and OPFS provides fast temporary disk spooling.
- **Smart Adaptive Compression**: Eliminates wasted CPU cycles by detecting pre-compressed media formats (MP4, MKV, JPG, PNG, ZIP, etc.) and routing them to `STORE` (Level 0), while deeply compressing text, data, and source code with Deflate.
- **3D Interactive Visualization**: React Three Fiber / Three.js 3D Compression Core reacts dynamically to compression velocity, particle suction, and completed states. A dedicated Performance Mode / Reduced Motion toggle allows 2D lightweight fallback on low-power devices.
- **Hardware-Aware Worker Pool**: Dynamically queries `navigator.hardwareConcurrency` and reserves 1–2 CPU cores for the UI thread, ensuring stutter-free interaction even on 20GB+ workloads.
- **Zero-Copy Memory Transfers**: Chunks and compressed outputs are passed across worker boundaries as Transferable `ArrayBuffer` objects, eliminating memory duplication.

---

## Architectural Overview

```
                         HYPERZIP PLATFORM
                                 │
                ┌────────────────┴────────────────┐
                │                                 │
           2D Dashboard                    3D Layer (R3F)
                │                         Three.js Canvas
                │                                 │
                └────────────────┬────────────────┘
                                 │
                       Compression Manager
                                 │
                ┌────────────────┼────────────────┐
                ▼                ▼                ▼
          File Analyzer     Worker Pool        Storage
          & Entropy Check        │              (OPFS)
                                 │
                     ┌───────────┼───────────┐
                     ▼           ▼           ▼
                  Worker 1    Worker 2    Worker N
                     │           │           │
                     └───────────┼───────────┘
                                 ▼
                          Archive Writer
                        (PKZip Compliant)
                                 │
                                 ▼
                     Direct Download / Save As
```

---

## Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons
- **3D Layer**: Three.js, React Three Fiber, `@react-three/drei`
- **State Management**: Zustand (stores: `fileStore`, `compressionStore`, `performanceStore`, `settingsStore`, `historyStore`)
- **Worker & Compression Engine**: Native Web Workers, `fflate` streaming Deflate/Store, IEEE 802.3 CRC-32 table
- **Storage & File I/O**: File System Access API (`showSaveFilePicker`), Origin Private File System (`navigator.storage.getDirectory()`)

---

## Compression Modes

| Mode | Strategy | Compression Level | Ideal Use Case |
|---|---|---|---|
| **⚡ FAST** | Deflate | Level 1 | Maximum throughput, instant archiving with low CPU utilization |
| **⚖ BALANCED** | Deflate | Level 6 | Recommended balance between speed and archive compactness |
| **📦 MAXIMUM** | Deflate | Level 9 | Smallest possible archive footprint for bandwidth-constrained distribution |
| **🧠 SMART** | Adaptive Heuristics | Dynamic (0 or 6) | Automatically stores media/archives and compresses text/code/data |

---

## Getting Started

### Prerequisites
- Node.js 18+ or 22+
- Modern Web Browser (Chrome, Edge, Firefox, Brave, Safari)

### Installation & Local Run

```bash
# Clone the repository
git clone https://github.com/your-username/HyperZip.git
cd HyperZip

# Install dependencies
npm install --legacy-peer-deps

# Start Vite development server
npm run dev

# Build production bundle
npm run build
```

---

## Testing & Benchmarks

Navigate to the **Benchmark** tab in the application to run a live synthetic benchmark on your hardware. HyperZip generates structured compressible JSON and high-entropy binary buffers in-memory and benchmarks throughput (MB/s) and bit reduction on your CPU cores.

---

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) — Comprehensive technical design & roadmap
- [PERFORMANCE.md](./PERFORMANCE.md) — Multi-threading, memory optimization, and zero-copy buffers
- [SECURITY.md](./SECURITY.md) — Threat model and zero-upload guarantees
- [COMPRESSION.md](./COMPRESSION.md) — PKZip binary specification, Central Directory, and CRC-32
- [CONTRIBUTING.md](./CONTRIBUTING.md) — Developer guidelines and engine extension interfaces
# TurboZip
# TurboZip
