# Reporte de Fortificación Blue Hat: AI Worm & Defense Sandbox

Este reporte presenta la auditoría de fortificación y blindaje del simulador bajo el **Protocolo Blue Hat**. Evalúa la robustez, cumplimiento ético/legal y mecanismos de seguridad de la nueva arquitectura híbrida.

---

## 1. Inventario de Activos (Asset Inventory)

Identificamos y clasificamos los activos críticos del sistema para definir sus niveles de protección:

| ID | Activo | Tipo | Clasificación | Descripción | Salvaguarda |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **ACT-01** | API Key de Google Gemini | Credencial | **Crítico / Confidencial** | Permite realizar inferencias de clasificación y pruebas en el Playground. | Almacenado únicamente en variables de entorno (`.env`) en el backend. Nunca se expone al cliente web. |
| **ACT-02** | Esquemas de Validación (Pydantic) | Código | **Uso Interno** | Estructuras de datos (`state.py`, `GuardResult`) que aseguran el tipado estricto. | Validación automática en FastAPI que rechaza payloads mal formateados. |
| **ACT-03** | Prompts de Sistema (LLM Guard) | Cognitivo | **Uso Interno** | Instrucciones que guían a Gemini 1.5 Flash para detectar jailbreaks. | Parametrización estática con `temperature: 0.0` para máxima predictibilidad. |
| **ACT-04** | Base de Escenarios (`scenarios.py`) | Datos | **Público** | Metadatos regulatorios y de negocio de los 4 países. | Archivo estático de lectura en memoria del backend. |

---

## 2. Matriz de Calidad y Arquitectura (Solidez del Diseño)

Evaluamos el nivel de calidad del diseño técnico actual:

* **Tolerancia a Fallos y Alta Disponibilidad (Calificación: Excelente):**
  * *Análisis:* La introducción del **mecanismo de fallback** en `gemini.py` garantiza que si la API de Gemini falla o se excede la cuota gratuita (Error 429), el simulador no se congele. Degradarse a regex de forma transparente es una excelente práctica de resiliencia operativa.
* **Control de Costes y Optimización (Calificación: Sobresaliente):**
  * *Análisis:* Al mantener la propagación inter-agente 100% determinista local, se evita el consumo de miles de tokens que requerirían llamadas recursivas de LLMs. El presupuesto de API es lineal y predecible (1 llamada por paso con LLM Guard activo y 1 llamada por prueba en el Playground).
* **Desacoplamiento (Calificación: Excelente):**
  * *Análisis:* El estado global reside enteramente en el store de Zustand del cliente, permitiendo que el backend sea stateless y atienda peticiones concurrentes de múltiples alumnos sin colisiones en memoria.

---

## 3. Plan de Blindaje y Gobernanza (Cumplimiento e Integridad)

### A. Gobernanza y Ética (IA Responsable y Cumplimiento)
* **Conformidad con la Ley de IA de la UE (EU AI Act):**
  * El simulador se clasifica como una **herramienta educativa/entrenamiento sin riesgo**. No procesa PII real, no toma decisiones automatizadas sobre personas y el RAG es 100% sintético.
* **Mitigación de Doble Uso (Dual-Use):**
  * Los payloads maliciosos de los presets están enfocados exclusivamente en la simulación lógica inter-agente y la replicación simulada (ej. enviando cadenas de texto al outbox simulado). No se incluye código explotable para APIs o servidores reales.

### B. Privacidad desde el Diseño (Privacy by Design)
* **Minimización de Inputs:**
  * En la UI del Playground y de los campos de texto, se incluirá una leyenda advirtiendo al estudiante: *"No ingresar contraseñas, PII real o claves corporativas en el prompt de pruebas"*.
  * Las llamadas a Gemini no almacenan historial de chat (son llamadas stateless de un solo turno), evitando la acumulación de datos sensibles en servidores de terceros.

### C. Hardening y Ciberseguridad (Alineado con NIST CSF 2.0)

#### 1. Identificar (Identify)
* Registro estructurado del estado de salud de la red (`network_health` = Green/Yellow/Red) en el JSON del estado para auditoría inmediata.

#### 2. Proteger (Protect)
* **Seguridad de Inferencia:** Se configuran los parámetros de Gemini con `temperature: 0.0` y `top_p: 1.0` en la clasificación del `LLM Guard` para evitar la aleatoriedad semántica (variabilidad de resultados ante prompts idénticos).
* **Sanitización de Peticiones:** FastAPI procesa los esquemas JSON mediante Pydantic v2, lo que previene ataques de inyección de parámetros o desbordamiento en el backend de Python.

#### 3. Detectar (Detect)
* **Logs de Seguridad:** Cada veredicto del `LLM Guard` y cada bloqueo del `Egress Firewall` emite un log detallado con nivel `SECURITY` en el servidor y se pinta en la consola del estudiante para fines de trazabilidad de auditoría.

#### 4. Responder y Recuperar (Respond & Recover)
* **Salvaguarda de Bucle Infinito (Hard Stop):** Si el contador de pasos de la simulación excede de 10 (`step_count > 10`), el motor detiene automáticamente la cola de mensajes y marca el estado como `completed` con un log de alerta. Esto previene bucles infinitos visuales en el navegador.
