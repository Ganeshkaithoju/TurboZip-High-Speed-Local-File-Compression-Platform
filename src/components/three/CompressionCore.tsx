import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CompressionStatus } from '../../stores/compressionStore';

interface CompressionCoreProps {
  status: CompressionStatus;
  throughputMBps?: number;
  progressPercent?: number;
}

export const CompressionCore = ({
  status,
  throughputMBps = 0,
  progressPercent = 0,
}: CompressionCoreProps) => {
  const outerRingRef = useRef<THREE.Mesh>(null);
  const middleRingRef = useRef<THREE.Mesh>(null);
  const innerCoreRef = useRef<THREE.Mesh>(null);
  const glowSphereRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    // Dynamic speed based on status and throughput
    let speedFactor = 0.5;
    if (status === 'compressing') {
      speedFactor = 2.0 + Math.min(throughputMBps / 40, 3.0);
    } else if (status === 'completed') {
      speedFactor = 0.2;
    }

    if (outerRingRef.current) {
      outerRingRef.current.rotation.x += delta * 0.4 * speedFactor;
      outerRingRef.current.rotation.y += delta * 0.6 * speedFactor;
    }

    if (middleRingRef.current) {
      middleRingRef.current.rotation.y -= delta * 0.5 * speedFactor;
      middleRingRef.current.rotation.z += delta * 0.3 * speedFactor;
    }

    if (innerCoreRef.current) {
      innerCoreRef.current.rotation.x += delta * 0.8 * speedFactor;
      innerCoreRef.current.rotation.z -= delta * 0.7 * speedFactor;

      // Pulsing scale
      const pulse = 1 + Math.sin(state.clock.elapsedTime * (status === 'compressing' ? 6 : 2)) * 0.08;
      innerCoreRef.current.scale.set(pulse, pulse, pulse);
    }

    if (glowSphereRef.current) {
      const pulseGlow = 1.1 + Math.sin(state.clock.elapsedTime * (status === 'compressing' ? 8 : 1.5)) * 0.12;
      glowSphereRef.current.scale.set(pulseGlow, pulseGlow, pulseGlow);
    }
  });

  // Color mapping based on status
  const coreColor =
    status === 'completed'
      ? '#34d399' // Emerald celebration
      : status === 'compressing'
      ? '#38bdf8' // Cyber blue active
      : status === 'paused'
      ? '#f59e0b' // Amber
      : '#10b981'; // Mint idle

  const ringColor =
    status === 'compressing'
      ? '#818cf8'
      : status === 'completed'
      ? '#10b981'
      : '#334155';

  return (
    <group position={[0, 0, 0]}>
      {/* Outer Gyro Ring */}
      <mesh ref={outerRingRef}>
        <torusGeometry args={[2.2, 0.03, 16, 64]} />
        <meshStandardMaterial
          color={ringColor}
          emissive={ringColor}
          emissiveIntensity={status === 'compressing' ? 0.8 : 0.2}
          wireframe={false}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Middle Gyro Ring */}
      <mesh ref={middleRingRef}>
        <torusGeometry args={[1.7, 0.035, 16, 64]} />
        <meshStandardMaterial
          color={status === 'compressing' ? '#38bdf8' : '#475569'}
          emissive={status === 'compressing' ? '#0284c7' : '#1e293b'}
          emissiveIntensity={status === 'compressing' ? 0.9 : 0.15}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Pulsing Core Glowing Sphere */}
      <mesh ref={glowSphereRef}>
        <sphereGeometry args={[0.95, 32, 32]} />
        <meshBasicMaterial
          color={coreColor}
          transparent
          opacity={status === 'compressing' ? 0.45 : 0.2}
        />
      </mesh>

      {/* Central Faceted Icosahedron Reactor */}
      <mesh ref={innerCoreRef}>
        <icosahedronGeometry args={[0.85, 1]} />
        <meshStandardMaterial
          color={coreColor}
          emissive={coreColor}
          emissiveIntensity={status === 'compressing' ? 1.2 : 0.4}
          roughness={0.15}
          metalness={0.9}
          wireframe={status !== 'completed'}
        />
      </mesh>
    </group>
  );
};
