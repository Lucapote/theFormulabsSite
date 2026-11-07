import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Building2, Copy, Check } from "lucide-react";
import { getDatosBancarios } from "@/services/configService";

/**
 * BookingBankDetailsCard
 * Ficha clínica compacta de datos bancarios oficiales para transferencias.
 * Optimizada para encajar en el viewport móvil sin scroll.
 */
export default function BookingBankDetailsCard({
  clientName = "Cliente Estimado",
  montoAbono = 0,
  abonoBadgeLabel = "1er ABONO (50%)",
  bankDetailsOverride = null
}) {
  const [bankDetails, setBankDetails] = useState({
    banco: "Nubank",
    beneficiario: "Paulina Nuñez Banuet Sandoval",
    clabe: "638180000134691855",
    telefono: "529982148831"
  });
  const [copiedClabe, setCopiedClabe] = useState(false);

  useEffect(() => {
    if (bankDetailsOverride) {
      setBankDetails(bankDetailsOverride);
      return;
    }

    getDatosBancarios().then((res) => {
      if (res?.success && res?.data) {
        setBankDetails((prev) => ({ ...prev, ...res.data }));
      }
    });
  }, [bankDetailsOverride]);

  const handleCopyClabe = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(bankDetails.clabe);
      setCopiedClabe(true);
      toast.success("Cuenta CLABE copiada al portapapeles");
      setTimeout(() => setCopiedClabe(false), 2000);
    }
  };

  return (
    <div className="bg-white border border-gray-200/90 rounded-2xl p-3 sm:p-4 shadow-xs space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-50 text-brand-blue border border-blue-100 flex items-center justify-center shrink-0">
            <Building2 className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-mono tracking-wider uppercase font-semibold text-gray-400">
              CUENTA
            </p>
            <p className="text-xs sm:text-sm font-sora font-bold text-gray-900 truncate">
              {clientName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {montoAbono > 0 && (
            <span className="text-xs sm:text-sm font-sora font-extrabold text-gray-900">
              ${Number(montoAbono).toLocaleString("es-MX")} MXN
            </span>
          )}
          {abonoBadgeLabel && (
            <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-sora font-bold bg-amber-100 text-amber-800 border border-amber-200">
              {abonoBadgeLabel}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 text-[11px] pt-1.5 border-t border-gray-100 text-gray-600">
        <span className="truncate">
          <strong className="text-gray-900 font-semibold">{bankDetails.banco}</strong>
          {" · "}
          <span className="text-gray-500">{bankDetails.beneficiario}</span>
        </span>
      </div>

      <div className="bg-gray-50 border border-gray-200/80 rounded-xl px-2.5 py-1.5 sm:py-2 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <span className="text-[8px] font-mono uppercase tracking-wider text-gray-400 block font-semibold leading-tight">
            CLABE INTERBANCARIA
          </span>
          <span className="font-mono text-xs sm:text-sm font-bold text-gray-900 tracking-wider truncate block">
            {bankDetails.clabe}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopyClabe}
          className="h-7 px-2.5 rounded-full bg-blue-50 hover:bg-blue-100 text-brand-blue border border-blue-200 text-[11px] font-sora font-bold inline-flex items-center gap-1 cursor-pointer transition-colors active:scale-[0.98] shrink-0"
        >
          {copiedClabe ? (
            <>
              <Check className="w-3 h-3 text-emerald-600" />
              <span className="text-emerald-700">Copiada</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copiar</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
