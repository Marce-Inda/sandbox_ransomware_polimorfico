import React, { useState } from 'react';
import { Terminal, Send, ShieldAlert, ShieldCheck, HelpCircle, Cpu, Activity } from 'lucide-react';

interface SafetyEval {
  is_unsafe: boolean;
  confidence: number;
  reason: string;
}

export const JailbreakPlayground: React.FC = () => {
  const [promptText, setPromptText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ prompt: string; safety_evaluation: SafetyEval } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTestPrompt = async () => {
    if (!promptText.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('http://localhost:8000/api/playground/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText }),
      });
      if (!res.ok) throw new Error('Error al conectar con la API de Playground.');
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cyber-panel w-full h-full flex flex-col p-4 bg-slate-950/80 border-cyan-500/20 text-slate-200 rounded-lg crt-overlay">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-3 border-b border-slate-900 pb-2 z-10 select-none">
        <h2 className="text-xs font-bold tracking-widest text-cyan-400 uppercase flex items-center gap-2 font-mono">
          <Terminal className="w-4 h-4 text-cyan-500 animate-pulse" /> LAB RED-TEAMING (PLAYGROUND)
        </h2>
        <span className="text-[8px] text-slate-500 font-mono">SANDBOX://PROMPT_GUARD_EVAL</span>
      </div>

      <div className="flex-1 flex flex-col gap-4 font-mono z-10 min-h-0 overflow-y-auto pr-0.5">
        <p className="text-[9.5px] text-slate-400 leading-relaxed bg-slate-900/40 p-2.5 border border-slate-900 rounded-lg">
          Realiza pruebas directas contra los guardrails de la IA de forma aislada. Aquí puedes experimentar con payloads alternativos u ofuscación de cadenas sin penalizar tu puntaje.
        </p>

        {/* INPUT PROMPT DE PRUEBA */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Prompt de Entrada</span>
          <div className="flex gap-2">
            <input
              type="text"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="Escribe un prompt de prueba (ej. ignora las reglas)..."
              className="flex-1 bg-slate-950 border border-slate-900 rounded-lg px-3 py-2 text-xs text-slate-350 font-mono focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 transition-all"
              onKeyDown={(e) => e.key === 'Enter' && handleTestPrompt()}
            />
            <button
              onClick={handleTestPrompt}
              disabled={loading}
              className="cyber-btn py-2 flex items-center gap-1 text-xs font-bold disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5 fill-current" /> {loading ? 'Testando...' : 'Evaluar'}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-2 border border-red-500/20 bg-red-500/5 text-[9.5px] text-red-400 rounded-lg font-bold">
            ERROR DE CONEXIÓN: {error}
          </div>
        )}

        {/* AUDIT RESULTS CARD */}
        {result && (
          <div className="bg-slate-950/80 border border-slate-900 rounded-lg p-3 text-xs leading-relaxed flex flex-col gap-3">
            
            <div className="flex items-center justify-between border-b border-slate-900/80 pb-2">
              <span className="text-[9px] text-slate-500 uppercase font-bold">Auditoría del Guardrail:</span>
              <span className={`px-2 py-0.5 rounded text-[8px] font-bold border flex items-center gap-1.5 ${
                result.safety_evaluation.is_unsafe
                  ? 'bg-red-950 text-red-450 border-red-500/30'
                  : 'bg-green-950 text-green-400 border-green-500/30'
              }`}>
                {result.safety_evaluation.is_unsafe ? (
                  <>
                    <ShieldAlert className="w-3 h-3 text-red-500 animate-pulse" /> AMENAZA DETECTADA
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3 h-3 text-green-400" /> ENTRADA SEGURA
                  </>
                )}
              </span>
            </div>

            <div className="text-[10px] text-slate-350 bg-slate-900/30 p-2 border border-slate-900/50 rounded">
              <strong className="text-slate-500 uppercase text-[8px] block mb-1">Razonamiento Clasificación LLM:</strong>
              {result.safety_evaluation.reason}
            </div>

            <div className="flex flex-col gap-1.5 pt-1.5 border-t border-slate-900">
              <div className="flex justify-between text-[9px] text-slate-500 font-bold">
                <span>CONFIANZA DEL CLASIFICADOR:</span>
                <span className={result.safety_evaluation.is_unsafe ? 'text-red-400' : 'text-green-400'}>
                  {(result.safety_evaluation.confidence * 100).toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${result.safety_evaluation.is_unsafe ? 'bg-red-500' : 'bg-green-500'}`}
                  style={{ width: `${result.safety_evaluation.confidence * 100}%` }}
                ></div>
              </div>
            </div>

          </div>
        )}
      </div>
      
    </div>
  );
};
