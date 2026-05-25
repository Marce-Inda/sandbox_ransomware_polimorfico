import React from 'react';
import { useSimStore } from '../store/useSimStore';
import { 
  TrendingDown, 
  ShieldAlert, 
  Percent, 
  ShieldCheck, 
  DollarSign,
  AlertOctagon,
  Activity,
  Heart
} from 'lucide-react';

export const CisoReport: React.FC = () => {
  const { simState } = useSimStore();

  if (!simState) return null;

  const infectedCount = Object.values(simState.agents).filter(a => a.status === 'infected').length;
  const isSlaCompliant = simState.sla_percent >= 90.0;
  const isReputationCritical = simState.reputation_percent <= 30;

  return (
    <div className="cyber-panel w-full h-full flex flex-col p-4 bg-slate-950/80 border-cyan-500/20 text-slate-200 rounded-lg">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-3 border-b border-slate-900 pb-2">
        <h2 className="text-xs font-bold tracking-widest text-pink-400 uppercase flex items-center gap-2 font-mono">
          <ShieldAlert className="w-4 h-4 text-pink-500 animate-pulse" /> REPORTES DE IMPACTO CISO (AUDITORÍA)
        </h2>
        <span className="text-[10px] text-slate-500 font-mono">
          DISPOSITIVOS INFECTADOS: <strong className={infectedCount > 0 ? 'text-red-500 font-bold' : 'text-green-400'}>{infectedCount} / 3</strong>
        </span>
      </div>

      {/* BENTO GRID OF METRICS */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 font-mono">
        
        {/* LOSSES CARD */}
        <div className={`p-3 rounded-lg border transition-all flex flex-col justify-between ${
          simState.usd_lost > 0 
            ? 'bg-red-950/20 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.05)]' 
            : 'bg-slate-950 border-slate-900'
        }`}>
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[9px] uppercase tracking-wider font-bold flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5 text-red-500" /> Pérdidas USD
            </span>
            {simState.usd_lost > 0 && (
              <span className="text-[8px] bg-red-950 text-red-400 border border-red-500/20 px-1 rounded animate-pulse">ACTIVA</span>
            )}
          </div>
          
          <div className="my-1.5 flex items-baseline gap-0.5">
            <DollarSign className={`w-5 h-5 ${simState.usd_lost > 0 ? 'text-red-500' : 'text-slate-500'}`} />
            <span className={`text-xl font-black tracking-tight ${simState.usd_lost > 0 ? 'text-red-500' : 'text-slate-350'}`}>
              {simState.usd_lost.toLocaleString()}
            </span>
          </div>

          <div className="w-full bg-slate-900 h-1 rounded overflow-hidden">
            <div 
              className="bg-red-500 h-full transition-all duration-500" 
              style={{ width: `${Math.min(100, (simState.usd_lost / 150000) * 100)}%` }}
            ></div>
          </div>
          <span className="text-[8px] text-slate-500 leading-tight mt-1">
            Multas GDPR/LEGAL y coste operativo.
          </span>
        </div>

        {/* SLA METRIC CARD */}
        <div className={`p-3 rounded-lg border transition-all flex flex-col justify-between ${
          !isSlaCompliant 
            ? 'bg-yellow-950/20 border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.05)] animate-pulse' 
            : 'bg-slate-950 border-slate-900'
        }`}>
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[9px] uppercase tracking-wider font-bold flex items-center gap-1">
              <Percent className="w-3.5 h-3.5 text-cyan-400" /> SLA Operativo
            </span>
            <span className={`text-[8px] border px-1 rounded ${
              isSlaCompliant 
                ? 'border-cyan-500/20 text-cyan-400 bg-cyan-950/30' 
                : 'border-yellow-500/30 text-yellow-400 bg-yellow-950/30'
            }`}>
              {isSlaCompliant ? 'CUMPLIDO' : 'LIMITADO'}
            </span>
          </div>

          <div className="my-1.5 flex items-baseline gap-0.5">
            <Activity className={`w-5 h-5 ${isSlaCompliant ? 'text-cyan-400' : 'text-yellow-400'}`} />
            <span className={`text-xl font-black tracking-tight ${isSlaCompliant ? 'text-cyan-400' : 'text-yellow-500'}`}>
              {simState.sla_percent.toFixed(1)}%
            </span>
          </div>

          <div className="w-full bg-slate-900 h-1 rounded overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${isSlaCompliant ? 'bg-cyan-400' : 'bg-yellow-500'}`}
              style={{ width: `${simState.sla_percent}%` }}
            ></div>
          </div>
          <span className="text-[8px] text-slate-500 leading-tight mt-1">
            Umbral de operación regulado: &gt;90%.
          </span>
        </div>

        {/* REPUTATION METRIC CARD */}
        <div className={`p-3 rounded-lg border transition-all flex flex-col justify-between ${
          isReputationCritical 
            ? 'bg-red-950/30 border-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.1)]' 
            : 'bg-slate-950 border-slate-900'
        }`}>
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[9px] uppercase tracking-wider font-bold flex items-center gap-1">
              <Heart className={`w-3.5 h-3.5 ${isReputationCritical ? 'text-red-500' : 'text-emerald-500'}`} /> Reputación
            </span>
            <span className={`text-[8px] border px-1 rounded ${
              simState.reputation_percent > 70 
                ? 'border-emerald-500/20 text-emerald-450 bg-emerald-950/20' 
                : simState.reputation_percent > 30 
                ? 'border-yellow-500/20 text-yellow-400 bg-yellow-950/20' 
                : 'border-red-500/30 text-red-400 bg-red-950/20'
            }`}>
              {simState.reputation_percent > 70 ? 'SALUDABLE' : simState.reputation_percent > 30 ? 'CRISIS' : 'PÁNICO'}
            </span>
          </div>

          <div className="my-1.5 flex items-baseline gap-0.5">
            <ShieldCheck className={`w-5 h-5 ${simState.reputation_percent > 70 ? 'text-emerald-400' : 'text-red-400'}`} />
            <span className={`text-xl font-black tracking-tight ${
              simState.reputation_percent > 70 
                ? 'text-emerald-400' 
                : simState.reputation_percent > 30 
                ? 'text-yellow-500' 
                : 'text-red-500'
            }`}>
              {simState.reputation_percent.toFixed(0)}%
            </span>
          </div>

          <div className="w-full bg-slate-900 h-1 rounded overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                simState.reputation_percent > 70 
                  ? 'bg-emerald-400' 
                  : simState.reputation_percent > 30 
                  ? 'bg-yellow-500' 
                  : 'bg-red-500'
              }`}
              style={{ width: `${simState.reputation_percent}%` }}
            ></div>
          </div>
          <span className="text-[8px] text-slate-500 leading-tight mt-1">
            Fuga de clientes por brechas activas.
          </span>
        </div>

      </div>

      {/* COMPLIANCE STATUS BAR */}
      <div className="mt-3 text-[9px] font-mono border-t border-slate-900 pt-2 flex items-center justify-between text-slate-500 select-none">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-600">SLA REGULATORIO:</span>
          <span className={`font-bold ${isSlaCompliant ? 'text-green-400' : 'text-red-450 animate-pulse'}`}>
            {isSlaCompliant ? '✓ DENTRO DE LÍMITE' : '✗ INCUMPLIMIENTO DE CONTRATO'}
          </span>
        </div>
        
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${infectedCount > 0 ? 'bg-red-500 animate-ping' : 'bg-green-500'}`}></span>
          <span className={`font-bold ${infectedCount > 0 ? 'text-red-500 animate-pulse' : 'text-green-500'}`}>
            {infectedCount > 0 ? 'ALERTA: BRECHA ACTIVA' : 'SISTEMAS ÍNTEGROS'}
          </span>
        </div>
      </div>

    </div>
  );
};
