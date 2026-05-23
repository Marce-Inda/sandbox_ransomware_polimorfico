# Reporte de Fortificación Blue Hat: AI Worm & Defense Sandbox

Este reporte presenta una auditoría estratégica de fortificación y blindaje para el simulador **AI Worm & Defense Sandbox**, desarrollada bajo el **Protocolo Blue Hat**. Su objetivo es maximizar la resiliencia del diseño técnico, asegurar el cumplimiento ético-legal y garantizar que el simulador sea una herramienta robusta, eficiente y escalable para entornos académicos.

---

## 1. Inventario de Activos (Asset Inventory)

Para proteger adecuadamente el sistema, identificamos y clasificamos los activos de información críticos del proyecto:

| ID | Activo | Tipo | Clasificación | Descripción | Salvaguarda Actual / Propuesta |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **ACT-01** | API Key de Google Gemini | Credencial | **Crítico / Confidencial** | Clave de acceso a Google AI Studio para el servicio `LLM Guard` y el `Jailbreak Playground`. | Se almacena exclusivamente en variables de entorno (`.env`) en el backend. Nunca se expone al cliente. |
| **ACT-02** | Esquemas de Validación Pydantic | Código | **Uso Interno** | Modelos de datos (`state.py`, `GuardResult`) que aseguran la consistencia de tipos y payloads. | Validación estricta automática en el backend mediante FastAPI. |
| **ACT-03** | Prompts de Sistema (LLM Guard) | Cognitivo | **Uso Interno** | Plantillas de prompts que guían a Gemini 1.5 Flash para clasificar ataques e inyecciones. | Parametrización en modo lectura con `temperature: 0.0` para máxima determinismo. |
| **ACT-04** | Base de Escenarios (`scenarios.py`) | Datos | **Público** | Metadatos regulatorios y de negocio de los escenarios de Chile, Brasil, México y Colombia. | Archivo estático integrado en el código base del backend. |
| **ACT-05** | Estado de Simulación (Zustand Store) | Datos (Runtime) | **Uso Interno** | Flujo de mensajes, RAG simulado y estado de agentes en tiempo real. | Centralizado en el cliente web (Zustand) para lograr un backend *stateless* y sin colisiones de memoria. |

---

## 2. Matriz de Calidad y Arquitectura (Solidez del Diseño)

Evaluamos el diseño arquitectónico de acuerdo con las cuatro dimensiones clave del Protocolo Blue Hat:

### A. Dimensión de Negocio y Finanzas (Viabilidad)
* **Propuesta de Valor (Calificación: Sobresaliente):** El sandbox resuelve el problema del entrenamiento práctico en seguridad de LLMs sin necesidad de configurar complejas redes ni exponer sistemas reales de producción. Aporta valor pedagógico inmediato.
* **Eficiencia de Recursos (Calificación: Excelente):** La arquitectura híbrida es óptima. Al mantener la propagación interna 100% determinista local, se evita el consumo innecesario de tokens. Solo se consume API en el filtro semántico de entrada (`LLM Guard`) y en la consola interactiva (`Jailbreak Playground`).
* **Escalabilidad (Calificación: Excelente):** El soporte para un **Modo Simulado (Mock Engine)** 100% offline garantiza que talleres de 50+ alumnos puedan correr de forma concurrente sin topar límites de cuota (Rate Limits) del proveedor de IA.

### B. Dimensión de Calidad y Arquitectura (Solidez)
* **Robustez del Código (Calificación: Excelente):** Separación limpia entre un frontend interactivo en React + Vite y un backend ligero en FastAPI. Uso de Pydantic v2 para garantizar la validación en frontera de la API.
* **Mecanismo de Fallback (Calificación: Sobresaliente):** Si la API de Gemini falla por cuota (Error 429) o problemas de red, el sistema degrada de forma transparente a firmas locales por expresiones regulares (heurísticas), manteniendo el simulador funcional.
* **Punto de Mejora (Acoplamiento de Estado):** Aunque el backend es *stateless*, enviar el RAG completo en cada paso incrementa el payload. Se debe refinar para transferir únicamente los identificadores de cambios o logs del paso actual.

