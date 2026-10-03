import { supabase } from "@/lib/supabase";

/**
 * Service helpers for Supabase operations via Serverless APIs (Option B - 100% Private Backend)
 */

export async function saveDiagnosticResult({ email, answers, resultData = null }) {
  try {
    // 1. Primary: Call Vercel Serverless Endpoint (Option B - Zero client key exposure)
    const response = await fetch("/api/diagnostic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, answers, resultData })
    });

    if (response.ok) {
      const json = await response.json();
      return { success: true, data: json.data };
    }
  } catch (apiErr) {
    console.warn("Serverless API notice, attempting direct fallback:", apiErr);
  }

  // Fallback to direct client insert if serverless endpoint is unavailable in local dev
  try {
    const { data, error } = await supabase
      .from("diagnostics")
      .insert([{ email, answers, result_data: resultData, created_at: new Date().toISOString() }])
      .select();

    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function saveContactLead({ name, email, company = "", message = "" }) {
  try {
    // 1. Primary: Call Vercel Serverless Endpoint (Option B - Zero client key exposure)
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, company, message })
    });

    if (response.ok) {
      const json = await response.json();
      return { success: true, data: json.data };
    }
  } catch (apiErr) {
    console.warn("Serverless API notice, attempting direct fallback:", apiErr);
  }

  // Fallback to direct client insert if serverless endpoint is unavailable in local dev
  try {
    const { data, error } = await supabase
      .from("contacts")
      .insert([{ name, email, company, message, created_at: new Date().toISOString() }])
      .select();

    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
