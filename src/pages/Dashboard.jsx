import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { LogOut, ShieldCheck, User, Database, RefreshCw, BarChart2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [diagnostics, setDiagnostics] = useState([]);
  const [loadingDb, setLoadingDb] = useState(false);

  const fetchDiagnostics = async () => {
    setLoadingDb(true);
    try {
      const { data, error } = await supabase
        .from("diagnostics")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        console.warn("Supabase fetch notice:", error.message);
      } else {
        setDiagnostics(data || []);
      }
    } catch (err) {
      console.error("Error loading diagnostics:", err);
    } finally {
      setLoadingDb(false);
    }
  };

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success("Sesión cerrada.");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-inter">
      {/* Dashboard Top Navigation */}
      <header className="border-b border-neutral-200 bg-white sticky top-0 z-40">
        <div className="container max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/">
              <img src="/logo.png" alt="The Formulab" className="h-7 w-auto object-contain" />
            </a>
            <span className="hidden sm:inline-block text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 border border-brand-magenta/30 text-brand-magenta font-bold">
              ÁREA PROTEGIDA
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-neutral-500 border-r border-neutral-200 pr-4">
              <User className="w-3.5 h-3.5 text-brand-magenta" />
              <span>{user?.email}</span>
            </div>

            <button
              onClick={handleLogout}
              className="h-9 px-4 rounded-none border border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white font-sora font-bold text-xs tracking-wider uppercase transition-colors flex items-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container max-w-6xl mx-auto px-6 py-10">
        {/* Welcome Banner */}
        <div className="mb-10 p-6 sm:p-8 border-2 border-neutral-900 bg-white relative overflow-hidden">
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-brand-magenta mb-2">
            <ShieldCheck className="w-4 h-4 text-brand-magenta" />
            SESIÓN AUTENTICADA CON ÉXITO
          </div>
          <h1 className="text-3xl sm:text-4xl font-sora font-extrabold text-neutral-900 tracking-tight">
            Panel Clínico de Administración
          </h1>
          <p className="text-neutral-600 text-sm mt-2 max-w-2xl leading-relaxed">
            Esta vista está protegida por Supabase Auth y requiere una sesión activa para ingresar. Desde aquí puedes consultar los diagnósticos capturados.
          </p>

          <div className="mt-6 flex flex-wrap gap-4 text-xs font-mono text-neutral-500 pt-4 border-t border-neutral-200">
            <div><strong>UID Usuario:</strong> {user?.id}</div>
            <div>•</div>
            <div><strong>Email:</strong> {user?.email}</div>
          </div>
        </div>

        {/* Database Leads Table */}
        <div className="border border-neutral-200 bg-white p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-200">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-400 font-bold block mb-1">
                BASE DE DATOS SUPABASE
              </span>
              <h2 className="text-xl font-sora font-bold text-neutral-900 flex items-center gap-2">
                <Database className="w-5 h-5 text-brand-magenta" />
                Diagnósticos Recientes
              </h2>
            </div>

            <button
              onClick={fetchDiagnostics}
              disabled={loadingDb}
              className="h-9 px-3.5 rounded-none border border-neutral-300 hover:border-neutral-900 text-xs font-mono font-bold text-neutral-700 hover:text-neutral-900 flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingDb ? "animate-spin" : ""}`} />
              Actualizar
            </button>
          </div>

          {diagnostics.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-inter text-sm border-collapse">
                <thead>
                  <tr className="border-b border-neutral-900 text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                    <th className="py-3 px-4">Correo</th>
                    <th className="py-3 px-4">Fecha</th>
                    <th className="py-3 px-4">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {diagnostics.map((row) => (
                    <tr key={row.id || row.created_at} className="hover:bg-neutral-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-neutral-900">{row.email}</td>
                      <td className="py-3.5 px-4 text-xs text-neutral-500">
                        {new Date(row.created_at).toLocaleString("es-MX")}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block text-[10px] font-mono font-bold uppercase px-2 py-0.5 bg-brand-magenta/10 text-brand-magenta">
                          Procesado
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-neutral-200">
              <BarChart2 className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
              <p className="font-sora text-sm font-bold text-neutral-700">No hay diagnósticos almacenados aún</p>
              <p className="font-inter text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
                Completa el formulario interactivo en la landing page o configura la tabla <code className="text-brand-magenta">diagnostics</code> en tu proyecto de Supabase.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
