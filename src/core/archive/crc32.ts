/**
 * Standard IEEE 802.3 CRC-32 Checksum Implementation
 * Precomputed 256-entry lookup table for high-speed computation.
 */

const CRC_TABLE = new Uint32Array(256);

for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  CRC_TABLE[i] = c >>> 0;
}

export function computeCrc32(data: Uint8Array, previousCrc = 0): number {
  let crc = (previousCrc ^ -1) >>> 0;
  for (let i = 0; i < data.length; i++) {
    crc = (CRC_TABLE[(crc ^ data[i]) & 0xff] ^ (crc >>> 8)) >>> 0;
  }
  return (crc ^ -1) >>> 0;
}
