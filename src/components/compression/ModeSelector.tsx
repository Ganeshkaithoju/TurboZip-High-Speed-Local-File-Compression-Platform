import React from 'react';
import { Zap, Scale, Archive, Brain, Check } from 'lucide-react';
import { CompressionMode } from '../../core/types/engine';
import { useCompressionStore } from '../../stores/compressionStore';

export const ModeSelector: React.FC = () => {
  const { selectedMode, setMode, status } = useCompressionStore();
  const isLocked = status === 'compressing';

  const modes: Array<{
    id: CompressionMode;
    name: string;
    tagline: string;
    icon: React.ReactNode;
    recommended?: boolean;
    description: string;
  }> = [
    {
      id: 'smart',
      name: 'Smart Adaptive',
      tagline: 'Intelligent Routing',
      icon: <Brain className="w-4 h-4 text-emerald-400" />,
      recommended: true,
      description: 'Heuristic analysis: skips re-compressing media/archives, deep-compresses text & code.',
    },
    {
      id: 'fast',
      name: 'Fast Mode',
      tagline: 'Maximum Throughput',
      icon: <Zap className="w-4 h-4 text-amber-400" />,
      description: 'Level 1 Deflate. Lowest CPU usage, instant streaming for speed-sensitive jobs.',
    },
    {
      id: 'balanced',
      name: 'Balanced',
      tagline: 'Standard Deflate',
      icon: <Scale className="w-4 h-4 text-cyan-400" />,
      description: 'Level 6 Deflate. Ideal trade-off between archive compactness and encoding speed.',
    },
    {
      id: 'maximum',
      name: 'Maximum',
      tagline: 'Smallest Archive',
      icon: <Archive className="w-4 h-4 text-purple-400" />,
      description: 'Level 9 Deflate. Maximizes bit efficiency for archival storage and transfers.',
    },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wide">
          Compression Engine Mode
        </label>
        <span className="text-[11px] font-mono text-slate-500">PKZip Multi-Threaded</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {modes.map((mode) => {
          const isSelected = selectedMode === mode.id;

          return (
            <div
              key={mode.id}
              onClick={() => !isLocked && setMode(mode.id)}
              className={`relative p-3 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                isSelected
                  ? 'bg-surface-subtle border-emerald-500/50 shadow-glow-sm ring-1 ring-emerald-500/30'
                  : 'bg-surface/60 hover:bg-surface-subtle/80 border-surface-border'
              } ${isLocked ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-lg bg-surface border border-surface-border">
                      {mode.icon}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                        <span>{mode.name}</span>
                        {mode.recommended && (
                          <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                            BEST
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {mode.tagline}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 leading-snug mt-1">
                  {mode.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
