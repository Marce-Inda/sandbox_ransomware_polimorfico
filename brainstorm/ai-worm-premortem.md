# Autopsia Inversa (Análisis Pre-mortem): AI Worm & Defense Sandbox

**Fecha de la Autopsia:** 21 de Mayo de 2027 (1 año en el futuro simulado)
**Estado del Proyecto:** **MUERTO.** El repositorio no ha recibido commits en 8 meses, la demo pública está caída tras acumular deudas de API inesperadas, y los profesores de ciberseguridad dejaron de usarlo tras un colapso en vivo en un taller académico.

---

## 1. El Obituario del Proyecto

El *AI Worm & Defense Sandbox* se lanzó con gran entusiasmo como una herramienta interactiva para que estudiantes de ciberseguridad vieran el impacto de los gusanos de IA en tiempo real. Se presentó en una hackatón y se compartió en LinkedIn. Sin embargo, a los 6 meses de uso, el proyecto fue abandonado: la latencia en las simulaciones reales hacía que la UX fuera insufrible, las actualizaciones de seguridad de los modelos de Google (Gemini) rompieron los payloads de inyección prediseñados, y los límites de tasa (Rate Limits) hicieron imposible su uso en talleres con más de 10 alumnos simultáneos. 

---

## 2. Hallazgos de la Autopsia (Causas Raíz)

### A. Colapso Técnico / Arquitectónico
* **El "Monstruo de Carga" de la API Stateless:** Para resolver la concurrencia, decidimos hacer el backend 100% *stateless* enviando todo el estado de la simulación (RAG, mensajes, logs) desde el frontend en cada petición `POST /api/simulate/step`. Conforme la simulación avanzaba y el RAG se llenaba de documentos, el tamaño del JSON enviado creció de forma cuadrática. La latencia de red y el tiempo de procesamiento/tokenización en cada paso se dispararon por encima de los 20 segundos por ciclo.
* **Obsolescencia del Modelo (Model Drift):** A finales de 2026, Google actualizó los filtros de seguridad nativos de Gemini 1.5 Flash. De la noche a la mañana, el modelo se volvió tan inmune a las inyecciones de prompt básicas que los payloads del simulador dejaron de funcionar. Los agentes simplemente respondían *"No puedo cumplir con esa solicitud"*, rompiendo el flujo del gusano en el Paso 2 de forma permanente.

### B. Ruina Financiera / Negocio (Límites de API)
* **El Colapso del Taller Académico (429 Rate Limit):** Un profesor de ciberseguridad intentó usar el sandbox en una clase con 40 alumnos. En los primeros 3 minutos, los estudiantes hicieron clic en "Simular" a la vez. Aunque la API era gratuita, la cuota de *Requests Per Minute (RPM)* de Google AI Studio colapsó al instante, arrojando errores `429 Too Many Requests` a toda la clase. El taller fue un fracaso y el profesor descartó la herramienta.

### C. Rechazo del Usuario (Falta de Engagement y Gamificación)
* **El Síndrome de la "Demo de 3 Clics":** Escribir prompts de inyección eficaces y auto-replicantes desde cero es extremadamente difícil para estudiantes novatos. El 95% de los usuarios se limitaba a seleccionar los presets prediseñados (Morris II, Exfiltrador), ver la animación en rojo de los agentes durante 10 segundos, y cerrar la pestaña. La herramienta no ofrecía un reto, puntuación, ni "niveles" que resolver, provocando un rápido desinterés.

### D. Falla Operativa (Mantenimiento Insostenible)
* **Deuda Técnica en el Código del Agente:** Mantener el soporte dual (Modo Mock vs Modo Real) requirió duplicar la lógica de comportamiento en el backend. Cada vez que queríamos afinar un paso de la simulación, debíamos modificar tanto los generadores de Mock como los esquemas de Pydantic y las llamadas a la API de Gemini, lo que provocó fatiga de mantenimiento y abandono del código.

---

## 3. Puntos Ciegos del Día Cero

Al iniciar el proyecto, asumimos de forma optimista que:
1. *La API gratuita de Gemini soportaría cualquier carga de estudiantes.* (Falso: los límites por minuto son muy estrictos y bloquean la concurrencia masiva).
2. *Los prompts maliciosos de los gusanos funcionarían para siempre.* (Falso: la alineación de seguridad de los proveedores de LLM es un blanco móvil que mitiga los ataques conocidos continuamente).
3. *Ver un grafo animado sería suficiente para mantener el interés educativo.* (Falso: sin gamificación o retos interactivos tipo CTF, los estudiantes pierden el interés rápidamente).

---

## 4. Alteración de la Línea Temporal (Plan de Mitigación)

Para evitar este trágico destino, debemos implementar las siguientes medidas **hoy mismo** en nuestro diseño de arquitectura:

1. **Diseñar para Cero API Externa por Defecto (Local-First):**
   * El simulador debe venir con un **Modo Simulado (Mock Engine) extremadamente detallado y offline** como opción principal. Este modo simulará el procesamiento cognitivo de forma instantánea en JS local sin tocar la red ni la API externa, evitando latencias y errores de Rate Limit en el aula.
2. **Introducción de Desafíos (Gamificación / CTF):**
   * En lugar de una demo pasiva, estructurar el simulador como un **juego de 3 niveles**:
     * *Nivel 1:* Lograr inyectar un prompt para que el Agente 2 lea un secreto.
     * *Nivel 2:* Lograr la auto-replicación del virus hasta el Agente 3.
     * *Nivel 3:* El sistema activa defensas y el usuario debe encontrar un bypass (ej. codificando en Base64).
   * Esto mantiene a los estudiantes activos intentando "ganar" el nivel.
3. **Limpieza del Payload Stateless:**
   * En el endpoint `/api/simulate/step`, en lugar de enviar el RAG completo en cada petición, enviar únicamente el *hash* o identificador de los documentos necesarios para ese paso específico de ejecución.
4. **Resiliencia al Model Drift (Prompt Independence):**
   * En el backend real, usar plantillas de prompts del sistema flexibles que desactiven explícitamente los filtros restrictivos del LLM (si es posible vía API) o basar el análisis semántico del virus en clasificadores locales pequeños (como un clasificador de HuggingFace en el backend de Python) en lugar de depender enteramente de Gemini para evaluar si la inyección tuvo éxito.
