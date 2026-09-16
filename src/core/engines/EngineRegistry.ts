import { CompressionEngine, CompressionMode } from '../types/engine';
import { ZipEngine } from './ZipEngine';
import { SmartEngine } from './SmartEngine';

export interface EngineDescriptor {
  id: string;
  name: string;
  description: string;
  supportedModes: CompressionMode[];
  isAvailableInBrowser: boolean;
  statusText: string;
  create: () => CompressionEngine;
}

export class EngineRegistry {
  private static engines: Map<string, EngineDescriptor> = new Map();

  static {
    // Register Standard ZIP Engine
    this.register({
      id: 'zip-engine',
      name: 'Standard ZIP Engine',
      description: 'Universal multi-threaded Deflate & Store engine. 100% standard PKZip compatibility.',
      supportedModes: ['fast', 'balanced', 'maximum'],
      isAvailableInBrowser: true,
      statusText: 'Available (Web Workers)',
      create: () => new ZipEngine(),
    });

    // Register Smart Adaptive Engine
    this.register({
      id: 'smart-engine',
      name: 'Smart Engine',
      description: 'Entropy-aware classification: skips media/compressed files, deeply compresses text/data.',
      supportedModes: ['smart'],
      isAvailableInBrowser: true,
      statusText: 'Available (Web Workers + Heuristics)',
      create: () => new SmartEngine(),
    });

    // Roadmap descriptor: Zstandard Engine
    this.register({
      id: 'zstd-engine',
      name: 'Zstandard Engine (Roadmap)',
      description: 'Modern real-time compression algorithm developed by Meta for maximum decompression speed.',
      supportedModes: ['fast', 'balanced', 'maximum'],
      isAvailableInBrowser: false,
      statusText: 'WASM Ready (V3 Roadmap)',
      create: () => {
        throw new Error('Zstd WASM engine is scheduled for V3 release.');
      },
    });

    // Roadmap descriptor: 7-Zip LZMA2 Engine
    this.register({
      id: '7z-engine',
      name: '7-Zip / LZMA2 Engine (Roadmap)',
      description: 'Maximum compression ratio algorithm from Igor Pavlov’s 7-Zip SDK.',
      supportedModes: ['maximum'],
      isAvailableInBrowser: false,
      statusText: 'Native Bridge (V3 Roadmap)',
      create: () => {
        throw new Error('7z LZMA2 engine requires the HyperZip Native Desktop Bridge.');
      },
    });

    // Roadmap descriptor: HyperZip Native Engine
    this.register({
      id: 'native-engine',
      name: 'HyperZip Desktop Core (Roadmap)',
      description: 'High-throughput Rust/C++ multi-threaded native engine bypassing browser sandbox limits.',
      supportedModes: ['fast', 'balanced', 'maximum', 'smart'],
      isAvailableInBrowser: false,
      statusText: 'Desktop Mode (V3 Roadmap)',
      create: () => {
        throw new Error('HyperZip Desktop Engine requires the native app installation.');
      },
    });
  }

  public static register(descriptor: EngineDescriptor): void {
    this.engines.set(descriptor.id, descriptor);
  }

  public static get(id: string): EngineDescriptor | undefined {
    return this.engines.get(id);
  }

  public static getAll(): EngineDescriptor[] {
    return Array.from(this.engines.values());
  }

  public static getEngineForMode(mode: CompressionMode): CompressionEngine {
    if (mode === 'smart') {
      return new SmartEngine();
    }
    return new ZipEngine();
  }
}
