import { supabase } from "@/lib/supabase";

const DEFAULT_BANK_DETAILS = {
  banco: "BBVA México",
  beneficiario: "The Formulabs",
  clabe: "012345678901234567",
  concepto_default: "Servicio de Contenido",
  telefono: "529981234567"
};

/**
 * Consulta la tabla configuraciones donde clave = 'datos_bancarios'.
 * Retorna { success: true, data: valor } con fallback predeterminado.
 */
export async function getDatosBancarios() {
  try {
    if (!supabase) return { success: true, data: DEFAULT_BANK_DETAILS };

    const { data, error } = await supabase
      .from("configuraciones")
      .select("valor")
      .eq("clave", "datos_bancarios")
      .maybeSingle();

    if (error || !data?.valor) {
      return { success: true, data: DEFAULT_BANK_DETAILS };
    }

    return {
      success: true,
      data: {
        banco: data.valor.banco || DEFAULT_BANK_DETAILS.banco,
        beneficiario: data.valor.beneficiario || DEFAULT_BANK_DETAILS.beneficiario,
        clabe: data.valor.clabe || DEFAULT_BANK_DETAILS.clabe,
        concepto_default: data.valor.concepto_default || DEFAULT_BANK_DETAILS.concepto_default,
        telefono: data.valor.telefono || DEFAULT_BANK_DETAILS.telefono
      }
    };
  } catch (err) {
    console.error("getDatosBancarios error:", err);
    return { success: true, data: DEFAULT_BANK_DETAILS };
  }
}

/**
 * Upsert en configuraciones con clave = 'datos_bancarios'.
 */
export async function updateDatosBancarios({ banco, beneficiario, clabe, concepto_default, telefono }) {
  try {
    if (!supabase) return { success: false, error: "Servicio no disponible." };

    const payload = {
      banco: String(banco || "").trim() || DEFAULT_BANK_DETAILS.banco,
      beneficiario: String(beneficiario || "").trim() || DEFAULT_BANK_DETAILS.beneficiario,
      clabe: String(clabe || "").trim().replace(/\s+/g, "") || DEFAULT_BANK_DETAILS.clabe,
      concepto_default: String(concepto_default || "").trim() || DEFAULT_BANK_DETAILS.concepto_default,
      telefono: String(telefono || "").trim().replace(/\D/g, "") || DEFAULT_BANK_DETAILS.telefono
    };

    const { data, error } = await supabase
      .from("configuraciones")
      .upsert(
        { clave: "datos_bancarios", valor: payload, updated_at: new Date().toISOString() },
        { onConflict: "clave" }
      )
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data?.valor || payload };
  } catch (err) {
    console.error("updateDatosBancarios error:", err);
    return { success: false, error: err.message };
  }
}

export const getAgencyBankDetails = getDatosBancarios;
export const updateAgencyBankDetails = updateDatosBancarios;
