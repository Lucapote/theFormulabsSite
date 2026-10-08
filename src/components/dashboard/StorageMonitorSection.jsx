import { useState, useEffect } from "react";
import { formatBytes } from "@/utils/mediaCompressor";
import { getStorageAndDatabaseMetrics } from "@/services/storageMonitorService";
import { toast } from "sonner";
import {
  HardDrive,
  Database,
  RefreshCw,
  Image as ImageIcon,
  Film,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Users,
  Calendar as CalendarIcon,
  Sparkles,
  Server,
  Layers,
  BarChart3,
  ShieldCheck,
  Zap
} from "lucide-react";

export default function StorageMonitorSection() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchMetrics = async (showToast = false) => {
    if (showToast) setIsRefreshing(true);
    else setLoading(true);

    const res = await getStorageAndDatabaseMetrics();
    if (res.success) {
      setMetrics(res);
      if (showToast) {
        toast.success("Métricas de almacenamiento y BD actualizadas.");
      }
    } else {
      toast.error(res.error || "No se pudieron obtener las métricas.");
    }

    setLoading(false);
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-[2rem] p-12 text-center border border-gray-100 shadow-xl max-w-5xl mx-auto my-6">
        <div className="w-12 h-12 rounded-full bg-pink-50 border border-pink-100 flex items-center justify-center mx-auto mb-4 text-pink-500">
          <Sparkles className="w-6 h-6 animate-spin text-pink-500" />
        </div>
        <h3 className="font-sora font-extrabold text-lg text-gray-900">
          Escaneando Almacenamiento & Base de Datos...
        </h3>
        <p className="text-xs text-gray-500 mt-1 font-medium">
          Calculando MBs en bucket de Supabase Storage y filas activas de PostgreSQL.
        </p>
      </div>
    );
  }

  const { storage, database, timestamp } = metrics || {};

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 shadow-xl border border-pink-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-pink-50 via-pink-100/40 to-transparent rounded-bl-[100%] -z-10 opacity-70" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-sora font-extrabold uppercase tracking-wider bg-pink-50 text-pink-600 border border-pink-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                SISTEMA EN TIEMPO REAL
              </span>
              {timestamp && (
                <span className="text-[11px] text-gray-400 font-medium hidden md:inline">
                  Último escaneo: {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight font-sora">
              Monitor de <span className="text-pink-500">Capacidad</span>
            </h1>
            <p className="text-gray-600 text-xs sm:text-sm mt-1 font-medium">
              Supervisión de espacio ocupado en el bucket de medios y consumo de la Base de Datos Supabase.
            </p>
          </div>

          <button
            onClick={() => fetchMetrics(true)}
            disabled={isRefreshing}
            className="h-11 px-5 bg-gray-900 hover:bg-black text-white font-sora font-extrabold text-xs rounded-full shadow-md hover:shadow-lg transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-pink-400 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>{isRefreshing ? "Escaneando..." : "Actualizar Métricas"}</span>
          </button>
        </div>
      </div>

      {/* Main 2 Column Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CARD 1: SUPABASE STORAGE BUCKET */}
        <div className="bg-white rounded-[2rem] p-6 sm:p-7 shadow-xl border border-gray-100 flex flex-col justify-between relative overflow-hidden transition-all hover:border-pink-200">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-pink-50 border border-pink-200 flex items-center justify-center text-pink-500 shrink-0">
                  <HardDrive className="w-5 h-5 text-pink-500" />
                </div>
                <div>
                  <h3 className="font-sora font-extrabold text-base text-gray-900">
                    Bucket Cloudflare R2
                  </h3>
                  <p className="text-[11px] text-gray-400 font-medium">
                    R2 Bucket: <span className="text-gray-700 font-bold">media-videos-calendario</span>
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-sora font-extrabold bg-pink-50 text-pink-600 border border-pink-100">
                {storage?.usedPercentage}% Usado
              </span>
            </div>

            {/* Storage Usage Numbers */}
            <div className="mb-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-gray-900 font-sora tracking-tight">
                  {formatBytes(storage?.totalBytes || 0)}
                </span>
                <span className="text-xs text-gray-400 font-semibold font-sora">
                  / de {formatBytes(storage?.limitBytes || 0)} (Cuota Gratis)
                </span>
              </div>
            </div>

            {/* Custom Progress Bar */}
            <div className="space-y-2 mb-6">
              <div className="w-full bg-gray-100 h-3.5 rounded-full overflow-hidden border border-gray-200/60 p-0.5">
                <div
                  className="bg-gradient-to-r from-pink-500 via-pink-400 to-[#188ff0] h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(2, storage?.usedPercentage || 0)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] font-sora font-bold text-gray-500">
                <span>Disponible: {formatBytes((storage?.limitBytes || 0) - (storage?.totalBytes || 0))}</span>
                <span className="text-pink-600 font-extrabold">{storage?.totalFiles} Archivos Totales</span>
              </div>
            </div>
          </div>

          {/* Breakdown Badges */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
            <div className="bg-pink-50/60 rounded-xl p-3 border border-pink-100">
              <div className="flex items-center gap-2 mb-1 text-pink-700 font-sora font-bold text-xs">
                <ImageIcon className="w-4 h-4 text-pink-500" />
                <span>Imágenes</span>
              </div>
              <p className="text-lg font-black text-gray-900 font-sora">
                {storage?.imagesCount || 0}{" "}
                <span className="text-[11px] font-normal text-gray-500">
                  ({formatBytes(storage?.imagesBytes || 0)})
                </span>
              </p>
            </div>

            <div className="bg-blue-50/60 rounded-xl p-3 border border-blue-100">
              <div className="flex items-center gap-2 mb-1 text-brand-blue font-sora font-bold text-xs">
                <Film className="w-4 h-4 text-brand-blue" />
                <span>Videos</span>
              </div>
              <p className="text-lg font-black text-gray-900 font-sora">
                {storage?.videosCount || 0}{" "}
                <span className="text-[11px] font-normal text-gray-500">
                  ({formatBytes(storage?.videosBytes || 0)})
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* CARD 2: SUPABASE POSTGRES DATABASE */}
        <div className="bg-white rounded-[2rem] p-6 sm:p-7 shadow-xl border border-gray-100 flex flex-col justify-between relative overflow-hidden transition-all hover:border-pink-200">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
                  <Database className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-sora font-extrabold text-base text-gray-900">
                    Base de Datos
                  </h3>
                  <p className="text-[11px] text-gray-400 font-medium">
                    PostgreSQL: <span className="text-gray-700 font-bold">Supabase DB</span>
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-sora font-extrabold bg-indigo-50 text-indigo-600 border border-indigo-100">
                {database?.usedPercentage}% Usado
              </span>
            </div>

            {/* DB Usage Numbers */}
            <div className="mb-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-gray-900 font-sora tracking-tight">
                  {formatBytes(database?.estimatedBytes || 0)}
                </span>
                <span className="text-xs text-gray-400 font-semibold font-sora">
                  / de {formatBytes(database?.limitBytes || 0)} (Cuota Gratis)
                </span>
              </div>
            </div>

            {/* Custom Progress Bar */}
            <div className="space-y-2 mb-6">
              <div className="w-full bg-gray-100 h-3.5 rounded-full overflow-hidden border border-gray-200/60 p-0.5">
                <div
                  className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(2, database?.usedPercentage || 0)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] font-sora font-bold text-gray-500">
                <span>Total Filas Registradas</span>
                <span className="text-indigo-600 font-extrabold">{database?.totalRows || 0} Registros</span>
              </div>
            </div>
          </div>

          {/* Table Counts Summary Badges */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-100 text-center">
            <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-200/70">
              <p className="text-[10px] text-gray-400 font-sora font-bold uppercase tracking-wider">Clientes</p>
              <p className="text-base font-black text-gray-900 font-sora mt-0.5">{database?.tables?.clientes}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-200/70">
              <p className="text-[10px] text-gray-400 font-sora font-bold uppercase tracking-wider">Calendarios</p>
              <p className="text-base font-black text-gray-900 font-sora mt-0.5">{database?.tables?.calendarios}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-200/70">
              <p className="text-[10px] text-gray-400 font-sora font-bold uppercase tracking-wider">Posts</p>
              <p className="text-base font-black text-gray-900 font-sora mt-0.5">{database?.tables?.posts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Tables Breakdown Section */}
      <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-xl border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-pink-50 border border-pink-200 flex items-center justify-center text-pink-500">
            <Layers className="w-5 h-5 text-pink-500" />
          </div>
          <div>
            <h3 className="font-sora font-extrabold text-lg text-gray-900">
              Desglose Detallado por Tabla de Base de Datos
            </h3>
            <p className="text-xs text-gray-500 font-medium">
              Conteo de registros por módulo activo en la base de datos de la plataforma.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Table Item: Clientes */}
          <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center font-bold">
                <Users className="w-4 h-4 text-pink-600" />
              </div>
              <div>
                <p className="font-sora font-extrabold text-xs text-gray-900">Tabla `clientes`</p>
                <p className="text-[11px] text-gray-400 font-medium">Clientes de la agencia</p>
              </div>
            </div>
            <span className="font-sora font-black text-base text-gray-900 bg-white px-3 py-1 rounded-xl border border-gray-200 shadow-2xs">
              {database?.tables?.clientes || 0}
            </span>
          </div>

          {/* Table Item: Calendarios */}
          <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-brand-blue flex items-center justify-center font-bold">
                <CalendarIcon className="w-4 h-4 text-brand-blue" />
              </div>
              <div>
                <p className="font-sora font-extrabold text-xs text-gray-900">Tabla `calendarios`</p>
                <p className="text-[11px] text-gray-400 font-medium">Calendarios mensuales</p>
              </div>
            </div>
            <span className="font-sora font-black text-base text-gray-900 bg-white px-3 py-1 rounded-xl border border-gray-200 shadow-2xs">
              {database?.tables?.calendarios || 0}
            </span>
          </div>

          {/* Table Item: Posts */}
          <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                <BarChart3 className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="font-sora font-extrabold text-xs text-gray-900">Tabla `posts`</p>
                <p className="text-[11px] text-gray-400 font-medium">Reels y Carruseles</p>
              </div>
            </div>
            <span className="font-sora font-black text-base text-gray-900 bg-white px-3 py-1 rounded-xl border border-gray-200 shadow-2xs">
              {database?.tables?.posts || 0}
            </span>
          </div>

          {/* Table Item: Archivos Galeria */}
          <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="font-sora font-extrabold text-xs text-gray-900">Tabla `archivos_galeria`</p>
                <p className="text-[11px] text-gray-400 font-medium">Archivos multimedia</p>
              </div>
            </div>
            <span className="font-sora font-black text-base text-gray-900 bg-white px-3 py-1 rounded-xl border border-gray-200 shadow-2xs">
              {database?.tables?.archivos_galeria || 0}
            </span>
          </div>

          {/* Table Item: Propuestas */}
          <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                <FileText className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="font-sora font-extrabold text-xs text-gray-900">Tabla `propuestas`</p>
                <p className="text-[11px] text-gray-400 font-medium">Estrategias clínicas</p>
              </div>
            </div>
            <span className="font-sora font-black text-base text-gray-900 bg-white px-3 py-1 rounded-xl border border-gray-200 shadow-2xs">
              {database?.tables?.propuestas || 0}
            </span>
          </div>

          {/* Table Item: Diagnósticos */}
          <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
              </div>
              <div>
                <p className="font-sora font-extrabold text-xs text-gray-900">Tabla `diagnostics`</p>
                <p className="text-[11px] text-gray-400 font-medium">Registros de diagnóstico</p>
              </div>
            </div>
            <span className="font-sora font-black text-base text-gray-900 bg-white px-3 py-1 rounded-xl border border-gray-200 shadow-2xs">
              {database?.tables?.diagnostics || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Health & Optimization Advice Card */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-black rounded-[2rem] p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400 shrink-0">
            <Zap className="w-6 h-6 text-pink-400" />
          </div>
          <div>
            <h4 className="font-sora font-extrabold text-base text-white">
              Estado de Salud del Servidor: <span className="text-emerald-400">Excelente</span>
            </h4>
            <p className="text-xs text-gray-300 font-medium mt-1 leading-relaxed max-w-xl">
              El espacio total utilizado en el bucket de medios está dentro de los límites óptimos de la cuota gratuita (1.00 GB). Las imágenes se optimizan automáticamente al subirse para asegurar cargas veloces sin saturar el almacenamiento.
            </p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/10 font-sora text-xs text-center shrink-0 w-full sm:w-auto">
          <span className="text-gray-400 block text-[10px] font-bold uppercase tracking-wider">Capacidad Disponible</span>
          <span className="text-lg font-black text-pink-400">
            {formatBytes((storage?.limitBytes || 0) - (storage?.totalBytes || 0))}
          </span>
        </div>
      </div>
    </div>
  );
}
