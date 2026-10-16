# Checklist de Verificación y Control de Calidad — The Formulabs

Este documento reúne las 4 fases de optimización y sus 18 puntos auditados para validar manualmente o mediante pruebas el correcto funcionamiento del sistema en frontend y backend (Supabase).

---

## 🟢 FASE A: Quick Wins & Erradicación de Fricciones

- [ ] **Punto 11: Bloqueo de scroll en inputs numéricos**
  - **Ubicación:** Listener global en `App.jsx` o hook global.
  - **Prueba:** Hacer foco en cualquier input de tipo numérico (precios, días de corte, duración) y girar la rueda del mouse.
  - **Criterio de éxito:** El valor numérico se mantiene inalterado y el input pierde el foco (`blur`) de forma limpia.

- [ ] **Punto 15: Conteo real de propuestas en el Dashboard**
  - **Ubicación:** `src/components/dashboard/proposals/ProposalsTabSection.jsx`.
  - **Prueba:** Contabilizar propuestas que tengan versiones hijas (ej. una propuesta con v1, v2 y v3).
  - **Criterio de éxito:** El contador principal solo cuenta las propuestas raíz (`!propuesta_padre_id`). En el ejemplo anterior, suma 1 y no 3.

- [ ] **Punto 8: Auto-apertura de edición al crear nueva versión**
  - **Ubicación:** `src/components/dashboard/proposals/CreateProposalVersionModal.jsx` y `ProposalsTabSection.jsx`.
  - **Prueba:** Generar una versión iterada (v2, v3...) desde el modal de duplicación.
  - **Criterio de éxito:** Tras guardar, el modal se cierra y se abre automáticamente el editor (`ProposalModal`) de la nueva versión sin requerir búsqueda ni clics adicionales.

- [ ] **Punto 9: Nombre automático de calendario y limpieza de borradores**
  - **Ubicación:** `src/components/dashboard/calendar/CreateCalendarModal.jsx`.
  - **Prueba:** Abrir el modal de creación de calendario y alternar entre distintos meses.
  - **Criterio de éxito:** El campo de nombre sugiere dinámicamente `"Calendario [MES] [AÑO]"` (ej. `"Calendario OCTUBRE 2026"`). Se removieron las opciones obsoletas de importación de borradores locales.

- [ ] **Punto 10: Estandarización del componente de previsualización de Slug**
  - **Ubicación:** `src/components/common/SlugPreviewField.jsx`.
  - **Prueba:** Inspeccionar la previsualización del link en `CreateCalendarModal`, `ProposalInfoTab`, `CreateProposalVersionModal` y `ProductionDetailModal` (Operaciones).
  - **Criterio de éxito:** Todos los módulos utilizan el mismo bloque estilizado con prefijo fijo en gris (`theformulab.io/...`) y el slug activo destacado con botón de copiado integrado.

- [x] **Punto 12: Botones interactivos de contacto en el expediente de Leads**
  - **Ubicación:** `src/components/dashboard/diagnostics/LeadDetailModal.jsx` y `LeadContactBar.jsx`.
  - **Prueba:** Abrir el modal de detalle de cualquier prospecto calificado.
  - **Criterio de éxito:** WhatsApp e Instagram se presentan como botones tipo píldora (`rounded-full`) con colores representativos planos (verde esmeralda y color plano oficial de Instagram `#E1306C` igual al template del email) y abren los enlaces directos en una pestaña nueva.

- [x] **Punto 17: Indicación de servicio (Gestión, Proyecto o Mentoría) y contacto en texto junto al nombre**
  - **Ubicación:** `src/components/dashboard/diagnostics/LeadDetailModal.jsx` y `LeadContactBar.jsx`.
  - **Prueba:** Abrir el expediente de cualquier prospecto calificado.
  - **Criterio de éxito:**
    1. Se indica con precisión el servicio requerido (Gestión Integral, Proyecto Puntual o Mentoría) mediante badge clínico sin estructuras redundantes.
    2. Al lado del nombre del prospecto se muestra en texto plano su Instagram (@usuario) y teléfono (+número).
    3. El botón interactivo de Instagram se presenta limpio como `"Ver Instagram"` (sin el usuario incrustado).

---

## 🟡 FASE B: Reglas de Negocio, SLA de Rodaje y Desaturación de Pagos

- [ ] **Punto 1: Slug reactivo por nombre y calibración de cuadrícula**
  - **Ubicación:** `src/components/dashboard/proposals/ProposalInfoTab.jsx`.
  - **Prueba:** Escribir o editar el nombre de un cliente en una nueva propuesta.
  - **Criterio de éxito:** El slug se genera automáticamente en minúsculas, sin acentos ni caracteres especiales. El formulario se distribuye en una cuadrícula alineada de 2 columnas sin desbordamientos.

- [x] **Punto 4: Locación base predeterminada en las instalaciones del cliente y sincronización operativa**
  - **Ubicación:** `src/components/booking/BookingFormCard.jsx`, `src/services/calendarService.js` y `src/components/dashboard/operations/ProductionDetailModal.jsx`.
  - **Prueba:** Actualizar la locación de un cliente desde su configuración en el Dashboard y revisar tanto la ventana de operaciones (detalle de rodaje) como el enlace público de reserva (`/reservar/produccion?token=...`).
  - **Criterio de éxito:** La dirección actualizada se hereda y sincroniza automáticamente en las sesiones de rodaje pendientes en Operaciones y se precarga en la ventana pública de reserva.

