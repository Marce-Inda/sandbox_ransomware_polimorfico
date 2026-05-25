import React, { useState, useEffect } from 'react';
import { useSimStore } from '../store/useSimStore';
import { Terminal, Cpu, ShieldAlert, Sparkles, Network } from 'lucide-react';

export const ThoughtConsole: React.FC = () => {
  const { simState, selectedAgentId } = useSimStore();
  const [typedText, setTypedText] = useState('');

  const selectedAgent = selectedAgentId && simState
    ? simState.agents[selectedAgentId]
    : null;

  // Typewriter effect to simulate raw LLM semantic processing
  useEffect(() => {
    if (!selectedAgent) {
      setTypedText('');
      return;
    }

    setTypedText('');
    let idx = 0;
    const rawText = selectedAgent.internal_monologue;
    
    const interval = setInterval(() => {
      if (idx < rawText.length) {
        setTypedText((prev) => prev + rawText.charAt(idx));
        idx++;
      } else {
        clearInterval(interval);
      }
    }, 8); // Fast typing speed

    return () => clearInterval(interval);
  }, [selectedAgent, simState?.current_step, selectedAgentId]);

  if (!simState) return null;

  // Helper to color audit logs dynamically
  const getLogColorClass = (logText: string) => {
    const textLower = logText.toLowerCase();
    if (textLower.includes('alerta') || textLower.includes('bloqueo') || textLower.includes('comprometido') || textLower.includes('brecha') || textLower.includes('fuga')) {
      return 'text-red-400 border-red-950 bg-red-950/10';
    }
    if (textLower.includes('filtro') || textLower.includes('segregación') || textLower.includes('firewall')) {
      return 'text-yellow-500 border-yellow-950 bg-yellow-950/10';
    }
    return 'text-cyan-400/80 border-slate-900 bg-transparent';
  };

  return (
    <div className="cyber-panel w-full h-full flex flex-col p-4 bg-slate-950/80 border-cyan-500/20 text-slate-200 rounded-lg crt-overlay">
      
      {/* TERMINAL DISPLAY HEADER */}
      <div className="flex items-center justify-between mb-3 border-b border-slate-900 pb-2 z-10 select-none">
        <h2 className="text-xs font-bold tracking-widest text-cyan-400 uppercase flex items-center gap-2 font-mono">
          <Terminal className="w-4 h-4 text-cyan-500 animate-pulse" /> MONÓLOGO INTERNO (IA SEMANTIC MIND)
        </h2>
        <span className="text-[8px] text-slate-500 font-mono">SYS_SHELL://10.85.12.0/AGENT_MONITOR</span>
      </div>

      {/* TYPED TEXT BOX */}
      <div className="flex-1 bg-slate-950/90 border border-slate-900 rounded-lg p-3 font-mono text-xs text-green-400 leading-relaxed overflow-y-auto mb-3 min-h-[140px] shadow-inner relative">
        {selectedAgent ? (
          <div>
            <div className="text-[9px] text-slate-500 border-b border-slate-900/80 pb-2 mb-2.5 flex justify-between items-center select-none">
              <span className="flex items-center gap-1">
                AUDITANDO LOG INTERNO: <strong className="text-slate-350">{selectedAgent.id}</strong>
              </span>
              <span className={`px-2 py-0.5 rounded text-[8px] font-bold border ${
                selectedAgent.status === 'infected' 
                  ? 'bg-red-950 text-red-400 border-red-500/20' 
                  : 'bg-green-950 text-green-400 border-green-500/20'
              }`}>
                {selectedAgent.status.toUpperCase()}
              </span>
            </div>
            
            <div className="whitespace-pre-wrap font-mono text-[10.5px]">
              {typedText || 'CARGANDO REGISTRO SEMÁNTICO...'}
              <span className="animate-pulse ml-0.5 font-bold text-green-300">_</span>
            </div>
          </div>
        ) : (
          <div className="text-slate-600 flex flex-col items-center justify-center h-full gap-2.5 text-center p-4 select-none">
            <Cpu className="w-8 h-8 text-slate-800 animate-pulse" />
            <span className="text-[10px] uppercase tracking-wider">Esperando selección de agente en el grafo...</span>
          </div>
        )}
      </div>

      {/* AUDIT LOG DE RED */}
      <div className="h-[120px] flex flex-col bg-slate-950 border border-slate-900 rounded-lg p-2.5 font-mono text-[9px] text-slate-450 z-10 overflow-hidden">
        <div className="text-[9px] text-slate-400 font-bold uppercase mb-2 border-b border-slate-900 pb-1 flex items-center gap-1.5 select-none">
          <Network className="w-3.5 h-3.5 text-cyan-500" /> Registro de Auditoría de Eventos de Red
        </div>
        
        <div className="flex-1 overflow-y-auto flex flex-col gap-1 pr-1 select-text">
          {simState.logs.length === 0 ? (
            <div className="text-slate-650 text-center py-4">No se han registrado transacciones de red.</div>
          ) : (
            simState.logs.map((log, idx) => (
              <div 
                key={idx} 
                className={`border-l-2 pl-2 py-1 text-[8.5px] leading-relaxed rounded-r ${getLogColorClass(log)}`}
              >
                <span className="text-slate-600 font-bold">[{idx.toString().padStart(2, '0')}]</span> {log}
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
