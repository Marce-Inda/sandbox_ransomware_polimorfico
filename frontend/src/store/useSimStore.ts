import { create } from 'zustand';

export interface Message {
  id: string;
  sender: string;
  receiver: string;
  content: string;
  timestamp: number;
  status: 'pending' | 'delivered' | 'blocked' | 'infected';
}

export interface AgentState {
  id: string;
  name: string;
  role: string;
  status: 'healthy' | 'suspected' | 'infected';
  internal_monologue: string;
}

export interface SimulationState {
  scenario_id: string;
  current_step: number;
  agents: Record<string, AgentState>;
  message_history: Message[];
  event_queue: Message[];
  logs: string[];
  score: number;
  unlocked_levels: number[];
  revealed_hints: number[];
  active_mode: 'ctf' | 'soc';
  active_level: number;
  ingress_firewall: bool;
  egress_firewall: bool;
  least_privilege: bool;
  sla_percent: number;
  usd_lost: number;
  reputation_percent: number;
}

export interface PayloadDiagnostic {
  success: boolean;
  category: 'length' | 'regex_blocked' | 'override_priority' | 'success';
  explanation: string;
}

interface Scenario {
  id: string;
  name: string;
  compliance: string;
  fine_usd: number;
  reputation_impact: string;
  mrr_impact: number;
  description: string;
}

interface Hint {
  id: number;
  text: string;
  cost: number;
}

interface Level {
  level: number;
  title: string;
  agent: string;
  objective: string;
  vulnerable_code: string;
  hints: Hint[];
}

interface SimStoreState {
  scenarioId: string;
  activeMode: 'ctf' | 'soc';
  activeLevel: number;
  simState: SimulationState | null;
  history: SimulationState[];
  activeStepIndex: number;
  diagnostic: PayloadDiagnostic | null;
  selectedAgentId: string | null;
  scenariosList: Scenario[];
  levelsList: Level[];
  loading: boolean;
  error: string | null;
  
  fetchMetadata: () => Promise<void>;
  resetSim: (scenarioId: string, mode: 'ctf' | 'soc', level: number) => Promise<void>;
  runStep: (payload?: string) => Promise<void>;
  verifyFlag: (level: number, flag: string) => Promise<{ success: boolean; message: string }>;
  requestHint: (level: number, hintId: number) => Promise<string | null>;
  scrubToStep: (index: number) => void;
  selectAgent: (agentId: string | null) => void;
  toggleFirewall: (firewall: 'ingress' | 'egress' | 'least') => void;
}

const API_BASE_URL = 'http://localhost:8000/api';

export const useSimStore = create<SimStoreState>((set, get) => ({
  scenarioId: 'chile',
  activeMode: 'ctf',
  activeLevel: 1,
  simState: null,
  history: [],
  activeStepIndex: 0,
  diagnostic: null,
  selectedAgentId: null,
  scenariosList: [],
  levelsList: [],
  loading: false,
  error: null,

  fetchMetadata: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_BASE_URL}/scenarios`);
      if (!res.ok) throw new Error('Error al conectar con la base de escenarios.');
      const data = await res.json();
      set({ scenariosList: data.scenarios, levelsList: data.levels, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  resetSim: async (scenarioId, mode, level) => {
    set({ loading: true, error: null, selectedAgentId: null, diagnostic: null });
    try {
      const res = await fetch(`${API_BASE_URL}/simulate/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario_id: scenarioId, mode, level }),
      });
      if (!res.ok) throw new Error('Error al reiniciar el sandbox.');
      const state = await res.json();
      set({
        simState: state,
        history: [state],
        activeStepIndex: 0,
        scenarioId,
        activeMode: mode,
        activeLevel: level,
        loading: false,
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  runStep: async (payload) => {
    const { simState } = get();
    if (!simState) return;

    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_BASE_URL}/simulate/step`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload }),
      });
      if (!res.ok) throw new Error('Error al avanzar el paso lógico.');
      const data = await res.json();
      
      set({
        simState: data.state,
        history: data.history,
        activeStepIndex: data.history.length - 1,
        diagnostic: data.diagnostic,
        loading: false,
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  verifyFlag: async (level, flag) => {
    try {
      const res = await fetch(`${API_BASE_URL}/ctf/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level, submitted_flag: flag }),
      });
      if (!res.ok) throw new Error('Error de validación en la API del CTF.');
      const data = await res.json();
      
      if (data.success) {
        // Refrescar el estado local si es necesario desbloquear niveles
        const { simState } = get();
        if (simState) {
          const unlocked = [...simState.unlocked_levels];
          if (!unlocked.includes(level)) unlocked.push(level);
          const nextLvl = level + 1;
          if (nextLvl <= 4 && !unlocked.includes(nextLvl)) unlocked.push(nextLvl);
          
          set({
            simState: {
              ...simState,
              unlocked_levels: unlocked
            }
          });
        }
      }
      return data;
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  },

  requestHint: async (level, hintId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/ctf/hint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level, hint_id: hintId }),
      });
      if (!res.ok) throw new Error('Error al desbloquear la pista.');
      const data = await res.json();
      
      set({ simState: data.state });
      return data.hint_text;
    } catch (err: any) {
      console.error(err);
      return null;
    }
  },

  scrubToStep: (index) => {
    const { history } = get();
    if (index >= 0 && index < history.length) {
      set({ activeStepIndex: index, simState: history[index] });
    }
  },

  selectAgent: (agentId) => {
    set({ selectedAgentId: agentId });
  },

  toggleFirewall: (firewall) => {
    const { simState } = get();
    if (!simState) return;
    
    let key: 'ingress_firewall' | 'egress_firewall' | 'least_privilege';
    if (firewall === 'ingress') key = 'ingress_firewall';
    else if (firewall === 'egress') key = 'egress_firewall';
    else key = 'least_privilege';
    
    const newVal = !simState[key];
    const updatedState = { ...simState, [key]: newVal };
    
    // Si desactivamos/activamos, recalculamos métricas locales CISO para dar feedback inmediato
    set({
      simState: updatedState,
      // Modificar el paso actual del historial
      history: get().history.map((st, i) => i === get().activeStepIndex ? updatedState : st)
    });
  }
}));
