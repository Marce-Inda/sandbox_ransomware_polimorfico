import { useEffect, useState } from 'react';
import { useSimStore } from './store/useSimStore';
import { AgentGraph } from './components/AgentGraph';
import { ControlPanel } from './components/ControlPanel';
import { CodeViewer } from './components/CodeViewer';
import { TimeScrubber } from './components/TimeScrubber';
import { ThoughtConsole } from './components/ThoughtConsole';
import { CisoReport } from './components/CisoReport';
import { JailbreakPlayground } from './components/JailbreakPlayground';
import { Shield } from 'lucide-react';

function App() {
  const { fetchMetadata, resetSim, scenarioId, activeMode, activeLevel, error, simState } = useSimStore();
  const [showPlayground, setShowPlayground] = useState(false);

  useEffect(() => {
    fetchMetadata();
  }, []);

  // Cargar simulación inicial si no está cargada y los metadatos ya llegaron
  useEffect(() => {
    if (!simState && !error) {
      resetSim('chile', 'ctf', 1);
    }
  }, [simState, error]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-100 flex flex-col font-mono selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Header Cyberpunk */}
      <header className="h-14 border-b border-slate-900 bg-slate-950/80 backdrop-blur px-6 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded border border-cyan-500/30 flex items-center justify-center bg-cyan-500/10">
            <Shield className="w-4 h-4 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-pink-500 uppercase glitch-text">
              AI Worm & Defense Sandbox
            </h1>
            <p className="text-[8px] text-slate-500 uppercase tracking-tight">
              Entorno educativo de simulación de amenazas de IA polimórficas (Morris II)
            </p>
          </div>
        </div>

        {/* Barra de Estado */}
        <div className="flex items-center gap-4 text-[10px]">
          {error && (
            <span className="text-red-500 font-bold animate-pulse">
              [CONEXIÓN FALLIDA: INICIA EL BACKEND EN EL PUERTO 8000]
            </span>
          )}
          <button
            onClick={() => setShowPlayground(!showPlayground)}
            className={`px-3 py-1 border rounded text-[9px] uppercase font-bold transition-all ${
              showPlayground
                ? 'bg-cyan-500 border-cyan-400 text-slate-950 shadow-sm'
                : 'border-slate-850 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            {showPlayground ? '🖥️ Consola Principal' : '🔬 Laboratorio Red-Team'}
          </button>
          <span className="text-slate-800 font-bold">|</span>
          <span className="text-green-500 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping"></span> ONLINE
          </span>
        </div>
      </header>

      {/* Main Grid Layout */}
      <main className="flex-1 p-3 grid grid-cols-12 gap-3 h-[calc(100vh-3.5rem)] min-h-0 overflow-hidden">
        
        {/* Left Column - Panel de Control o Playground */}
        <section className="col-span-3 min-h-0 flex flex-col">
          {showPlayground ? <JailbreakPlayground /> : <ControlPanel />}
        </section>

        {/* Center Column - Topología de Red, Time Scrubber y CISO Report */}
        <section className="col-span-5 min-h-0 flex flex-col gap-3">
          <div className="flex-1 min-h-0">
            <AgentGraph />
          </div>
          <div className="shrink-0">
            <TimeScrubber />
          </div>
          <div className="h-32 shrink-0">
            <CisoReport />
          </div>
        </section>

        {/* Right Column - Código Vulnerable e Inspector de Pensamiento */}
        <section className="col-span-4 min-h-0 flex flex-col gap-3">
          <div className="flex-1 min-h-0">
            <CodeViewer />
          </div>
          <div className="flex-1 min-h-0">
            <ThoughtConsole />
          </div>
        </section>

      </main>
    </div>
  );
}

export default App;
