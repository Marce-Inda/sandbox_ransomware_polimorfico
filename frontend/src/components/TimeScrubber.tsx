import React from 'react';
import { useSimStore } from '../store/useSimStore';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';

export const TimeScrubber: React.FC = () => {
  const { history, activeStepIndex, scrubToStep, runStep, simState } = useSimStore();

  if (history.length <= 1) {
    return (
      <div className="cyber-panel w-full flex items-center justify-between p-3 bg-slate-950/80 border-cyan-500/20 text-slate-500 font-mono text-xs rounded-lg">
        <span>Línea de tiempo inactiva. Envía un correo de ataque para iniciar la simulación.</span>
        <button 
          disabled
          className="px-4 py-1 border border-slate-900 text-slate-700 text-xs rounded cursor-not-allowed uppercase"
        >
          Avanzar Paso
        </button>
      </div>
    );
  }

  const handleScrub = (val: number) => {
    scrubToStep(val);
  };

  const handlePrev = () => {
    if (activeStepIndex > 0) {
      scrubToStep(activeStepIndex - 1);
    }
  };

  const handleNext = () => {
    if (activeStepIndex < history.length - 1) {
      scrubToStep(activeStepIndex + 1);
    }
  };

  const handleStepForward = () => {
    // Si hay mensajes en la cola, avanza un paso lógico
    runStep();
  };

  const hasEventsLeft = simState ? simState.event_queue.length > 0 : false;

  return (
    <div className="cyber-panel w-full flex flex-col p-3 bg-slate-950/90 border-cyan-500/20 text-slate-200 rounded-lg gap-2 font-mono">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
            Historial de Ejecución (Time Scrubber)
          </span>
          <span className="text-[10px] text-slate-500">
            Paso {activeStepIndex} de {history.length - 1}
          </span>
        </div>

        {/* Mensaje de cola */}
        <span className="text-[10px] text-yellow-500 animate-pulse">
          {hasEventsLeft ? '● Eventos pendientes en cola' : 'Cola vacía (Simulación Completada)'}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Controles de navegación de línea de tiempo */}
        <button
          onClick={handlePrev}
          disabled={activeStepIndex === 0}
          className="p-1 border border-slate-800 rounded hover:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-400"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Deslizador */}
        <input
          type="range"
          min="0"
          max={history.length - 1}
          value={activeStepIndex}
          onChange={(e) => handleScrub(parseInt(e.target.value))}
          className="flex-1 accent-cyan-400 bg-slate-950 h-1 rounded cursor-pointer"
        />

        <button
          onClick={handleNext}
          disabled={activeStepIndex === history.length - 1}
          className="p-1 border border-slate-800 rounded hover:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-400"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Botón de ejecución manual de paso a paso */}
        <button
          onClick={handleStepForward}
          disabled={!hasEventsLeft}
          className={`px-4 py-1 font-bold text-xs uppercase rounded transition-all flex items-center gap-1.5 ${
            hasEventsLeft
              ? 'bg-cyan-500 border border-cyan-400 text-slate-950 hover:bg-cyan-400 shadow-sm'
              : 'border border-slate-900 bg-slate-950 text-slate-700 cursor-not-allowed'
          }`}
        >
          <Play className="w-3.5 h-3.5" /> Procesar Paso
        </button>
      </div>

      {/* Marcadores de hitos en la barra */}
      <div className="flex justify-between text-[8px] text-slate-650 px-7 select-none">
        {history.map((_, idx) => (
          <span 
            key={idx} 
            onClick={() => scrubToStep(idx)}
            className={`cursor-pointer hover:text-cyan-400 ${activeStepIndex === idx ? 'text-cyan-400 font-bold' : ''}`}
          >
            {idx === 0 ? 'Reset' : `S${idx}`}
          </span>
        ))}
      </div>
    </div>
  );
};
