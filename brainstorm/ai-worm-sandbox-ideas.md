# Ideas para Proyecto: Simulador de Gusanos de IA en Entornos Multiagente (AI Worm & Defense Sandbox)

## 1. Contexto y Origen de la Idea
La investigación del gusano **Morris II** (2024) demostró que los agentes de IA que procesan datos externos mediante RAG (Retrieval-Augmented Generation) y tienen acceso a herramientas (enviar emails, modificar bases de datos) son vulnerables a **inyecciones de prompt auto-replicantes**. 
Un agente infectado lee un prompt malicioso y, al interactuar con otros agentes o APIs, propaga el mismo prompt inyectado, comprometiendo todo el ecosistema de agentes.

---

## 2. Concepto Principal: El Simulador Defensivo (Sandbox)
En lugar de construir un malware funcional (que presentaría altos riesgos de seguridad), el proyecto consistirá en una **plataforma visual e interactiva de simulación (Sandbox)** para demostrar cómo ocurren estos ataques y cómo funcionan las distintas defensas en tiempo real.

### Componentes Clave
1. **Red de Agentes Simulada:** Un grafo de agentes que interactúan entre sí. Por ejemplo:
   * **Agente de Recepción (Email Agent):** Lee correos entrantes usando RAG sobre un buzón ficticio.
   * **Agente de Base de Datos (DB Agent):** Consulta información interna para responder preguntas de otros agentes.
   * **Agente de Soporte (Support Agent):** Genera respuestas automáticas y las envía a clientes.
2. **Inyector de Ataques (Worm Injector):** Permite al usuario "lanzar" un correo electrónico infectado con un prompt auto-replicante hacia la red de agentes.
3. **Panel de Control de Defensas (Firewall Toggle):** Permite activar o desactivar filtros de seguridad en tiempo real y observar el resultado:
   * **Filtros de Ingress (Entrada):** Sanitización de texto entrante y clasificación semántica de intenciones (con LLM Guard o heurísticas).
   * **Filtros de Egress (Salida):** Inspección de llamadas a herramientas. Si un agente intenta enviar un email que contiene directivas de ejecución o la firma del gusano, la llamada a la herramienta es bloqueada.
   * **Restricción de Privilegios (Least Privilege):** Limitar los canales de comunicación directa entre agentes.
4. **Dashboard Visual (UI):** Una interfaz gráfica (web interactiva) que muestre el flujo de mensajes en tiempo real, pintando los agentes en verde (sanos), amarillo (bajo sospecha) o rojo (infectados/comprometidos).

---

## 3. Definición del Dolor, Valor y Público Objetivo (Scoping de Negocio)

### A. ¿A quiénes se lo estamos ofreciendo? (Público Objetivo)
1. **CISOs y Líderes de Seguridad Corporativa:** Profesionales que necesitan entender las nuevas amenazas antes de autorizar la adopción de agentes de IA en sus empresas.
2. **Desarrolladores de Aplicaciones de IA / MLOps:** Ingenieros que están construyendo sistemas multiagente y necesitan saber cómo implementar salvaguardas (guardrails) efectivas.
3. **Educadores en Ciberseguridad y Centros de Formación:** Profesores o instructores de bootcamps/universidades que requieren herramientas visuales e interactivas para enseñar conceptos del OWASP Top 10 para LLMs.

### B. ¿Cuál es el Dolor (Pain Point) que resolvemos?
* **Invisibilidad del Riesgo:** El tráfico semántico (lenguaje natural) burla las herramientas de ciberseguridad tradicionales (EDR, firewalls de red). Las empresas no pueden "ver" cómo se propaga una infección de IA.
* **Bloqueo en la Adopción de IA:** La falta de entendimiento sobre la seguridad de LLMs hace que los departamentos de seguridad prohíban o retrasen proyectos de automatización basados en agentes por miedo al "peor escenario".
* **Falta de Sandbox de Prueba:** Probar defensas directamente en el código de producción es lento, complejo y propenso a romper la funcionalidad legítima del agente.

