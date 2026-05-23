import React from 'react';
import { useSimStore } from '../store/useSimStore';
import { Code, AlertCircle } from 'lucide-react';

export const CodeViewer: React.FC = () => {
  const { activeLevel, levelsList, selectedAgentId } = useSimStore();

  if (levelsList.length === 0) return null;

  const activeLevelData = levelsList.find(l => l.level === activeLevel) || levelsList[0];
  
  // Si hay un agente seleccionado, mostrar su código correspondiente, sino mostrar el del nivel activo
  const targetAgent = selectedAgentId || activeLevelData.agent;
  
  // Buscar si hay código de nivel asociado al agente seleccionado
  const levelForAgent = levelsList.find(l => l.agent === targetAgent) || activeLevelData;
  const codeContent = levelForAgent.vulnerable_code;

  return (
    <div className="cyber-panel w-full h-full flex flex-col p-4 bg-slate-950/80 border-cyan-500/20 text-slate-200 rounded-lg">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <h2 className="text-sm font-bold tracking-widest text-cyan-400 uppercase flex items-center gap-2 font-mono">
          <Code className="w-4 h-4" /> Inspección de Código Vulnerable (White-Box)
        </h2>
        <span className="text-[10px] text-slate-500 font-mono">
          Agente: {targetAgent}
        </span>
      </div>

      {/* Editor simulado */}
      <div className="flex-1 bg-slate-950/90 border border-slate-900 rounded p-3 overflow-auto font-mono text-[10px] text-slate-400 leading-relaxed relative min-h-[150px]">
        {/* Marcador superior */}
        <div className="absolute top-2 right-2 text-[9px] text-slate-700 select-none">
          VULNERABLE_TEMPLATE.py
        </div>
        
        <pre className="whitespace-pre-wrap select-text">
          {codeContent}
        </pre>
      </div>

      {/* Alerta didáctica */}
      <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded flex gap-2 items-start font-mono text-[9px] leading-normal text-red-400">
        <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
        <div>
          <strong>EDUCACIÓN DE SEGURIDAD LLM:</strong> La inyección de prompt ocurre por tratar datos no confiables de entrada de usuario como parte de la plantilla de instrucciones. Para resolver esto, los ingenieros deben desacoplar las variables y forzar esquemas JSON estrictos o llamadas tipadas.
        </div>
      </div>
    </div>
  );
};
