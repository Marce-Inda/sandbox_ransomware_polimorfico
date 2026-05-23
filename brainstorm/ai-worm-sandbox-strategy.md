# Estrategia de Implementación, Viabilidad y Competencia: AI Worm & Defense Sandbox

Este documento detalla la estrategia de negocio, viabilidad técnica y pedagógica adoptada tras el rediseño del sandbox. Se consolida el proyecto como un **Laboratorio de Simulación Interactiva (Auditor/Arquitecto de IA)**.

---

## Principio de Diseño: Separación de Ambientes (Simulado vs. Real)

Para evitar malentendidos durante auditorías de seguridad, análisis de código o pruebas automatizadas, se establece la distinción estricta entre dos planos:

1. **El Plano Simulado (Sandbox Académico)**:
   * **Propósito**: Mostrar cómo se propaga y actúa un gusano de IA.
   * **Comportamiento Esperado**: El malware *debe* propagarse lógicamente de un agente a otro y poder evadir firewalls simulados mediante técnicas que el alumno configure (como Base64 o traducción). Las infecciones, RAG leaks y alertas en este plano son **funcionalidades pedagógicas deseadas**, no fallos de seguridad de la aplicación.
2. **El Plano Real (Infraestructura de la Plataforma)**:
   * **Propósito**: Soportar la ejecución y visualización del simulador para múltiples usuarios concurrentes.
   * **Comportamiento Esperado**: Debe ser **100% inmune** a vulnerabilidades reales de seguridad. Esto incluye el aislamiento absoluto de las sesiones en memoria (evitar que las simulaciones de diferentes alumnos se crucen), control de API keys de Gemini, sanitización real de parámetros y prevención de denegación de cartera (Wallet-Exhaustion) reales en el servidor.

---

## 1. Arquitectura de Simulación Híbrida

Para garantizar coste cero de API en talleres académicos, latencia de milisegundos y consistencia educativa, el simulador utiliza un diseño híbrido:

```
  +-------------------------------------------------------------+
  |              FRONTEND: Dashboard Interactivo (Vite + React)  |
  |  - Panel de Configuración de Amenaza y Defensas             |
  |  - Grafo SVG Dinámico (Estados de Agentes en tiempo real)    |
  |  - Consola de Logs y Reporte del CISO (Indicadores Financieros)|
  |  - Jailbreak Playground (Sandbox aislado de Red Teaming)    |
  +------------------------------+------------------------------+
                                 | Envia Estado / Prompt
                                 | Recibe Estado / Respuesta
                                 v API REST (FastAPI)
  +-------------------------------------------------------------+
  |               BACKEND: Motor de Simulación (FastAPI)        |
  |  - Motor de Estados Determinista (Simulación del Gusano)    |
  |  - Servicio Gemini (Llamadas Reales de Clasificación)        |
  |  - LLM Guard: Clasificación Semántica + Fallback a Regex     |
  |  - Cálculo de Métricas SLA, Churn y Multas Regulatorias      |
  +-------------------------------------------------------------+
```

### Decisiones Arquitectónicas Clave:
1. **Core Determinista:** La propagación del gusano a través de los tres agentes lingüísticos (`EmailReceiverAgent` -> `DBQueryAgent` -> `OutboundResponseAgent`) se simula mediante una máquina de estados precalculada en base a la configuración de la amenaza y los firewalls activos. Esto elimina la latencia (transiciones instantáneas), el riesgo de alucinación del modelo y los errores de tasa de uso (429 Rate Limits).
2. **Clasificación Real (LLM Guard):** Cuando el firewall de Ingress tiene activo el filtro semántico, el backend realiza una llamada real a la API de **Gemini 1.5 Flash**. Se define un System Prompt estricto y se fuerza una salida estructurada con Pydantic v2 (`GuardResult`).
3. **Mecanismo de Fallback:** Si la API de Gemini falla por problemas de red o límite de cuota, el motor del backend degrada el servicio automáticamente a un analizador heurístico local basado en firmas de expresiones regulares, permitiendo la continuidad de la simulación con una advertencia en los logs.
4. **Jailbreak Playground (Sandbox de Red Teaming):** Un panel aislado del simulador permite al estudiante enviar directamente prompts de inyección personalizados contra Gemini para comprobar en tiempo real qué payloads logran evadir la alineación nativa del LLM y revelar la "Flag" corporativa.

---

## 2. Alineación de Escenarios (Contexto Regulatorio y de Negocio)

Se descartan las mecánicas e historias de ataques web tradicionales (SQLi, S3, DDoS, SPEI core). Las copias de escenarios de *The Responder* sirven estrictamente como **contexto regulatorio, legal y financiero** para modelar el impacto del gusano de IA:

* **Escenario 1 (Chile - cl-elearning):** Contexto educativo. Regulado por la Ley 21.663/ANPD Chile. Churn medio (0.5% por spam), multa fija de $15,000 USD y factor de daño 1.0x.
* **Escenario 2 (Brasil - br-ecommerce):** Contexto retail. Regulado por la LGPD/ANPD Brasil. Churn crítico (0.8% por spam), multa fija de $25,000 USD y factor de daño 1.5x.
* **Escenario 3 (México - mx-banking):** Contexto financiero. Regulado por LFPDPPP/CNBV. Churn bajo-medio (0.3%), multa fija de $60,000 USD y factor de daño 2.0x (riesgo de pérdida de licencia bancaria).
* **Escenario 4 (Colombia - co-government):** Contexto gubernamental. Regulado por la Ley 1581/SIC. Churn bajo (0.1%), multa tope de $8,000 USD y factor de daño 2.5x (crisis institucional).

---

## 3. Metodología Pedagógica: Auditor/Arquitecto de IA

Se elimina la paradoja de roles entre atacante y defensor. El estudiante adopta el rol de un **Auditor o Arquitecto de Seguridad de IA**:

1. **Fase de Configuración:** Configura los parámetros del malware (ofuscación, tipo de canal) y activa las defensas que desea auditar.
2. **Fase de Ejecución Visual:** Observa cómo se propaga la infección en el grafo inter-agente y comprende la cadena lógica del malware semántico.
3. **Fase de Análisis de Negocio:** Evalúa el reporte de impacto (SLA, Gobernanza, Reputación e ingresos perdidos) para entender la rentabilidad de las inversiones en controles de seguridad.
4. **Fase de Experimentación (Playground):** Intenta bypassear las defensas de un LLM real redactando jailbreaks polimórficos de forma manual.

---

## 4. Viabilidad y Mitigación de Riesgos

* **Porcentaje de Viabilidad: 98%**
* **Mitigación del Model Drift:** El core determinista protege al simulador de fallos de compatibilidad si Google actualiza la seguridad nativa de Gemini en el futuro.
* **Mitigación de costes de API:** El consumo de tokens reales es mínimo y predecible al limitarse únicamente a las consultas del `LLM Guard` y al `Jailbreak Playground`, garantizando el cumplimiento de la capa gratuita de API Studio.
