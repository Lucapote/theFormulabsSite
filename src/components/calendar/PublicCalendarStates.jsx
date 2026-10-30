import { Loader2, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

export function PublicCalendarLoading() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col justify-center items-center p-6 font-inter">
      <div className="text-center space-y-4 max-w-sm">
        <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto shadow-sm">
          <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
        </div>
        <h2 className="font-sora text-xl font-bold tracking-tight text-gray-900">
          Cargando Calendario de Contenidos...
        </h2>
        <p className="text-xs text-gray-500">Obteniendo publicaciones y plan editorial.</p>
      </div>
    </div>
  );
}

export function PublicCalendarNotFound({ errorMsg }) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col items-center justify-center p-6 font-inter">
      <div className="max-w-md w-full bg-white border border-gray-100 rounded-[2.5rem] p-8 text-center space-y-6 shadow-xl">
        <div className="w-16 h-16 rounded-full bg-red-50 border border-red-100 text-red-500 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-sora font-extrabold text-gray-900">Calendario No Encontrado</h1>
          <p className="text-xs text-gray-500 leading-relaxed">{errorMsg}</p>
        </div>

        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 h-11 px-6 rounded-full bg-[#188ff0] hover:bg-blue-600 text-white text-xs font-sora font-bold uppercase tracking-wider transition-all shadow-md shadow-blue-200"
          >
            Ir al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

