import { Building2, Plus, Sparkles, Users, Mail, Trash2, ChevronRight } from "lucide-react";

/**
 * ClientListSidebar
 * Renders the directory list of clients with selection and action buttons.
 */
export default function ClientListSidebar({
  clientes = [],
  loadingClientes = false,
  selectedCliente = null,
  deletingId = null,
  onSelectClient,
  onOpenClientModal,
  onDeleteClient
}) {
  return (
    <div className="lg:col-span-4 bg-white rounded-[2rem] p-6 shadow-xl border border-gray-100 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <h3 className="font-sora font-bold text-gray-900 text-sm flex items-center gap-2">
          <Building2 className="w-4 h-4 text-pink-500" />
          Directorio de Clientes ({clientes.length})
        </h3>
        <button
          type="button"
          onClick={onOpenClientModal}
          className="p-1.5 rounded-full hover:bg-pink-50 text-pink-600 transition-all cursor-pointer"
          title="Agregar cliente"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {loadingClientes ? (
        <div className="p-8 text-center">
          <Sparkles className="w-6 h-6 text-pink-500 animate-spin mx-auto mb-2" />
          <span className="text-xs font-sora font-medium text-gray-500">Cargando clientes...</span>
        </div>
      ) : clientes.length === 0 ? (
        <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-xs font-sora font-semibold text-gray-700 mb-1">Sin clientes aún</p>
          <p className="text-[11px] text-gray-500 mb-4">Crea tu primer cliente para asignarle calendarios.</p>
          <button
            type="button"
            onClick={onOpenClientModal}
            className="h-9 px-4 bg-pink-500 text-white font-sora font-bold text-xs rounded-full shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Agregar Cliente
          </button>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
          {clientes.map((c) => {
            const isSelected = selectedCliente?.id === c.id;
            return (
              <div
                key={c.id}
                onClick={() => onSelectClient(c)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? "bg-pink-50/60 border-pink-300 shadow-xs"
                    : "bg-white border-gray-100 hover:border-pink-200 hover:bg-pink-50/20"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-sora font-bold text-sm text-gray-900 truncate">
                      {c.nombre}
                    </span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-pink-500 shrink-0" />
                    )}
                  </div>
                  {c.empresa && (
                    <p className="text-xs text-gray-500 font-medium truncate flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3 h-3 text-gray-400 shrink-0" />
                      {c.empresa}
                    </p>
                  )}
                  {c.email && (
                    <p className="text-[11px] text-gray-400 truncate flex items-center gap-1 mt-0.5 font-mono">
                      <Mail className="w-3 h-3 text-gray-300 shrink-0" />
                      {c.email}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => onDeleteClient(c, e)}
                    disabled={deletingId === c.id}
                    className="p-1.5 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all cursor-pointer"
                    title="Eliminar cliente"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${
                      isSelected ? "text-pink-500 translate-x-0.5" : "text-gray-300"
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
