# Plan de Corrección Integral y Pulido Clínico UX/UI (Operaciones y Reserva)

Este documento detalla la solución técnica para resolver los 4 problemas reportados por el usuario, elevando la prolijidad visual y ergonomía conforme a las reglas de **GEMINI.md** (diseño *Clinical High-Tech Lab*, cero emojis, Tailwind puro y componentes reutilizables).

---

## 1. Diagnóstico de Causas Raíz

### A. El modal de confirmación de eliminación queda bloqueado o por detrás
- **Causa Raíz**: `ProductionDetailModal` utiliza `BaseFormModal` (construido sobre Radix UI `Dialog`), el cual monta un portal en `document.body` con un backdrop a pantalla completa y trampa de foco (*focus trap*). `ConfirmDeleteModal` se renderizaba como un `div` con `fixed inset-0 z-50` dentro del árbol normal (`#root`), quedando bloqueado por el backdrop de Radix (`aria-hidden="true"` y pointer-events bloqueados en `#root`).
- **Solución**: Convertir `ConfirmDeleteModal` para que use el componente nativo de Radix [`AlertDialog`](file:///c:/Users/ASUS/OneDrive/Escritorio/Proyectos/theFormulabsSite/src/components/ui/alert-dialog.jsx) o `createPortal(..., document.body)` con capa superior `z-[100]`. Esto garantiza que siempre se renderice al frente con prioridad absoluta y foco accesible.

### B. "Comprobante de la 2da sesión supuestamente subido pero no aparece en el Dashboard"
- **Causa Raíz**: En [`BookingFormCard.jsx`](file:///c:/Users/ASUS/OneDrive/Escritorio/Proyectos/theFormulabsSite/src/components/booking/BookingFormCard.jsx#L46-L52), la constante `existingReceipt` evaluaba:
  ```javascript
  const existingReceipt = comprobanteSubidoUrl || ciclo?.comprobante_url || ciclo?.comprobante_2_url || ...
  ```
  Al abrir la reserva de **Octubre 2** (segundo abono), detectaba `ciclo.comprobante_url` (perteneciente a **Octubre 1**) y le mostraba erróneamente al cliente: *"Comprobante registrado • En revisión"*. En realidad el cliente nunca había adjuntado el comprobante del 2do abono (`ciclo.comprobante_2_url` seguía `null`), generando una falsa apariencia en la reserva y la ausencia del comprobante en el dashboard.
- **Solución**: Condicionar la detección en [`BookingFormCard.jsx`](file:///c:/Users/ASUS/OneDrive/Escritorio/Proyectos/theFormulabsSite/src/components/booking/BookingFormCard.jsx) según el tramo de la sesión:
  - Si la sesión corresponde al segundo corte (`numero_sesion > sesiones_primer_pago`): **solo** leer `ciclo.comprobante_2_url`.
  - Si corresponde al primer corte: **solo** leer `ciclo.comprobante_url`.
  - Así, la pantalla de Octubre 2 mostrará limpiamente el selector de archivo vacío para que el cliente adjunte el comprobante del 2do pago, y al confirmarlo, se actualizará `comprobante_2_url` y aparecerá de inmediato en el panel de revisión del Dashboard.

### C. Eliminación estricta de emojis (Regla GEMINI.md)
- **Causa Raíz**: En [`OperationsCycleCard.jsx`](file:///c:/Users/ASUS/OneDrive/Escritorio/Proyectos/theFormulabsSite/src/components/dashboard/operations/OperationsCycleCard.jsx#L369) se incluyó el emoji `📄` (`[📄 Ver]`), y en [`ProductionSessionCapsule.jsx`](file:///c:/Users/ASUS/OneDrive/Escritorio/Proyectos/theFormulabsSite/src/components/dashboard/operations/ProductionSessionCapsule.jsx#L54-L62) había strings con `⚠️` y `🔒`.
- **Solución**: Reemplazar todo emoji por iconos vectoriales puros de `lucide-react` (`FileText`, `ExternalLink`, etc.) y texto sobrio acorde a la estética clínica.

### D. Reordenamiento y prolijidad UX/UI ("desordenado / desprolijo")
- **Problemas Visuales Actuales**:
  1. `+ + Agregar Rodaje`: El botón renderizaba dos signos más (icono `<Plus>` + texto `+ Agregar Rodaje`).
  2. Columna 3 (Finanzas): Elementos flotando con anchos irregulares, el selector de pago y el botón de costos desalineados con los comprobantes permanentes y el botón verde gigante de validar pago.
  3. Cápsulas de rodajes: Envoltorio irregular con micro-botones de enlaces apretados que deformaban la cápsula.
  4. Pie de modal en `ProductionDetailModal`: Botón "Eliminar Sesión" con salto de línea partido en dos (`Eliminar \n Sesión`).
- **Solución**:
  - Envolver la columna 3 en una tarjeta clínica unificada de control financiero (`bg-gray-50/70 p-3.5 rounded-2xl border border-gray-100`).
  - Corregir el botón a `<Plus className="w-3 h-3" /> <span>Agregar Rodaje</span>`.
  - Pulir las cápsulas de rodajes con altura y alineación consistente (`h-7`, badges discretos).
  - En `ProductionDetailModal`, corregir el botón a `<Trash2 className="w-3.5 h-3.5" /> <span>Eliminar</span>` con `whitespace-nowrap`.

---

## 2. Plan de Cambios Propuesto

### Componente 1: Modal de Confirmación Clínico
#### [MODIFY] [`src/components/dashboard/common/ConfirmDeleteModal.jsx`](file:///c:/Users/ASUS/OneDrive/Escritorio/Proyectos/theFormulabsSite/src/components/dashboard/common/ConfirmDeleteModal.jsx)
- Adaptar `ConfirmDeleteModal` para que use Radix `AlertDialog` de `@/components/ui/alert-dialog` o renderice vía `createPortal(..., document.body)` con `z-[100]`.
- Garantizar que al activarse desde `ProductionDetailModal`, se dibuje al frente del modal padre y permita confirmar la eliminación sin bloqueos.

### Componente 2: Detección y Flujo de Comprobante por Tramo
#### [MODIFY] [`src/components/booking/BookingFormCard.jsx`](file:///c:/Users/ASUS/OneDrive/Escritorio/Proyectos/theFormulabsSite/src/components/booking/BookingFormCard.jsx)
- Aislar el comprobante existente según el número de sesión y el esquema de pago:
  ```javascript
  const esDosPagos = (cliente?.esquema_pago || initialData?.cliente?.esquema_pago) === "dos_pagos";
  const limitePrimerPago = cliente?.sesiones_primer_pago || initialData?.cliente?.sesiones_primer_pago || 1;
  const esSegundoTramo = esDosPagos && (initialData?.numero_sesion || 1) > limitePrimerPago;
  
  const existingReceipt = comprobanteSubidoUrl || (esSegundoTramo
    ? (ciclo?.comprobante_2_url || initialData?.ciclo?.comprobante_2_url || "")
    : (ciclo?.comprobante_url || initialData?.ciclo?.comprobante_url || ""));
  ```
- Si `existingReceipt` está vacío (como en Octubre 2 antes de subir su abono), mostrar la zona de arrastre/selección de archivo y NO marcar *"Comprobante registrado • En revisión"*.
- Eliminar la función RPC duplicada de 4 parámetros en Supabase para que no genere ambigüedad.

### Componente 3: Erradicación de Emojis
#### [MODIFY] [`src/components/dashboard/operations/OperationsCycleCard.jsx`](file:///c:/Users/ASUS/OneDrive/Escritorio/Proyectos/theFormulabsSite/src/components/dashboard/operations/OperationsCycleCard.jsx)
- Reemplazar `[📄 Ver]` por `<FileText className="w-3 h-3 text-emerald-600" /> <span>1er Abono</span> <ExternalLink className="w-2.5 h-2.5 opacity-60" />`.
#### [MODIFY] [`src/components/dashboard/operations/ProductionSessionCapsule.jsx`](file:///c:/Users/ASUS/OneDrive/Escritorio/Proyectos/theFormulabsSite/src/components/dashboard/operations/ProductionSessionCapsule.jsx)
- Reemplazar `⚠️` y `🔒` en títulos y tooltips por texto técnico limpio.

### Componente 4: Rediseño Estético y Reordenamiento Visual Clínico
#### [MODIFY] [`src/components/dashboard/operations/OperationsCycleCard.jsx`](file:///c:/Users/ASUS/OneDrive/Escritorio/Proyectos/theFormulabsSite/src/components/dashboard/operations/OperationsCycleCard.jsx)
- **Columna 1 (Cliente & Configuración)**:
  - Fila superior: Nombre del cliente, botón de configuración (`Settings`).
  - Fila central: Badges compactos y ordenados en una sola línea fluida (`Cortes` • `Formato` • `Esquema`).
  - Fila inferior: Calendario mensual o botón de crear con espaciado equilibrado.
- **Columna 2 (Rodajes)**:
  - Encabezado simétrico: `RODAJES (N)` + botón `Agregar Rodaje` (sin doble `+`).
  - Indicador de estado del ciclo alineado a la derecha.
  - Grilla de cápsulas con separación limpia y sin desbordes.
- **Columna 3 (Hub Financiero Unificado)**:
  - Contenedor con fondo sutil `bg-gray-50/70 rounded-2xl p-3 border border-gray-100 flex flex-col gap-2.5`.
  - Fila 1: Monto cobrado en grande a la izquierda, costo operativo a la derecha.
  - Fila 2: Selector de estado de pago + botón `Costos` con altura fija de 32px y alineación perfecta.
  - Fila 3: Píldoras de comprobantes acreditados (`1er Abono: Ver`, `2do Abono: Ver`) con iconos discretos.
  - Fila 4: Bloque de comprobante en revisión o botón de validación de pago a ancho completo dentro del contenedor.
#### [MODIFY] [`src/components/dashboard/operations/ProductionDetailModal.jsx`](file:///c:/Users/ASUS/OneDrive/Escritorio/Proyectos/theFormulabsSite/src/components/dashboard/operations/ProductionDetailModal.jsx)
- Botón footer: `<Trash2 className="w-3.5 h-3.5 shrink-0" /> <span className="whitespace-nowrap">Eliminar</span>`.

---

## 3. Plan de Verificación

### Pruebas Automatizadas y Compilación
- Ejecutar `npx esbuild` sobre los componentes modificados para asegurar cero errores de sintaxis y tipado.

### Verificación Manual con Browser Subagent
1. **Verificar Eliminación de Sesión**:
   - Abrir el detalle de `Octubre 3 Extra`.
   - Clic en `Eliminar`.
   - Verificar que el modal de confirmación aparezca claramente al frente, centrado y con foco.
   - Confirmar la eliminación y verificar que la sesión desaparece del ciclo.
2. **Verificar Comprobante de Octubre 2**:
   - Abrir `http://localhost:8080/reservar/produccion?token=48c9e1aba4a71ef403d878a1`.
   - Constatar que muestra el input limpio para subir comprobante (NO dice "en revisión").
   - Seleccionar un archivo de comprobante de prueba y enviar la reserva.
   - Verificar en el Dashboard que ahora sí aparece el banner *"2do Abono recibido"* con su enlace para revisar o validar.
3. **Verificar Ausencia de Emojis**:
   - Inspeccionar visualmente que los botones de comprobantes y tooltips no tengan ningún emoji.
4. **Verificar Orden y Prolijidad UX/UI**:
   - Tomar capturas de pantalla de la tarjeta de operaciones y validar alineaciones, márgenes y diseño armónico conforme a `GEMINI.md`.
