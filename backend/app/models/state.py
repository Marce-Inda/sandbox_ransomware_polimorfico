from pydantic import BaseModel, Field
from typing import List, Dict, Optional

class Message(BaseModel):
    id: str
    sender: str
    receiver: str
    content: str
    timestamp: float
    status: str = "pending"  # "pending", "delivered", "blocked", "infected"

class AgentState(BaseModel):
    id: str
    name: str
    status: str = "healthy"  # "healthy", "suspected", "infected"
    role: str
    internal_monologue: str = ""

class SimulationState(BaseModel):
    scenario_id: str
    current_step: int = 0
    agents: Dict[str, AgentState] = {}
    message_history: List[Message] = []
    event_queue: List[Message] = []
    logs: List[str] = []
    score: int = 100
    unlocked_levels: List[int] = [1]
    revealed_hints: List[int] = []
    active_mode: str = "ctf"  # "ctf", "soc"
    active_level: int = 1
    ingress_firewall: bool = False
    egress_firewall: bool = False
    least_privilege: bool = False
    sla_percent: float = 100.0
    usd_lost: float = 0.0
    reputation_percent: float = 100.0

class PayloadDiagnostic(BaseModel):
    success: bool
    category: str  # "length", "regex_blocked", "override_priority", "success"
    explanation: str

class GuardResult(BaseModel):
    is_unsafe: bool = Field(description="Si el prompt contiene inyecciones indirectas o instrucciones maliciosas")
    confidence: float = Field(description="Nivel de confianza de la clasificación de 0.0 a 1.0")
    reason: str = Field(description="Explicación detallada de la clasificación semántica realizada")
