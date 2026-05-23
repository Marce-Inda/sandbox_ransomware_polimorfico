import React from 'react';
import { useSimStore } from '../store/useSimStore';
import { Shield, Database, Send, AlertTriangle, HelpCircle } from 'lucide-react';

export const AgentGraph: React.FC = () => {
  const { simState, selectedAgentId, selectAgent } = useSimStore();

  if (!simState) return null;

  const agents = [
    {
      id: 'EmailReceiverAgent',
      name: 'EmailReceiverAgent',
      label: 'Receptor de Correos',
      x: 150,
      y: 200,
      icon: <Shield className="w-6 h-6 text-slate-300" />,
      colorClass: 'color-cyan'
    },
    {
      id: 'DBQueryAgent',
      name: 'DBQueryAgent',
      label: 'DB Query Agent (RAG)',
      x: 400,
      y: 120,
      icon: <Database className="w-6 h-6 text-slate-300" />,
      colorClass: 'color-magenta'
    },
    {
      id: 'OutboundResponseAgent',
      name: 'OutboundResponseAgent',
      label: 'Despachador de Salida',
      x: 650,
      y: 200,
      icon: <Send className="w-6 h-6 text-slate-300" />,
      colorClass: 'color-cyan'
    }
  ];

  // Determinar color de borde/luz según estado del agente
  const getAgentStatusGlow = (status: string) => {
    switch (status) {
      case 'infected':
        return 'status-glow-infected';
      case 'suspected':
        return 'status-glow-suspected';
      default:
        return 'status-glow-healthy';
    }
  };

  const getAgentColor = (status: string) => {
    switch (status) {
      case 'infected':
        return '#ff1a1a';
      case 'suspected':
        return '#ffcc00';
      default:
        return '#00ff66';
    }
  };

  return (
    <div className="cyber-panel w-full h-full min-h-[300px] flex flex-col p-4 rounded-lg bg-slate-950/80 border-cyan-500/20">
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
        <h2 className="text-sm font-bold tracking-widest text-cyan-400 uppercase flex items-center gap-2">
          <Database className="w-4 h-4" /> Topología de Red Multi-Agente
        </h2>
        <span className="text-xs text-slate-500 font-mono">
          Eventos en cola: {simState.event_queue.length}
        </span>
      </div>

      <div className="relative flex-1 bg-slate-950 border border-slate-900 rounded overflow-hidden flex items-center justify-center">
        {/* Gráfico SVG */}
        <svg className="w-full h-full min-h-[250px]" viewBox="0 0 800 320">
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00ffff" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ff00aa" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ff00aa" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#00ffff" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* Enlaces estáticos */}
          <line x1="150" y1="200" x2="400" y2="120" stroke="url(#grad1)" strokeWidth="2" />
          <line x1="400" y1="120" x2="650" y2="200" stroke="url(#grad2)" strokeWidth="2" />
          
          {/* Si no hay least privilege, hay conexión libre directa (vulnerable) */}
          {!simState.least_privilege && (
            <line 
              x1="150" y1="200" 
              x2="650" y2="200" 
              stroke="#00ffff" 
              strokeWidth="1" 
              strokeDasharray="4,4" 
              strokeOpacity="0.3"
            />
          )}

          {/* Animación de mensajes en tránsito */}
          {simState.event_queue.map((event, idx) => {
            let start = { x: 150, y: 200 };
            let end = { x: 400, y: 120 };

            if (event.sender === 'EmailReceiverAgent' && event.receiver === 'DBQueryAgent') {
              start = { x: 150, y: 200 };
              end = { x: 400, y: 120 };
            } else if (event.sender === 'DBQueryAgent' && event.receiver === 'OutboundResponseAgent') {
              start = { x: 400, y: 120 };
              end = { x: 650, y: 200 };
            } else if (event.sender === 'ExternalUser') {
              start = { x: 50, y: 200 };
              end = { x: 150, y: 200 };
            }

            return (
              <circle
                key={event.id + idx}
                r="6"
                fill={event.status === 'infected' ? '#ff1a1a' : '#00ffff'}
                className="filter drop-shadow"
              >
                <animateMotion
                  dur="1.5s"
                  repeatCount="indefinite"
                  path={`M ${start.x} ${start.y} L ${end.x} ${end.y}`}
                />
              </circle>
            );
          })}

          {/* Nodos de Agente */}
          {agents.map((ag) => {
            const stateAg = simState.agents[ag.id];
            if (!stateAg) return null;
            const isSelected = selectedAgentId === ag.id;
            const statusColor = getAgentColor(stateAg.status);

            return (
              <g 
                key={ag.id} 
                onClick={() => selectAgent(ag.id)}
                className="cursor-pointer group"
              >
                {/* Sombra de selección */}
                {isSelected && (
                  <circle
                    cx={ag.x}
                    cy={ag.y}
                    r="40"
                    fill="none"
                    stroke="#00ffff"
                    strokeWidth="2"
                    strokeDasharray="4,2"
                    className="animate-spin"
                    style={{ transformOrigin: `${ag.x}px ${ag.y}px`, animationDuration: '8s' }}
                  />
                )}

                {/* Círculo base del nodo */}
                <circle
                  cx={ag.x}
                  cy={ag.y}
                  r="30"
                  fill="#0a0a0f"
                  stroke={statusColor}
                  strokeWidth={isSelected ? "3" : "2"}
                  className="transition-all duration-300"
                />

                {/* Glow de estado */}
                <circle
                  cx={ag.x + 22}
                  cy={ag.y - 20}
                  r="7"
                  className={getAgentStatusGlow(stateAg.status)}
                />

                {/* Etiqueta del agente */}
                <text
                  x={ag.x}
                  y={ag.y + 50}
                  textAnchor="middle"
                  fill="#e2e8f0"
                  fontSize="11"
                  className="font-mono font-bold tracking-tight select-none"
                >
                  {ag.name}
                </text>
                
                {/* Detalle del rol */}
                <text
                  x={ag.x}
                  y={ag.y + 64}
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="9"
                  className="font-mono select-none"
                >
                  {stateAg.status === 'infected' ? '⚠️ INFECCIÓN ACTIVA' : 'SANO'}
                </text>

                {/* Ícono interno */}
                <foreignObject
                  x={ag.x - 12}
                  y={ag.y - 12}
                  width="24"
                  height="24"
                  className="pointer-events-none"
                >
                  <div className="flex items-center justify-center w-full h-full text-slate-400 group-hover:text-cyan-400 transition-colors">
                    {stateAg.status === 'infected' ? <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" /> : ag.icon}
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-3 flex gap-4 text-xs font-mono justify-center border-t border-slate-900 pt-3">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block shadow-sm"></span> Sano</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block shadow-sm animate-pulse"></span> Sospechoso</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block shadow-sm animate-pulse"></span> Infectado</span>
      </div>
    </div>
  );
};
