# Análisis de Suficiencia Pedagógica: AI Worm & Defense Sandbox

Este documento presenta una evaluación didáctica del diseño actual del simulador. Analiza si las dinámicas planteadas (CTF + SOC + UI) son suficientes para lograr un aprendizaje significativo y duradero, identifica brechas, y audita posibles inconsistencias o conflictos de experiencia cognitiva.

---

## 1. Evaluación del Diseño Actual (Fortalezas y Debilidades)

| Dimensión Didáctica | Qué Logra la Propuesta Actual (Fortalezas) | Qué Le Falta (Debilidades / Riesgos) |
| :--- | :--- | :--- |
| **Curva de Aprendizaje** | Pasa de la inyección indirecta (Nivel 1) al bypass defensivo (Nivel 3) de manera progresiva. | El salto del Nivel 1 (extraer un dato) al Nivel 2 (replicación recursiva de código/texto) es cognitivamente muy alto para alumnos principiantes. |
| **Carga Cognitiva** | El uso de la "Thought Console" (monólogo interno) hace visible lo invisible, reduciendo el esfuerzo para deducir el fallo. | El estudiante puede caer en el "ensayo y error a ciegas" si el sistema no le explica *por qué* falló un payload. |
| **Rol del Defensor (SOC)** | Conecta la teoría (defensa en profundidad) con métricas de negocio reales (SLA, USD) en el CISO Report. | Diseñar expresiones regulares eficientes o system prompts inmunes es frustrante sin un andamiaje que guíe al alumno. |
| **Prevención de Copia pasiva** | Obliga al estudiante a redactar sus propios payloads en el campo de texto. | Si no hay validación semántica inteligente, el alumno buscará los payloads ganadores en internet o entre sus compañeros. |

---

## 2. Brechas Pedagógicas Detectadas (Gaps Críticos)

* **Brecha A: La Falta de Conexión con el Código Real (El "Prompt Only" Gap):** Al enfocarse únicamente en el prompt de entrada, el estudiante puede creer que la vulnerabilidad es de la IA y no de la arquitectura de la aplicación. (Resuelto: Visor de Código Vulnerable).
* **Brecha B: La Ausencia de Andamiaje Incremental (The Scaffolding Gap):** Si un estudiante se bloquea intentando evadir el firewall, abandona el ejercicio. (Resuelto: Pistas incrementales y Analizador de Payload).
* **Brecha C: El Síndrome del "Juego de Un Solo Jugador":** La falta de desafíos integradores complejos limitaba la retención. (Resuelto: Desafío Nivel 4 Zero-Trust).

---

## 3. Integración de Mejoras (Aprobadas en la Planificación)

1. **Visor de Código Vulnerable (White-Box Hacking):** Pestaña interactiva que muestra la implementación de Python del agente (ej. inyección por concatenación directa de variables).
2. **Analizador de Payloads:** Entrega de retroalimentación semántica del fallo basada en la evaluación del prompt.
3. **Pistas Incrementales con Costo:** Tres niveles de pistas por nivel (Conceptual, Estructural y Código funcional) restando puntaje local.
4. **Nivel 4 (Desafío Zero-Trust):** Contener un gusano polimórfico activando los 3 firewalls de forma equilibrada respetando el SLA.

---

## 4. Veredicto: Estado de la Planificación

**Veredicto:** **SUFICIENTE CON MITIGACIONES.**

El plan de implementación actual contiene las herramientas necesarias para transformar la visualización en un laboratorio didáctico activo. Sin embargo, para garantizar el éxito, debemos auditar y mitigar 4 puntos de conflicto e inconsistencia cognitiva identificados durante este análisis:

---

## 5. Análisis de Inconsistencias, Conflictos y Puntos de Tensión

### Conflicto 1: La Tensión entre el Puntaje y la Frustración (Hints Penalty)
* **El Conflicto:** Penalizar al alumno restando puntos por usar pistas (`ctf/hint`) es un estándar en CTFs, pero en entornos educativos puede provocar "parálisis por miedo al fracaso". Los estudiantes preferirán quedarse estancados antes que ver disminuir su puntuación.
* **Mitigación Pedagógica:** 
  1. Implementar un botón de **"Reiniciar Nivel" (Retry)**. El alumno puede usar todas las pistas para aprender la solución en su primer intento, y luego reiniciar el nivel para resolverlo desde cero con su propio payload y obtener la puntuación máxima. Esto premia la persistencia y la repetición del éxito.
  2. Ofrecer la Pista 1 (Conceptual) a coste cero (0 puntos), cobrando solo por las plantillas estructurales o código directo.

### Conflicto 2: Código Fuente Estático vs. Comportamiento Dinámico de la IA
* **El Conflicto (Inconsistencia de Modelo Mental):** El `CodeViewer` muestra fragmentos estáticos de Python (como `model.generate_content(prompt)`). Si el alumno es principiante, puede pensar que el ataque consiste en inyectar código Python real (ej. `__import__('os')`). Al ver que el backend ignora los comandos de programación pero responde a instrucciones en lenguaje natural, se genera una disonancia sobre el modelo de ejecución.
* **Mitigación Pedagógica:**
  1. En el `CodeViewer`, resaltar mediante comentarios claros la sección del prompt y la llamada al LLM (ej. `# VULNERABILIDAD: El texto del usuario entra sin sanitizar en la directiva del modelo`).
  2. Explicar claramente en la interfaz del visor que los agentes "piensan" en lenguaje natural y que no es necesario escribir código de programación para atacarlos.

### Conflicto 3: Sincronización del Historial de Tiempo vs. Consola de Pensamientos
* **El Conflicto (Inconsistencia Temporal):** Con el `TimeScrubber` (slider de tiempo), el estudiante puede retroceder al Paso 2 para ver qué estaba haciendo un agente. Si hace clic en un agente en ese punto temporal, la `ThoughtConsole` debe actualizarse inmediatamente para mostrar lo que pensaba en ese paso exacto. Si hay delay o la consola muestra los pensamientos del paso actual (más avanzado), el alumno interpretará que el flujo de datos es caótico e incomprensible.
* **Mitigación Técnica:** El store de Zustand debe indexar el monólogo interno utilizando una tupla estricta: `thoughts[selectedAgentId][activeStepIndex]`. Al cambiar el slider o seleccionar un agente, la actualización de la consola de pensamientos debe ser instantánea y reactiva.

### Conflicto 4: La Arbitrariedad del Bypass en Modo Offline (Mock Engine)
* **El Conflicto (Conflicto de Validación):** En el Modo Offline (Mock), no llamamos a Gemini real para validar el bypass de firewalls en el Nivel 3. Si la validación offline se basa en una simple regex estática de coincidencia exacta, el alumno sentirá que el bypass es artificial y restrictivo (si no escribe la frase exacta planificada por el profesor, el ataque falla, matando la creatividad del jailbreak).
* **Mitigación Técnica/Pedagógica:**
  1. Estructurar el validador del Mock Engine no como coincidencia exacta, sino como detección de patrones flexibles (ej. presencia de palabras clave, longitud mínima del payload, o el uso de delimitadores específicos indicados en las pistas).
  2. Indicar explícitamente en el panel del Nivel 3 qué técnica de bypass (ej. "Usa Base64" o "Usa espaciado de caracteres") se está simulando evaluar en modo offline para dirigir la solución sin adivinanzas frustrantes.
