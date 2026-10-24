---
name: human-craft-ux
description: >-
  Use this skill whenever architecting user flows, designing interactions, managing UI states,
  or reviewing user experience. It enforces human-centric UX principles: progressive disclosure
  to minimize cognitive load, optimistic UI for zero perceived latency, zero dead-ends architecture,
  actionable empty states, and defensive error prevention.
---

# Human Craft UX: Arquitectura de Flujos & Experiencia Humana

Mientras que el diseño de interfaz (UI) se encarga de la estética, la paleta y la tactilidad, la **Experiencia de Usuario (UX)** es la disciplina que define **cómo piensa, fluye y siente una persona al usar el software**.

Las inteligencias artificiales tienden a generar una UX deficiente: formularios monolíticos de 30 campos apiñados, botones que se congelan sin feedback, mensajes de error técnicos e incomprensibles, pantallas vacías que dicen *"No hay datos"* sin guiar al usuario, y callejones sin salida donde el usuario no sabe cómo continuar.

Este skill establece los principios para construir **flujos de producto naturales, ágiles y psicológicamente placenteros**.

---

## 1. Los 3 Pilares Maestros

### Pilar 1: Reducción de Carga Cognitiva y Divulgación Progresiva
> *"Nunca le pidas al usuario que procese 10 decisiones simultáneas si puedes dividirlas en un camino intuitivo de 2 o 3 pasos."*

1. **Divulgación Progresiva (*Progressive Disclosure*)**:
   - En modales y pantallas de configuración, presenta únicamente los datos vitales para la tarea inmediata (ej. Nombre, Empresa, Email).
   - Oculta configuraciones secundarias o técnicas (IDs de Meta, tokens, webhooks) detrás de interruptores o botones `"Avanzado"`.
   - Si un formulario excede 6 u 8 campos, agrúpalo en pestañas semánticas fijas (`BaseFormModal` con tabs) o pasos numerados con indicador de avance.
2. **Valores Predeterminados Inteligentes (*Smart Defaults*)**:
   - Pre-calcula y sugiere siempre que sea posible. Si un cliente contrata 2 sesiones, la app debe sugerir automáticamente el nombre `"Sesión #1 - Nombre"` y la distribución de pagos recomendada sin obligar al usuario a escribirlo desde cero.
   - Hereda datos contextuales: si el cliente ya tiene una locación base guardada, el modal de rodaje debe pre-cargar esa dirección automáticamente.

### Pilar 2: Optimistic UI y Cero Latencia Percibida
> *"El software moderno no hace esperar al usuario por una confirmación de base de datos para mostrar que su acción tuvo éxito."*

1. **Actualizaciones Optimistas Inmediatas**:
   - Al activar un switch, marcar un post como aprobado o cambiar el estado de un pago, **actualiza la interfaz localmente en el frame 0** (`setLocalState(...)`).
   - Dispara la mutación a Supabase o al backend en segundo plano.
2. **Estrategia de Reversión Elegante (*Graceful Rollback*)**:
   - Si la petición de red falla, revierte el estado local a su valor original de forma fluida.
   - Muestra un toast explicativo con opción de reintentar:
     `toast.error("No se pudo guardar el cambio", { action: { label: "Reintentar", onClick: retry } })`
3. **Esqueletos de Carga Estructurales**:
   - Reemplaza los spinners centrales que bloquean toda la pantalla por esqueletos (`Skeleton`) que imitan la forma y proporción exacta del contenido que va a cargar. Esto elimina la sensación de lentitud y prepara el ojo del usuario.

### Pilar 3: Arquitectura sin Callejones sin Salida (*Zero Dead-Ends*)
> *"Cada pantalla, estado vacío, confirmación o error debe ofrecer siempre un siguiente paso lógico hacia adelante."*

