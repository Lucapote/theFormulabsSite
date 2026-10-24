import {
  Facebook,
  Instagram,
  CheckCircle2,
  Unlink,
  Link2
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

/**
 * ClientMetaSection
 * Subcomponente atómico para la configuración y vinculación oficial de Facebook e Instagram
 * con soporte de auto-publicación programada para clientes.
 */
export default function ClientMetaSection({
  formData,
  setFormData,
  cliente,
  availableMetaPages = [],
  isAssigningPage = false,
  onConnectOAuth,
  onSelectPage,
  onCancelPageSelection,
  onUnlinkMeta,
  onOpenAdvancedScanner
}) {
  return (
    <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100 space-y-3 font-inter">
      <div className="flex items-center justify-between">
        <span className="text-xs font-sora font-bold text-gray-500 uppercase tracking-wider block">
          2. Autopublicación & Redes (Meta)
        </span>
        {formData.fb_page_id ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Conectado / Auto-publicación lista</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200 text-[11px] font-medium">
            <span>Sin vincular</span>
          </span>
        )}
      </div>

      {formData.fb_page_id ? (
        /* ESTADO 1: CUENTA CONECTADA */
        <div className="bg-white border border-gray-200 rounded-xl p-3.5 space-y-3 shadow-xs">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Facebook className="w-4 h-4 text-[#1877F2]" />
                <span className="font-sora font-semibold text-xs text-gray-900">
                  Página de Facebook
                </span>
                <span className="font-mono text-[11px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                  ID: {formData.fb_page_id}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Instagram className="w-4 h-4 text-pink-600" />
                <span className="font-sora font-semibold text-xs text-gray-900">
                  Instagram Business
                </span>
                {formData.ig_business_account_id ? (
                  <span className="font-mono text-[11px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                    ID: {formData.ig_business_account_id}
                  </span>
                ) : (
                  <span className="text-[11px] text-amber-600 font-inter">
                    Sin cuenta de Instagram asociada
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={onUnlinkMeta}
              className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-full border border-rose-200 font-sora font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-[0.98]"
            >
              <Unlink className="w-3.5 h-3.5" />
              <span>Desvincular</span>
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="space-y-0.5">
              <Label htmlFor="auto-publish-switch" className="text-xs font-sora font-bold text-gray-700 block">
                Auto-publicación programada
              </Label>
              <p className="text-[11px] font-inter text-gray-400">
                Habilita el cron job para publicar automáticamente en fecha y hora.
              </p>
            </div>
            <Switch
              id="auto-publish-switch"
              checked={Boolean(formData.auto_publish_enabled)}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, auto_publish_enabled: checked })
              }
            />
          </div>
        </div>
      ) : availableMetaPages.length > 0 ? (
        /* ESTADO 2: SELECCIÓN DE PÁGINAS SINCRONIZADAS TRAS OAUTH */
        <div className="bg-white border border-blue-200 rounded-xl p-3.5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <div className="space-y-0.5">
              <p className="text-xs font-sora font-bold text-gray-900">
                Selecciona la página que pertenece a {cliente?.nombre || "este cliente"}:
              </p>
              <p className="text-[11px] font-inter text-gray-500">
                {availableMetaPages.length} {availableMetaPages.length === 1 ? "página encontrada" : "páginas encontradas"} en tu cuenta de Facebook.
              </p>
            </div>
            <button
              type="button"
              onClick={onCancelPageSelection}
              className="text-[11px] text-gray-500 hover:text-gray-800 px-2.5 py-1 rounded-full hover:bg-gray-100 font-sora font-medium transition-colors cursor-pointer"
            >
              Cancelar
            </button>
          </div>

          <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
            {availableMetaPages.map((page) => (
              <div
                key={page.pageId}
                className="flex items-center justify-between p-2.5 bg-gray-50/80 border border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50/40 transition-all gap-3"
              >
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <Facebook className="w-3.5 h-3.5 text-[#1877F2] shrink-0" />
                    <span className="font-sora font-bold text-xs text-gray-900 truncate">
                      {page.pageName}
                    </span>
                    <span className="font-mono text-[10px] text-gray-400 shrink-0">
                      ID: {page.pageId}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    {page.instagramUsername ? (
                      <>
                        <Instagram className="w-3 h-3 text-pink-600 shrink-0" />
                        <span className="text-pink-600 font-medium font-inter">
                          @{page.instagramUsername}
                        </span>
                        <span className="font-mono text-[10px] text-gray-400">
                          ({page.instagramId})
                        </span>
                      </>
                    ) : (
                      <span className="text-amber-600 text-[10px] font-inter">
                        Sin Instagram comercial asociado
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isAssigningPage}
                  onClick={() => onSelectPage(page)}
                  className="h-8 px-3.5 rounded-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-sora font-bold tracking-wide transition-all shadow-xs active:scale-[0.98] cursor-pointer shrink-0"
                >
                  {isAssigningPage ? "Asignando..." : "Asignar"}
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ESTADO 3: BOTÓN DE CONEXIÓN OAUTH Y ACCESO AVANZADO */
        <div className="bg-white border border-dashed border-gray-200 rounded-xl p-5 text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-[#1877F2] flex items-center justify-center mx-auto">
            <Facebook className="w-5 h-5 fill-[#1877F2]" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-sora font-semibold text-gray-900">
              Vinculación Oficial de Meta (Facebook & Instagram)
            </p>
            <p className="text-[11px] font-inter text-gray-500 max-w-sm mx-auto">
              Inicia sesión con la cuenta de Facebook que administra las páginas e Instagram de este cliente para otorgar los permisos de publicación automática.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
            <button
              type="button"
              onClick={onConnectOAuth}
              className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-full bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-sora font-bold tracking-wide transition-all shadow-sm shadow-blue-200 active:scale-[0.98] cursor-pointer w-full sm:w-auto"
            >
              <Facebook className="w-4 h-4 fill-white" />
              <span>Conectar Páginas con Facebook</span>
            </button>
            <button
              type="button"
              onClick={onOpenAdvancedScanner}
              title="Escanear cuentas con token manual o ya existente"
              className="inline-flex items-center justify-center gap-1.5 h-10 px-3 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-sora font-medium transition-all cursor-pointer"
            >
              <Link2 className="w-3.5 h-3.5 text-gray-400" />
              <span>Avanzado</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
