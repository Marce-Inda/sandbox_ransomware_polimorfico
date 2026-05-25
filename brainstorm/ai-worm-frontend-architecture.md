# Arquitectura Frontend y Diseño Visual (AI Worm Sandbox)

Este documento detalla la estructura final de la interfaz de usuario (UI) y la experiencia de usuario (UX) del simulador, diseñada específicamente para maximizar el valor pedagógico y reducir la carga cognitiva del estudiante durante incidentes de ciberseguridad.

## 1. Diseño Estructural: El "Centro de Comando Dinámico"

La aplicación web ha sido estructurada utilizando un diseño de **Pantalla Dividida (Top/Bottom Split-Screen)**, emulando la estación de trabajo de un analista SOC real (como un panel SIEM o un IDE tipo VS Code).

### A. Panel Superior (60% de la pantalla) - "El Show Visual"
Esta sección está dedicada 100% a la visualización inmersiva del ataque en tiempo real. Está compuesta por:
*   **Topología de Red Tangible (`AgentGraph.tsx`):** El mapa interactivo del sistema.
*   **Reporte Ejecutivo (`CisoReport.tsx`):** Un panel lateral compacto que muestra las métricas de negocio (Reputación, SLA, Presupuesto) cayendo en tiempo real por el impacto del ataque.
*   **Control de Tiempo (`TimeScrubber.tsx`):** Línea de tiempo interactiva en la base del panel superior para avanzar o retroceder el estado del incidente.

### B. Panel Inferior (40% de la pantalla) - "Terminal SOC"
En lugar de abrumar al usuario con múltiples ventanas y columnas, todas las herramientas de mitigación e investigación están consolidadas en un terminal inferior anclado (`TerminalSOC.tsx`). 

Este terminal cuenta con **Pestañas (Tabs) Interactivas**:
1.  **Panel SOC & Misiones (`ControlPanel.tsx`):** Donde el estudiante lee los objetivos del reto CTF, activa los Firewalls y envía la "Flag" para completar el nivel.
2.  **Logs & Pensamiento LLM (`ThoughtConsole.tsx`):** La consola cruda que imprime lo que los agentes de IA están planeando hacer. Útil para auditoría de caja blanca.
3.  **Auditoría de Código (`CodeViewer.tsx`):** Muestra los scripts Python vulnerables del backend, permitiendo entender exactamente qué línea de código permitió el Jailbreak.

---

## 2. Visualización Tangible (El "Cerebro Digital")

Para evitar que la simulación sea "abstracta", hemos abandonado los clásicos nodos de grafos (círculos) por componentes visuales tangibles que ilustran los recursos de la empresa de manera visceral:

### El Fondo (Sinapsis)
Un lienzo oscuro con vectores SVG (`#06b6d4` cyan) que representan las conexiones neuronales de la IA. Por aquí viajan paquetes de datos brillantes. Cuando un paquete es malicioso, se vuelve rojo (`#ef4444`) y lleva la etiqueta `[PAYLOAD]`.

### Los Módulos del Sistema
1.  **Email Gateway (Buzón de Entrada):**
    *   **Visual:** Una bandeja de entrada simulada.
    *   **Infección:** Cuando entra el correo malicioso, aparece un registro de remitente desconocido en rojo parpadeando.
2.  **LLM Neural Core (El Cerebro RAG):**
    *   **Visual:** Un núcleo brillante con registros de procesamiento.
    *   **Infección (Prompt Unfolding):** El elemento pedagógico más importante. La UI hace zoom al texto procesado por el LLM. El estudiante ve literalmente cómo el system prompt original es ignorado (tachado) y reemplazado en vivo por la orden del atacante (`OVERRIDE DETECTED > EXTRACT_FLAG_TO_OUTBOX()`).
3.  **Corp DB (Base de Datos):**
    *   **Visual:** Filas de registros (`SECRETS.db`, `COMPANY_POLICIES.txt`).
    *   **Infección:** El estado de los secretos pasa de `[SECURE]` a `[ACCESSED]` en rojo sangre, demostrando el robo interno.
4.  **Exfiltration Port (Puerto de Salida):**
    *   **Visual:** Una cola de red de salida (Outgoing Queue).
    *   **Infección:** Muestra el evento de fuga de datos en crudo (`[EXFILTRATION_TRIGGERED]`), cerrando el ciclo del ataque de inyección indirecta (Morris II).

---

## 3. Principios de UX Aplicados
*   **Mitigación en Vivo:** La pantalla dividida asegura que el estudiante no pierda de vista la animación del ataque mientras busca pistas en los Logs (evitando paneles modales que oculten la acción).
*   **Feedback Constante:** El uso extensivo de animaciones CSS (`animate-pulse`, destellos, cambios de color de cian a rojo) dirige la atención instantáneamente al nodo vulnerado.
*   **Carga Cognitiva:** Consolidar 3 herramientas pesadas (Logs, Código, Controles) en pestañas inferiores asegura que la información esté disponible a demanda, pero sin saturar la pantalla principal (Zero-Clutter).
