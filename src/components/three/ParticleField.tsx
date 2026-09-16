import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CompressionStatus } from '../../stores/compressionStore';

interface ParticleFieldProps {
  status: CompressionStatus;
  count?: number;
}

export const ParticleField = ({ status, count = 240 }: ParticleFieldProps) => {
  const pointsRef = useRef<THREE.Points>(null);

  // Generate initial particle coordinates and speeds
  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Distributed in sphere around core
      const radius = 3.5 + Math.random() * 5.0;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);

      spd[i] = 0.2 + Math.random() * 0.8;
    }

    return [pos, spd];
  }, [count]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    const positionsAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const array = positionsAttr.array as Float32Array;

    const isCompressing = status === 'compressing';
    const isCompleted = status === 'completed';

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      let x = array[idx];
      let y = array[idx + 1];
      let z = array[idx + 2];

      const dist = Math.sqrt(x * x + y * y + z * z);

      if (isCompressing) {
        // Stream inward toward the compression core
        const pullSpeed = delta * (1.2 + speeds[i] * 2.0);
        x -= (x / dist) * pullSpeed;
        y -= (y / dist) * pullSpeed;
        z -= (z / dist) * pullSpeed;

        // If swallowed by core, respawn at outer boundary
        if (dist < 0.9) {
          const newRadius = 7.0 + Math.random() * 2.0;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(Math.random() * 2 - 1);
          x = newRadius * Math.sin(phi) * Math.cos(theta);
          y = newRadius * Math.sin(phi) * Math.sin(theta);
          z = newRadius * Math.cos(phi);
        }
      } else if (isCompleted) {
        // Calm orbit in tight cluster
        const angle = delta * 0.2;
        const newX = x * Math.cos(angle) - z * Math.sin(angle);
        const newZ = x * Math.sin(angle) + z * Math.cos(angle);
        x = newX;
        z = newZ;
      } else {
        // Ambient drift
        const angle = delta * 0.08 * speeds[i];
        const newX = x * Math.cos(angle) - z * Math.sin(angle);
        const newZ = x * Math.sin(angle) + z * Math.cos(angle);
        x = newX;
        z = newZ;
      }

      array[idx] = x;
      array[idx + 1] = y;
      array[idx + 2] = z;
    }

    positionsAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color={status === 'compressing' ? '#38bdf8' : status === 'completed' ? '#34d399' : '#94a3b8'}
        transparent
        opacity={status === 'compressing' ? 0.85 : 0.45}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
};
