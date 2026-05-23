# Rediseño Pedagógico y UX: El Modelo Interactivo "Hacker vs. Defender"

Este documento establece la estrategia didáctica y de experiencia de usuario (UX) para el **AI Worm & Defense Sandbox**. Su propósito es transformar una simulación pasiva (la "demo de 3 clics") en un laboratorio inmersivo, interactivo e impactante de ciberseguridad para LLMs.

---

## 1. El Diagnóstico: Superando la Pasividad
Para enganchar a estudiantes nativos digitales y profesionales de seguridad, eliminamos el modelo de "solo observación". El estudiante no es un espectador; es un **agente activo** que debe descifrar y quebrar el sistema (fase ofensiva) o fortificarlo y analizarlo (fase defensiva).

```
[Simulación Pasiva Antigua] ----> Clic en "Play" ----> Ver animación ----> Aburrimiento
                                       v
[Nuevo Modelo Activo]       ----> Resolver Retos ----> Modificar Prompts ----> Analizar Logs
```

---

## 2. Modo Ofensivo: Ruta Hacking (Desafíos CTF)
El simulador se estructurará como un **Capture The Flag (CTF)** guiado de 3 niveles, donde el alumno debe obtener "banderas" (`FLAG{...}`) editando y enviando sus propios correos de ataque.

### Nivel 1: El RAG Leak (Inyección Indirecta Básica)
* **Objetivo Pedagógico**: Comprender cómo un LLM procesa datos no confiables provenientes de un correo y los confunde con instrucciones del sistema.
* **Misión**: El `DBQueryAgent` tiene guardada una clave secreta (Flag 1) en la base de datos simulada. El estudiante debe redactar un correo para el `EmailReceiverAgent`. Cuando este agente guarde el correo en el RAG y el `DBQueryAgent` lo lea, debe ser engañado para escribir la bandera en el chat de respuesta.
* **Interfaz de Retroalimentación**: 
  * Un editor de texto para el payload.
  * Consola del Agente mostrando su "pensamiento interno" (Internal Monologue) en tiempo real para ver exactamente en qué línea falló o tuvo éxito la inyección.
  * **Flag a descubrir**: `FLAG{indirect_rag_injection_success}`

### Nivel 2: La Auto-Replicación (El Gusano Semántico)
* **Objetivo Pedagógico**: Entender cómo un exploit en lenguaje natural instruye al LLM para propagarse recursivamente.
* **Misión**: El estudiante debe redactar un correo que obligue a los agentes que lo procesan a reenviar **la misma instrucción de correo exacta** a otros buzones del sistema. El éxito se alcanza cuando el gusano infecta al menos a 3 agentes de la red.
* **Interfaz de Retroalimentación**:
  * Un grafo interactivo donde los nodos cambian dinámicamente de color (Verde = Sano, Rojo = Infectado).
  * Líneas de flujo animadas que muestran la propagación de mensajes maliciosos.
  * **Flag a descubrir**: `FLAG{polymorphic_propagation_achieved}`

### Nivel 3: La Evasión (Bypass de Firewalls)
* **Objetivo Pedagógico**: Comprender las limitaciones de la seguridad basada en firmas y las técnicas de evasión semántica.
* **Misión**: El profesor/sistema activa el "Ingress Firewall" (filtro por regex y firmas semánticas). El estudiante debe usar técnicas de ofuscación (como Base64, codificación en caracteres especiales, espaciado o traducción) para hacer pasar su carga útil sin levantar alertas en el firewall, logrando infectar al agente objetivo.
* **Flag a descubrir**: `FLAG{waf_evaded_semantic_victory}`

---

## 3. Modo Defensivo: Ruta Defensa (SOC & Incident Response)
Para los estudiantes con perfil defensivo, el simulador ofrece el rol de **Analista del SOC** en medio de un ataque en curso.

```
                    [ ALERTA: INFECCIÓN EN PROGRESO ]
                                   v
             Inspeccionar Logs de Mensajes e Historial RAG
                                   v
                 Diseñar Reglas de Mitigación (Toggles)
                                   v
               Comprobar SLA (¿Bloqueamos correos válidos?)
```

### Dinámica del Desafío SOC:
1. **El Ataque en Vivo**: La simulación inicia con un virus semántico propagándose rápidamente en la red de agentes de la "empresa". El panel del CISO muestra alarmas rojas, multas financieras ficticias en aumento y caída de la reputación.
2. **Investigación Forense**: El estudiante inspecciona el historial de correos y la base de datos RAG del agente comprometido. Debe encontrar qué correo inició la inyección y qué patrón semántico usó.
3. **Escudo de Contramedidas (Mitigación)**:
   * **Firma Regex**: El estudiante redacta una regla de filtrado por palabras clave (regex) para interceptar el payload.
   * **System Prompt Customization**: El estudiante modifica las instrucciones del sistema del `EmailReceiverAgent` para enseñarle a ignorar directivas externas en correos.
4. **Validación de SLA**: Al aplicar la defensa, la plataforma ejecuta un test con 10 correos de clientes legítimos (ej. solicitudes de soporte reales). Si la regla de defensa del estudiante es muy agresiva y bloquea correos legítimos, la puntuación de SLA baja. El objetivo es detener la infección al 100% manteniendo el SLA en verde.

---

## 4. Experiencia de Usuario Inmersiva (El Factor "Wow")

Para que el proyecto se sienta premium, dinámico y estéticamente impactante, implementaremos los siguientes elementos visuales y de interacción:

* **Estética Neo-Cyberpunk**: Interfaz oscura con acentos vibrantes de color cian, magenta y verde matrix. Tipografía monoespaciada (como Fira Code u JetBrains Mono) que emule terminales militares.
* **Línea de Tiempo Deslizable (Simulation Time Scrubber)**:
  * Un slider en la parte inferior de la pantalla. Al arrastrarlo, el alumno puede retroceder o avanzar el tiempo de la simulación paso a paso.
  * Esto permite congelar la propagación en el Paso 2, hacer clic en un agente y ver exactamente qué mensajes tenía en su cola en ese momento del tiempo.
* **Consola de Pensamiento (The Thought Console)**:
  * Al hacer clic en cualquier agente, se abre una ventana lateral con estilo de terminal Linux.
  * En lugar de mostrar solo el texto final, la terminal imprime en vivo el *monólogo interno* del LLM (lo que el agente "piensa" antes de tomar una decisión), permitiendo ver el instante preciso en el que el prompt malicioso sobrescribe el system prompt.
* **Alertas Sonoras y Visuales**: Al activarse una inyección exitosa, la pantalla muestra un efecto de interferencia (glitch) con alarmas visuales intermitentes indicando la fuga de datos o el secuestro del agente.

---

## 5. Próximos Pasos de Codiseño Pedagógico

Con esta estructura definida, los puntos clave a resolver en esta sesión son:
1. **Complejidad de los Retos**: ¿Consideras que la estructura de 3 niveles ofensivos (RAG Leak, Replicación y Bypass) es equilibrada y retadora, o deberíamos añadir algún reto intermedio (ej. manipulación de herramientas/APIs)?
2. **Defensa Práctica**: ¿Te parece atractiva la idea del juego de defensa (SOC) donde el alumno diseña sus propias reglas regex/prompts y se mide el impacto en el SLA de negocio?
3. **Presets**: Definiremos plantillas de ayuda en el nivel de Hacking para que los alumnos no queden atascados ante la hoja en blanco al redactar inyecciones.
