import React, { useState } from 'react';
import { ControlPanel } from './ControlPanel';
import { ThoughtConsole } from './ThoughtConsole';
import { CodeViewer } from './CodeViewer';
import { Terminal, Shield, Code, Cpu } from 'lucide-react';

export const TerminalSOC: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'control' | 'logs' | 'code'>('control');

  return (
    <div className="flex flex-col h-full bg-slate-950/90 rounded-lg overflow-hidden border border-slate-800/80">
      {/* Tabs Header */}
      <div className="flex items-center border-b border-slate-900 bg-slate-950 shrink-0">
        <button
          onClick={() => setActiveTab('control')}
          className={`flex items-center gap-2 px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-widest transition-all ${
            activeTab === 'control'
              ? 'bg-slate-900/60 text-cyan-400 border-t-2 border-t-cyan-400'
              : 'text-slate-500 hover:bg-slate-900/30 hover:text-slate-300 border-t-2 border-transparent'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          Panel SOC & Misiones
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-widest transition-all ${
            activeTab === 'logs'
              ? 'bg-slate-900/60 text-pink-400 border-t-2 border-t-pink-400'
              : 'text-slate-500 hover:bg-slate-900/30 hover:text-slate-300 border-t-2 border-transparent'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          Logs & Pensamiento LLM
        </button>

        <button
          onClick={() => setActiveTab('code')}
          className={`flex items-center gap-2 px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-widest transition-all ${
            activeTab === 'code'
              ? 'bg-slate-900/60 text-yellow-400 border-t-2 border-t-yellow-400'
              : 'text-slate-500 hover:bg-slate-900/30 hover:text-slate-300 border-t-2 border-transparent'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          Auditoría de Código
        </button>
        
        {/* Decorative Space */}
        <div className="flex-1 border-b border-slate-900 bg-slate-950/50 flex justify-end px-3 items-center">
            <span className="text-[9px] text-slate-600 font-mono flex items-center gap-1">
                <Cpu className="w-3 h-3" /> TERMINAL_ID: SOC-09
            </span>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 min-h-0 relative">
        <div className={`absolute inset-0 transition-opacity duration-200 ${activeTab === 'control' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
          <ControlPanel />
        </div>
        <div className={`absolute inset-0 transition-opacity duration-200 ${activeTab === 'logs' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
          <ThoughtConsole />
        </div>
        <div className={`absolute inset-0 transition-opacity duration-200 ${activeTab === 'code' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
          <CodeViewer />
        </div>
      </div>
    </div>
  );
};
