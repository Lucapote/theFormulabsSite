# Estado del Proyecto — The Formulab (STATUS.md)

**Última actualización:** 2026-11-06  
**Fase actual:** Arquitectura de 2 Columnas (Administración/Finanzas + Mission Control Rodajes).

---

## 📸 Foto de Hoy (Contexto Operativo)

1. **Modularización Progresiva de Componentes Extensos (Opción B — Sprint 1)**:
   - **`NotificationCenterPopover.jsx` (438 $\rightarrow$ 200 líneas)**: Modularizado extrayendo `FailedPostNotificationCard.jsx` (94 lín), `PreReservaNotificationCard.jsx` (48 lín), `FeedbackNotificationCard.jsx` (59 lín) y `NotificationZeroInboxCard.jsx` (19 lín).
   - **`FinanceCostModal.jsx` (412 $\rightarrow$ 222 líneas)**: Modularizado extrayendo `ReceiptUploaderField.jsx` (89 lín), `FinanceAmountsFormFields.jsx` (75 lín) y `FinanceMarginSummaryCard.jsx` (26 lín).
   - **`CreateClientModal.jsx` (411 $\rightarrow$ 115 líneas)**: Modularizado extrayendo `CreateClientIdentityTab.jsx` (87 lín) y `CreateClientRetainerTab.jsx` (238 lín).
   - **`PostCopyBottomSheet.jsx` (377 $\rightarrow$ 248 líneas)**: Modularizado extrayendo `PostCopyBottomSheetActions.jsx` (172 lín).
   - **Todos cumplen estrictamente $\le 250$ líneas** bajo el Principio de Responsabilidad Única (SRP) de [GEMINI.md](file:///c:/Users/ASUS/OneDrive/Escritorio/Proyectos/theFormulabsSite/GEMINI.md).

2. **Resolución de Quick-Wins de Cumplimiento GEMINI.md (Opción A)**:
   - **Eliminación de Estilos Inline en Checklist (`BookingChecklistSection.jsx`)**: Se sustituyó `style={{ width: `${porcentaje}%` }}` por clases utilitarias dinámicas de Tailwind (`w-full`, `w-3/4`, etc.) para un diseño 100% utilitario.
   - **Eliminación de Estilo Inline en Portada (`Index.jsx`)**: Se reemplazó el color de fondo inline en el indicador de etapas por clases de color oficiales de Tailwind (`bg-brand-magenta` y `bg-brand-blue`).
   - **Eliminación de Fallback Literal en API (`api/meta-callback.js`)**: Se removió el ID de Meta quemado como fallback (`"1988387095189436"`), requiriendo validación explícita de `META_APP_ID` y `META_APP_SECRET`.

2. **Reestructuración a 2 Columnas en `OperationsCycleCard.jsx`**:
   - **Columna 1 (33.3%, `lg:col-span-4`) — [`CycleClientPanel.jsx`](file:///c:/Users/ASUS/OneDrive/Escritorio/Proyectos/theFormulabsSite/src/components/dashboard/operations/CycleClientPanel.jsx)**:
     - Cabecera: Nombre de la empresa con icono de configuración y botón de desglose `[$ Costos]`.
     - Datos ordenados sin repetición: `Corte: Día X` y `Orgánica (4h)` / `Profesional (6h)`.
     - Se eliminó la etiqueta incomprensible `"Pagos: 1 + 1 ses."` y la repetición de fechas de corte.
     - Selector de estado de pago integrado con botón de validación ágil (`[Acreditar Pago]` / `[Validar 1er Abono]` / `[Aprobar / Rechazar Comprobante]`).
     - Insignias de comprobantes aprobados.
     - Pie con métricas discretas (`Cobrado: $X · Costo Op: $Y`) y acceso al calendario mensual.
   - **Columna 2 (66.7%, `lg:col-span-8`) — [`CycleSessionsTrack.jsx`](file:///c:/Users/ASUS/OneDrive/Escritorio/Proyectos/theFormulabsSite/src/components/dashboard/operations/CycleSessionsTrack.jsx)**:
     - Máximo protagonismo y amplitud para el centro de rodajes.
     - Spotlight del próximo rodaje con borde rosa de marca de 2px (`border-2 border-[#ef18d6]`), fecha, locación, checklist de requerimientos y copiado de enlace.
     - Fila inferior compacta para el resto de sesiones del mes y botón `+ Agregar Rodaje`.

---

## ✅ Resuelto Recientemente

1. **Arquitectura de 2 Columnas en Tarjetas de Ciclo — [COMPLETADO]**:
   - `OperationsCycleCard.jsx` (149 líneas) ensambla el layout 4/8.
   - `CycleClientPanel.jsx` (216 líneas) y `CyclePaymentVerificationBlock.jsx` (123 líneas) modularizados bajo SRP ($\le 250$ líneas).
   - `CycleSessionsTrack.jsx` (86 líneas) ampliado al 66.7% sin bordes laterales redundantes.
2. **Refinamiento Visual Spotlight & Limpieza de Altura — [COMPLETADO]**:
   - `UpcomingProductionSpotlight.jsx` (246 líneas) con borde 2px rosa `#ef18d6`, sin barra degradé y sin inline styles.
   - `CycleSessionsTrack.jsx` (86 líneas) sin alerta redundante de reserva bloqueada.
2. **Mission Control Operativo en Ciclos — [COMPLETADO]**:
   - Helper `getClosestUpcomingSession` en `bookingHelpers.js`.
   - Nuevos componentes modulares `UpcomingProductionSpotlight.jsx` (241 líneas) y `SecondarySessionsList.jsx` (63 líneas).
   - `CycleApprovedReceiptsBadges.jsx` (59 líneas) extraído para mantener `CycleFinanceHub.jsx` en 248 líneas ($\le 250$).
   - Layout 3-6-3 en `OperationsCycleCard.jsx` (161 líneas).
2. **Cuadro Multilínea con Salto de Línea en Gestor de Requerimientos — [COMPLETADO]**:
   - `ProductionChecklistManager.jsx` actualizado con textarea multilínea, salto de línea en `Enter` y pegado masivo con limpieza de viñetas.
3. **Flujo de 3 Pasos en Reserva de Producción — [COMPLETADO]**:
   - `[ Comprobante ] [ Reserva ] [ Requerimientos ]` en contenedor unificado de ancho idéntico.

---

## ⏳ Próximos Pasos Disponibles

- Recargar el navegador para visualizar el nuevo layout Mission Control de las tarjetas operativas en el Dashboard.
- Ejecutar la migración SQL `20261106_requerimientos_produccion_checklist.sql` en Supabase para persistir permanentemente los requerimientos.
