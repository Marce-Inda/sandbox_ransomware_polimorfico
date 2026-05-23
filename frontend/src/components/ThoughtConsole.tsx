import React, { useState, useEffect } from 'react';
import { useSimStore } from '../store/useSimStore';
import { Terminal, Cpu, AlertTriangle } from 'lucide-react';

export const ThoughtConsole: React.FC = () => {
  const { simState, selectedAgentId } = useSimStore();
  const [typedText, setTypedText] = useState('');

  const selectedAgent = selectedAgentId && simState
    ? simState.agents[selectedAgentId]
    : null;

  // Efecto de máquina de escribir para simular procesamiento en vivo
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
    }, 12); // Velocidad rápida pero visible

    return () => clearInterval(interval);
  }, [selectedAgent, simState?.current_step]);

  if (!simState) return null;

  return (
    <div className="cyber-panel w-full h-full flex flex-col p-4 bg-slate-950/80 border-cyan-500/20 text-slate-200 rounded-lg">
      
      {/* Cabecera Consola de Pensamientos */}
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <h2 className="text-sm font-bold tracking-widest text-cyan-400 uppercase flex items-center gap-2 font-mono">
          <Cpu className="w-4 h-4" /> Consola de Pensamiento (LLM Monologue)
        </h2>
      </div>

      {/* Caja de Monólogo Interno */}
      <div className="flex-1 bg-slate-950 border border-slate-900 rounded p-3 font-mono text-xs text-green-400 leading-relaxed overflow-y-auto mb-3 min-h-[140px]">
        {selectedAgent ? (
          <div>
            <div className="text-[10px] text-slate-500 border-b border-slate-900 pb-1.5 mb-2 flex justify-between items-center">
              <span>Agente: <strong className="text-slate-300">{selectedAgent.id}</strong></span>
              <span className={`px-1.5 py-0.5 rounded text-[8px] ${
                selectedAgent.status === 'infected' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
              }`}>
                {selectedAgent.status.toUpperCase()}
              </span>
            </div>
            
            <div className="whitespace-pre-wrap">
              {typedText || 'PROCESANDO PENSAMIENTO SEMÁNTICO...'}
              <span className="animate-pulse ml-0.5">_</span>
            </div>
          </div>
        ) : (
          <div className="text-slate-650 flex flex-col items-center justify-center h-full gap-2 text-center p-4">
            <Terminal className="w-8 h-8 text-slate-800" />
            <span>Selecciona un agente en el grafo para inspeccionar su monólogo interno de IA en vivo.</span>
          </div>
        )}
      </div>

      {/* Registro de Auditoría de Logs de Red */}
      <div className="h-[120px] flex flex-col bg-slate-950 border border-slate-900 rounded p-2.5 font-mono text-[9px] text-slate-400 overflow-hidden">
        <div className="text-[9px] text-slate-500 font-bold uppercase mb-1.5 flex items-center gap-1">
          <Terminal className="w-3.5 h-3.5" /> Auditoría de Eventos de Red
        </div>
        <div className="flex-1 overflow-y-auto flex flex-col gap-1 pr-1">
          {simState.logs.map((log, idx) => (
            <div key={idx} className="border-l border-slate-800 pl-1.5 py-0.5 text-slate-400">
              <span className="text-slate-600">[{idx}]</span> {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
