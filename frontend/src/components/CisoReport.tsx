import React from 'react';
import { useSimStore } from '../store/useSimStore';
import { TrendingDown, ShieldAlert, Percent, ShieldCheck } from 'lucide-react';

export const CisoReport: React.FC = () => {
  const { simState } = useSimStore();

  if (!simState) return null;

  const infectedCount = Object.values(simState.agents).filter(a => a.status === 'infected').length;

  return (
    <div className="cyber-panel w-full h-full flex flex-col p-4 bg-slate-950/80 border-cyan-500/20 text-slate-200 rounded-lg">
      {/* Cabecera Reporte CISO */}
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <h2 className="text-sm font-bold tracking-widest text-magenta-400 uppercase flex items-center gap-2 font-mono">
          <ShieldAlert className="w-4 h-4" /> Dashboard de Impacto de CISO
        </h2>
        <span className="text-[10px] text-slate-500 font-mono">
          Infecciones: {infectedCount} / 3
        </span>
      </div>

      {/* Bento Grid de Indicadores */}
      <div className="flex-1 grid grid-cols-3 gap-3 font-mono">
        
        {/* Pérdidas Financieras (USD Lost) */}
        <div className="bg-slate-950 border border-slate-900 rounded p-2.5 flex flex-col justify-between">
          <span className="text-[9px] text-slate-500 uppercase flex items-center gap-1 font-bold">
            <TrendingDown className="w-3.5 h-3.5 text-red-500" /> Pérdidas USD
          </span>
          <div className="text-sm font-extrabold text-red-500 tracking-tight my-1.5">
            ${simState.usd_lost.toLocaleString()}
          </div>
          <span className="text-[8px] text-slate-650 leading-tight">
            Fugas de datos y costes operativos activos.
          </span>
        </div>

        {/* Impacto Operativo (SLA) */}
        <div className="bg-slate-950 border border-slate-900 rounded p-2.5 flex flex-col justify-between">
          <span className="text-[9px] text-slate-500 uppercase flex items-center gap-1 font-bold">
            <Percent className="w-3.5 h-3.5 text-cyan-400" /> SLA Operativo
          </span>
          <div className="text-sm font-extrabold text-cyan-400 tracking-tight my-1.5">
            {simState.sla_percent.toFixed(1)}%
          </div>
          <span className="text-[8px] text-slate-650 leading-tight">
            Latencia por firewalls (Umbral: &gt;90%).
          </span>
        </div>

        {/* Daño Reputacional */}
        <div className="bg-slate-950 border border-slate-900 rounded p-2.5 flex flex-col justify-between">
          <span className="text-[9px] text-slate-500 uppercase flex items-center gap-1 font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-yellow-500" /> Reputación
          </span>
          <div className={`text-sm font-extrabold tracking-tight my-1.5 ${
            simState.reputation_percent > 70 ? 'text-green-500' : simState.reputation_percent > 30 ? 'text-yellow-500' : 'text-red-500'
          }`}>
            {simState.reputation_percent.toFixed(0)}%
          </div>
          <span className="text-[8px] text-slate-650 leading-tight">
            Pérdida de clientes por quiebre de confidencialidad.
          </span>
        </div>
      </div>

      {/* Resumen de Cumplimiento Regulatorio */}
      <div className="mt-3 text-[9px] font-mono border-t border-slate-900 pt-2 flex items-center justify-between text-slate-550">
        <span>SLA General: {simState.sla_percent >= 90.0 ? '✅ CUMPLIDO' : '❌ INCUMPILDO'}</span>
        <span className={infectedCount > 0 ? 'text-red-500 animate-pulse font-bold' : 'text-green-500'}>
          {infectedCount > 0 ? '● BRECHA ACTIVA DETECTADA' : '● SISTEMAS SEGUROS'}
        </span>
      </div>
    </div>
  );
};
