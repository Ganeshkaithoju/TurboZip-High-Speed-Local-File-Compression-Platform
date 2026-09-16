import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { CompressionCore } from './CompressionCore';
import { ParticleField } from './ParticleField';
import { FileOrbits } from './FileOrbits';
import { useCompressionStore } from '../../stores/compressionStore';
import { useFileStore } from '../../stores/fileStore';
import { usePerformanceStore } from '../../stores/performanceStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { Cpu, ShieldCheck } from 'lucide-react';

interface SceneProps {
  className?: string;
}

export const CompressionScene: React.FC<SceneProps> = ({ className = 'h-full w-full' }) => {
  const { status } = useCompressionStore();
  const { files } = useFileStore();
  const { progress } = usePerformanceStore();
  const { performanceMode, show3DVisualization } = useSettingsStore();

  // If 3D is disabled or performance mode is active on low-spec hardware:
  if (!show3DVisualization || performanceMode) {
    return (
      <div className={`relative flex items-center justify-center bg-surface-subtle/40 rounded-2xl border border-surface-border overflow-hidden ${className}`}>
        <div className="text-center p-6 space-y-4">
          <div className="relative inline-flex items-center justify-center">
            {/* 2D High-Tech Animated Reactor Ring */}
            <div
              className={`w-32 h-32 rounded-full border-2 border-dashed ${
                status === 'compressing'
                  ? 'border-cyan-400 animate-spin-slow'
                  : status === 'completed'
                  ? 'border-emerald-400'
                  : 'border-slate-600'
              } flex items-center justify-center p-2`}
            >
              <div
                className={`w-24 h-24 rounded-full ${
                  status === 'compressing'
                    ? 'bg-cyan-500/20 shadow-glow-cyan animate-pulse'
                    : status === 'completed'
                    ? 'bg-emerald-500/20 shadow-glow-sm'
                    : 'bg-slate-800/60'
                } flex flex-col items-center justify-center text-center`}
              >
                <Cpu className={`w-8 h-8 ${status === 'compressing' ? 'text-cyan-400' : 'text-emerald-400'}`} />
                <span className="text-[11px] font-mono mt-1 text-slate-300">
                  {status === 'compressing' ? `${progress.ratio}%` : 'REACTOR'}
                </span>
              </div>
            </div>
          </div>
          <div>
            <div className="text-xs font-mono tracking-wider uppercase text-slate-400">
              {performanceMode ? 'Performance Mode (2D Simplified)' : 'Core Ready'}
            </div>
            <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
              Hardware concurrency optimized. 100% compute reserved for background workers.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-2xl border border-surface-border bg-gradient-to-b from-[#0b0e17] to-[#080a11] overflow-hidden ${className}`}>
      {/* HUD Overlay Badges */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 pointer-events-none">
        <div className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-black/50 backdrop-blur-md border border-white/10 text-slate-300 flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${status === 'compressing' ? 'bg-cyan-400 animate-ping' : status === 'completed' ? 'bg-emerald-400' : 'bg-slate-500'}`} />
          <span>{status.toUpperCase()}</span>
        </div>
        {status === 'compressing' && (
          <div className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-cyan-950/60 backdrop-blur-md border border-cyan-500/30 text-cyan-300">
            {progress.throughputMBps} MB/s
          </div>
        )}
      </div>

      <div className="absolute top-3 right-3 z-10 flex items-center gap-2 pointer-events-none">
        <div className="px-2 py-1 rounded-md text-[10px] font-mono bg-black/40 text-slate-400 border border-white/5 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>LOCAL ENGINE</span>
        </div>
      </div>

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 1.2, 5.5], fov: 48 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1.2} color="#f8fafc" />
        <directionalLight position={[-10, -5, -5]} intensity={0.5} color="#38bdf8" />
        <pointLight position={[0, 0, 0]} intensity={status === 'compressing' ? 2 : 0.8} color="#00f2fe" distance={6} />

        <Suspense fallback={null}>
          <CompressionCore
            status={status}
            throughputMBps={progress.throughputMBps}
            progressPercent={progress.ratio}
          />
          <ParticleField status={status} count={status === 'compressing' ? 360 : 200} />
          <FileOrbits files={files} status={status} />
        </Suspense>

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={3.5}
          maxDistance={8}
          maxPolarAngle={Math.PI / 1.7}
          minPolarAngle={Math.PI / 3}
          autoRotate={status !== 'compressing'}
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
};
