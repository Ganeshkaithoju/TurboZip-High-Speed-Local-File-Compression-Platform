/**
 * Origin Private File System (OPFS) Storage Manager
 * Provides fast local temporary storage for large archives without saturating browser JS heap.
 */

export interface StorageQuotaInfo {
  supported: boolean;
  usageBytes: number;
  quotaBytes: number;
  availableBytes: number;
}

export class OpfsStorage {
  private static TEMP_DIR_NAME = 'hyperzip_temp';

  public static isSupported(): boolean {
    return (
      typeof navigator !== 'undefined' &&
      !!navigator.storage &&
      typeof navigator.storage.getDirectory === 'function'
    );
  }

  public static async getQuota(): Promise<StorageQuotaInfo> {
    if (!this.isSupported()) {
      return { supported: false, usageBytes: 0, quotaBytes: 0, availableBytes: 0 };
    }

    try {
      const estimate = await navigator.storage.estimate();
      const usage = estimate.usage || 0;
      const quota = estimate.quota || 0;
      return {
        supported: true,
        usageBytes: usage,
        quotaBytes: quota,
        availableBytes: Math.max(0, quota - usage),
      };
    } catch {
      return { supported: false, usageBytes: 0, quotaBytes: 0, availableBytes: 0 };
    }
  }

  public static async getTempDirectory(): Promise<FileSystemDirectoryHandle | null> {
    if (!this.isSupported()) return null;

    try {
      const root = await navigator.storage.getDirectory();
      return await root.getDirectoryHandle(this.TEMP_DIR_NAME, { create: true });
    } catch (e) {
      console.warn('Unable to access OPFS temp directory:', e);
      return null;
    }
  }

  public static async createTempFile(filename: string): Promise<FileSystemFileHandle | null> {
    const tempDir = await this.getTempDirectory();
    if (!tempDir) return null;

    try {
      return await tempDir.getFileHandle(filename, { create: true });
    } catch (e) {
      console.warn('Failed to create OPFS temp file:', e);
      return null;
    }
  }

  public static async cleanupTempFiles(): Promise<void> {
    if (!this.isSupported()) return;

    try {
      const root = await navigator.storage.getDirectory();
      await root.removeEntry(this.TEMP_DIR_NAME, { recursive: true });
    } catch {
      // Ignore if directory doesn't exist
    }
  }
}
