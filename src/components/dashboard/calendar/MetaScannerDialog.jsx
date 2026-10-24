import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Facebook,
  Instagram,
  RefreshCw,
  Link2,
  Check,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

/**
 * MetaScannerDialog
 * Diálogo clínico de escaneo y selección de cuentas de Meta / Instagram
 * para precarga directa de credenciales en la ficha de edición de cliente.
 */
export default function MetaScannerDialog({
  isOpen = false,
  onClose,
  onSelectAccount,
  clients = [],
  currentClientId = null,
}) {
  const [loading, setLoading] = useState(false);
  const [pages, setPages] = useState([]);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers = session?.access_token
        ? { Authorization: `Bearer ${session.access_token}` }
        : {};

      const res = await fetch("/api/meta-accounts", { headers });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al consultar las cuentas de Meta");
      }
      setPages(data.pages || []);
    } catch (err) {
      console.error("Error fetching meta accounts in scanner:", err);
      toast.error(err.message || "No se pudo sincronizar con Meta Graph API.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchAccounts();
    }
  }, [isOpen, fetchAccounts]);

  const handlePick = (page) => {
    if (onSelectAccount) {
      onSelectAccount(page);
    }
    toast.success(`Cuenta de ${page.pageName} seleccionada.`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl w-full max-h-[85vh] p-0 flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-2xl">
        {/* Cabecera Clínica Oscura */}
        <DialogHeader className="bg-slate-950 text-white px-6 py-4 flex flex-row items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-500/20 text-[#188ff0] flex items-center justify-center border border-blue-400/30">
              <Link2 className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="font-sora font-bold text-base text-white flex items-center gap-2">
                <span>Vincular Cuenta de Meta</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/30 text-[#188ff0] border border-blue-400/40 text-[11px] font-mono">
                  {pages.length} disponibles
                </span>
              </DialogTitle>
              <DialogDescription className="font-inter text-xs text-slate-400">
                Selecciona la Fanpage e Instagram del Business Portfolio para este cliente
              </DialogDescription>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={fetchAccounts}
            disabled={loading}
            className="h-8 w-8 rounded-full border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Refrescar cuentas desde Meta"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-pink-400" : ""}`} />
          </Button>
        </DialogHeader>

        {/* Lista de Cuentas */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-gray-50/60 min-h-[280px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
              <Loader2 className="w-7 h-7 animate-spin text-[#188ff0]" />
              <span className="text-xs font-inter font-medium text-gray-500">
                Buscando páginas en el Business Portfolio...
              </span>
            </div>
          ) : pages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-white border border-dashed border-gray-200 rounded-2xl p-6">
              <AlertCircle className="w-10 h-10 text-amber-500 mb-2" />
              <h4 className="font-sora font-bold text-sm text-gray-900">
                No se encontraron cuentas activas
              </h4>
              <p className="font-inter text-xs text-gray-500 max-w-sm mt-1">
                Verifica que el Business Portfolio tenga páginas asociadas en Meta Business Manager.
              </p>
            </div>
          ) : (
            pages.map((page) => {
              const assignedToOther = clients.find(
                (c) => c.fb_page_id === page.pageId && c.id !== currentClientId
              );
              const isCurrent = clients.find(
                (c) => c.fb_page_id === page.pageId && c.id === currentClientId
              );

              return (
                <Card
                  key={page.pageId}
                  className="bg-white border border-gray-200 rounded-xl shadow-xs hover:border-gray-300 transition-all overflow-hidden"
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1877F2] flex items-center justify-center shrink-0 border border-blue-100">
                          <Facebook className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-sora font-bold text-sm text-gray-900">
                            {page.pageName}
                          </h4>
                          <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                            ID: {page.pageId}
                          </p>
                        </div>
                      </div>

                      {isCurrent ? (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 rounded-full font-inter text-[11px] px-2.5 py-0.5 font-medium flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Asignada a este cliente</span>
                        </Badge>
                      ) : assignedToOther ? (
                        <Badge
                          variant="outline"
                          className="bg-amber-50 text-amber-800 border-amber-200 rounded-full font-inter text-[11px] px-2.5 py-0.5 font-medium flex items-center gap-1"
                        >
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          <span>Asignada a: {assignedToOther.nombre}</span>
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="bg-gray-100 text-gray-600 border border-gray-200 rounded-full font-inter text-[11px] px-2.5 py-0.5 font-medium"
                        >
                          Disponible
                        </Badge>
                      )}
                    </div>

                    {/* Fila Instagram */}
                    <div className="flex items-center gap-2 text-xs bg-gray-50 border border-gray-100 p-2.5 rounded-lg">
                      <Instagram className="w-4 h-4 text-pink-600 shrink-0" />
                      {page.instagramUsername ? (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-sora font-semibold text-pink-600">
                            @{page.instagramUsername}
                          </span>
                          <span className="text-gray-400 font-mono text-[10px]">
                            (IG ID: {page.instagramId})
                          </span>
                        </div>
                      ) : (
                        <span className="text-amber-600 text-xs font-inter">
                          Sin cuenta de Instagram conectada
                        </span>
                      )}
                    </div>

                    {/* Botón de selección */}
                    <div className="pt-1 flex justify-end">
                      <Button
                        type="button"
                        onClick={() => handlePick(page)}
                        className="h-8 px-4 rounded-full bg-[#188ff0] hover:bg-blue-600 text-white text-xs font-sora font-semibold tracking-wide transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        <span>Seleccionar esta cuenta</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
