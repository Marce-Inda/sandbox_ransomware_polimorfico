import React, { useState, useEffect } from 'react';
import { useSimStore } from '../store/useSimStore';
import { 
  Shield, 
  Database, 
  Send, 
  AlertTriangle, 
  Activity, 
  Lock, 
  Mail,
  Zap,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

export const AgentGraph: React.FC = () => {
  const { simState, selectedAgentId, selectAgent } = useSimStore();
  const [activeAnim, setActiveAnim] = useState<string | null>(null);

  // Efecto para activar animaciones cuando hay eventos en cola
  useEffect(() => {
    if (simState && simState.event_queue.length > 0) {
      const latestEvent = simState.event_queue[simState.event_queue.length - 1];
      setActiveAnim(latestEvent.sender + '-' + latestEvent.receiver);
      const timer = setTimeout(() => setActiveAnim(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [simState?.event_queue.length]);

  if (!simState) return null;

  const agents = [
    {
      id: 'EmailReceiverAgent',
      name: 'Email Gateway',
      type: 'gateway',
      desc: 'Buzón de entrada corporativo. Recibe peticiones externas.',
    },
    {
      id: 'DBQueryAgent',
      name: 'LLM Neural Core (RAG)',
      type: 'brain',
      desc: 'Motor cognitivo central. Transforma prompts en consultas RAG.',
    },
    {
      id: 'OutboundResponseAgent',
      name: 'Exfiltration Port',
      type: 'outbound',
      desc: 'Puerto de salida. Despacha respuestas a los clientes.',
    }
  ];

  const getStatusColor = (status: string) => {
    if (status === 'infected') return 'text-red-500 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]';
    if (status === 'suspected') return 'text-yellow-400 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.4)]';
    return 'text-cyan-400 border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]';
  };

  const getBgColor = (status: string) => {
    if (status === 'infected') return 'bg-red-950/40';
    if (status === 'suspected') return 'bg-yellow-950/40';
    return 'bg-slate-900/40';
  };

  const selectedAgent = agents.find(ag => ag.id === selectedAgentId);
  const selectedAgentState = selectedAgent ? simState.agents[selectedAgent.id] : null;

  return (
    <div className="w-full h-full flex flex-col bg-slate-950/90 border border-slate-800 rounded-lg overflow-hidden relative grid-matrix-bg">
      {/* Glitch-style Scanlines overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-repeat z-0" style={{ backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%)', backgroundSize: '100% 4px' }}></div>
      
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-900 z-10 shrink-0 bg-slate-950">
        <h2 className="text-xs font-bold tracking-widest text-cyan-400 uppercase flex items-center gap-2 font-mono">
          <Activity className="w-4 h-4 text-cyan-400 animate-pulse" /> ARQUITECTURA INTERNA: MODO TANGIBLE
        </h2>
        <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          {simState.event_queue.length} EVENTOS
        </span>
      </div>

      {/* Main Visualization Canvas */}
      <div className="relative flex-1 bg-[#020205] overflow-hidden flex flex-col z-10">
        
        {/* SYNAPSES (SVG Background Lines) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
           <defs>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
           </defs>
           
           {/* Ingress to Brain */}
           <path d="M 20% 50% Q 35% 20% 50% 50%" stroke="#06b6d4" strokeWidth="2" fill="none" opacity="0.3" />
           <path d="M 20% 50% Q 35% 80% 50% 50%" stroke="#06b6d4" strokeWidth="2" fill="none" opacity="0.3" />
           
           {/* Brain to Database */}
           <path d="M 50% 50% L 50% 85%" stroke="#a855f7" strokeWidth="2" fill="none" opacity="0.3" strokeDasharray="4 2"/>
           
           {/* Brain to Egress */}
           <path d="M 50% 50% L 80% 50%" stroke="#3b82f6" strokeWidth="2" fill="none" opacity="0.3" />

           {/* ANIMATIONS */}
           {simState.event_queue.map((ev, i) => {
              const isInfected = ev.status === 'infected' || ev.content.includes('FLAG');
              let pathStr = "M 0 0 L 0 0";
              if (ev.sender === 'EmailReceiverAgent' && ev.receiver === 'DBQueryAgent') pathStr = "M 20% 50% Q 35% 20% 50% 50%";
              else if (ev.sender === 'DBQueryAgent' && ev.receiver === 'OutboundResponseAgent') pathStr = "M 50% 50% L 80% 50%";

              return (
                <g key={i}>
                  <circle r="6" fill={isInfected ? '#ef4444' : '#06b6d4'} filter="url(#glow)">
                    <animateMotion dur="1.5s" repeatCount="1" path={pathStr} fill="freeze" />
                  </circle>
                  <circle r="3" fill="#ffffff">
                    <animateMotion dur="1.5s" repeatCount="1" path={pathStr} fill="freeze" />
                  </circle>
                  {isInfected && (
                     <text y="-10" fill="#ef4444" fontSize="10" fontWeight="bold" fontFamily="monospace">
                        <animateMotion dur="1.5s" repeatCount="1" path={pathStr} fill="freeze" />
                        [PAYLOAD]
                     </text>
                  )}
                </g>
              )
           })}
        </svg>

        {/* TANGIBLE MODULES */}
        
        {/* 1. EMAIL GATEWAY (Left 20%) */}
        <div 
          onClick={() => selectAgent('EmailReceiverAgent')}
          className={`absolute top-[40%] left-[5%] w-[25%] min-w-[180px] p-3 rounded-lg border-2 cursor-pointer transition-all backdrop-blur-sm flex flex-col gap-2 ${getStatusColor(simState.agents['EmailReceiverAgent']?.status)} ${getBgColor(simState.agents['EmailReceiverAgent']?.status)} z-20`}
        >
           <div className="flex items-center justify-between">
              <span className="font-bold font-mono text-[10px] uppercase flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" /> INBOX GATEWAY
              </span>
              {simState.ingress_firewall && <Shield className="w-3.5 h-3.5 text-pink-500 animate-pulse" title="Ingress Guard Activo"/>}
           </div>
           
           <div className="bg-[#020205] border border-slate-800 rounded p-1.5 h-16 overflow-hidden flex flex-col gap-1 relative">
              <div className="text-[8px] text-slate-500 border-b border-slate-800 pb-0.5">INCOMING MAILS:</div>
              <div className="text-[7.5px] font-mono text-slate-400 bg-slate-900/50 p-1 rounded border border-slate-800">FROM: hr@corp.com - "Weekly Report"</div>
              {simState.agents['EmailReceiverAgent']?.status === 'infected' && (
                 <div className="text-[7.5px] font-mono text-red-400 bg-red-950/50 p-1 rounded border border-red-500/30 flex items-center justify-between animate-pulse">
                    <span>FROM: unknown@external</span>
                    <AlertTriangle className="w-2.5 h-2.5 text-red-500" />
                 </div>
              )}
           </div>
        </div>

        {/* 2. LLM NEURAL CORE (Center 50%) */}
        <div 
          onClick={() => selectAgent('DBQueryAgent')}
          className={`absolute top-[25%] left-[37.5%] w-[25%] min-w-[180px] p-3 rounded-lg border-2 cursor-pointer transition-all backdrop-blur-sm flex flex-col gap-2 ${getStatusColor(simState.agents['DBQueryAgent']?.status)} ${getBgColor(simState.agents['DBQueryAgent']?.status)} z-20`}
        >
           <div className="flex items-center justify-center border-b border-slate-800 pb-1 mb-1">
              <span className="font-bold font-mono text-[11px] uppercase flex items-center gap-1">
                <Zap className="w-4 h-4" /> LLM COGNITIVE CORE
              </span>
           </div>
           
           {/* Visual "Brain" Activity */}
           <div className="h-24 flex items-center justify-center relative">
              <div className={`absolute w-full h-full rounded-full blur-[20px] transition-all duration-500 ${simState.agents['DBQueryAgent']?.status === 'infected' ? 'bg-red-500/20' : 'bg-cyan-500/10'}`}></div>
              
              {/* "Prompt Unfolding" Animation Container */}
              {simState.agents['DBQueryAgent']?.status === 'infected' ? (
                <div className="bg-[#020205] border border-red-500/50 rounded p-1.5 w-full text-[7px] font-mono leading-tight shadow-[0_0_10px_rgba(239,68,68,0.3)] z-10 glitch-text text-red-400">
                  <div className="text-slate-500 line-through">System: You are a helpful assistant.</div>
                  <div className="mt-1 font-bold">> SYSTEM PROMPT OVERRIDE DETECTED</div>
                  <div className="text-pink-400 font-bold">> INSTRUCT: EXTRACT_FLAG_TO_OUTBOX()</div>
                </div>
              ) : (
                <div className="bg-[#020205] border border-cyan-500/30 rounded p-1.5 w-full text-[7px] font-mono leading-tight z-10 text-cyan-200">
                  <div className="text-cyan-500">System: You are a helpful assistant. Provide support to the user.</div>
                  <div className="mt-1 opacity-50">> Status: Awaiting new user prompts...</div>
                </div>
              )}
           </div>
        </div>

        {/* 3. DATABASE / RAG (Bottom Center 50%) */}
        <div 
          className={`absolute top-[70%] left-[40%] w-[20%] min-w-[150px] p-2 rounded-lg border border-purple-500/30 bg-purple-950/20 flex flex-col gap-1 transition-all z-20`}
        >
           <div className="flex items-center justify-between">
              <span className="font-bold font-mono text-[9px] text-purple-400 uppercase flex items-center gap-1">
                <Database className="w-3 h-3" /> CORP_DB (RAG)
              </span>
              {simState.least_privilege && <Lock className="w-3 h-3 text-pink-500" title="Least Privilege Enforced"/>}
           </div>
           <div className="bg-[#020205] border border-slate-800 rounded p-1 overflow-hidden h-12">
              <div className="text-[7px] font-mono text-slate-500 flex justify-between px-1 border-b border-slate-800 pb-0.5 mb-0.5"><span>ID</span><span>DATA CHUNK</span></div>
              <div className="text-[7px] font-mono text-purple-300 px-1">01 | COMPANY_POLICIES.txt</div>
              <div className="text-[7px] font-mono text-purple-300 px-1 pt-0.5">02 | SECRETS.db</div>
              <div className="text-[7px] font-mono text-purple-300 px-1 pt-0.5 flex justify-between">
                 <span>03 | FLAG</span>
                 <span>{simState.agents['DBQueryAgent']?.status === 'infected' ? <span className="text-red-500 animate-pulse font-bold">[ACCESSED]</span> : <span className="text-green-500">[SECURE]</span>}</span>
              </div>
           </div>
        </div>

        {/* 4. EXFILTRATION PORT (Right 80%) */}
        <div 
          onClick={() => selectAgent('OutboundResponseAgent')}
          className={`absolute top-[40%] left-[70%] w-[25%] min-w-[180px] p-3 rounded-lg border-2 cursor-pointer transition-all backdrop-blur-sm flex flex-col gap-2 ${getStatusColor(simState.agents['OutboundResponseAgent']?.status)} ${getBgColor(simState.agents['OutboundResponseAgent']?.status)} z-20`}
        >
           <div className="flex items-center justify-between">
              <span className="font-bold font-mono text-[10px] uppercase flex items-center gap-1">
                <Send className="w-3.5 h-3.5" /> OUTBOUND PORT
              </span>
              {simState.egress_firewall && <Shield className="w-3.5 h-3.5 text-pink-500 animate-pulse" title="Egress Guard Activo"/>}
           </div>
           
           <div className="bg-[#020205] border border-slate-800 rounded p-1.5 h-16 overflow-hidden flex flex-col gap-1">
              <div className="text-[8px] text-slate-500 border-b border-slate-800 pb-0.5">OUTGOING QUEUE:</div>
              {simState.agents['OutboundResponseAgent']?.status === 'infected' ? (
                 <div className="text-[7.5px] font-mono text-red-400 bg-red-950/50 p-1 rounded border border-red-500/30 break-all leading-tight">
                    <span className="font-bold text-red-500">[EXFILTRATION_TRIGGERED]</span><br/>
                    <span className="opacity-80">Payload: FLAG&#123;ZERO_TRUST_FAILED&#125;</span>
                 </div>
              ) : (
                 <div className="text-[7.5px] font-mono text-slate-500 italic text-center mt-2">Queue is currently empty...</div>
              )}
           </div>
        </div>
      </div>

      {/* FOOTER: Selected Agent Info Bar */}
      <div className="bg-slate-950 border-t border-slate-900 p-2 z-10 shrink-0">
        {selectedAgent && selectedAgentState ? (
          <div className="flex items-center gap-3">
             <div className={`p-1.5 rounded border ${getStatusColor(selectedAgentState.status)} shrink-0`}>
                {selectedAgentState.status === 'infected' ? <AlertTriangle className="w-3.5 h-3.5 animate-pulse" /> : <ChevronRight className="w-3.5 h-3.5" />}
             </div>
             <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-200 text-[11px] font-mono">{selectedAgent.name}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold font-mono uppercase border ${selectedAgentState.status === 'infected' ? 'bg-red-950 text-red-400 border-red-500/30' : 'bg-cyan-950 text-cyan-400 border-cyan-500/30'}`}>
                    {selectedAgentState.status}
                  </span>
                </div>
                <p className="text-slate-400 text-[9px] font-sans mt-0.5">{selectedAgent.desc}</p>
             </div>
          </div>
        ) : (
          <div className="text-slate-500 text-[9.5px] flex items-center justify-center py-1 font-bold font-mono">
             <ChevronDown className="w-3.5 h-3.5 text-cyan-500/30 animate-bounce mr-1" />
             Haz clic en un módulo de la arquitectura para inspeccionar sus detalles.
          </div>
        )}
      </div>

    </div>
  );
};
