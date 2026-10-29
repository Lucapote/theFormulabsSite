import { AlertCircle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

export function BookingLoadingSkeleton() {
  return (
    <div className="space-y-4 max-w-xl mx-auto">
      <div className="text-center space-y-2 mb-6">
        <Skeleton className="h-5 w-48 mx-auto rounded-full bg-gray-200" />
        <Skeleton className="h-8 w-64 mx-auto rounded-xl bg-gray-200" />
      </div>
      <Skeleton className="h-96 w-full rounded-2xl bg-gray-200" />
    </div>
  );
}

export function BookingErrorCard({ error }) {
  return (
    <div className="bg-white border border-gray-200 shadow-xl rounded-2xl p-8 max-w-md mx-auto text-center">
      <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-7 h-7" />
      </div>
      <h2 className="font-sora font-bold text-gray-900 text-lg mb-2">
        Enlace de Reserva Inválido
      </h2>
      <p className="font-inter text-xs text-gray-500 mb-6">
        {error} Verifica que el enlace esté completo o solicita a tu gestor de cuenta un nuevo link de reserva.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-xs font-sora font-bold uppercase tracking-wider transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Ir al Inicio</span>
      </Link>
    </div>
  );
}

