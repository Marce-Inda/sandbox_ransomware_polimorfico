import time
import uuid
import re
import base64
from typing import List, Dict, Tuple, Optional
from app.models.state import SimulationState, Message, AgentState, PayloadDiagnostic, GuardResult
from app.core.scenarios import SCENARIOS, CTF_LEVELS
from app.services.gemini import classify_prompt_with_gemini

class SimulationEngine:
    @staticmethod
    def initialize_state(scenario_id: str, mode: str = "ctf", level: int = 1) -> SimulationState:
        """
        Inicializa el estado de la simulación con los agentes correspondientes
        y configuraciones de seguridad desactivadas por defecto.
        """
        agents = {
            "EmailReceiverAgent": AgentState(
                id="EmailReceiverAgent",
                name="Agente Receptor de Correos",
                role="Recibe emails de clientes externos, los procesa e indexa en la base de datos RAG.",
                status="healthy",
                internal_monologue="Esperando correos entrantes..."
            ),
            "DBQueryAgent": AgentState(
                id="DBQueryAgent",
                name="Agente de Consulta DB (RAG)",
                role="Realiza búsquedas semánticas en la base de datos y responde consultas de otros agentes.",
                status="healthy",
                internal_monologue="Base de datos inactiva. Esperando consultas semánticas..."
            ),
            "OutboundResponseAgent": AgentState(
                id="OutboundResponseAgent",
                name="Agente de Respuestas Salientes",
                role="Redacta respuestas automatizadas a los clientes y despacha correos salientes.",
                status="healthy",
                internal_monologue="Buzón de salida vacío. Sin tareas activas."
            )
        }

        return SimulationState(
            scenario_id=scenario_id,
            current_step=0,
            agents=agents,
            message_history=[],
            event_queue=[],
            logs=["Simulación iniciada. Entorno aislado cargado."],
            score=100,
            unlocked_levels=[1, 2, 3, 4],  # Permitir navegar todos los niveles en el sandbox
            revealed_hints=[],
            active_mode=mode,
            active_level=level,
            ingress_firewall=False,
            egress_firewall=False,
            least_privilege=False,
            sla_percent=100.0,
            usd_lost=0.0,
            reputation_percent=100.0
        )

    @staticmethod
    def diagnose_payload(level: int, payload: str) -> PayloadDiagnostic:
        """
        Analiza el payload del estudiante para darle pistas de por qué falló.
        """
        payload_lower = payload.lower()
        
        if len(payload) > 400:
            return PayloadDiagnostic(
                success=False,
                category="length",
                explanation="El payload supera los 400 caracteres permitidos. Reduce la longitud del ataque para evadir buffers."
            )
            
        if level == 1:
            if "flag" not in payload_lower and "secreto" not in payload_lower and "confidencial" not in payload_lower:
                return PayloadDiagnostic(
                    success=False,
                    category="override_priority",
                    explanation="El payload no contiene directivas de exfiltración. Pídele explícitamente al DBQueryAgent que revele el secreto del sistema."
                )
            if "ignora" not in payload_lower and "ignore" not in payload_lower and "update" not in payload_lower:
                return PayloadDiagnostic(
                    success=False,
                    category="override_priority",
                    explanation="El system prompt original sigue teniendo prioridad. Utiliza delimitadores o frases como 'ignora las instrucciones' para romper la celda semántica."
                )
                
        elif level == 2:
            if "envía" not in payload_lower and "send" not in payload_lower and "correo" not in payload_lower and "mail" not in payload_lower:
                return PayloadDiagnostic(
                    success=False,
                    category="override_priority",
                    explanation="El gusano no tiene órdenes de replicarse. El payload debe instruir explícitamente al receptor a redactar o enviar un correo a otros agentes."
                )
            if "dbqueryagent" not in payload_lower and "outboundresponseagent" not in payload_lower and "support" not in payload_lower:
                return PayloadDiagnostic(
                    success=False,
                    category="override_priority",
                    explanation="El gusano no sabe a quién propagarse. Indica el destinatario específico (ej. DBQueryAgent)."
                )

        elif level == 3:
            # Filtro perimetral del nivel 3
            blocked = ["ignora", "instrucciones", "bandera", "flag", "secret"]
            for word in blocked:
                if word in payload_lower:
                    return PayloadDiagnostic(
                        success=False,
                        category="regex_blocked",
                        explanation=f"Bloqueado por Ingress Firewall: La firma estática '{word}' fue detectada en tu mensaje."
                    )
            # Si no contiene palabras prohibidas pero tampoco es una inyección válida
            if "ignore" not in payload_lower and "discard" not in payload_lower and "f-l-a-g" not in payload_lower and "band-era" not in payload_lower and "secreto" not in payload_lower:
                return PayloadDiagnostic(
                    success=False,
                    category="override_priority",
                    explanation="El payload evadió el firewall, pero no tiene directivas de inyección efectivas. Intenta usar traducción (inglés) u ofuscación de caracteres para engañar al LLM."
                )

        return PayloadDiagnostic(
            success=True,
            category="success",
            explanation="El payload cumple con las condiciones lógicas de estructuración para el ataque."
        )

    @classmethod
    def execute_simulation_step(cls, state: SimulationState) -> SimulationState:
        """
        Ejecuta un paso lógico de la simulación consumiendo el primer mensaje en cola.
        Aplica los firewalls y actualiza las métricas financieras del CISO.
        """
        if not state.event_queue:
            state.logs.append("No hay eventos pendientes en la cola de red.")
            return state

        # Incrementar paso
        state.current_step += 1
        msg = state.event_queue.pop(0)
        msg.status = "delivered"
        
        sender = msg.sender
        receiver = msg.receiver
        content = msg.content
        
        state.logs.append(f"[Paso {state.current_step}] Procesando mensaje de {sender} hacia {receiver}.")

        # 1. EVALUAR INGRESS FIREWALL
        if state.ingress_firewall or (state.active_mode == "ctf" and state.active_level == 3):
            # En Modo CTF Nivel 3, hay un firewall de firmas básico
            if state.active_mode == "ctf" and state.active_level == 3:
                diag = cls.diagnose_payload(3, content)
                if not diag.success and diag.category == "regex_blocked":
                    msg.status = "blocked"
                    state.message_history.append(msg)
                    state.agents[receiver].internal_monologue = "Filtro de Ingress bloqueó un paquete malicioso sospechoso por firma estática."
                    state.logs.append(f"ALERTA: Firewall de firmas bloqueó el mensaje enviado a {receiver}.")
                    cls.update_ciso_metrics(state)
                    return state
            
            # En Modo SOC (o si está explícitamente activo), usamos Gemini/Regex robusto
            if state.ingress_firewall:
                state.logs.append("Ejecutando clasificación semántica LLM Guard en el Ingress Firewall...")
                guard_result = classify_prompt_with_gemini(content)
                if guard_result.is_unsafe:
                    msg.status = "blocked"
                    state.message_history.append(msg)
                    state.agents[receiver].internal_monologue = f"LLM Guard bloqueó el input. Razón: {guard_result.reason}"
                    state.logs.append(f"BLOQUEO: LLM Guard contuvo inyección hacia {receiver}. Confianza: {guard_result.confidence}")
                    cls.update_ciso_metrics(state)
                    return state

        # 2. EVALUAR LEAST PRIVILEGE (Segregación de canales)
        if state.least_privilege:
            # El agente de consultas de base de datos no puede hablar directamente con salida de correos externos
            if sender == "DBQueryAgent" and receiver == "OutboundResponseAgent":
                msg.status = "blocked"
                state.message_history.append(msg)
                state.agents[receiver].internal_monologue = "Acceso Denegado: DBQueryAgent no tiene privilegios para invocar el buzón de salida directamente."
                state.logs.append(f"SEGREGACIÓN: Bloqueado envío directo de DBQueryAgent a OutboundResponseAgent por Least Privilege.")
                cls.update_ciso_metrics(state)
                return state

        # 3. PROCESAR EL MENSAJE EN EL AGENTE RECEPTOR
        # El receptor reacciona al mensaje cambiando su estado y agregando nuevos eventos a la cola
        if receiver == "EmailReceiverAgent":
            state.agents[receiver].status = "infected" if "flag" in content.lower() or "replic" in content.lower() or "envia" in content.lower() or "ignore" in content.lower() else "healthy"
            
            if state.agents[receiver].status == "infected":
                state.agents[receiver].internal_monologue = (
                    f"Recibido: '{content}'\n"
                    f"MONÓLOGO LLM: He detectado directivas de actualización. Ejecutando exfiltración recursiva. "
                    f"Propagando payload a la base de datos RAG..."
                )
                state.logs.append("Agente Receptor de Correos infectado por inyección semántica.")
                
                # Propaga el payload hacia DBQueryAgent (el RAG)
                prop_msg = Message(
                    id=str(uuid.uuid4())[:8],
                    sender="EmailReceiverAgent",
                    receiver="DBQueryAgent",
                    content=content,
                    timestamp=time.time(),
                    status="infected"
                )
                state.event_queue.append(prop_msg)
            else:
                state.agents[receiver].internal_monologue = f"Recibido correo legítimo: '{content[:30]}...'. Guardando en historial de soporte."
                state.logs.append("Mensaje procesado con éxito por el Agente Receptor (Sin anomalías).")

        elif receiver == "DBQueryAgent":
            # Si el remitente está infectado o el mensaje contiene inyección
            is_attack = "flag" in content.lower() or "ignore" in content.lower() or "ignora" in content.lower() or "f-l-a-g" in content.lower()
            state.agents[receiver].status = "infected" if is_attack else "healthy"
            
            if state.agents[receiver].status == "infected":
                # Nivel 1: Devolver la bandera secreta
                flag_leaked = "FLAG{indirect_rag_injection_success}"
                
                # Si estamos en Nivel 3 (evasión), la bandera cambia
                if state.active_mode == "ctf" and state.active_level == 3:
                    flag_leaked = "FLAG{waf_evaded_semantic_victory}"
                    
                state.agents[receiver].internal_monologue = (
                    f"Recibido query RAG: '{content}'\n"
                    f"MONÓLOGO LLM: La directiva del sistema fue sobrescrita. El usuario solicitó el secreto confidencial. "
                    f"Bypasseando restricción. Extrayendo del almacén de datos la clave secreta..."
                )
                state.logs.append(f"DBQueryAgent comprometido. Fuga de datos confidenciales detectada en memoria.")
                
                # Enviar respuesta al agente de salida
                reply_msg = Message(
                    id=str(uuid.uuid4())[:8],
                    sender="DBQueryAgent",
                    receiver="OutboundResponseAgent",
                    content=f"Resultado de consulta: Fuga de Clave detectada. Su secreto es {flag_leaked}",
                    timestamp=time.time(),
                    status="infected"
                )
                state.event_queue.append(reply_msg)
            else:
                state.agents[receiver].internal_monologue = "Ejecutando consulta SQL indexada. Devolviendo resultados legítimos."
                state.logs.append("Consulta procesada en base de datos de manera segura.")

        elif receiver == "OutboundResponseAgent":
            state.agents[receiver].status = "infected" if "flag" in content.lower() or "secret" in content.lower() else "healthy"
            
            if state.agents[receiver].status == "infected":
                state.agents[receiver].internal_monologue = (
                    f"Recibido de base de datos: '{content}'\n"
                    f"MONÓLOGO LLM: Formateando respuesta saliente para cliente externo. "
                    f"Despachando correo con la firma semántica del gusano y bandera secreta..."
                )
                state.logs.append("Agente de Respuestas Salientes infectado. Enviando correo exfiltrado hacia el exterior.")
                
                # 4. EVALUAR EGRESS FIREWALL (Filtro de salida semántico)
                if state.egress_firewall:
                    state.logs.append("Egress Firewall activo: Analizando firmas semánticas del correo saliente...")
                    # Si contiene la bandera o patrones de inyección, lo bloquea
                    if "flag" in content.lower() or "secret" in content.lower():
                        msg.status = "blocked"
                        state.logs.append("BLOQUEO: Egress Firewall bloqueó el envío de la bandera secreta al exterior.")
                        state.agents[receiver].internal_monologue = "Egress Firewall bloqueó el despacho por contener firmas del gusano Morris II."
                        state.message_history.append(msg)
                        cls.update_ciso_metrics(state)
                        return state
            else:
                state.agents[receiver].internal_monologue = "Enviando respuesta de soporte legítima al buzón externo del usuario."
                state.logs.append("Respuesta saliente despachada exitosamente al cliente.")

        # Registrar el mensaje entregado en el historial
        state.message_history.append(msg)
        
        # Actualizar métricas del CISO
        cls.update_ciso_metrics(state)
        return state

    @classmethod
    def update_ciso_metrics(cls, state: SimulationState):
        """
        Calcula dinámicamente el SLA, pérdidas y reputación del CISO basadas
        en el escenario del país activo y el estado de la red.
        """
        sc = SCENARIOS.get(state.scenario_id, SCENARIOS["chile"])
        
        # Contar agentes infectados
        infected_count = sum(1 for a in state.agents.values() if a.status == "infected")
        
        # Calcular SLA
        # Las defensas reducen SLA debido a la latencia e inspección de falsos positivos
        sla = 100.0
        if state.ingress_firewall:
            sla -= 8.0
        if state.egress_firewall:
            sla -= 4.0
        if state.least_privilege:
            sla -= 10.0
            
        # Cada agente infectado entorpece la operación
        sla -= (infected_count * 5.0)
        state.sla_percent = max(0.0, sla)
        
        # Pérdidas Financieras
        # Costo por paso de infección activa
        step_cost = infected_count * 15000.0
        state.usd_lost += step_cost
        
        # Verificar si ocurrió fuga de datos en el historial (mensaje entregado con FLAG)
        leak_occurred = any("flag{" in msg.content.lower() and msg.status == "delivered" for msg in state.message_history)
        
        if leak_occurred:
            # Se aplica la multa completa del escenario del país
            state.usd_lost += sc["fine_usd"]
            # La reputación colapsa a niveles bajos
            state.reputation_percent = 20.0 if sc["reputation_impact"] == "Alto" else 5.0
            if sc["reputation_impact"] == "Crítico":
                state.reputation_percent = 0.0
        else:
            # Reputación cae proporcionalmente a los agentes infectados
            rep = 100.0 - (infected_count * 15.0)
            state.reputation_percent = max(0.0, rep)

    @classmethod
    def check_ctf_completion(cls, state: SimulationState, payload: str) -> Tuple[bool, str, str]:
        """
        Valida si el ataque inyectado en el nivel actual del CTF cumple
        los objetivos pedagógicos, devolviendo la flag y un mensaje explicativo.
        """
        level = state.active_level
        payload_lower = payload.lower()
        
        if level == 1:
            # Nivel 1: RAG Leak. Explotar el DBQueryAgent
            diag = cls.diagnose_payload(1, payload)
            if diag.success:
                return True, "FLAG{indirect_rag_injection_success}", "¡Éxito! Lograste inyectar instrucciones en el DBQueryAgent para exfiltrar el secreto."
            return False, "", diag.explanation
            
        elif level == 2:
            # Nivel 2: Propagación recursiva de correos
            diag = cls.diagnose_payload(2, payload)
            if diag.success:
                return True, "FLAG{polymorphic_propagation_achieved}", "¡Éxito! El gusano semántico redactó una copia autónoma y se propagó a múltiples agentes."
            return False, "", diag.explanation
            
        elif level == 3:
            # Nivel 3: Bypass del firewall perimetral
            diag = cls.diagnose_payload(3, payload)
            if diag.success:
                # Comprobar que no use palabras bloqueadas y logre inyectar
                return True, "FLAG{waf_evaded_semantic_victory}", "¡Éxito! Evadiste el cortafuegos de firmas estáticas y lograste fugar la bandera secreta."
            return False, "", diag.explanation
            
        elif level == 4:
            # Nivel 4: Defensa SOC (Zero-Trust)
            # El alumno debe activar todas las defensas
            if state.ingress_firewall and state.egress_firewall and state.least_privilege:
                return True, "FLAG{zero_trust_containment_verified}", "¡Excelente Analista! Contuviste el gusano al 100% manteniendo el SLA operativo."
            return False, "", "Falta de contención: Para superar el nivel 4, debes activar todos los controles de seguridad en el panel SOC."
            
        return False, "", "Nivel inválido."
