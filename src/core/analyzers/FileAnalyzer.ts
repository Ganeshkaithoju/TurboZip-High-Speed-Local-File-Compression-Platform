import { FileAnalysis, FileCategory, CompressionStrategy } from '../types/engine';

export class FileAnalyzer {
  // Common pre-compressed extensions
  private static readonly PRECOMPRESSED_EXTENSIONS = new Set([
    // Archives
    'zip', '7z', 'rar', 'tar', 'gz', 'tgz', 'bz2', 'tbz2', 'xz', 'txz', 'zst', 'br',
    'cab', 'iso', 'dmg', 'pkg', 'deb', 'rpm', 'apk', 'jar',
    // Video
    'mp4', 'mkv', 'avi', 'mov', 'wmv', 'flv', 'webm', 'm4v', '3gp', 'ts',
    // Audio
    'mp3', 'aac', 'ogg', 'opus', 'flac', 'm4a', 'wma',
    // Images
    'jpg', 'jpeg', 'png', 'webp', 'avif', 'gif', 'heic', 'ico', 'tiff',
    // Compressed Office OpenXML (ZIP packages)
    'docx', 'xlsx', 'pptx', 'odt', 'ods', 'odp',
    // Binary packages
    'pdf', 'crx', 'woff', 'woff2'
  ]);

  private static readonly TEXT_EXTENSIONS = new Set([
    'txt', 'log', 'md', 'markdown', 'rtf', 'tex', 'ascii',
    'csv', 'tsv', 'json', 'xml', 'yaml', 'yml', 'toml', 'ini', 'cfg', 'conf', 'env',
    'html', 'htm', 'xhtml', 'css', 'scss', 'sass', 'less',
    'js', 'jsx', 'ts', 'tsx', 'mjs', 'cjs',
    'py', 'rb', 'php', 'java', 'c', 'cpp', 'h', 'hpp', 'cs', 'go', 'rs', 'swift', 'kt', 'kts',
    'sql', 'graphql', 'gql', 'proto', 'sh', 'bash', 'zsh', 'ps1', 'bat', 'cmd',
    'svg', 'wasm'
  ]);

  /**
   * Fast synchronous heuristic analysis based on filename, extension, and size
   */
  public static analyzeFile(file: File, relativePath?: string): FileAnalysis {
    const name = file.name;
    const path = relativePath || file.name;
    const extension = this.extractExtension(name);
    const mimeType = file.type || this.guessMimeType(extension);
    const size = file.size;

    const isAlreadyCompressed = this.PRECOMPRESSED_EXTENSIONS.has(extension);
    const category = this.categorize(extension, mimeType);

    let recommendedStrategy: CompressionStrategy = 'compress';

    if (isAlreadyCompressed) {
      recommendedStrategy = 'store';
    } else if (category === 'text' || category === 'code' || category === 'data') {
      recommendedStrategy = 'compress';
    } else if (size < 1024) {
      // Tiny files: Store or low compression is faster
      recommendedStrategy = 'store';
    } else if (category === 'unknown' && size > 64 * 1024) {
      recommendedStrategy = 'sample';
    }

    return {
      name,
      path,
      extension,
      mimeType,
      size,
      category,
      recommendedStrategy,
      isAlreadyCompressed,
    };
  }

  /**
   * Sample entropy check for unknown or large files
   * Calculates Shannon entropy (0 to 8 bits per byte).
   * Entropy > 7.4 indicates high randomness / pre-compression.
   */
  public static async sampleEntropy(file: File, sampleSize: number = 32768): Promise<number> {
    try {
      const slice = file.slice(0, Math.min(file.size, sampleSize));
      const buffer = new Uint8Array(await slice.arrayBuffer());
      if (buffer.length === 0) return 0;

      const counts = new Uint32Array(256);
      for (let i = 0; i < buffer.length; i++) {
        counts[buffer[i]]++;
      }

      let entropy = 0;
      const total = buffer.length;
      for (let i = 0; i < 256; i++) {
        if (counts[i] > 0) {
          const p = counts[i] / total;
          entropy -= p * Math.log2(p);
        }
      }

      return Math.round(entropy * 100) / 100;
    } catch {
      return 6.0; // Safe fallback
    }
  }

  private static extractExtension(filename: string): string {
    const idx = filename.lastIndexOf('.');
    return idx !== -1 ? filename.slice(idx + 1).toLowerCase() : '';
  }

  private static categorize(ext: string, mime: string): FileCategory {
    if (this.TEXT_EXTENSIONS.has(ext) || mime.startsWith('text/')) {
      if (['json', 'xml', 'csv', 'tsv', 'yaml', 'yml', 'sql'].includes(ext)) {
        return 'data';
      }
      if (['js', 'ts', 'jsx', 'tsx', 'py', 'c', 'cpp', 'rs', 'go', 'java', 'html', 'css'].includes(ext)) {
        return 'code';
      }
      return 'text';
    }

    if (['mp4', 'mkv', 'avi', 'mov', 'webm', 'mp3', 'flac', 'wav', 'jpg', 'jpeg', 'png', 'webp', 'avif', 'gif'].includes(ext) ||
        mime.startsWith('video/') || mime.startsWith('audio/') || mime.startsWith('image/')) {
      return 'media';
    }

    if (['zip', '7z', 'rar', 'tar', 'gz', 'bz2', 'xz', 'apk', 'iso'].includes(ext)) {
      return 'archive';
    }

    if (['pdf', 'docx', 'xlsx', 'pptx', 'odt', 'ods', 'rtf'].includes(ext) || mime.includes('document') || mime.includes('pdf')) {
      return 'document';
    }

    if (['exe', 'dll', 'so', 'dylib', 'bin', 'dat', 'iso'].includes(ext)) {
      return 'binary';
    }

    return 'unknown';
  }

  private static guessMimeType(ext: string): string {
    const map: Record<string, string> = {
      txt: 'text/plain',
      json: 'application/json',
      csv: 'text/csv',
      html: 'text/html',
      css: 'text/css',
      js: 'application/javascript',
      ts: 'application/typescript',
      mp4: 'video/mp4',
      mp3: 'audio/mpeg',
      jpg: 'image/jpeg',
      png: 'image/png',
      zip: 'application/zip',
      pdf: 'application/pdf',
    };
    return map[ext] || 'application/octet-stream';
  }
}
