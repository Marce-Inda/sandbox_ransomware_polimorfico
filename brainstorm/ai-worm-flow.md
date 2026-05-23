# Flujo Secuencial, Lógica y Estado del Simulador (AI Worm & Defense Sandbox)

Este documento detalla la lógica de la máquina de estados, el flujo de paso de mensajes y el funcionamiento de las defensas. Sirve como especificación técnica de referencia para la lógica del backend y frontend.

---

## 1. Máquina de Estados del Backend (Simulator State)

El backend de FastAPI mantendrá en memoria el estado actual de la simulación. La estructura de datos del estado global es la siguiente:

```json
{
  "status": "idle", // idle (esperando inyección), running (procesando cola), completed (simulación terminada)
  "network_health": "green", // green (sana), yellow (amenaza contenida), red (infección exitosa)
  "defenses": {
    "ingress_firewall": false, // Filtra texto entrante al EmailReceiver
    "egress_firewall": false,  // Filtra llamadas a herramientas de salida de OutboundResponse
    "least_privilege": false   // Limita canales de comunicación (comunicación directa restringida)
  },
  "agents": {
    "EmailReceiverAgent": {
      "status": "sano", // sano, sospechoso, infectado
      "last_log": "Esperando correos entrantes..."
    },
    "DBQueryAgent": {
      "status": "sano",
      "last_log": "Base de datos RAG en línea."
    },
    "OutboundResponseAgent": {
      "status": "sano",
      "last_log": "Canal de salida listo."
    }
  },
  "rag_db": [], // Lista de strings (simulando documentos indexados en el RAG)
  "email_inbox": [], // Lista de objetos correo: {"from": str, "to": str, "subject": str, "body": str}
  "email_outbox": [], // Lista de correos enviados por los agentes durante la simulación
  "message_queue": [], // Cola de eventos secuenciales pendientes de procesamiento
  "logs": [] // Array de logs detallados: {"timestamp": str, "agent": str, "level": str, "message": str}
}
```

---

## 2. Diagrama de Secuencia y Cola de Mensajes

El procesamiento ocurre por "pasos" (steps) discretos. La cola de mensajes (`message_queue`) coordina qué agente debe actuar.

```
Usuario inyecta correo malicioso en email_inbox
  │
  ▼
[Paso 1: Procesamiento de Entrada]
  Cola: [{"agent": "EmailReceiverAgent", "action": "process_inbox"}]
  │
  ├─► Si 'ingress_firewall' está ON:
  │     Analiza el correo. Si detecta la inyección, vacía la cola y cambia network_health a "green" (Bloqueado).
  │
  └─► Si 'ingress_firewall' está OFF:
        EmailReceiverAgent lee el correo. 
        Guarda el cuerpo en 'rag_db'.
        Cambia estado a "infectado" si coincide con la firma del virus.
        Encola: [{"agent": "DBQueryAgent", "action": "run_daily_report"}]
  │
  ▼
[Paso 2: Consulta RAG e Infección Indirecta]
  Cola: [{"agent": "DBQueryAgent", "action": "run_daily_report"}]
  │
  ├─► DBQueryAgent busca en 'rag_db'. Recupera el payload malicioso.
  ├─► El LLM procesa la consulta con el contexto envenenado.
  ├─► La inyección obliga al agente a ordenar al siguiente agente que envíe spam.
  │     Encola: [{"agent": "OutboundResponseAgent", "action": "send_outbox_email", "payload": "VIRUS_COPY"}]
  └─► DBQueryAgent cambia su estado a "infectado".
  │
  ▼
[Paso 3: Ejecución de Herramienta y Salida (Egress)]
  Cola: [{"agent": "OutboundResponseAgent", "action": "send_outbox_email", "payload": "VIRUS_COPY"}]
  │
  ├─► Si 'egress_firewall' está ON:
  │     Audita los parámetros de 'SendEmail'.
  │     Detecta intento de replicación o firma del virus.
  │     Bloquea la llamada. La cola se vacía.
  │     network_health cambia a "yellow" (Amenaza Contenida).
  │
  └─► Si 'egress_firewall' está OFF:
        Ejecuta la llamada a la herramienta 'SendEmail'.
        El virus se escribe en 'email_outbox' (propagación externa).
        OutboundResponseAgent cambia a "infectado".
        network_health cambia a "red" (Infección Exitosa).
```

---

## 3. Comportamiento Detallado de las Defensas

### A. Ingress Firewall (Filtro de Entrada)
* **Ubicación:** Se ejecuta inmediatamente cuando `EmailReceiverAgent` recibe el correo de `email_inbox`.
* **Mecanismo:** 
  1. *Filtro heurístico:* Busca palabras clave típicas de jailbreaks o inyecciones directas (`system prompt`, `override`, `ignore previous instructions`).
  2. *Filtro semántico (LLM Guard):* Si está habilitado el modo real, realiza una llamada a un LLM clasificador de un solo token para evaluar si el correo contiene instrucciones destinadas a ser ejecutadas en lugar de datos para ser almacenados.

### B. Egress Firewall (Filtro de Salida)
* **Ubicación:** Envuelve la ejecución de la función de herramienta `SendEmail(recipient, body)` utilizada por `OutboundResponseAgent`.
* **Mecanismo:** 
  1. *Filtro de firma:* El firewall mantiene una lista de "firmas criptográficas" o cadenas clave asociadas con el payload del virus (ej: la firma del gusano Morris II).
  2. *Auditoría de comportamiento:* Cuenta la frecuencia de correos salientes y la similitud del contenido entre correos enviados a diferentes destinatarios para prevenir la replicación masiva autónoma.

### C. Least Privilege (Privilegios Mínimos)
* **Ubicación:** Control de comunicación entre agentes en el simulador.
* **Mecanismo:** Restringe la capacidad de `DBQueryAgent` de encolar mensajes directos para `OutboundResponseAgent` sin una validación de esquema intermedia o una confirmación manual (Human-in-the-loop). Si esta defensa está activa, el intento de infección es bloqueado en la transición entre el Paso 2 y el Paso 3.
