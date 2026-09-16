import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FileItem } from '../../core/types/engine';
import { CompressionStatus } from '../../stores/compressionStore';

interface FileOrbitsProps {
  files: FileItem[];
  status: CompressionStatus;
}

export const FileOrbits = ({ files, status }: FileOrbitsProps) => {
  const groupRef = useRef<THREE.Group>(null);

  // Take up to 12 files to represent visually without cluttering
  const displayFiles = files.slice(0, 12);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Slow orbit rotation
    const rotSpeed = status === 'compressing' ? 0.8 : 0.2;
    groupRef.current.rotation.y += delta * rotSpeed;
  });

  if (displayFiles.length === 0) return null;

  return (
    <group ref={groupRef}>
      {displayFiles.map((fileItem, i) => {
        const total = displayFiles.length;
        const angle = (i / total) * Math.PI * 2;
        const radius = 3.2 + (i % 3) * 0.4;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = Math.sin(i * 1.5) * 0.8;

        // Size scaled by file size (between 0.08 and 0.22)
        const scale = Math.max(0.08, Math.min(0.25, 0.08 + Math.log10(Math.max(1000, fileItem.file.size)) * 0.02));

        // Color by file category
        let color = '#38bdf8'; // text/code
        if (fileItem.analysis.category === 'media') color = '#ec4899';
        if (fileItem.analysis.category === 'archive') color = '#a855f7';
        if (fileItem.analysis.category === 'data') color = '#10b981';

        return (
          <group key={fileItem.id} position={[x, y, z]}>
            <mesh scale={[scale, scale, scale]}>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={status === 'compressing' ? 0.8 : 0.3}
                roughness={0.3}
                metalness={0.7}
              />
            </mesh>
            {/* Subtle Orbit Path Ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[radius - 0.01, radius + 0.01, 64]} />
              <meshBasicMaterial
                color="#334155"
                transparent
                opacity={0.08}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};
