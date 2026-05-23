import React, { useState } from 'react';
import { Terminal, Send, ShieldAlert, ShieldCheck, HelpCircle } from 'lucide-react';

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
    <div className="cyber-panel w-full h-full flex flex-col p-4 bg-slate-950/80 border-cyan-500/20 text-slate-200 rounded-lg">
      
      {/* Cabecera */}
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <h2 className="text-sm font-bold tracking-widest text-cyan-400 uppercase flex items-center gap-2 font-mono">
          <Terminal className="w-4 h-4" /> Laboratorio de Red-Teaming (Playground)
        </h2>
      </div>

      <div className="flex-1 flex flex-col gap-3 font-mono">
        <p className="text-[10px] text-slate-500 leading-normal">
          Realiza pruebas directas contra los guardrails de la IA de forma aislada. Aquí puedes experimentar con payloads alternativos sin penalizar tu puntaje.
        </p>

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="Escribe un prompt de prueba (ej. ignora las reglas)..."
            className="flex-1 bg-slate-950 border border-slate-900 rounded px-2.5 py-1.5 text-xs text-slate-300 font-mono focus:outline-none focus:border-cyan-500"
            onKeyDown={(e) => e.key === 'Enter' && handleTestPrompt()}
          />
          <button
            onClick={handleTestPrompt}
            disabled={loading}
            className="px-4 py-1.5 bg-slate-900 border border-slate-800 text-cyan-400 hover:border-slate-700 font-bold text-xs disabled:opacity-40 transition-all flex items-center gap-1"
          >
            <Send className="w-3.5 h-3.5" /> {loading ? 'Testando...' : 'Testar'}
          </button>
        </div>

        {error && (
          <div className="text-[10px] text-red-500">
            Error: {error}
          </div>
        )}

        {/* Resultado */}
        {result && (
          <div className="bg-slate-950 border border-slate-900 rounded p-2.5 text-xs leading-relaxed flex flex-col gap-2">
            <div className="flex items-center justify-between border-b border-slate-900 pb-1.5">
              <span className="text-[10px] text-slate-500">Resultado de Auditoría:</span>
              <span className={`px-2 py-0.5 rounded text-[8px] font-bold flex items-center gap-1 ${
                result.safety_evaluation.is_unsafe
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-green-500/20 text-green-400'
              }`}>
                {result.safety_evaluation.is_unsafe ? (
                  <>
                    <ShieldAlert className="w-3 h-3" /> AMENAZA DETECTADA
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3 h-3" /> ENTRADA SEGURA
                  </>
                )}
              </span>
            </div>

            <div className="text-[10px] text-slate-300">
              <strong className="text-slate-500">Razonamiento LLM:</strong> {result.safety_evaluation.reason}
            </div>

            <div className="text-[9px] text-slate-500">
              Confianza del Clasificador: {(result.safety_evaluation.confidence * 100).toFixed(0)}%
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
