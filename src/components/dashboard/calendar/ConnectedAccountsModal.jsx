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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Facebook,
  Instagram,
  RefreshCw,
  Link2,
  CheckCircle2,
  AlertCircle,
  Unlink,
} from "lucide-react";
import { assignMetaAccountToClient, unlinkMetaAccountFromClient } from "@/services/calendarService";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

/**
 * ConnectedAccountsModal
 * Modal clínico para auditoría, consulta y asignación directa de Fanpages de Facebook
 * e Instagram Business Accounts vinculadas al Business Portfolio de The Formulab.
 */
export default function ConnectedAccountsModal({
  isOpen = false,
  onClose,
  clients = [],
  onClientUpdated,
}) {
  const [loading, setLoading] = useState(false);
  const [pages, setPages] = useState([]);
  const [updatingPageId, setUpdatingPageId] = useState(null);

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
      console.error("Error fetching meta accounts:", err);
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

  const handleSelectClient = async (page, targetClientId) => {
    setUpdatingPageId(page.pageId);

    if (targetClientId === "UNLINK") {
      // Buscar qué cliente tiene actualmente esta página asignada
      const currentAssigned = clients.find((c) => c.fb_page_id === page.pageId);
      if (currentAssigned) {
        const res = await unlinkMetaAccountFromClient(currentAssigned.id);
        if (res.success) {
          toast.success(`Cuenta desvinculada de ${currentAssigned.nombre}.`);
          if (onClientUpdated) onClientUpdated();
        } else {
          toast.error(res.error || "No se pudo desvincular la cuenta.");
        }
      }
      setUpdatingPageId(null);
      return;
    }

    const res = await assignMetaAccountToClient({
      clientId: targetClientId,
      pageId: page.pageId,
      pageAccessToken: page.pageAccessToken,
      instagramId: page.instagramId,
    });

    setUpdatingPageId(null);

    if (res.success) {
      const targetClient = clients.find((c) => c.id === targetClientId);
      toast.success(
        `Cuenta vinculada exitosamente a ${targetClient?.nombre || "el cliente"}.`
      );
      if (onClientUpdated) onClientUpdated();
    } else {
      toast.error(res.error || "Error al vincular la cuenta al cliente.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full max-h-[85vh] p-0 flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-2xl">
        {/* Cabecera Clínica Oscura */}
        <DialogHeader className="bg-slate-950 text-white px-6 py-4 flex flex-row items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-500/20 text-[#188ff0] flex items-center justify-center border border-blue-400/30">
              <Link2 className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="font-sora font-bold text-base text-white flex items-center gap-2">
                <span>Cuentas de Meta Conectadas</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/30 text-[#188ff0] border border-blue-400/40 text-[11px] font-mono">
                  {pages.length} {pages.length === 1 ? "activa" : "activas"}
                </span>
              </DialogTitle>
              <DialogDescription className="font-inter text-xs text-slate-400">
                Páginas de Facebook e Instagram vinculadas al Business Portfolio de The Formulab
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
        <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-gray-50/60 min-h-[300px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
              <Loader2 className="w-7 h-7 animate-spin text-[#188ff0]" />
              <span className="text-xs font-inter font-medium text-gray-500">
                Sincronizando con Meta Graph API...
              </span>
            </div>
          ) : pages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-white border border-dashed border-gray-200 rounded-2xl p-6">
              <AlertCircle className="w-10 h-10 text-amber-500 mb-2" />
              <h4 className="font-sora font-bold text-sm text-gray-900">
                No se encontraron cuentas activas
              </h4>
              <p className="font-inter text-xs text-gray-500 max-w-sm mt-1">
                Verifica que el Business Portfolio tenga páginas asociadas y que META_USER_ACCESS_TOKEN cuente con los permisos necesarios.
              </p>
            </div>
          ) : (
            pages.map((page) => {
              const assignedClient = clients.find((c) => c.fb_page_id === page.pageId);
              const isUpdating = updatingPageId === page.pageId;

              return (
                <Card
                  key={page.pageId}
                  className="bg-white border border-gray-200/90 rounded-xl shadow-xs transition-shadow hover:shadow-md overflow-hidden"
                >
                  <CardContent className="p-4 space-y-3">
                    {/* Header de la Tarjeta */}
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1877F2] flex items-center justify-center shrink-0 border border-blue-100">
                          <Facebook className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-sora font-bold text-sm text-gray-900 flex items-center gap-1.5">
                            {page.pageName}
                          </h4>
                          <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                            Page ID: {page.pageId}
                          </p>
                        </div>
                      </div>

                      {assignedClient ? (
                        <Badge
                          variant="outline"
                          className="bg-emerald-50 text-emerald-700 border-emerald-200 rounded-full font-inter text-[11px] px-2.5 py-0.5 font-medium flex items-center gap-1.5 shrink-0"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Asignado a: {assignedClient.nombre}</span>
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="bg-gray-100 text-gray-600 border border-gray-200 rounded-full font-inter text-[11px] px-2.5 py-0.5 font-medium shrink-0"
                        >
                          Sin Asignar
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
                          Sin cuenta de Instagram conectada a esta página
                        </span>
                      )}
                    </div>

                    {/* Selector de Asignación a Cliente */}
                    <div className="pt-1 flex items-center gap-2">
                      <div className="flex-1">
                        <Select
                          value={assignedClient ? assignedClient.id : ""}
                          disabled={isUpdating}
                          onValueChange={(val) => handleSelectClient(page, val)}
                        >
                          <SelectTrigger className="w-full text-xs h-9 bg-white border-gray-200 rounded-lg font-inter">
                            <SelectValue placeholder="Asignar a un cliente..." />
                          </SelectTrigger>
                          <SelectContent className="max-h-56">
                            {assignedClient && (
                              <SelectItem
                                value="UNLINK"
                                className="text-xs text-rose-600 font-medium cursor-pointer border-b border-gray-100 mb-1"
                              >
                                <span className="flex items-center gap-1.5">
                                  <Unlink className="w-3 h-3 text-rose-500" />
                                  <span>Desvincular (dejar sin asignar)</span>
                                </span>
                              </SelectItem>
                            )}
                            {clients.map((c) => (
                              <SelectItem key={c.id} value={c.id} className="text-xs">
                                <span className="font-medium text-gray-900">{c.nombre}</span>
                                {c.empresa && (
                                  <span className="text-gray-400 ml-1">({c.empresa})</span>
                                )}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {isUpdating && (
                        <div className="flex items-center text-xs text-gray-400 gap-1 shrink-0 font-inter">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#188ff0]" />
                          <span>Guardando...</span>
                        </div>
                      )}
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
