# Análisis Pre-mortem: AI Worm & Defense Sandbox

**Fecha del Análisis (Simulado):** 23 de Mayo de 2027 (1 año en el futuro)  
**Estado del Proyecto:** **MUERTO.** El repositorio se encuentra abandonado, los servidores están caídos, la API Key fue revocada por Google por sospechas de abuso y los docentes de ciberseguridad descartaron la herramienta tras múltiples colapsos en vivo durante clases académicas.

---

## 1. El Obituario del Proyecto

El *AI Worm & Defense Sandbox* fue concebido como una innovadora plataforma educativa para visualizar de forma clara e interactiva la propagación de gusanos semánticos en sistemas multi-agente. Sin embargo, a los pocos meses de su lanzamiento, la realidad se impuso: la falta de aislamiento de sesiones provocó cruces de datos caóticos entre alumnos, las API keys reales colapsaron por rate limits en talleres grupales, y la experiencia de usuario resultó frustrante y pasiva para estudiantes novatos que carecían de habilidades para redactar prompts complejos y terminaban limitándose a ver una demo estática de tres clics.

---

## 2. Hallazgos de la Autopsia (Causas Raíz)

### A. Colapso Técnico / Arquitectónico
* **Colisión de Concurrencia (Falta de Session Isolation):** El backend de FastAPI se diseñó bajo una estructura "stateless" pero procesaba las variables de la simulación en memoria usando referencias globales. Al usarse en un aula con 30 alumnos concurrentes en un servidor compartido, la cola de eventos y la base de datos RAG del Estudiante A se mezclaron con la del Estudiante B, provocando que los agentes de un alumno respondieran a correos de otro en la interfaz visual.
  * *Corrección de Diseño:* Se establece la ejecución estrictamente local de la aplicación en la máquina del estudiante.
* **Fragilidad ante Errores de Validación (Pydantic Validation Crash):** En el Modo Real con Gemini 1.5 Flash, el backend forzó la estructura `GuardResult` a través de esquemas Pydantic. Cuando los filtros nativos de seguridad de Google detectaron intentos de inyección y devolvieron respuestas de bloqueo en texto plano (*"I cannot fulfill this request..."*), el motor del backend lanzó excepciones `ValidationError` no controladas, resultando en errores HTTP 500 continuos que congelaban la simulación.

### B. Ruina Financiera / Negocio (Manejo de API Keys y Cuotas)
* **Agotamiento de Cuota en Talleres (429 Rate Limits):** Si toda la clase intentase correr la simulación en vivo bajo una única clave compartida en un servidor centralizado, la cuota RPM (solicitudes por minuto) colapsaría instantáneamente, arrojando errores 429 para todos.
  * *Corrección Open-Source:* El sandbox se diseña para ser clonado localmente desde GitHub por cada estudiante. Los alumnos configuran su propia clave de API en su archivo `.env` local (copiado desde `.env.example`), distribuyendo el consumo de cuotas y tokens de manera individual en su propia máquina.

### C. Rechazo del Usuario (Falta de Engagement y Gamificación)
* **El Síndrome de la "Demo de 3 Clics"**: Escribir payloads e inyecciones indirectas es sumamente difícil. Sin una guía interactiva, el 95% de los alumnos elegía los presets existentes, hacía clic en "Ejecutar", miraba la animación del grafo por 15 segundos y cerraba la pestaña. La plataforma no ofrecía retos, puntuación ni retroalimentación interactiva, provocando un rápido desinterés.
  * *Acción Obligatoria:* Debemos repensar y complejizar el aspecto pedagógico del simulador antes de escribir código.

### D. Falla Operativa (Model Drift y Mantenimiento de Prompts)
* **Obsolescencia Acelerada de Prompts:** Google actualizó las directivas de alineación y seguridad nativas de los modelos Gemini. De un día para otro, los payloads maliciosos prediseñados y las plantillas de inyección dejaron de funcionar de forma silenciosa, rompiendo los escenarios del simulador y exigiendo mantenimiento y reescritura constante de prompts del sistema.
  * *Acción Preventiva:* No se puede evitar que los proveedores de LLM refuercen la seguridad del modelo, pero se puede automatizar la detección del fallo mediante tests en el backend e iniciar por defecto en el Modo Simulado determinista.

---

## 3. Los Puntos Ciegos del Día Cero

Al iniciar el desarrollo, el optimismo inicial llevó a asumir ingenuamente que:
1. *La API del servidor centralizado soportaría a decenas de estudiantes concurrentes sin límite.* (Falso: la aplicación debe distribuirse en GitHub y correr localmente configurando el `.env` con la clave individual de cada alumno).
2. *Forzar un esquema Pydantic a Gemini funcionaría en el 100% de los casos.* (Falso: las capas de seguridad y filtros nativos del modelo rompen la salida estructurada devolviendo texto plano).
3. *Observar un grafo interactivo mantendría enganchados a los estudiantes.* (Falso: se requiere una reevaluación pedagógica profunda para plantear un reto real e impactante que los enganche activamente).

---

## 4. Alteración de la Línea Temporal (Plan de Mitigación)

Para evitar este destino catastrófico, debemos implementar las siguientes medidas correctivas de forma prioritaria en nuestro plan de desarrollo:

### Medida 1: Fase Previa de Rediseño Pedagógico (Próximo Paso Inmediato)
* **Acción:** Detener el desarrollo de código y dedicar la próxima iteración a codiseñar la experiencia didáctica. Debemos definir cómo guiar al alumno en la construcción de payloads complejos, cómo dar feedback inmediato y cómo retarles de manera interactiva (por ejemplo, mediante desafíos con flags o análisis forense de logs simulados).

### Medida 2: Distribución en GitHub y Configuración por .env (Local-First por Diseño)
* **Acción:** Diseñar el proyecto como una aplicación desacoplada y autocontenida que el estudiante clona localmente. Toda configuración y API Key del alumno se lee de variables de entorno mediante un archivo `.env` local, eliminando colisiones de concurrencia y simplificando la infraestructura del servidor central.

### Medida 3: Suite de Pruebas de Salud del Modelo (Anti-Model Drift)
* **Acción:** Desarrollar un test unitario en el backend (`pytest`) que compruebe la efectividad de las inyecciones de los presets contra la API real de Gemini. El docente puede correr esta suite antes de su clase para identificar si Google ha mitigado alguno de los payloads por actualizaciones de seguridad.

### Medida 4: Modo Simulado (Mock Engine) Offline por Defecto
* **Acción:** Diseñar el simulador con un motor local en JavaScript/Python que simule el procesamiento lingüístico de forma offline mediante plantillas prediseñadas inmediatas. Esto evita llamadas a la red y el agotamiento de cuotas durante explicaciones o simulaciones generales en el aula.

### Medida 5: Tolerancia a Fallos en Validaciones de Esquemas de IA
* **Acción:** En `services/gemini.py`, capturar cualquier excepción de tipo `ValidationError` o error de parsing. Si Gemini no devuelve la estructura esperada, interceptar el error y aplicar una clasificación heurística local (fallback) marcando la salida como sospechosa por defecto de forma segura.
