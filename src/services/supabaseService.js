import { supabase } from "@/lib/supabase";

/**
 * Service helpers for Supabase database operations
 */

export async function saveDiagnosticResult({ email, answers, resultData = null }) {
  try {
    const { data, error } = await supabase
      .from("diagnostics")
      .insert([
        {
          email,
          answers,
          result_data: resultData,
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      console.warn("Supabase notice (saveDiagnosticResult):", error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Error in saveDiagnosticResult:", err);
    return { success: false, error: err.message };
  }
}

export async function saveContactLead({ name, email, company = "", message = "" }) {
  try {
    const { data, error } = await supabase
      .from("contacts")
      .insert([
        {
          name,
          email,
          company,
          message,
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      console.warn("Supabase notice (saveContactLead):", error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Error in saveContactLead:", err);
    return { success: false, error: err.message };
  }
}