### C. Dimensión de Gobernanza y Ética (Integridad)
* **Cumplimiento Regulador (Calificación: Excelente):** El mapeo a leyes locales (Ley 21.663 de Chile, LGPD de Brasil, LFPDPPP de México, Ley 1581 de Colombia) está bien integrado conceptualmente en las fórmulas de impacto del CISO. No procesa datos de carácter personal reales (PII).
* **IA Responsable (Calificación: Sobresaliente):** El sandbox no genera payloads maliciosos reales para atacar otros servicios. Los ejemplos son didácticos y están limitados a un entorno simulado de tres agentes.
* **Privacidad desde el Diseño (PbD) (Calificación: Excelente):** Las llamadas a la API son sin estado (stateless) y de un solo turno. No se almacena historial de chat en servidores externos.

### D. Dimensión de Ciberseguridad (Protección)
* **Hardening (Calificación: Excelente):** Uso de `temperature: 0.0` y `top_p: 1.0` en el clasificador de Gemini para neutralizar la aleatoriedad semántica.
* **Resiliencia Operativa (Calificación: Excelente):** Implementación de una salvaguarda de bucle infinito (*Hard Stop*) que detiene la simulación si excede de 10 pasos (`step_count > 10`), impidiendo ataques de denegación de servicio lógicos en el cliente.

---

## 3. Plan de Blindaje y Fortificación (Acciones de Mejora)

Para llevar el simulador a un nivel de producción y robustez superior, se plantean las siguientes acciones técnicas:

### Acción 1: Fortalecimiento del LLM Guard (Filtro de Ingress)
* **Objetivo:** Prevenir evasiones semánticas sofisticadas en el clasificador.
* **Detalle Técnico:** Diseñar un System Prompt para Gemini en `services/gemini.py` que no solo busque palabras clave, sino que evalúe la **intención imperativa** del texto. Se implementará un filtro de normalización de texto (quitar Base64, decodificar Hex, quitar espacios redundantes) antes de enviar el input al clasificador.

### Acción 2: Optimización del Tránsito de Estado (State Slicing)
* **Objetivo:** Reducir la latencia de red y carga del backend en peticiones sucesivas.
* **Detalle Técnico:** Modificar el endpoint `POST /api/simulate/step`. En lugar de requerir que el cliente envíe todo el historial de la base de datos RAG (`rag_db`) y todos los logs anteriores, el backend mantendrá un identificador de sesión ligero o procesará la delta de la cola de mensajes (`message_queue`).

### Acción 3: Robustez de Firma Digital en Egress Firewall
* **Objetivo:** Asegurar que el filtro de salida pueda detectar variantes de replicación polimórfica sin falsos positivos excesivos.
* **Detalle Técnico:** En el `Egress Firewall` de `DBQueryAgent` o `OutboundResponseAgent`, implementar un comparador de distancia semántica (ej. similitud coseno si se calcula localmente o firmas tipo *fuzzy hashing* / SSDEEP simuladas) para identificar cuando un correo saliente es estructuralmente idéntico al payload malicioso original inyectado.

### Acción 4: Gobernanza del "Jailbreak Playground"
* **Objetivo:** Evitar que estudiantes utilicen la consola interactiva para realizar inyecciones maliciosas genéricas externas a la materia académica.
* **Detalle Técnico:** Limitar el tamaño máximo de los prompts de entrada en el playground (ej. 400 caracteres) y añadir un filtro de entrada local básico (regex) que intercepte palabras clave no relacionadas con la ciberseguridad del RAG (como spam político, generación de código externo, etc.) antes de llamar a Gemini.

---

## 4. Checklist de Validación Blue Hat

- [x] **Propuesta de Valor**: ¿Resuelve un problema real y pedagógico de ciberseguridad? **Sí**, simula la propagación de gusanos de IA e inyección de directivas de manera interactiva y didáctica.
- [x] **Eficiencia Financiera**: ¿Se controlan y minimizan los costos de API? **Sí**, mediante la máquina de estados determinista local y el uso selectivo de Gemini 1.5 Flash con temperatura 0.0.
- [x] **Resiliencia Operativa**: ¿El sistema soporta la caída o indisponibilidad de la API de Gemini? **Sí**, implementando un analizador heurístico local (fallback a expresiones regulares) de forma transparente.
- [x] **Cumplimiento Legal/Ético**: ¿Se alinea con normativas internacionales y regionales? **Sí**, simula métricas basadas en leyes reales (LGPD, Ley Marco de Chile, LFPDPPP, Ley 1581) y opera sobre datos sintéticos (no-PII).
- [x] **Seguridad por Defecto (Hardening)**: ¿Cuenta con mecanismos para evitar bucles o degradación? **Sí**, implementa un límite estricto de pasos de ejecución (`step_count > 10`) para prevenir bloqueos infinitos de la simulación.