- [ ] **Punto 5: Restricción estricta de agenda (Lunes a Viernes y 3 días mínimos)**
  - **Ubicación:** `src/components/booking/BookingFormCard.jsx`.
  - **Prueba:** Intentar seleccionar un día sábado o domingo, o un día dentro de las próximas 48 horas.
  - **Criterio de éxito:** Los fines de semana aparecen bloqueados (o son invalidados) y la fecha mínima seleccionable es de al menos 3 días posteriores a la fecha corriente.

- [ ] **Puntos 2 y 6: Alerta clínica de SLA, cancelaciones y tipo de rodaje**
  - **Ubicación:** `src/components/booking/ProductionSlaWarningDialog.jsx`.
  - **Prueba:** Completar los campos de reserva y pulsar `"Confirmar Fecha de Grabación"`.
  - **Criterio de éxito:** Se despliega el diálogo de advertencia especificando:
    1. Penalización completa si se cancela o reprograma con menos de 72 horas.
    2. Las sesiones no son acumulables de un mes a otro.
    3. Tolerancia de 30 minutos de comienzo y cargo extra por tiempo adicional.
    4. Nivel de producción esperado (orgánica vs. profesional) consistente con la vista pública y sin emojis al lado de iconos.

- [ ] **Punto 16: Desaturación visual y jerarquía del modal de activación de cuenta**
  - **Ubicación:** `src/components/proposal/ProposalActivationModal.jsx`.
  - **Prueba:** Hacer clic en `"Aceptar Propuesta"` desde la vista pública comercial.
  - **Criterio de éxito:** El modal presenta un diseño conciso y quirúrgico centrado en:
    1. Transparencia del total: Se expone la inversión total del plan.
    2. Jerarquía de cobros: Distribución clara entre el 1er abono inmediato (prioritario con indicador "A transferir hoy") y 2do abono programado.
    3. Datos bancarios limpios con confirmación del monto exacto a transferir y copiado rápido de CLABE con un clic.
    4. Botón directo a WhatsApp con mensaje automático que cita el abono y el total contratado.

---

## 🔵 FASE C: Gestión Comercial Avanzada y Datos Maestros

- [ ] **Punto 7: Selector de sesiones mensuales y precio extra en propuestas**
  - **Ubicación:** `src/components/dashboard/proposals/ProposalPricingTab.jsx` y `src/services/operationsService.js`.
  - **Prueba:** Configurar 2 o más sesiones en la propuesta y convertirla en cliente mediante el botón del Dashboard.
  - **Criterio de éxito:** El campo `clientes.producciones_por_mes` se guarda con el número exacto configurado, y el ciclo mensual genera automáticamente esa cantidad de slots de rodaje (`numero_sesion = 1..N`).

- [ ] **Punto 14: Borrado inteligente de versiones de propuestas**
  - **Ubicación:** `src/components/dashboard/proposals/DeleteProposalVersionDialog.jsx` y `src/services/proposalCrudService.js`.
  - **Prueba:** Intentar borrar una versión dentro de una propuesta que tiene historial iterado.
  - **Criterio de éxito:** Si la propuesta tiene múltiples versiones, el diálogo ofrece 3 acciones explícitas:
    1. `"Cancelar"`: Cierra el diálogo sin modificaciones.
    2. `"Eliminar v[X]"`: Elimina únicamente la versión activa (re-vinculando la raíz si se borra la v1 para evitar registros huérfanos).
    3. `"Eliminar Todo ([N])"`: Erradica en bloque el expediente completo y todas sus versiones iteradas.

- [ ] **Punto 13: Panel de control de datos de agencia y comprobantes**
  - **Ubicación:** Tabla `configuraciones` en Supabase, `src/services/configService.js`, `src/pages/Dashboard.jsx` y `src/components/dashboard/common/BankSettingsModal.jsx`.
  - **Prueba:** Hacer clic en el icono de flecha abajo al final del email en el header del Dashboard, seleccionar `"Datos"`, y actualizar los datos bancarios o el número de WhatsApp receptor de comprobantes.
  - **Criterio de éxito:**
    1. El header despliega un menú desde la píldora del email con la opción `"Datos"`.
    2. El modal permite configurar banco, beneficiario, CLABE y el teléfono de WhatsApp para comprobantes con el código internacional `+52` predeterminado (ingresando solo los 10 dígitos locales, mientras que el concepto en la propuesta se mantiene automáticamente con el slug/nombre del cliente).
    3. Los botones de WhatsApp en `ProposalActivationModal` y `BookingLockedCard` dirigen al número dinámicamente configurado.

---

## 🟣 FASE D: Tiempo Real (Realtime)

- [ ] **Punto 18: Actualización en vivo de diagnósticos (Supabase Realtime)**
  - **Ubicación:** `supabase/migrations/20261017_realtime_leads.sql`, `src/components/dashboard/diagnostics/DiagnosticsTabSection.jsx` y `src/pages/Dashboard.jsx`.
  - **Prueba:** Enviar un nuevo diagnóstico desde la landing page en una pestaña de incógnito mientras el Dashboard administrativo permanece abierto.
  - **Criterio de éxito:**
    1. La nueva fila aparece al inicio de la lista de leads de forma automática sin recargar la página.
    2. Se dispara una notificación visual (`toast.info`).
    3. El badge numérico de pendientes en la pestaña `Diagnósticos` se actualiza reactivamente.

---

## ⏸️ Punto Aplazado

- **Punto 3: Autocompletado de dirección con Google Places / Maps**
  - **Estado:** Pospuesto deliberadamente para evitar dependencias de credenciales y facturación en Google Cloud Console en esta etapa. El campo opera actualmente como input de texto validado con fallback inteligente.