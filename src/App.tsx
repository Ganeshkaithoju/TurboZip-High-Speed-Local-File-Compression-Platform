import { useState } from 'react';
import { Navbar, NavTab } from './components/layout/Navbar';
import { Compressor } from './pages/Compressor';
import { Benchmark } from './pages/Benchmark';
import { History } from './pages/History';
import { Settings } from './pages/Settings';
import { Documentation } from './pages/Documentation';
import { ShieldCheck, HardDrive, Cpu } from 'lucide-react';

function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('compressor');

  const renderContent = () => {
    switch (currentTab) {
      case 'compressor':
        return <Compressor />;
      case 'benchmark':
        return <Benchmark />;
      case 'history':
        return <History />;
      case 'settings':
        return <Settings />;
      case 'docs':
        return <Documentation />;
      default:
        return <Compressor />;
    }
  };

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 flex flex-col tech-grid tech-radial selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Top Navigation */}
      <Navbar currentTab={currentTab} onTabChange={setCurrentTab} />

      {/* Main Content Area */}
      <main className="flex-1 w-full pb-16">
        {renderContent()}
      </main>

      {/* Global Footer */}
      <footer className="w-full border-t border-surface-border bg-surface/80 backdrop-blur-md py-6 text-xs text-slate-400 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-200">HyperZip Engine</span>
            <span>•</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Client-Side</span>
            </span>
            <span>•</span>
            <span className="hidden sm:inline text-slate-500">
              Zero Server Uploads Guaranteed
            </span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setCurrentTab('docs')}
              className="hover:text-slate-200 transition-colors"
            >
              Architecture Whitepaper
            </button>
            <button
              onClick={() => setCurrentTab('benchmark')}
              className="hover:text-slate-200 transition-colors"
            >
              Hardware Benchmark
            </button>
            <button
              onClick={() => setCurrentTab('settings')}
              className="hover:text-slate-200 transition-colors"
            >
              Thread Settings
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
