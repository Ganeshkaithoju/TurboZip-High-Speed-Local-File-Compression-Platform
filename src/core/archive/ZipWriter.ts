/**
 * High-Speed Streaming ZIP Archive Writer
 * Generates standards-compliant PKZip archives with UTF-8 filenames,
 * Deflate / Store compression methods, and full Central Directory records.
 */

export interface ZipEntryMeta {
  filename: string;
  uncompressedSize: number;
  compressedSize: number;
  crc32: number;
  compressionMethod: number; // 0 = Store, 8 = Deflate
  localHeaderOffset: number;
  lastModDate?: Date;
}

export class ZipWriter {
  private chunks: Uint8Array[] = [];
  private entries: ZipEntryMeta[] = [];
  private currentOffset = 0;
  private textEncoder = new TextEncoder();

  constructor() {}

  /**
   * Appends a completed file entry to the archive
   */
  public addEntry(
    filename: string,
    compressedData: Uint8Array,
    uncompressedSize: number,
    crc: number,
    method: 0 | 8 = 8,
    date: Date = new Date()
  ): ZipEntryMeta {
    // Sanitize filename to forward slashes (standard ZIP path syntax)
    const cleanPath = filename.replace(/\\/g, '/').replace(/^\/+/, '');
    const filenameBytes = this.textEncoder.encode(cleanPath);

    const dosTime = this.toDosDateTime(date);
    const localHeaderOffset = this.currentOffset;

    // 1. Build Local File Header (30 bytes + filename)
    const localHeader = new Uint8Array(30 + filenameBytes.length);
    const view = new DataView(localHeader.buffer);

    // Signature: 0x04034b50 ("PK\x03\x04")
    view.setUint32(0, 0x04034b50, true);
    // Version needed: 20 (2.0)
    view.setUint16(4, 20, true);
    // General purpose flag: 0x0800 (UTF-8 filename bit 11)
    view.setUint16(6, 0x0800, true);
    // Compression method: 0 (Store) or 8 (Deflate)
    view.setUint16(8, method, true);
    // Last mod time / date
    view.setUint16(10, dosTime.time, true);
    view.setUint16(12, dosTime.date, true);
    // CRC-32
    view.setUint32(14, crc >>> 0, true);
    // Compressed size
    view.setUint32(18, compressedData.byteLength >>> 0, true);
    // Uncompressed size
    view.setUint32(22, uncompressedSize >>> 0, true);
    // Filename length
    view.setUint16(26, filenameBytes.length, true);
    // Extra field length
    view.setUint16(28, 0, true);

    // Filename bytes
    localHeader.set(filenameBytes, 30);

    // Write Local Header and Compressed Data
    this.appendChunk(localHeader);
    this.appendChunk(compressedData);

    const meta: ZipEntryMeta = {
      filename: cleanPath,
      uncompressedSize,
      compressedSize: compressedData.byteLength,
      crc32: crc,
      compressionMethod: method,
      localHeaderOffset,
      lastModDate: date,
    };

    this.entries.push(meta);
    return meta;
  }

  /**
   * Finalizes the ZIP archive by writing the Central Directory and End of Central Directory (EOCD)
   * Returns the complete ZIP as a Blob.
   */
  public finalize(comment: string = 'Created with HyperZip'): Blob {
    const centralDirectoryStartOffset = this.currentOffset;
    let centralDirectorySize = 0;

    // 2. Build Central Directory headers
    for (const entry of this.entries) {
      const filenameBytes = this.textEncoder.encode(entry.filename);
      const dosTime = this.toDosDateTime(entry.lastModDate || new Date());

      // Central header size: 46 bytes + filename
      const cdHeader = new Uint8Array(46 + filenameBytes.length);
      const view = new DataView(cdHeader.buffer);

      // Signature: 0x02014b50 ("PK\x01\x02")
      view.setUint32(0, 0x02014b50, true);
      // Version made by: 20 (UNIX/DOS)
      view.setUint16(4, 20, true);
      // Version needed to extract: 20
      view.setUint16(6, 20, true);
      // General purpose bit flag: 0x0800 (UTF-8)
      view.setUint16(8, 0x0800, true);
      // Compression method
      view.setUint16(10, entry.compressionMethod, true);
      // Last mod time / date
      view.setUint16(12, dosTime.time, true);
      view.setUint16(14, dosTime.date, true);
      // CRC-32
      view.setUint32(16, entry.crc32 >>> 0, true);
      // Compressed size
      view.setUint32(20, entry.compressedSize >>> 0, true);
      // Uncompressed size
      view.setUint32(24, entry.uncompressedSize >>> 0, true);
      // Filename length
      view.setUint16(28, filenameBytes.length, true);
      // Extra field length
      view.setUint16(30, 0, true);
      // File comment length
      view.setUint16(32, 0, true);
      // Disk number start
      view.setUint16(34, 0, true);
      // Internal file attributes
      view.setUint16(36, 0, true);
      // External file attributes (regular file 0644)
      view.setUint32(38, 0x81a40000, true);
      // Relative offset of local header
      view.setUint32(42, entry.localHeaderOffset >>> 0, true);

      // Filename
      cdHeader.set(filenameBytes, 46);

      this.appendChunk(cdHeader);
      centralDirectorySize += cdHeader.byteLength;
    }

    // 3. End of Central Directory Record (EOCD: 22 bytes + comment)
    const commentBytes = this.textEncoder.encode(comment);
    const eocd = new Uint8Array(22 + commentBytes.length);
    const view = new DataView(eocd.buffer);

    // Signature: 0x06054b50 ("PK\x05\x06")
    view.setUint32(0, 0x06054b50, true);
    // Number of this disk: 0
    view.setUint16(4, 0, true);
    // Disk where central directory starts: 0
    view.setUint16(6, 0, true);
    // Number of central directory records on this disk
    view.setUint16(8, this.entries.length, true);
    // Total number of central directory records
    view.setUint16(10, this.entries.length, true);
    // Size of central directory
    view.setUint32(12, centralDirectorySize >>> 0, true);
    // Offset of start of central directory
    view.setUint32(16, centralDirectoryStartOffset >>> 0, true);
    // Comment length
    view.setUint16(20, commentBytes.length, true);

    if (commentBytes.length > 0) {
      eocd.set(commentBytes, 22);
    }

    this.appendChunk(eocd);

    // Convert accumulated chunks to final Blob
    return new Blob(this.chunks as unknown as BlobPart[], { type: 'application/zip' });
  }

  public getArchiveSize(): number {
    return this.currentOffset;
  }

  public getEntryCount(): number {
    return this.entries.length;
  }

  private appendChunk(chunk: Uint8Array): void {
    this.chunks.push(chunk);
    this.currentOffset += chunk.byteLength;
  }

  /**
   * Converts a JavaScript Date to MS-DOS date and time format
   */
  private toDosDateTime(date: Date): { date: number; time: number } {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = Math.floor(date.getSeconds() / 2);

    const dosDate = ((year - 1980) << 9) | (month << 5) | day;
    const dosTime = (hours << 11) | (minutes << 5) | seconds;

    return { date: dosDate, time: dosTime };
  }
}
