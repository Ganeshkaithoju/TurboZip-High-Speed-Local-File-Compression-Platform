import { FileItem } from '../types/engine';

/**
 * Derives an intelligent, collision-free archive name based on the selected files or folder.
 */
export function getSuggestedArchiveName(files: FileItem[]): string {
  if (files.length === 0) {
    const timestamp = getCompactTimestamp();
    return `HyperZip_Archive_${timestamp}.zip`;
  }

  // Case 1: Single file
  if (files.length === 1) {
    const baseName = files[0].file.name.replace(/\.[^/.]+$/, '');
    return sanitizeFilename(`${baseName}.zip`);
  }

  // Case 2: Folder upload (all or majority of files share a common root directory)
  const firstPath = files[0].relativePath.replace(/\\/g, '/');
  const slashIdx = firstPath.indexOf('/');

  if (slashIdx > 0) {
    const potentialRoot = firstPath.substring(0, slashIdx);
    // Check if the first 50 files also share this root folder
    const sample = files.slice(0, 50);
    const sharesRoot = sample.every((f) => {
      const norm = f.relativePath.replace(/\\/g, '/');
      return norm.startsWith(potentialRoot + '/') || norm === potentialRoot;
    });

    if (sharesRoot && potentialRoot.trim().length > 0) {
      return sanitizeFilename(`${potentialRoot}.zip`);
    }
  }

  // Case 3: Multiple loose files without common root -> Use timestamped unique name
  const timestamp = getCompactTimestamp();
  return `HyperZip_Archive_${timestamp}.zip`;
}

function getCompactTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}_${hours}${minutes}${seconds}`;
}

function sanitizeFilename(name: string): string {
  // Replace characters not allowed in Windows/macOS/Linux file systems
  return name.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_');
}
