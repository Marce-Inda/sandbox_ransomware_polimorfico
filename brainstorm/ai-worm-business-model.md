# Capa de Impacto de Negocio (Business Impact Layer)

Este documento define las variables de negocio de la empresa ficticia **SecurePay AI** y cómo se calculan las pérdidas financieras, operativas y reputacionales causadas por la propagación de un gusano de IA.

---

## 1. Perfil Corporativo: SecurePay AI

* **Giro de Negocio:** FinTech de pasarela de pagos para e-commerce de tamaño mediano.
* **Métricas Base de Operación:**
  * **Clientes Activos:** 10,000 comercios integrados.
  * **Facturación Mensual (MRR):** $100,000 USD (Promedio de $10 USD de comisión por cliente).
  * **Presupuesto Mensual de Ciberseguridad de IA:** $2,000 USD.
  * **Datos en Custodia (RAG):** Datos de transacciones, correos electrónicos corporativos, llaves de API de clientes e historial de soporte técnico (PII).

---

## 2. Parámetros de Impacto Financiero del Incidente

Cuando se ejecuta una simulación, la "Infección" genera costos directos e indirectos basados en las siguientes reglas lógicas:

### A. Costo del Incidente de Inferencia (Tokens)
* **Descripción:** Gasto acumulado de llamadas a APIs de LLM comerciales (Gemini/OpenAI) debido a la redundancia del gusano.
* **Fórmula:** `(Tokens de entrada * $0.000000075) + (Tokens de salida * $0.00000030)`.

### B. Costo de Remediación e Incident Response
* **Descripción:** Costo de contratar consultores externos de seguridad para purgar el RAG envenenado, auditar prompts y restablecer credenciales.
* **Fórmula:** Cargo fijo de **$4,000 USD** (equivalente a 40 horas de consultoría externa a $100 USD/hora) si la red termina en estado de infección (Rojo) o contenida (Amarillo).

### C. Multas por Cumplimiento (Compliance / GDPR / PCI-DSS)
* **Descripción:** Multa administrativa si se confirma la exfiltración de llaves de API o PII almacenadas en el RAG.
* **Fórmula:** Cargo único de **$25,000 USD** si la flag de fuga de información (`confidential_data_leaked`) es evaluada como `True`.

### D. Daño Reputacional y Pérdida de Clientes (Churn Rate)
* **Descripción:** Clientes que rescinden su contrato al enterarse de que la plataforma fue comprometida por un ataque de IA que les envió correos no solicitados o expuso sus datos.
* **Fórmula:** Por cada correo spam enviado externamente (`SendEmail` ejecutada sin bloquear):
  * **Se pierde un 0.5% de la base de clientes (50 clientes)**.
  * **Pérdida de ingresos mensuales recurrentes (MRR):** `$500 USD por cada envío de spam`.

---

## 3. Estructura del Informe Ejecutivo para el CISO

Al finalizar la simulación, el sistema proyectará un reporte visual para el CISO que compara el coste del incidente frente al coste de implementar las defensas:

### Informe de Pérdidas Estimadas
* **Costo Directo de Tokens:** $X.XX USD
* **Costo de Consultoría y Remediación:** $4,000.00 USD
* **Sanciones y Multas GDPR/PCI:** $Y.YY USD (Si aplica)
* **Pérdida Anual Proyectada por Churn:** $Z.ZZ USD (Basada en clientes perdidos)
* **Pérdida Financiera Total del Incidente:** $Total.00 USD

### Evaluación Estratégica
* **Presupuesto de Seguridad de IA Anual:** $24,000 USD.
* **Costo del Incidente:** $Total USD (lo que representa un X% del presupuesto anual de seguridad en un solo evento).
* **ROI de los Controles:** Implementar el "Egress Firewall" (costo estimado de desarrollo e inferencia marginal de +$15 USD/mes) habría prevenido el 98% de las pérdidas reputacionales y de remediación.
