import { useEffect, useState } from 'react';
import { useSimStore } from './store/useSimStore';
import { AgentGraph } from './components/AgentGraph';
import { ControlPanel } from './components/ControlPanel';
import { CodeViewer } from './components/CodeViewer';
import { TimeScrubber } from './components/TimeScrubber';
import { ThoughtConsole } from './components/ThoughtConsole';
import { CisoReport } from './components/CisoReport';
import { JailbreakPlayground } from './components/JailbreakPlayground';
import { TerminalSOC } from './components/TerminalSOC';
import { Shield, LayoutDashboard, Sliders } from 'lucide-react';

function App() {
  const { fetchMetadata, resetSim, error, simState } = useSimStore();
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
    <div className="min-h-screen bg-[#020205] text-slate-100 flex flex-col font-mono selection:bg-cyan-500/30 selection:text-cyan-200 grid-matrix-bg relative overflow-hidden">
      
      {/* BACKGROUND MATRIX LIGHT DOT */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Header Cyberpunk */}
      <header className="h-14 border-b border-slate-900 bg-slate-950/40 backdrop-blur-md px-6 flex items-center justify-between z-10 shrink-0 select-none">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md border border-cyan-500/30 flex items-center justify-center bg-cyan-500/10 shadow-[0_0_10px_rgba(0,240,255,0.1)]">
            <Shield className="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-pink-500 uppercase glitch-text">
              AI Worm & Defense Sandbox
            </h1>
            <p className="text-[7.5px] text-slate-500 uppercase tracking-widest font-sans font-bold">
              Entorno pedagógico de simulación de amenazas LLM polimórficas (Morris II)
            </p>
          </div>
        </div>

        {/* Barra de Estado */}
        <div className="flex items-center gap-4 text-[10px]">
          {error && (
            <span className="text-red-500 font-bold animate-pulse font-mono text-[9px] border border-red-500/30 bg-red-950/20 px-2 py-0.5 rounded">
              [CONEXIÓN FALLIDA: REINICIA EL SERVIDOR BACKEND]
            </span>
          )}
          
          <button
            onClick={() => setShowPlayground(!showPlayground)}
            className={`px-3 py-1 border rounded text-[9px] uppercase font-bold transition-all flex items-center gap-1.5 ${
              showPlayground
                ? 'bg-cyan-500 border-cyan-400 text-slate-950 shadow-[0_0_8px_rgba(0,240,255,0.3)]'
                : 'border-slate-800 text-slate-400 hover:border-slate-655 hover:text-slate-200'
            }`}
          >
            {showPlayground ? (
              <>
                <LayoutDashboard className="w-3.5 h-3.5" /> Consola Principal
              </>
            ) : (
              <>
                <Sliders className="w-3.5 h-3.5" /> Laboratorio Red-Team
              </>
            )}
          </button>
          
          <span className="text-slate-800 font-bold">|</span>
          <span className="text-green-500 flex items-center gap-1.5 font-bold font-mono">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span> ONLINE
          </span>
        </div>
      </header>

      {/* Main Layout: Pantalla Dividida (60% Show / 40% Terminal) */}
      <main className="flex-1 p-3 flex flex-col gap-3 h-[calc(100vh-3.5rem)] min-h-0 overflow-hidden relative z-10">
        
        {/* Top Panel (60%): The "Show" - AgentGraph & Metrics */}
        <section className="flex-[3] flex flex-col gap-3 min-h-0">
          <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-3">
            <div className="flex-[4] min-w-0 min-h-0">
              <AgentGraph />
            </div>
            <div className="flex-1 lg:w-72 lg:flex-none shrink-0 flex flex-col gap-3 min-h-0">
              <div className="flex-1 min-h-0">
                 <CisoReport />
              </div>
            </div>
          </div>
          <div className="shrink-0">
            <TimeScrubber />
          </div>
        </section>

        {/* Bottom Panel (40%): Terminal SOC */}
        <section className="flex-[2] min-h-0 flex flex-col">
          {showPlayground ? <JailbreakPlayground /> : <TerminalSOC />}
        </section>

      </main>
    </div>
  );
}

export default App;
