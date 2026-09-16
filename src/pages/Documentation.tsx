import React from 'react';
import { BookOpen, ShieldCheck, Cpu, HardDrive, Layers, Terminal } from 'lucide-react';

export const Documentation: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-surface-border pb-6">
        <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase tracking-wider font-semibold">
          <BookOpen className="w-4 h-4" />
          <span>Technical Whitepaper & Architecture</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-1">
          HyperZip Platform Architecture
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          In-depth technical breakdown of browser-local streaming compression, multi-threading, and
          future native bridges.
        </p>
      </div>

      <div className="space-y-6 text-slate-300 text-xs leading-relaxed font-sans">
        {/* Section 1: The Core Philosophy */}
        <div className="p-6 rounded-2xl bg-surface border border-surface-border space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-100 font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>1. Local-First, Zero-Upload Philosophy</span>
          </div>
          <p>
            Standard cloud compression utilities force users to upload gigabytes of private data to a
            remote server, wait for server-side processing, and then download the archive back over
            the internet. This incurs severe network latency, bandwidth consumption, and privacy
            risks.
          </p>
          <p>
            <strong>HyperZip</strong> flips this paradigm: the browser provides an orchestration and
            visualization layer while local Web Workers and Origin Private File System (OPFS)
            execute the compression on the user's CPU. Data never leaves the client machine.
          </p>
        </div>

        {/* Section 2: Worker Architecture */}
        <div className="p-6 rounded-2xl bg-surface border border-surface-border space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-100 font-mono">
            <Cpu className="w-4 h-4 text-purple-400" />
            <span>2. Hardware-Aware Worker Pool Architecture</span>
          </div>
          <p>
            Modern workstations feature multiple physical and logical CPU cores. HyperZip queries{' '}
            <code className="px-1.5 py-0.5 rounded bg-surface-subtle font-mono text-slate-200">
              navigator.hardwareConcurrency
            </code>{' '}
            and dynamically instantiates an isolated pool of Web Workers.
          </p>
          <div className="p-4 rounded-xl bg-surface-subtle font-mono text-[11px] text-slate-300 border border-surface-border space-y-1">
            <div className="text-emerald-400 font-bold">// Parallel File Task Dispatch</div>
            <div>File 1 (text.json) ──► Worker 1 ──► Deflate Stream (Level 6)</div>
            <div>File 2 (video.mp4) ──► Worker 2 ──► Store Stream (Level 0)</div>
            <div>File 3 (code.ts)   ──► Worker 3 ──► Deflate Stream (Level 6)</div>
            <div>File 4 (data.csv)  ──► Worker 4 ──► Deflate Stream (Level 6)</div>
            <div className="text-slate-500 pt-1">
              ▼ Stream chunks feed into Streaming ZipWriter Central Directory
            </div>
          </div>
          <p>
            By transferring <code className="font-mono text-slate-200">ArrayBuffer</code> instances
            as transferable objects, HyperZip completely eliminates memory duplication penalties
            between workers and the main thread.
          </p>
        </div>

        {/* Section 3: Smart File Analysis */}
        <div className="p-6 rounded-2xl bg-surface border border-surface-border space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-100 font-mono">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>3. Smart Compression & Entropy Detection</span>
          </div>
          <p>
            Compressing already-compressed data (such as MP4 video, JPEG/PNG images, or ZIP archives)
            with Deflate is computationally wasteful, typically yielding zero size reduction while
            consuming 100% CPU.
          </p>
          <p>
            HyperZip’s <code className="font-mono text-slate-200">FileAnalyzer</code> scans
            extensions, MIME classifications, and performs Shannon entropy sampling on unknown
            files. If entropy exceeds 7.3 bits/byte or the format is pre-packed, it routes the entry
            to <strong>STORE</strong> mode (Level 0), saving massive CPU time while deeply compressing
            code, logs, and text.
          </p>
        </div>

        {/* Section 4: PKZip Binary Specification */}
        <div className="p-6 rounded-2xl bg-surface border border-surface-border space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-100 font-mono">
            <Terminal className="w-4 h-4 text-amber-400" />
            <span>4. Streaming ZIP Archive Writer</span>
          </div>
          <p>
            HyperZip’s archive engine outputs strict, specification-compliant PKZip archives. Every
            archive entry consists of a standard 30-byte Local File Header, UTF-8 encoded relative
            paths, Deflate compressed stream data, CRC-32 checksums, Central Directory headers, and
            an End of Central Directory (EOCD) record.
          </p>
          <p>
            The resulting archives can be opened natively by Windows Explorer, macOS Archive
            Utility, Linux unzip, and 7-Zip without third-party utilities.
          </p>
        </div>
      </div>
    </div>
  );
};
