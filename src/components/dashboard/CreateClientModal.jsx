import { UserPlus, RefreshCw } from "lucide-react";

/**
 * CreateClientModal
 * Modal dialog for creating a new client/brand.
 */
export default function CreateClientModal({
  isOpen = false,
  onClose,
  clientForm = { nombre: "", empresa: "", email: "" },
  setClientForm,
  onSubmit,
  isSaving = false
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-full h-full min-h-[100dvh] bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-3 sm:p-6 font-inter animate-in fade-in duration-200 overflow-x-hidden">
      <div className="bg-white rounded-[2rem] p-6 md:p-8 max-w-md w-full max-w-[calc(100vw-1.5rem)] mx-auto shadow-2xl border border-gray-100 relative">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-pink-50 flex items-center justify-center text-pink-500">
              <UserPlus className="w-5 h-5" />
            </div>
            <h3 className="font-sora font-bold text-gray-900 text-lg">
              Nuevo Cliente
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 font-bold text-xl px-2 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-sora font-bold uppercase text-gray-700 mb-1.5">
              Nombre del Cliente / Marca *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Clínica Aurora"
              value={clientForm.nombre}
              onChange={(e) => setClientForm({ ...clientForm, nombre: e.target.value })}
              className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none text-sm text-gray-900 font-medium transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-sora font-bold uppercase text-gray-700 mb-1.5">
              Empresa / Razón Social
            </label>
            <input
              type="text"
              placeholder="Ej. Aurora Health Group S.A."
              value={clientForm.empresa}
              onChange={(e) => setClientForm({ ...clientForm, empresa: e.target.value })}
              className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none text-sm text-gray-900 font-medium transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-sora font-bold uppercase text-gray-700 mb-1.5">
              Email de Contacto
            </label>
            <input
              type="email"
              placeholder="Ej. contacto@clinicaaurora.com"
              value={clientForm.email}
              onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
              className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none text-sm text-gray-900 font-medium transition-all"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="h-11 px-5 rounded-full border border-gray-300 hover:bg-gray-100 text-gray-700 font-sora font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="h-11 px-6 bg-pink-500 hover:bg-pink-600 text-white font-sora font-bold text-xs uppercase tracking-wider rounded-full shadow-md shadow-pink-200 transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Guardando...
                </>
              ) : (
                "Guardar Cliente"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
