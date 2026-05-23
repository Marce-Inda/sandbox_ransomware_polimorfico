# Eventos Cruzados y Ataques Encadenados (AI Worm & The Responder)

Este documento especifica cómo el simulador **AI Worm & Defense Sandbox** justifica y conecta la simulación del gusano de IA con los ataques originales de los escenarios de **The Responder (juego-ciberseguridad)** mediante el concepto de **Ataques Encadenados (Exploit Chaining)**.

---

## 1. Concepto: Inyección de Prompt Almacenada (Stored Prompt Injection)

En el mundo real, un gusano de IA no nace de la nada; necesita un **vector de entrada** para colocar el "payload semilla" (seed payload) en un lugar donde los agentes de IA lo procesen. 
Los incidentes originales de los escenarios actúan como el **exploit primario**, y el gusano de IA actúa como el **payload secundario** de persistencia y propagación.

---

## 2. Mapeo de Eventos Cruzados (Cross-Events)

### Caso 1: Exposición S3 (`cl-elearning-s3exposure`) + AI Worm
* **Ataque Primario (Juego):** Exposición pública de un bucket S3 con archivos de estudiantes.
* **Encadenamiento (Sandbox):** El atacante no solo descargó datos, sino que usó el acceso de escritura en S3 para reemplazar un archivo PDF de material de estudio con un **PDF malicioso que contiene una inyección de prompt oculta**. 
* **Efecto en el Sandbox:** Cuando el `DBQueryAgent` (RAG) lee el bucket S3 para responder dudas de estudiantes, procesa el PDF infectado. La inyección se activa en el LLM, toma control del agente, y este se conecta al sistema de correo para infectar al resto de la organización.
* **Foco Educativo:** Integridad del almacenamiento Cloud como vector de entrada para envenenamiento de RAG.

### Caso 2: SQL Injection (`br-ecommerce-sqlinjection`) + AI Worm
* **Ataque Primario (Juego):** Vulnerabilidad SQLi en el checkout del e-commerce durante Black Friday.
* **Encadenamiento (Sandbox):** El atacante explotó la inyección SQL no solo para extraer datos de tarjetas, sino para realizar un `UPDATE` en la tabla de descripciones de productos, insertando un **payload de prompt polimórfico en la base de datos**.
* **Efecto en el Sandbox:** Cuando el agente de soporte de IA del e-commerce consulta la base de datos para responder a un cliente sobre un producto ("¿Tienen stock del producto X?"), el LLM lee la descripción modificada que contiene las instrucciones del gusano, infectando al agente de soporte y propagando el gusano vía email B2B.
* **Foco Educativo:** Entrada de inyección SQL como vector de persistencia para ataques de prompt injection almacenados (Stored Prompt Injection).

### Caso 3: SPEI APT (`mx-banking-apt-advanced`) + AI Worm
* **Ataque Primario (Juego):** Intrusión persistente APT en el Core Bancario y transferencias SPEI.
* **Encadenamiento (Sandbox):** Para evadir los firewalls tradicionales de red del banco, el grupo APT "GoldenJackal" desplegó un **gusano de IA polimórfico interno** que se comunica únicamente a través de prompts en lenguaje natural entre los distintos asistentes de IA internos del banco.
* **Efecto en el Sandbox:** El gusano infecta al agente que procesa peticiones de transferencias, permitiéndole desviar fondos en transacciones pequeñas y auto-replicándose silenciosamente en la red interna a través de los chats de ayuda técnica de los empleados.
* **Foco Educativo:** Uso de agentes de IA como canal de Comando y Control (C2) encubierto para evadir DLP (Data Loss Prevention) tradicionales.

### Caso 4: Elecciones Bajo Fuego (`co-government-multi-vector-elections`) + AI Worm
* **Ataque Primario (Juego):** DDoS masivo y desinformación mediante deepfakes durante las elecciones.
* **Encadenamiento (Sandbox):** El grupo APT41 utilizó una inyección indirecta de prompt en el buzón de quejas ciudadanas. El correo electrónico contenía un payload polimórfico diseñado para forzar al agente automatizado de la Registraduría a propagar el deepfake del presidente.
* **Efecto en el Sandbox:** Al abrir el correo de quejas, el agente de recepción se infecta y reenvía correos automatizados con el enlace del deepfake a los servidores de correo de la prensa nacional, amplificando la campaña de desinformación de forma autónoma.
* **Foco Educativo:** Automatización de campañas de desinformación masivas mediante la infección de agentes de comunicación gubernamentales.

---

## 3. Visualización en la Interfaz (Frontend)

En el panel de selección de escenarios del Sandbox, cuando el usuario haga clic en un escenario, se mostrará una tarjeta de **"Vector de Ataque Encadenado"** explicando exactamente esta narrativa:

> **[SQL Injection E-commerce Brasil]**
> * **Vector de Entrada:** Inyección SQL exitosa en base de datos de productos.
> * **Semilla del Gusano:** Payload de prompt polimórfico almacenado en el catálogo.
> * **Consecuencia CISO:** 0.8% Churn por correo spam enviado; multa de $25,000 USD bajo LGPD.
