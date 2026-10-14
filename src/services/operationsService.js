import { supabase } from "@/lib/supabase";

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

    // 1. Verificar si ya existe el ciclo para este periodo
    const { data: existingCiclo, error: fetchErr } = await supabase
      .from("ciclos_mensuales")
      .select("*, producciones(*)")
      .eq("cliente_id", clienteId)
      .eq("mes", targetMes)
      .eq("anio", targetAnio)
      .maybeSingle();

    if (fetchErr) {
      console.error("ensureCicloActual fetch error:", fetchErr);
      return { success: false, error: fetchErr.message };
    }

    if (existingCiclo) {
      return {
        success: true,
        data: {
          ciclo: existingCiclo,
          producciones: existingCiclo.producciones || [],
          isNew: false
        }
      };
    }

    // 2. Si no existe, crear el ciclo mensual
    const cicloPayload = {
      cliente_id: clienteId,
      mes: targetMes,
      anio: targetAnio,
      monto_cobrado: Math.max(0, Number(montoDefault) || 0),
      costo_operativo: 0,
      estado_pago: "pendiente",
      created_at: new Date().toISOString()
    };

    const { data: nuevoCiclo, error: insertCicloErr } = await supabase
      .from("ciclos_mensuales")
      .insert([cicloPayload])
      .select()
      .single();

    if (insertCicloErr) {
      console.error("ensureCicloActual insert ciclo error:", insertCicloErr);
      return { success: false, error: insertCicloErr.message };
    }

    // 3. Obtener locación y tipo default del cliente si están configurados
    let defaultLocacion = (locacionDefault && typeof locacionDefault === "string") ? locacionDefault.trim() : "";
    let defaultTipo = tipoSesion || "organica";

    const { data: clienteRecord } = await supabase
      .from("clientes")
      .select("locacion_default, tipo_sesion_default")
      .eq("id", clienteId)
      .maybeSingle();

    if (!defaultLocacion && clienteRecord?.locacion_default) {
      defaultLocacion = clienteRecord.locacion_default.trim();
    }
    if (clienteRecord?.tipo_sesion_default && (!tipoSesion || tipoSesion === "organica")) {
      defaultTipo = clienteRecord.tipo_sesion_default;
    }

    // 4. Crear las producciones asociadas según la cantidad estipulada
    const totalSessions = Math.max(1, Number(cantProducciones) || 1);
    const produccionesPayload = Array.from({ length: totalSessions }, (_, idx) => ({
      cliente_id: clienteId,
      ciclo_id: nuevoCiclo.id,
      numero_sesion: idx + 1,
      tipo: defaultTipo,
      duracion_horas: defaultTipo === "profesional" ? 6 : 4,
      locacion: defaultLocacion || null,
      estado: "pendiente_agendamiento",
      created_at: new Date().toISOString()
    }));

    const { data: nuevasProducciones, error: insertProdErr } = await supabase
      .from("producciones")
      .insert(produccionesPayload)
      .select();

    if (insertProdErr) {
      console.error("ensureCicloActual insert producciones error:", insertProdErr);
      // Retornar el ciclo creado aunque haya advertencia en producciones
      return {
        success: true,
        data: {
          ciclo: nuevoCiclo,
          producciones: [],
          isNew: true,
          warning: "Ciclo creado pero ocurrió un problema al instanciar producciones."
        }
      };
    }

    return {
      success: true,
      data: {
        ciclo: nuevoCiclo,
        producciones: nuevasProducciones || [],
        isNew: true
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

    const { data, error } = await supabase
      .from("ciclos_mensuales")
      .update(updatePayload)
      .eq("id", cicloId)
      .select()
      .single();

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

    // 2.3 Parámetros Operativos
    let producciones_por_mes = 1;
    if (Number(contenido.producciones_por_mes) > 0) {
      producciones_por_mes = Number(contenido.producciones_por_mes);
    } else {
      const planReels = Number(currentPlan.reels) || 0;
      const planShoots = Number(currentPlan.shoots || currentPlan.rodajes || currentPlan.sesiones) || 0;
      const hasTwoCoverages = Array.isArray(contenido.baseFeatures) &&
        contenido.baseFeatures.some((f) => typeof f === "string" && /2\s+(coberturas|rodajes|sesiones)/i.test(f));

      if (planShoots >= 2 || planReels > 10 || hasTwoCoverages) {
        producciones_por_mes = 2;
      } else if (planShoots === 1) {
        producciones_por_mes = 1;
      }
    }

    // Tipo de sesión predeterminado inferido de los formatos contratados o features
    let tipo_sesion_default = "organica";
    if (contenido.tipo_sesion_default) {
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

    // 3. Inserción atómica en Supabase
    const clientPayload = {
      nombre,
      empresa,
      email,
      activo: true,
      permite_descarga,
      monto_retainer,
      esquema_pago,
      dia_corte_pago,
      dia_corte_pago_2,
      producciones_por_mes,
      tipo_sesion_default,
      locacion_default,
      propuesta_origen_id: propuesta.id,
      created_at: new Date().toISOString()
    };

    let { data: newClient, error: insertClientErr } = await supabase
      .from("clientes")
      .insert([clientPayload])
      .select()
      .single();

    // Fallback defensivo si alguna columna de migración pendiente no existe aún
    if (insertClientErr) {
      const fallbackPayload = { ...clientPayload };
      let hadFallback = false;
      if (insertClientErr.message && insertClientErr.message.includes("locacion_default")) {
        delete fallbackPayload.locacion_default;
        hadFallback = true;
      }
      if (
        insertClientErr.message &&
        (insertClientErr.message.includes("esquema_pago") ||
          insertClientErr.message.includes("dia_corte_pago_2") ||
          insertClientErr.message.includes("tipo_sesion_default"))
      ) {
        delete fallbackPayload.esquema_pago;
        delete fallbackPayload.dia_corte_pago_2;
        delete fallbackPayload.tipo_sesion_default;
        hadFallback = true;
      }
      if (hadFallback) {
        const retry = await supabase.from("clientes").insert([fallbackPayload]).select().single();
        if (!retry.error && retry.data) {
          newClient = retry.data;
          insertClientErr = null;
        }
      }
    }

    if (insertClientErr) {
      console.error("convertProposalToClient insert client error:", insertClientErr);
      return { success: false, error: insertClientErr.message };
    }

    // 4. Inicializar ciclo mensual y producciones garantizando herencia de locación
    const now = new Date();
    const mesActual = now.getMonth() + 1;
    const anioActual = now.getFullYear();

    const cicloRes = await ensureCicloActual(
      newClient.id,
      mesActual,
      anioActual,
      newClient.monto_retainer,
      newClient.producciones_por_mes,
      newClient.tipo_sesion_default,
      newClient.locacion_default
    );

    return {
      success: true,
      data: {
        cliente: newClient,
        ciclo: cicloRes?.data?.ciclo || null
      }
    };
  } catch (err) {
    console.error("convertProposalToClient unexpected error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Obtiene los detalles de una producción mediante su token de auto-reserva público.
 * Incluye datos básicos del cliente y del ciclo mensual.
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

    const { data, error } = await supabase
      .from("producciones")
      .select(`
        *,
        cliente:clientes(nombre, empresa, tipo_sesion_default, esquema_pago),
        ciclo:ciclos_mensuales(mes, anio)
      `)
      .eq("token_reserva", token)
      .maybeSingle();

    if (error) {
      console.error("getProduccionByToken error:", error);
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: "Sesión de rodaje no encontrada o token inválido." };
    }

    return { success: true, data };
  } catch (err) {
    console.error("getProduccionByToken unexpected error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Confirma la auto-reserva de una sesión de producción por parte del cliente.
 * Actualiza fecha, locación, notas y cambia el estado a 'agendada'.
 *
 * @param {string} token - Token de reserva de la producción
 * @param {object} reservaData - { fecha_produccion, locacion, notas_brief }
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

    const { data, error } = await supabase
      .from("producciones")
      .update({
        fecha_produccion: reservaData.fecha_produccion || null,
        locacion: reservaData.locacion || "",
        notas_brief: reservaData.notas_brief || "",
        estado: "agendada"
      })
      .eq("token_reserva", token)
      .select(`
        *,
        cliente:clientes(nombre, empresa, tipo_sesion_default, esquema_pago),
        ciclo:ciclos_mensuales(mes, anio)
      `)
      .single();

    if (error) {
      console.error("confirmarReservaProduccion error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    console.error("confirmarReservaProduccion unexpected error:", err);
    return { success: false, error: err.message };
  }
}