1. **Estados Vacíos Accionables (*Actionable Empty States*)**:
   - ❌ **Prohibido**: Una tarjeta gris que dice `"Sin registros"` o `"No hay clientes"`.
   - ✅ **Estándar**: Todo estado vacío debe responder a 3 preguntas humanas:
     1. *¿Por qué está vacío?* ("Aún no has generado los ciclos operativos de este mes").
     2. *¿Cuál es el beneficio de crearlo?* ("Al generarlos podrás registrar costos y calendarizar rodajes").
     3. *¿Cuál es el botón de acción directa?* (Un CTA prominente como `[Generar Ciclos de Octubre]`).
2. **Confirmaciones Orientadas a la Acción**:
   - Al completar un flujo (ej. crear un cliente), el modal o pantalla debe ofrecer el siguiente paso natural: `¿Deseas programar su primer rodaje ahora?` en lugar de simplemente cerrarse y dejar al usuario buscando qué hacer.
3. **Mapeo de Rutas de Salida y Navegación Defensiva**:
   - El usuario siempre debe saber cómo volver atrás sin perder su trabajo. En formularios extensos, advertir si hay cambios sin guardar antes de cerrar accidentalmente con la tecla `Escape` o clic fuera del modal.

---

## 2. Prevención de Errores y UX Defensiva

1. **Bloqueo Idempotente de Envíos**:
   - Al pulsar un botón de guardar o pagar, deshabilitar inmediatamente el botón y mostrar el estado de carga (`disabled={isLoading}`). Esto previene clics dobles impulsivos que dupliquen registros en la base de datos o envíen cobros dobles.
2. **Alertas Previas de Riesgo (*SLA Warnings*)**:
   - No esperes a que ocurra un error: advierte proactivamente. Si un usuario intenta agendar una sesión en menos de 24 horas y el cliente aún no tiene el pago validado, muestra una advertencia de riesgo operativa explicando las implicaciones antes de confirmar.
3. **Diálogos de Confirmación Quirúrgicos**:
   - No satures al usuario con diálogos de *"¿Estás seguro?"* para acciones reversibles (usar un toast con botón `"Deshacer"`).
   - Reserva los modales de interrupción pesada (`ConfirmDeleteModal`) exclusivamente para acciones irreversibles (borrado permanente de expedientes o eliminación de clientes).

---

## 3. Tono de Voz y Redacción Humanizada (Microcopy)

La redacción de la interfaz debe ser la de un **socio experto, clínico y empático**:

| Caso | Microcopy Robótico de IA ❌ | Microcopy Humano y Claro ✅ |
| :--- | :--- | :--- |
| **Error de Red** | `"Error 500: Database connection pool exhausted."` | `"No pudimos conectar con el servidor. Revisa tu conexión e intenta de nuevo."` |
| **Fecha Duplicada** | `"Integrity error: Duplicate key value on column fecha_hora."` | `"Este horario ya está ocupado por otro rodaje. Selecciona una hora diferente."` |
| **Validación de Pago** | `"Payment status updated to primer_pago."` | `"1er Abono validado con éxito. Se habilitaron 2 sesiones para el cliente."` |
| **Confirmación de Borrado** | `"¿Está seguro de que desea eliminar el registro?"` | `"Se eliminará este calendario y sus 12 publicaciones programadas. Esta acción no se puede deshacer."` |

---

## 4. Checklist Rápido de Evaluación de UX

Antes de considerar listo un flujo en este proyecto, valida:
- [ ] ¿Hay algún estado vacío que no tenga un botón de acción principal para resolverlo?
- [ ] ¿El usuario tiene que rellenar manualmente datos que el sistema ya conoce?
- [ ] ¿Las acciones de toggle o confirmación se reflejan instantáneamente en pantalla (Optimistic UI)?
- [ ] ¿Los botones de mutación se protegen contra doble clic?
- [ ] ¿Hay algún callejón sin salida donde el usuario se quede sin saber qué hacer a continuación?
- [ ] ¿Los mensajes de error explican **la causa y la solución**, o son códigos crudos?
