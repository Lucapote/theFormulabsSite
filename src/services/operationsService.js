import { supabase } from "@/lib/supabase";
import { getDefaultFirstPaymentSessions } from "@/utils/bookingHelpers";
import { deleteR2Object } from "@/services/r2Service";

/**
 * Service for Operaciones, Retainers y Producciones (Fase 1)
 * Reglas GEMINI.md:
 * - Puro JavaScript asíncrono, cero JSX, cero imports de React.
 * - Respuestas estructuradas: { success, data, error }
 */

/**
 * Asegura la existencia del ciclo mensual para un cliente y periodo dado.
 * Si no existe, lo crea e inicializa sus sesiones de producción correspondientes.
 *
 * @param {string} clienteId - UUID del cliente
 * @param {number} [mes] - Mes (1-12). Por defecto mes corriente.
 * @param {number} [anio] - Año (ej. 2026). Por defecto año corriente.
 * @param {number} [montoDefault=0] - Monto del retainer a cobrar en el ciclo.
 * @param {number} [cantProducciones=1] - Cantidad de sesiones de producción a instanciar.
 * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
 */
export async function ensureCicloActual(
  clienteId,
  mes = null,
  anio = null,
  montoDefault = 0,
  cantProducciones = 1,
  tipoSesion = "organica",
  locacionDefault = null
) {
  if (!clienteId) {
    return { success: false, error: "ID de cliente no provisto." };
  }

  const now = new Date();
  const targetMes = mes ? Number(mes) : now.getMonth() + 1;
  const targetAnio = anio ? Number(anio) : now.getFullYear();

  try {
    if (!supabase) {
      return { success: false, error: "Supabase no está configurado." };
    }

    const { data: rpcRes, error: rpcErr } = await supabase.rpc("ensure_ciclo_actual_atomic", {
      p_cliente_id: clienteId,
      p_mes: targetMes,
      p_anio: targetAnio,
      p_monto_default: Math.max(0, Number(montoDefault) || 0),
      p_cant_producciones: Math.max(1, Number(cantProducciones) || 1),
      p_tipo_sesion: tipoSesion || "organica",
      p_locacion_default: locacionDefault || null
    });

    if (rpcErr) {
      console.error("ensureCicloActual rpc error:", rpcErr);
      return { success: false, error: rpcErr.message };
    }

    if (!rpcRes?.success) {
      return { success: false, error: rpcRes?.error || "Error al asegurar ciclo mensual." };
    }

    return {
      success: true,
      data: {
        ciclo: rpcRes.ciclo,
        producciones: rpcRes.producciones || [],
        isNew: Boolean(rpcRes.is_new)
      }
    };
  } catch (err) {
    console.error("ensureCicloActual unexpected error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Obtiene todos los ciclos de un periodo específico con sus relaciones
 * (cliente, producciones y calendario vinculado).
 *
 * @param {number} mes - Mes (1-12)
 * @param {number} anio - Año (ej. 2026)
 * @returns {Promise<{ success: boolean, data: Array, error?: string }>}
 */
export async function getCiclosByPeriodo(mes, anio) {
  if (!mes || !anio) {
    return { success: false, data: [], error: "Mes y año son obligatorios." };
  }

  try {
    if (!supabase) {
      return { success: false, data: [], error: "Supabase no está configurado." };
    }

    const { data, error } = await supabase
      .from("ciclos_mensuales")
      .select(`
        *,
        cliente:clientes(*),
        producciones(*),
        calendario:calendarios(id, nombre, slug)
      `)
      .eq("mes", Number(mes))
      .eq("anio", Number(anio))
      .order("created_at", { ascending: false });

    if (error) {
      console.error("getCiclosByPeriodo error:", error);
      return { success: false, data: [], error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (err) {
    console.error("getCiclosByPeriodo unexpected error:", err);
    return { success: false, data: [], error: err.message };
  }
}

/**
 * Actualiza el dictamen financiero y estado de cobro de un ciclo mensual.
 *
 * @param {string} cicloId - UUID del ciclo mensual
 * @param {object} finanzasData - { monto_cobrado, costo_operativo, estado_pago, fecha_pago, comprobante_url }
 * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
 */
export async function updateCicloFinanzas(cicloId, finanzasData = {}) {
  if (!cicloId) {
    return { success: false, error: "ID de ciclo no provisto." };
  }

  try {
    if (!supabase) {
      return { success: false, error: "Supabase no está configurado." };
    }

    const updatePayload = {};
    if (finanzasData.monto_cobrado !== undefined) {
      updatePayload.monto_cobrado = Number(finanzasData.monto_cobrado) || 0;
    }
    if (finanzasData.costo_operativo !== undefined) {
      updatePayload.costo_operativo = Number(finanzasData.costo_operativo) || 0;
    }
    if (finanzasData.estado_pago !== undefined) {
      updatePayload.estado_pago = finanzasData.estado_pago;
    }
    if (finanzasData.fecha_pago !== undefined) {
      updatePayload.fecha_pago = finanzasData.fecha_pago || null;
    }
    if (finanzasData.comprobante_url !== undefined) {
      updatePayload.comprobante_url = finanzasData.comprobante_url || null;
    }
    if (finanzasData.comprobante_2_url !== undefined) {
      updatePayload.comprobante_2_url = finanzasData.comprobante_2_url || null;
    }
    if (finanzasData.comprobante_en_revision !== undefined) {
      updatePayload.comprobante_en_revision = Boolean(finanzasData.comprobante_en_revision);
    }

    let { data, error } = await supabase
      .from("ciclos_mensuales")
      .update(updatePayload)
      .eq("id", cicloId)
      .select()
      .single();

    if (
      error &&
      error.message &&
      (error.message.includes("comprobante_2_url") || error.message.includes("comprobante_en_revision"))
    ) {
      const fallbackPayload = { ...updatePayload };
      delete fallbackPayload.comprobante_2_url;
      delete fallbackPayload.comprobante_en_revision;
      const retry = await supabase
        .from("ciclos_mensuales")
        .update(fallbackPayload)
        .eq("id", cicloId)
        .select()
        .single();
      if (!retry.error) {
        return { success: true, data: { ...retry.data, ...updatePayload } };
      }
    }

    if (error) {
      console.error("updateCicloFinanzas error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    console.error("updateCicloFinanzas unexpected error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Actualiza los datos logísticos y de rodaje de una producción específica.
 *
 * @param {string} produccionId - UUID de la producción
 * @param {object} prodData - { estado, fecha_produccion, locacion, notas_brief, tipo }
 * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
 */
export async function updateProduccion(produccionId, prodData = {}) {
  if (!produccionId) {
    return { success: false, error: "ID de producción no provisto." };
  }

  try {
    if (!supabase) {
      return { success: false, error: "Supabase no está configurado." };
    }

    const updatePayload = {};
    if (prodData.nombre !== undefined) updatePayload.nombre = prodData.nombre;
    if (prodData.estado !== undefined) updatePayload.estado = prodData.estado;
    if (prodData.fecha_produccion !== undefined) {
      updatePayload.fecha_produccion = prodData.fecha_produccion || null;
    }
    if (prodData.locacion !== undefined) updatePayload.locacion = prodData.locacion;
    if (prodData.notas_brief !== undefined) updatePayload.notas_brief = prodData.notas_brief;
    if (prodData.tipo !== undefined) updatePayload.tipo = prodData.tipo;
    if (prodData.duracion_horas !== undefined) {
      updatePayload.duracion_horas = Number(prodData.duracion_horas) || 4;
    }

    let { data, error } = await supabase
      .from("producciones")
      .update(updatePayload)
      .eq("id", produccionId)
      .select()
      .single();

    // Fallback defensivo si la columna 'nombre' aún no existe en Supabase
    if (error && error.message && error.message.includes("column \"nombre\"") && updatePayload.nombre !== undefined) {
      const fallbackPayload = { ...updatePayload };
      delete fallbackPayload.nombre;
      const retry = await supabase
        .from("producciones")
        .update(fallbackPayload)
        .eq("id", produccionId)
        .select()
        .single();
      if (!retry.error) {
        return { success: true, data: { ...retry.data, nombre: updatePayload.nombre } };
      }
    }

    if (error) {
      console.error("updateProduccion error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    console.error("updateProduccion unexpected error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Realiza el onboarding 1-Click: convierte una propuesta comercial en un cliente formal
 * e inicializa automáticamente su ciclo y sesiones de producción del mes en curso.
 *
 * @param {object} propuesta - Objeto de propuesta comercial
 * @returns {Promise<{ success: boolean, data?: object, alreadyConverted?: boolean, error?: string }>}
 */
export async function convertProposalToClient(propuesta) {
  if (!propuesta || !propuesta.id) {
    return { success: false, error: "Propuesta inválida o sin ID." };
  }

  try {
    if (!supabase) {
      return { success: false, error: "Supabase no está configurado." };
    }

    // 1. Validar si ya existe un cliente vinculado a esta propuesta
    const { data: existingClient, error: checkErr } = await supabase
      .from("clientes")
      .select("id, nombre, empresa, monto_retainer, propuesta_origen_id")
      .eq("propuesta_origen_id", propuesta.id)
      .maybeSingle();

    if (checkErr) {
      console.error("convertProposalToClient check error:", checkErr);
    }

    if (existingClient) {
      return {
        success: false,
        alreadyConverted: true,
        data: existingClient,
        error: `Esta propuesta ya fue convertida previamente en el cliente "${existingClient.nombre}".`
      };
    }

    // 2. Extraer y mapear exhaustivamente desde el JSON propuesta.contenido
    const contenido = propuesta.contenido || propuesta.content || {};
    const clientData = contenido.client || {};

    // 2.1 Datos Generales del Cliente
    const nombre = (clientData.name || propuesta.cliente || "Cliente Estimado").trim();
    const empresa = (clientData.company || clientData.shortName || clientData.name || nombre).trim();
    const email = clientData.email ? clientData.email.trim() : null;
    const rawLocacion = clientData.location || clientData.address || contenido.location || contenido.address || null;
    const locacion_default = rawLocacion ? String(rawLocacion).trim() : null;

    // 2.2 Plan y Finanzas
    const selectedPlanId = contenido.selectedPlanId || contenido.selectedPlan;
    const plansList = Array.isArray(contenido.pricingPlans) ? contenido.pricingPlans : [];
    const currentPlan = (selectedPlanId ? plansList.find((p) => p.id === selectedPlanId) : null) ||
      plansList.find((p) => p.highlight) ||
      plansList[0] ||
      {};

    const monto_retainer = Math.max(0, Number(contenido.totalPrice || currentPlan.price) || 0);
    const esquema_pago = (contenido.paymentFrequency === "quincenal" || contenido.esquema_pago === "quincenal")
      ? "quincenal"
      : "mensual";
    const dia_corte_pago = Math.min(31, Math.max(1, Number(contenido.billingDay || contenido.dia_corte_pago) || 1));
    const dia_corte_pago_2 = Math.min(31, Math.max(1, Number(contenido.billingDay2 || contenido.dia_corte_pago_2) || 15));

    // 2.3 Parámetros Operativos y Scope
    const extraSessions = Number(contenido.pricing?.extraSessionsCount) || 0;
    const produccionesPorMes = Number(
      contenido.scope?.producciones_por_mes ||
      contenido.selectedPlan?.producciones_por_mes ||
      contenido.producciones_por_mes ||
      1
    ) + extraSessions;

    // Tipo de sesión predeterminado inferido de scope o formatos
    let tipo_sesion_default = "organica";
    if (contenido.scope?.tipo_sesion_default) {
      tipo_sesion_default = contenido.scope.tipo_sesion_default;
    } else if (contenido.tipo_sesion_default) {
      tipo_sesion_default = contenido.tipo_sesion_default;
    } else if (contenido.tipo_sesion) {
      tipo_sesion_default = contenido.tipo_sesion;
    } else if (currentPlan.sessionType) {
      tipo_sesion_default = currentPlan.sessionType;
    } else {
      const formatsPool = [
        ...(Array.isArray(contenido.formatos) ? contenido.formatos : []),
        ...(Array.isArray(contenido.formats) ? contenido.formats : []),
        ...(Array.isArray(contenido.baseFeatures) ? contenido.baseFeatures : []),
        currentPlan.description || "",
        currentPlan.name || ""
      ].join(" ").toLowerCase();

      if (formatsPool.includes("profesional")) {
        tipo_sesion_default = "profesional";
      } else if (formatsPool.includes("hibrido") || (formatsPool.includes("foto") && formatsPool.includes("reel"))) {
        tipo_sesion_default = "hibrido";
      } else if (formatsPool.includes("foto") && !formatsPool.includes("reel")) {
        tipo_sesion_default = "fotos";
      } else if (formatsPool.includes("reel") || formatsPool.includes("video")) {
        tipo_sesion_default = "reels_batch";
      } else {
        tipo_sesion_default = "organica";
      }
    }

    const permite_descarga = Boolean(contenido.allowDownload || contenido.permite_descarga || false);

    // 3. Inserción atómica y transaccional mediante RPC en Supabase
    const clientPayload = {
      nombre,
      empresa,
      email,
      activo: true,
      permite_descarga,
      monto_retainer,
      esquema_pago: (esquema_pago === "quincenal" || esquema_pago === "dos_pagos") ? "dos_pagos" : "mensual",
      dia_corte_pago,
      dia_corte_pago_2,
      producciones_por_mes: produccionesPorMes,
      tipo_sesion_default,
      locacion_default,
      propuesta_origen_id: propuesta.id
    };

    const now = new Date();
    const mesActual = now.getMonth() + 1;
    const anioActual = now.getFullYear();

    const { data: rpcRes, error: rpcErr } = await supabase.rpc("onboard_cliente_atomic", {
      p_cliente: clientPayload,
      p_cant_producciones: produccionesPorMes,
      p_monto: monto_retainer,
      p_mes: mesActual,
      p_anio: anioActual
    });

    if (rpcErr) {
      console.warn("convertProposalToClient rpc fallback to ensureCicloActual:", rpcErr);
      const { data: insertedClient, error: insertErr } = await supabase
        .from("clientes")
        .insert(clientPayload)
        .select()
        .single();

      if (insertErr) {
        console.error("convertProposalToClient insert error:", insertErr);
        return { success: false, error: insertErr.message };
      }

      const cicloRes = await ensureCicloActual(
        insertedClient.id,
        mesActual,
        anioActual,
        monto_retainer,
        produccionesPorMes,
        tipo_sesion_default,
        locacion_default
      );

      return {
        success: true,
        data: {
          cliente: insertedClient,
          ciclo: cicloRes.data?.ciclo || null,
          producciones: cicloRes.data?.producciones || []
        }
      };
    }

    if (!rpcRes?.success) {
      if (rpcRes?.already_converted) {
        return {
          success: false,
          alreadyConverted: true,
          data: rpcRes.cliente,
          error: rpcRes.error
        };
      }
      return { success: false, error: rpcRes?.error || "Error al convertir propuesta en cliente." };
    }

    return {
      success: true,
      data: {
        cliente: rpcRes.cliente,
        ciclo: rpcRes.ciclo,
        producciones: rpcRes.producciones || []
      }
    };
  } catch (err) {
    console.error("convertProposalToClient unexpected error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Determina si una sesión de producción específica se encuentra desbloqueada para reserva.
 * Regla de Negocio (Gatekeeper):
 * - Si el cliente acordó 2 pagos (esquema_pago === 'quincenal' o dia_corte_pago_2 definido):
 *   - Sin pago (pendiente/vencido): todas bloqueadas ('pago_pendiente').
 *   - Con 1er abono ('primer_pago'):
 *     - Si son 2 sesiones mensuales: se desbloquea solo la primera (Sesión 1).
 *     - Si son 4 sesiones mensuales: se desbloquean solo las primeras dos (Sesiones 1 y 2).
 *     - En general: Math.max(1, Math.floor(totalSesiones / 2)).
 *     - Las sesiones restantes quedan bloqueadas con motivo 'esperando_segundo_pago'.
 *   - Con pago completo ('pagado'): todas las sesiones desbloqueadas.
 * - Si el cliente acordó 1 solo pago mensual:
 *   - Con 'pagado': todas las sesiones desbloqueadas.
 *   - Con 'pendiente': todas bloqueadas con motivo 'pago_pendiente'.
 *
 * @param {object} produccion - { numero_sesion, estado }
 * @param {object} ciclo - { estado_pago, monto_cobrado }
 * @param {object} [cliente] - { esquema_pago, dia_corte_pago_2, producciones_por_mes }
 * @param {number} [totalCount] - Cantidad total de sesiones
 * @returns {{ estaDesbloqueada: boolean, motivoBloqueo: string | null }}
 */
export function checkSesionDesbloqueada(produccion, ciclo, cliente = {}, totalCount = null) {
  if (!produccion) return { estaDesbloqueada: false, motivoBloqueo: "inexistente" };

  if (
    produccion.estado === "agendada" ||
    ["rodaje_completado", "en_edicion", "finalizada"].includes(produccion.estado)
  ) {
    return { estaDesbloqueada: true, motivoBloqueo: null };
  }

  // Si la agencia propuso explícitamente una fecha ('fecha_propuesta'), el cliente puede verla y confirmarla (con regla de pago hasta 24h antes)
  if (produccion.estado === "fecha_propuesta") {
    return {
      estaDesbloqueada: true,
      modoPropuestaAgencia: true,
      motivoBloqueo: null
    };
  }

  // Si el cliente ya subió comprobante y realizó pre-reserva temporal
  if (produccion.estado === "pre_reservada") {
    return {
      estaDesbloqueada: true,
      modoPreReserva: true,
      motivoBloqueo: null
    };
  }

  // Las sesiones extras tienen su propio flujo de reserva y comprobante
  const cuotaPautada = Math.max(1, Number(cliente?.producciones_por_mes) || 1);
  const esSesionExtra =
    Boolean(produccion.precio_extra) ||
    (Number(produccion.numero_sesion) || 1) > cuotaPautada ||
    Boolean(produccion.nombre && produccion.nombre.toLowerCase().includes("extra"));

  if (esSesionExtra) {
    return {
      estaDesbloqueada: true,
      esSesionExtra: true,
      motivoBloqueo: null
    };
  }

  const estadoPago = ciclo?.estado_pago || "pendiente";

  if (estadoPago === "pendiente" || estadoPago === "vencido") {
    return { estaDesbloqueada: false, motivoBloqueo: "pago_pendiente" };
  }

  const isDosPagos =
    cliente?.esquema_pago === "quincenal" ||
    cliente?.esquema_pago === "dos_pagos" ||
    Boolean(cliente?.dia_corte_pago_2);

  if (!isDosPagos) {
    if (estadoPago === "pagado") {
      return { estaDesbloqueada: true, motivoBloqueo: null };
    }
    return { estaDesbloqueada: false, motivoBloqueo: "pago_pendiente" };
  }

  if (estadoPago === "pagado") {
    return { estaDesbloqueada: true, motivoBloqueo: null };
  }

  if (estadoPago === "primer_pago") {
    const total = Math.max(1, Number(totalCount) || Number(cliente?.producciones_por_mes) || 2);
    const configuredFirst = Number(cliente?.sesiones_primer_pago);
    const maxDesbloqueadasPrimerPago =
      configuredFirst >= 1 && configuredFirst < total
        ? configuredFirst
        : getDefaultFirstPaymentSessions(total);
    const numSesion = Number(produccion.numero_sesion) || 1;

    if (numSesion <= maxDesbloqueadasPrimerPago) {
      return { estaDesbloqueada: true, motivoBloqueo: null };
    }
    return { estaDesbloqueada: false, motivoBloqueo: "esperando_segundo_pago" };
  }

  return { estaDesbloqueada: false, motivoBloqueo: "pago_pendiente" };
}

/**
 * Obtiene los detalles de una producción mediante su token de auto-reserva público.
 * Incluye datos completos del cliente, del ciclo mensual y la bandera de desbloqueo condicional.
 *
 * @param {string} token - Token de reserva de la producción
 * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
 */
export async function getProduccionByToken(token) {
  if (!token) {
    return { success: false, error: "Token de reserva no proporcionado." };
  }

  try {
    if (!supabase) {
      return { success: false, error: "Supabase no está configurado." };
    }

    let { data, error } = await supabase
      .from("producciones")
      .select(`
        *,
        cliente:clientes(id, nombre, empresa, email, locacion_default, tipo_sesion_default, producciones_por_mes, sesiones_primer_pago, esquema_pago, dia_corte_pago, dia_corte_pago_2, monto_retainer),
        ciclo:ciclos_mensuales(id, mes, anio, estado_pago, monto_cobrado, comprobante_url, comprobante_2_url, comprobante_en_revision)
      `)
      .eq("token_reserva", token)
      .single();

    // Fallback si las columnas nuevas aún no fueron migradas en Supabase
    if (error && error.message && (error.message.includes("sesiones_primer_pago") || error.message.includes("comprobante_2_url"))) {
      const retry = await supabase
        .from("producciones")
        .select(`
          *,
          cliente:clientes(id, nombre, empresa, email, locacion_default, tipo_sesion_default, producciones_por_mes, esquema_pago, dia_corte_pago, dia_corte_pago_2, monto_retainer),
          ciclo:ciclos_mensuales(id, mes, anio, estado_pago, monto_cobrado, comprobante_url)
        `)
        .eq("token_reserva", token)
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error || !data) {
      console.error("getProduccionByToken error:", error);
      return { success: false, error: "Enlace de reserva inválido o no encontrado." };
    }

    const check = checkSesionDesbloqueada(data, data.ciclo, data.cliente);

    return {
      success: true,
      data: {
        ...data,
        estaDesbloqueada: check.estaDesbloqueada,
        modoPropuestaAgencia: Boolean(check.modoPropuestaAgencia),
        modoPreReserva: Boolean(check.modoPreReserva),
        motivoBloqueo: check.motivoBloqueo
      }
    };
  } catch (err) {
    console.error("getProduccionByToken unexpected error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Confirma la auto-reserva o pre-reserva de una sesión de producción por parte del cliente.
 * Gatekeeper de Producción: Valida el estado de desbloqueo, propuesta de agencia o comprobante subido.
 *
 * @param {string} token - Token de reserva de la producción
 * @param {object} reservaData - { fecha_produccion, locacion, notas_brief, comprobante_url }
 * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
 */
export async function confirmarReservaProduccion(token, reservaData = {}) {
  if (!token) {
    return { success: false, error: "Token de reserva no proporcionado." };
  }

  try {
    if (!supabase) {
      return { success: false, error: "Supabase no está configurado." };
    }

    let { data: rpcRes, error: rpcErr } = await supabase.rpc("confirmar_reserva_produccion_rpc", {
      p_token: token.trim(),
      p_fecha: reservaData.fecha_produccion || null,
      p_locacion: reservaData.locacion || null,
      p_notas: reservaData.notas_brief || null,
      p_comprobante_url: reservaData.comprobante_url || null
    });

    // Fallback defensivo si la firma de 4 argumentos aún está activa en BD
    if (rpcErr && rpcErr.message && rpcErr.message.includes("p_comprobante_url")) {
      const retry = await supabase.rpc("confirmar_reserva_produccion_rpc", {
        p_token: token.trim(),
        p_fecha: reservaData.fecha_produccion ? reservaData.fecha_produccion.slice(0, 10) : null,
        p_locacion: reservaData.locacion || null,
        p_notas: reservaData.notas_brief || null
      });
      rpcRes = retry.data;
      rpcErr = retry.error;
    }

    if (rpcErr) {
      console.error("confirmarReservaProduccion rpc error:", rpcErr);
      return { success: false, error: rpcErr.message };
    }

    if (!rpcRes?.success) {
      return {
        success: false,
        motivoBloqueo: rpcRes?.motivo_bloqueo,
        error: rpcRes?.error || "No se pudo confirmar la reserva."
      };
    }

    return {
      success: true,
      data: {
        ...rpcRes.produccion,
        cliente: rpcRes.cliente,
        ciclo: rpcRes.ciclo,
        estaDesbloqueada: true
      }
    };
  } catch (err) {
    console.error("confirmarReservaProduccion unexpected error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Valida el pago de un ciclo mensual, desbloquea las reservas, confirma pre-reservas
 * cubiertas por el tramo de pago y dispara email al cliente.
 * Soporta esquema de 2 pagos ('primer_pago' para el 1er tramo o 'pagado' para el 100%).
 *
 * @param {object} params
 * @param {string} params.cicloId - UUID del ciclo mensual
 * @param {object} [params.cliente] - Datos del cliente { email, nombre, empresa, esquema_pago, producciones_por_mes, sesiones_primer_pago }
 * @param {object} [params.produccionPrincipal] - Producción asignada para obtener el token_reserva
 * @param {number} [params.montoCobrado=0] - Monto del ciclo
 * @param {number} [params.mes] - Mes del ciclo
 * @param {number} [params.anio] - Año del ciclo
 * @param {string} [params.nuevoEstado="pagado"] - Estado destino ('primer_pago' o 'pagado')
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export async function validarPagoYDesbloquear({
  cicloId,
  cliente,
  produccionPrincipal,
  montoCobrado,
  mes,
  anio,
  nuevoEstado = "pagado"
}) {
  try {
    if (!supabase) {
      return { success: false, error: "Supabase no está configurado." };
    }

    if (!cicloId) {
      return { success: false, error: "ID de ciclo no proporcionado." };
    }

    // 1. Verificación previa de idempotencia
    const { data: currentCiclo, error: fetchErr } = await supabase
      .from("ciclos_mensuales")
      .select("id, estado_pago, fecha_pago, comprobante_en_revision")
      .eq("id", cicloId)
      .maybeSingle();

    if (fetchErr && !fetchErr.message?.includes("comprobante_en_revision")) throw fetchErr;

    // 2. Actualizar el ciclo mensual al estado indicado y limpiar bandera de revisión
    const fechaHoy = new Date().toISOString().split("T")[0];
    let { data: updatedCiclo, error: cicloError } = await supabase
      .from("ciclos_mensuales")
      .update({
        estado_pago: nuevoEstado,
        fecha_pago: currentCiclo?.fecha_pago || fechaHoy,
        comprobante_en_revision: false
      })
      .eq("id", cicloId)
      .select()
      .single();

    if (cicloError && cicloError.message?.includes("comprobante_en_revision")) {
      const retry = await supabase
        .from("ciclos_mensuales")
        .update({
          estado_pago: nuevoEstado,
          fecha_pago: currentCiclo?.fecha_pago || fechaHoy
        })
        .eq("id", cicloId)
        .select()
        .single();
      updatedCiclo = retry.data;
      cicloError = retry.error;
    }

    if (cicloError) throw cicloError;

    // 3. Promover automáticamente sesiones en 'pre_reservada' (con fecha) a 'agendada' según el tramo cubierto
    const totalSesiones = Math.max(1, Number(cliente?.producciones_por_mes) || 1);
    const maxPrimerPago =
      Number(cliente?.sesiones_primer_pago) >= 1 && Number(cliente?.sesiones_primer_pago) < totalSesiones
        ? Number(cliente.sesiones_primer_pago)
        : getDefaultFirstPaymentSessions(totalSesiones);

    let prodQuery = supabase
      .from("producciones")
      .update({ estado: "agendada" })
      .eq("ciclo_id", cicloId)
      .in("estado", ["pre_reservada", "fecha_propuesta"])
      .not("fecha_produccion", "is", null);

    if (nuevoEstado === "primer_pago") {
      prodQuery = prodQuery.lte("numero_sesion", maxPrimerPago);
    }

    await prodQuery;

    // 4. Disparar email al cliente en segundo plano solo en la primera transición válida
    const alreadyHadSameStatus =
      currentCiclo?.estado_pago === nuevoEstado ||
      (nuevoEstado === "primer_pago" && currentCiclo?.estado_pago === "pagado");

    if (!alreadyHadSameStatus && cliente?.email && produccionPrincipal?.token_reserva) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const authHeaders = session?.access_token
          ? { Authorization: `Bearer ${session.access_token}` }
          : {};

        await fetch("/api/notify-payment-unlocked", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders
          },
          body: JSON.stringify({
            clienteEmail: cliente.email,
            clienteNombre: cliente.nombre,
            empresa: cliente.empresa,
            montoCobrado: montoCobrado || 0,
            mes,
            anio,
            tokenReserva: produccionPrincipal.token_reserva,
            numeroSesion: produccionPrincipal.numero_sesion || 1,
            esPrimerPago: nuevoEstado === "primer_pago"
          })
        });
      } catch (emailErr) {
        console.warn("No se pudo enviar el correo de desbloqueo:", emailErr);
      }
    }

    return { success: true, data: updatedCiclo };
  } catch (err) {
    console.error("Error al validar pago y desbloquear:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Rechaza un comprobante subido por el cliente y libera las pre-reservas temporales no pagadas.
 *
 * @param {string} cicloId - UUID del ciclo mensual
 * @param {boolean} [esSegundoPago=false] - Si corresponde al 2do abono
 * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
 */
export async function rechazarComprobanteCiclo(cicloId, esSegundoPago = false) {
  if (!cicloId) {
    return { success: false, error: "ID de ciclo no provisto." };
  }

  try {
    if (!supabase) {
      return { success: false, error: "Supabase no está configurado." };
    }

    // Obtener la URL del comprobante que se va a rechazar para purgarlo de R2
    const { data: cicloPrevio } = await supabase
      .from("ciclos_mensuales")
      .select("comprobante_url, comprobante_2_url")
      .eq("id", cicloId)
      .single();

    const urlToPurge = esSegundoPago ? cicloPrevio?.comprobante_2_url : cicloPrevio?.comprobante_url;
    if (urlToPurge) {
      try {
        const storageKey = urlToPurge.replace(/^https?:\/\/[^\/]+\//, "");
        if (storageKey) await deleteR2Object(storageKey);
      } catch (r2Err) {
        console.warn("Aviso al purgar comprobante rechazado de R2:", r2Err);
      }
    }

    const updateFields = {
      comprobante_en_revision: false
    };
    if (esSegundoPago) {
      updateFields.comprobante_2_url = null;
    } else {
      updateFields.comprobante_url = null;
    }

    const { data, error } = await supabase
      .from("ciclos_mensuales")
      .update(updateFields)
      .eq("id", cicloId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // Limpiar comprobante_url en producciones si apuntaban a este comprobante
    if (urlToPurge) {
      await supabase
        .from("producciones")
        .update({ comprobante_url: null })
        .eq("ciclo_id", cicloId)
        .eq("comprobante_url", urlToPurge);
    }

    // Revertir sesiones que estaban en pre_reservada a pendiente_agendamiento
    await supabase
      .from("producciones")
      .update({
        estado: "pendiente_agendamiento",
        fecha_produccion: null
      })
      .eq("ciclo_id", cicloId)
      .eq("estado", "pre_reservada");

    return { success: true, data };
  } catch (err) {
    console.error("rechazarComprobanteCiclo error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Crea una sesión de rodaje adicional o nueva para un ciclo.
 */
export async function createProduccionExtra({
  ciclo_id,
  cliente_id,
  nombre,
  tipo = "organica",
  duracion_horas = 4,
  locacion = null,
  fecha_produccion = null,
  notas_brief = "",
  estado = "pendiente_agendamiento",
  precio_extra = null
}) {
  try {
    // 1. Obtener el número de sesión correlativo
    const { data: existingProds, error: countErr } = await supabase
      .from("producciones")
      .select("numero_sesion")
      .eq("ciclo_id", ciclo_id)
      .order("numero_sesion", { ascending: false })
      .limit(1);

    if (countErr) throw countErr;

    const nextNumero = (existingProds?.[0]?.numero_sesion || 0) + 1;
    const tokenReserva = (typeof crypto !== "undefined" && crypto.randomUUID)
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 24)
      : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    const extraPrice = Number(precio_extra) > 0 ? Number(precio_extra) : null;

    // 2. Si se asignó un precio extra, sumarlo de inmediato al monto_cobrado del ciclo
    if (extraPrice) {
      const { data: currentCiclo } = await supabase
        .from("ciclos_mensuales")
        .select("id, monto_cobrado")
        .eq("id", ciclo_id)
        .single();

      if (currentCiclo) {
        const nuevoMonto = (Number(currentCiclo.monto_cobrado) || 0) + extraPrice;
        await supabase
          .from("ciclos_mensuales")
          .update({ monto_cobrado: nuevoMonto })
          .eq("id", ciclo_id);
      }
    }

    const payload = {
      ciclo_id,
      cliente_id,
      numero_sesion: nextNumero,
      nombre: nombre?.trim() || null,
      tipo: tipo || "organica",
      duracion_horas: Number(duracion_horas) || 4,
      locacion: locacion?.trim() || null,
      fecha_produccion: fecha_produccion || null,
      notas_brief: notas_brief?.trim() || "",
      estado: estado || (fecha_produccion ? "fecha_propuesta" : "pendiente_agendamiento"),
      token_reserva: tokenReserva,
      precio_extra: extraPrice
    };

    const { data, error } = await supabase
      .from("producciones")
      .insert(payload)
      .select(`
        *,
        cliente:clientes(*),
        ciclo:ciclos_mensuales(*)
      `)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error("createProduccionExtra error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Elimina definitivamente una sesión de producción de la base de datos.
 * Aplica reglas estrictas de GEMINI.md (Zero Orphan Records):
 * 1. Purga físicamente el comprobante asociado en Cloudflare R2 si existía.
 * 2. Limpia las referencias en ciclos_mensuales.
 * 3. Si era sesión extra con precio, descuenta automáticamente el valor de monto_cobrado.
 */
export async function deleteProduccion(id) {
  try {
    // 1. Obtener la sesión antes de suprimirla para verificar archivos y precio
    const { data: prod, error: fetchErr } = await supabase
      .from("producciones")
      .select("*, ciclo:ciclos_mensuales(*)")
      .eq("id", id)
      .single();

    if (fetchErr) throw fetchErr;

    // 2. Si la producción tenía un comprobante asociado, purgar el archivo físico en Cloudflare R2
    const comprobanteUrl = prod?.comprobante_url;
    if (comprobanteUrl) {
      try {
        const storageKey = comprobanteUrl.replace(/^https?:\/\/[^\/]+\//, "");
        if (storageKey) {
          await deleteR2Object(storageKey);
        }
      } catch (r2Err) {
        console.warn("Aviso al purgar comprobante de R2:", r2Err);
      }

      // Limpiar referencias en el ciclo si apuntaban a este archivo
      const ciclo = prod.ciclo;
      if (ciclo) {
        const updateCiclo = {};
        if (ciclo.comprobante_url === comprobanteUrl) {
          updateCiclo.comprobante_url = null;
          updateCiclo.comprobante_en_revision = false;
        }
        if (ciclo.comprobante_2_url === comprobanteUrl) {
          updateCiclo.comprobante_2_url = null;
          updateCiclo.comprobante_en_revision = false;
        }
        if (Object.keys(updateCiclo).length > 0) {
          await supabase
            .from("ciclos_mensuales")
            .update(updateCiclo)
            .eq("id", ciclo.id);
        }
      }
    }

    // 3. Si la producción tenía precio_extra, revertirlo/descontarlo de monto_cobrado del ciclo
    if (prod?.precio_extra && Number(prod.precio_extra) > 0 && prod.ciclo_id) {
      const { data: currentCiclo } = await supabase
        .from("ciclos_mensuales")
        .select("id, monto_cobrado")
        .eq("id", prod.ciclo_id)
        .single();

      if (currentCiclo) {
        const montoRevertido = Math.max(0, (Number(currentCiclo.monto_cobrado) || 0) - Number(prod.precio_extra));
        await supabase
          .from("ciclos_mensuales")
          .update({ monto_cobrado: montoRevertido })
          .eq("id", prod.ciclo_id);
      }
    }

    // 4. Proceder a eliminar la fila en producciones
    const { error: deleteErr } = await supabase
      .from("producciones")
      .delete()
      .eq("id", id);

    if (deleteErr) throw deleteErr;
    return { success: true };
  } catch (err) {
    console.error("deleteProduccion error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Cancela y libera la fecha asignada a una producción, regresándola a pendiente_agendamiento.
 */
export async function cancelarFechaProduccion(id) {
  try {
    const { data, error } = await supabase
      .from("producciones")
      .update({
        fecha_produccion: null,
        estado: "pendiente_agendamiento"
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error("cancelarFechaProduccion error:", err);
    return { success: false, error: err.message };
  }
}



