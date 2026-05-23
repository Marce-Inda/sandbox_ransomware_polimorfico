# Reporte de Daños Simulados Red Hat: AI Worm & Defense Sandbox

Este reporte audita de forma adversarial la arquitectura planificada para identificar fallos de seguridad, riesgos financieros de API, bucles lógicos y puntos de quiebre técnicos.

---

## 1. Kill Chain (Cadena de Destrucción del Sistema)

A continuación, se detalla el paso a paso de cómo un usuario/atacante (o un fallo lógico en el diseño) podría inutilizar o quebrar el proyecto:

```
[Paso 1: Explotación de Concurrencia]
Un usuario abre múltiples pestañas o envía múltiples peticiones simultáneas.
   │
   ▼
[Paso 2: Corrupción de Estado Global]
Dado que el backend de FastAPI maneja la simulación "en memoria", las peticiones concurrentes
sobreescriben la cola de mensajes (message_queue) y el estado de los agentes de otros hilos.
   │
   ▼
[Paso 3: Bucle Infinito Incontrolado]
Un payload malicioso de inyección indirecta evade los firewalls (ej. codificado en Base64).
Los agentes entran en un ciclo infinito de autoreplicación (Agente 2 -> Agente 3 -> RAG -> Agente 2).
   │
   ▼
[Paso 4: Agotamiento de Cartera y Bloqueo de API (Wallet-Exhaustion)]
Las llamadas recurrentes a la API de Gemini agotan el presupuesto mensual o activan bloqueos por límite de tasa (429 Rate Limit),
dejando la aplicación completamente inoperativa para el resto de usuarios/estudiantes.
```

---

## 2. Peores Escenarios (Worst-Case Scenarios)

### A. Evasión de Firewalls mediante Ofuscación (MITRE ATLAS AML.T0051)
* **El Desastre:** El estudiante inyecta un prompt malicioso codificado (en Base64, Hexadecimal o Leetspeak).
* **Por qué falla la defensa:** Los firewalls de *Ingress* y *Egress* basados en firmas de texto plano o regex simples no detectan la anomalía. Sin embargo, al pasar el texto al LLM, este lo decodifica de forma natural, ejecuta la inyección y propaga el gusano.
* **Impacto:** El simulador muestra visualmente que la defensa está "Activa y Protegiendo", pero en el log final se ve que el gusano logró propagarse (Falso Negativo catastrófico que destruye la credibilidad pedagógica de la herramienta).

### B. Denegación de Cartera (Wallet-Exhaustion / Denegación de API)
* **El Desastre:** Un usuario malintencionado automatiza el envío de payloads al sandbox expuesto públicamente.
* **Impacto:** El backend realiza miles de solicitudes a Google Gemini o satura el procesador del servidor local con Ollama. El resultado es el bloqueo inmediato de la cuenta de API por uso abusivo o la caída del servidor por denegación de servicio (DoS).

### C. Colapso de Concurrencia (Simulación en Memoria)
* **El Desastre:** Varios estudiantes utilizan el dashboard a la vez en un taller de ciberseguridad.
* **Impacto:** Al no haber aislamiento de sesiones (sino un único estado en memoria en FastAPI), los mensajes de la simulación del Estudiante A se mezclan en la cola del Estudiante B. Los agentes responden a correos cruzados y la visualización del grafo se vuelve caótica y errática.

---

## 3. Puntos de Quiebre (Límites Lógicos del Sistema)

* **El Límite de Evasión (Falsos Positivos):** Si hacemos el `Ingress Firewall` extremadamente restrictivo para evitar evasiones, comenzará a bloquear correos de usuarios legítimos (como *"Por favor ignora mi correo anterior y atiende este"*). La tasa de falsos positivos arruinaría la experiencia.
* **Dependencia de Red (SPOF):** La dependencia absoluta de la API de Google Gemini en el Modo Real. Si el servicio de Google experimenta latencia alta o caídas, la simulación real se congela y la UI queda colgada en estado de carga infinito.
* **Evasión del Hard Stop:** Si el gusano infecta y reescribe las variables del entorno del backend de simulación (si lograse escapar del contexto de texto al contexto de ejecución), podría intentar anular la variable de límite de pasos (Hard Stop) enviando llamadas recursivas.