### C. ¿Qué es exactamente lo que estamos ofreciendo?
Ofrecemos un **Laboratorio Visual de Concientización y Pruebas de Seguridad para Agentes de IA**. Es una herramienta interactiva que permite:
* **Simular visualmente el radio de impacto** de una inyección indirecta de prompt.
* **Demostrar el flujo de replicación** (cómo un correo comprometido infecta la base de datos y esta a su vez infecta a otros agentes).
* **Validar la eficacia de las defensas** mediante un panel de control interactivo (toggles) que activa contramedidas (como Egress Filtering) y muestra cómo se detiene el gusano en tiempo real.

### D. ¿Cuál es el Valor del Proyecto?
* **Valor Educativo e Immersivo:** Facilita la comprensión instantánea de un vector de ataque avanzado para stakeholders técnicos y no técnicos.
* **Valor de Portafolio / Negocio:** Te posiciona a la vanguardia de la seguridad en la era de la IA, demostrando capacidades de arquitectura segura de agentes y desarrollo de interfaces modernas.

### E. Análisis de Ingeniería de IA: Determinismo vs. IA Real

Para demostrar tu conocimiento como ingeniera de IA, el diseño del proyecto sigue la premisa clave de la ingeniería de software moderna aplicada a LLMs: **"Solo usa IA cuando agregue valor real y no pueda resolverse de forma determinista y económica"**.

#### 1. Por qué la propagación del gusano debe ser simulada (determinista):
* **Costo y Concurrencia:** Ejecutar llamadas recursivas reales entre agentes (Email -> RAG -> DB -> Outbox) para cada paso y para múltiples alumnos saturaría rápidamente las API Keys, provocando costes elevados e inevitables errores de límite de tasa (429).
* **Consistencia Pedagógica:** Los LLMs reales sufren de "Model Drift" (cambios de comportamiento de la API) y alucinaciones. Si el LLM real decide repentinamente ignorar el ataque en un taller académico, el flujo del gusano se rompería de forma impredecible, frustrando a los estudiantes.
* **Diagnóstico Claro:** La emulación determinista permite trazar estados exactos de seguridad de red en milisegundos, ofreciendo una experiencia interactiva sin latencia.

#### 2. Dónde la IA Real es imprescindible y aporta valor estratégico (AI Module):
Para demostrar tus habilidades prácticas en ingeniería de IA con Python (Gemini API, Structured Outputs y Guardrails), implementaremos dos módulos que sí consumen inferencia real de forma aislada y controlada:

1. **LLM Guard (Filtro Semántico del Ingress Firewall):**
   * **Problema:** Un simple filtro de expresiones regulares (regex) no puede detectar la intención maliciosa de un prompt de jailbreak redactado en lenguaje natural o distribuido semánticamente.
   * **Solución de IA:** Cuando el usuario activa "LLM Guard", el backend realiza una llamada real a **Gemini 1.5 Flash** (u Ollama). El sistema utiliza **Structured Outputs** (Pydantic v2) para forzar al LLM a devolver un JSON con un análisis estructurado:
     ```python
     class GuardResult(BaseModel):
         is_unsafe: bool
         confidence: float
         reason: str
     ```
   * **Técnica de Ingeniería de IA:** Esto demuestra el uso de esquemas estructurados para control de formato, diseño de system prompts robustos y la implementación de un **mecanismo de contingencia (fallback)**. Si la llamada al LLM falla (por falta de API key, red o 429), el backend pasa automáticamente a un filtro de firma (regex) con un log de advertencia en la consola.

2. **Jailbreak Playground (El Laboratorio de Red Teaming):**
   * **Problema:** En un motor determinista, el usuario no puede probar la efectividad de sus propios prompts de jailbreak.
   * **Solución de IA:** Un panel interactivo aislado donde el estudiante escribe un prompt de ataque personalizado. El backend realiza una llamada directa a Gemini para ver si el modelo revela una bandera (Flag) o si es bloqueado por sus salvaguardas internas.
   * **Técnica de Ingeniería de IA:** Permite al alumno interactuar directamente con un LLM sin interferir con la máquina de estados estable de la simulación gráfica, demostrando técnicas de red-teaming de LLMs y evaluación de vulnerabilidades semánticas.
