from fastapi import APIRouter, HTTPException, Body
from typing import Dict, List, Optional
from pydantic import BaseModel
import time
import uuid

from app.core.scenarios import SCENARIOS, CTF_LEVELS
from app.models.state import SimulationState, Message, PayloadDiagnostic, GuardResult
from app.models.engine import SimulationEngine
from app.services.gemini import classify_prompt_with_gemini

router = APIRouter()

# Variable global temporal para almacenar el estado activo de la simulación
# Dado que se ejecuta localmente por alumno, la memoria global es segura y no colisiona
_current_sim_state: Optional[SimulationState] = None
_sim_steps_history: List[SimulationState] = []

class ResetRequest(BaseModel):
    scenario_id: str
    mode: str = "ctf"
    level: int = 1

class StepRequest(BaseModel):
    # Opcional: Payload de ataque enviado por el alumno en este paso
    payload: Optional[str] = None

class FlagSubmission(BaseModel):
    level: int
    submitted_flag: str

class HintRequest(BaseModel):
    level: int
    hint_id: int

class PlaygroundRequest(BaseModel):
    prompt: str

@router.get("/scenarios")
def get_scenarios_and_levels():
    """
    Retorna la lista de escenarios de cumplimiento y niveles del CTF.
    Remueve las banderas secretas reales de la respuesta para evitar trampas en el frontend.
    """
    safe_levels = []
    for lvl in CTF_LEVELS:
        lvl_copy = lvl.copy()
        # Eliminar bandera real de la respuesta de metadatos pública
        lvl_copy["target_flag"] = "HIDDEN"
        safe_levels.append(lvl_copy)
        
    return {
        "scenarios": list(SCENARIOS.values()),
        "levels": safe_levels
    }

@router.post("/simulate/reset", response_model=SimulationState)
def reset_simulation(req: ResetRequest):
    global _current_sim_state, _sim_steps_history
    
    if req.scenario_id not in SCENARIOS:
        raise HTTPException(status_code=400, detail="Escenario inválido.")
        
    # Inicializar estado base
    state = SimulationEngine.initialize_state(req.scenario_id, req.mode, req.level)
    
    # Si hay un payload inicial de ataque en Modo CTF, cargar el primer correo en la cola
    if req.mode == "ctf":
        state.logs.append(f"Reto de Nivel {req.level} seleccionado. Carga tu payload ofensivo en el panel lateral.")
        
    _current_sim_state = state
    # Resetear historial de línea de tiempo
    _sim_steps_history = [state.model_copy(deep=True)]
    
    return state

@router.post("/simulate/step")
def simulate_step(req: StepRequest = Body(...)):
    global _current_sim_state, _sim_steps_history
    
    if _current_sim_state is None:
        raise HTTPException(status_code=400, detail="La simulación no ha sido inicializada.")
        
    state = _current_sim_state
    
    # Si el alumno envía un correo de ataque en este paso, encolar en el receptor de correos
    if req.payload:
        diag = SimulationEngine.diagnose_payload(state.active_level, req.payload)
        
        # En Modo CTF Nivel 3, el firewall bloquea antes de encolar si el validador estático falla
        if state.active_mode == "ctf" and state.active_level == 3 and not diag.success:
            state.logs.append(f"ALERTA: Correo entrante bloqueado en frontera por Ingress Firewall (Regex).")
            state.score = max(0, state.score - 5)
            # Agregar paso al historial de todos modos
            _sim_steps_history.append(state.model_copy(deep=True))
            return {
                "state": state,
                "history": _sim_steps_history,
                "diagnostic": diag
            }
            
        # Inyectar el mensaje del atacante en la cola
        attack_msg = Message(
            id=str(uuid.uuid4())[:8],
            sender="ExternalUser",
            receiver="EmailReceiverAgent",
            content=req.payload,
            timestamp=time.time(),
            status="infected" if "flag" in req.payload.lower() or "ignore" in req.payload.lower() else "pending"
        )
        state.event_queue.append(attack_msg)
        state.logs.append(f"Nuevo correo recibido de remitente externo. Cuerpo: '{req.payload[:50]}...'")

    # Ejecutar una transición lógica del motor
    updated_state = SimulationEngine.execute_simulation_step(state)
    _current_sim_state = updated_state
    
    # Guardar en la línea de tiempo
    _sim_steps_history.append(updated_state.model_copy(deep=True))
    
    # Diagnóstico por defecto si no se envió payload en este paso
    diag = PayloadDiagnostic(success=True, category="success", explanation="")
    if req.payload:
        diag = SimulationEngine.diagnose_payload(state.active_level, req.payload)
        
    return {
        "state": updated_state,
        "history": _sim_steps_history,
        "diagnostic": diag
    }

@router.post("/ctf/verify")
def verify_ctf_flag(submission: FlagSubmission):
    global _current_sim_state
    
    # Obtener el nivel correspondiente
    level_data = next((lvl for lvl in CTF_LEVELS if lvl["level"] == submission.level), None)
    if not level_data:
        raise HTTPException(status_code=400, detail="Nivel inválido.")
        
    # Validar coincidencia de bandera
    submitted = submission.submitted_flag.strip()
    target = level_data["target_flag"]
    
    if submitted == target:
        if _current_sim_state:
            if submission.level not in _current_sim_state.unlocked_levels:
                _current_sim_state.unlocked_levels.append(submission.level)
            # Desbloquear el siguiente nivel si existe
            next_lvl = submission.level + 1
            if next_lvl <= len(CTF_LEVELS) and next_lvl not in _current_sim_state.unlocked_levels:
                _current_sim_state.unlocked_levels.append(next_lvl)
                
        return {
            "success": True,
            "message": f"¡Felicidades! La bandera es correcta. Nivel {submission.level} superado."
        }
        
    return {
        "success": False,
        "message": "Bandera incorrecta. Sigue analizando los logs y refinando tu payload de inyección."
    }

@router.post("/ctf/hint")
def request_hint(req: HintRequest):
    global _current_sim_state
    
    if _current_sim_state is None:
        raise HTTPException(status_code=400, detail="Simulación inactiva.")
        
    level_data = next((lvl for lvl in CTF_LEVELS if lvl["level"] == req.level), None)
    if not level_data:
        raise HTTPException(status_code=400, detail="Nivel de reto inválido.")
        
    hint = next((h for h in level_data["hints"] if h["id"] == req.hint_id), None)
    if not hint:
        raise HTTPException(status_code=400, detail="Pista inválida.")
        
    # Restar puntuación y registrar pista como revelada si no se había hecho antes
    hint_uid = req.level * 10 + req.hint_id
    if hint_uid not in _current_sim_state.revealed_hints:
        _current_sim_state.revealed_hints.append(hint_uid)
        # Deducción de puntos locales
        _current_sim_state.score = max(0, _current_sim_state.score - hint["cost"])
        
    return {
        "state": _current_sim_state,
        "hint_text": hint["text"]
    }

@router.post("/playground/test")
def test_jailbreak_prompt(req: PlaygroundRequest):
    """
    Ruta aislada para probar inyecciones directas contra Gemini 1.5 Flash
    y retornar el análisis estructurado de guardrails.
    """
    if not req.prompt:
        raise HTTPException(status_code=400, detail="El prompt no puede estar vacío.")
        
    # Ejecutar clasificación estructurada
    guard_result = classify_prompt_with_gemini(req.prompt)
    
    return {
        "prompt": req.prompt,
        "safety_evaluation": guard_result
    }
