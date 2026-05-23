# Matriz de Restricciones del Proyecto: AI Worm & Defense Sandbox

## 1. Restricciones Éticas y de Seguridad (Críticas)
* **No Dual-Use Explotable:** El simulador NO debe contener ni generar payloads de inyección de prompt que puedan utilizarse directamente para hackear servicios comerciales en la nube (como OpenAI Assistants o endpoints de producción). 
* **Entorno Cerrado (Mocks y APIs Controladas):** Las interacciones de red e integraciones de herramientas (como el envío de emails o consultas a BD) deben estar completamente simuladas localmente o en un entorno virtualizado interno. No debe haber conexiones a servicios externos de producción reales para evitar fugas de datos o spam accidental.

---

## 2. Restricciones Técnicas
* **Costes de API (Token Budget):** Ejecutar múltiples agentes interactuando entre sí puede disparar el consumo de tokens y costes de API si se usan modelos comerciales como GPT-4o.
  * *Mitigación:* Diseñar el sistema para ser compatible con modelos locales/ligeros (como Llama 3 / Phi-3 vía Ollama) o usar modelos de bajo coste con contextos optimizados (Gemini 1.5 Flash).
* **Latencia de Ejecución:** La orquestación de agentes múltiples suele ser lenta (pudiendo tardar varios segundos por interacción). La interfaz de usuario debe manejar estados asíncronos de forma limpia para evitar que la UI se congele.
* **Falsos Positivos de Defensa:** La sanitización de entradas agresiva puede degradar el rendimiento de los agentes para sus tareas legítimas. El proyecto debe documentar y medir esta tasa de degradación.

---

## 3. Restricciones Regulatorias y Legales
* **Cumplimiento de Políticas de Proveedores de LLM:** Los términos de servicio de OpenAI/Google/Anthropic prohíben la generación deliberada de contenido malicioso o simulación de ciberataques si se detecta abuso. Las pruebas con inyecciones de prompt deben ceñirse a pruebas de concepto seguras en entornos controlados y, preferiblemente, utilizando modelos locales cuando se realicen pruebas intensivas de ataques.
