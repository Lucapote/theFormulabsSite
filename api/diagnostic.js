import { supabase, isSupabaseConfigured } from "./_lib/supabaseClient.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,POST");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "POST") {
    try {
      const { email, answers, resultData } = req.body || {};

      if (!email) {
        return res.status(400).json({ success: false, error: "El correo es requerido." });
      }

      let dbResult = null;
      if (supabase) {
        const { data, error } = await supabase
          .from("diagnostics")
          .insert([{ email, answers, result_data: resultData || null, created_at: new Date().toISOString() }]);
        if (error) {
          console.warn("Supabase API Insert Warning:", error.message);
        } else {
          dbResult = data;
        }
      }

      return res.status(200).json({
        success: true,
        message: "Diagnóstico registrado con éxito en The Formulab.",
        data: {
          email,
          status: "processed",
          dbResult,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error("Error en api/diagnostic:", error);
      return res.status(500).json({ success: false, error: "Error interno en el servidor." });
    }
  }

  return res.status(200).json({
    service: "The Formulab Diagnostic API (Supabase Connected)",
    supabaseConfigured: isSupabaseConfigured,
    timestamp: new Date().toISOString()
  });
}
