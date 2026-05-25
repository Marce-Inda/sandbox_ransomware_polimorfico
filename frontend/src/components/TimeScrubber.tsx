import React from 'react';
import { useSimStore } from '../store/useSimStore';
import { ChevronLeft, ChevronRight, Play, RotateCcw } from 'lucide-react';

export const TimeScrubber: React.FC = () => {
  const { history, activeStepIndex, scrubToStep, runStep, simState, resetSim, scenarioId, activeMode, activeLevel } = useSimStore();

  if (history.length <= 1) {
    return (
      <div className="cyber-panel w-full flex items-center justify-between p-3.5 bg-slate-950/80 border-cyan-500/20 text-slate-500 font-mono text-xs rounded-lg select-none">
        <span className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-800 animate-pulse"></span>
          Timeline inactiva. Envía un correo de inyección desde el panel de control para iniciar el análisis.
        </span>
        <button 
          disabled
          className="px-4 py-1.5 border border-slate-900 text-slate-800 text-xs rounded-md cursor-not-allowed uppercase font-bold"
        >
          Procesar Paso
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
    runStep();
  };

  const handleResetSimulator = () => {
    resetSim(scenarioId, activeMode, activeLevel);
  };

  const hasEventsLeft = simState ? simState.event_queue.length > 0 : false;

  return (
    <div className="cyber-panel w-full flex flex-col p-4 bg-slate-950/95 border-cyan-500/20 text-slate-200 rounded-lg gap-2.5 font-mono select-none">
      
      {/* HEADER CONTROLS */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
            CONTROL DE LÍNEA DE TIEMPO (HUD SCRUBBER)
          </span>
          <span className="text-[10px] text-slate-500 bg-slate-950 border border-slate-900 px-1.5 py-0.2 rounded">
            STEP [ {activeStepIndex.toString().padStart(2, '0')} // {(history.length - 1).toString().padStart(2, '0')} ]
          </span>
        </div>

        {/* Queue status */}
        <span className={`text-[9px] flex items-center gap-1.5 ${hasEventsLeft ? 'text-yellow-500 animate-pulse font-bold' : 'text-slate-500'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${hasEventsLeft ? 'bg-yellow-500 animate-ping' : 'bg-slate-700'}`}></span>
          {hasEventsLeft ? 'EVENTOS DETECTADOS EN LA COLA DE RED' : 'COLA DE RED LIMPIDA (SIMULACIÓN FINALIZADA)'}
        </span>
      </div>

      {/* TIMELINE RANGE AND STEPS */}
      <div className="flex items-center gap-3 mt-1">
        {/* Step back button */}
        <button
          onClick={handlePrev}
          disabled={activeStepIndex === 0}
          className="p-1.5 border border-slate-800 rounded-md hover:border-slate-650 disabled:opacity-20 disabled:cursor-not-allowed text-slate-400 bg-slate-950"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Range Slider */}
        <input
          type="range"
          min="0"
          max={history.length - 1}
          value={activeStepIndex}
          onChange={(e) => handleScrub(parseInt(e.target.value))}
          className="flex-1 cyber-range cursor-pointer"
        />

        {/* Step forward button */}
        <button
          onClick={handleNext}
          disabled={activeStepIndex === history.length - 1}
          className="p-1.5 border border-slate-800 rounded-md hover:border-slate-650 disabled:opacity-20 disabled:cursor-not-allowed text-slate-400 bg-slate-950"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Step execution button */}
        <button
          onClick={handleStepForward}
          disabled={!hasEventsLeft}
          className={`px-4 py-1.5 font-bold text-xs uppercase transition-all flex items-center gap-1.5 border ${
            hasEventsLeft
              ? 'bg-cyan-500 border-cyan-400 text-slate-950 hover:bg-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
              : 'border-slate-900 bg-slate-950 text-slate-700 cursor-not-allowed'
          }`}
          style={{ clipPath: 'polygon(0 0, 92% 0, 100% 30%, 100% 100%, 8% 100%, 0 70%)' }}
        >
          <Play className="w-3.5 h-3.5 fill-current" /> Procesar Paso
        </button>

        {/* Full Reset Simulation Shortcut */}
        <button
          onClick={handleResetSimulator}
          className="p-1.5 border border-slate-800 hover:border-slate-650 hover:text-red-400 rounded-md text-slate-500 bg-slate-950"
          title="Resetear toda la simulación"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* MILESTONE TICK BUBBLES */}
      <div className="flex justify-between text-[8px] text-slate-600 px-7 select-none mt-0.5">
        {history.map((stateItem, idx) => {
          const isActive = activeStepIndex === idx;
          // Check if this step item has any infected agents
          const stepHasInfection = Object.values(stateItem.agents).some(a => a.status === 'infected');

          return (
            <div 
              key={idx} 
              onClick={() => scrubToStep(idx)}
              className="flex flex-col items-center gap-1 cursor-pointer group"
            >
              {/* Timeline tick bullet */}
              <span className={`w-2.5 h-2.5 rounded-full border transition-all ${
                isActive 
                  ? 'bg-cyan-400 border-white scale-110 shadow-[0_0_6px_#00f0ff]' 
                  : stepHasInfection 
                  ? 'bg-red-950 border-red-500 group-hover:bg-red-500' 
                  : 'bg-slate-950 border-slate-800 group-hover:border-slate-550'
              }`}></span>
              <span className={`font-mono text-[7.5px] transition-colors ${
                isActive 
                  ? 'text-cyan-400 font-bold' 
                  : stepHasInfection 
                  ? 'text-red-500' 
                  : 'text-slate-500 group-hover:text-slate-350'
              }`}>
                {idx === 0 ? 'RESET' : `STEP ${idx}`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
