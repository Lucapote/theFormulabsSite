import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Building2, Copy, Check } from "lucide-react";
import { getDatosBancarios } from "@/services/configService";

/**
 * BookingBankDetailsCard
 * Ficha clínica de datos bancarios oficiales para transferencias.
 * Reutilizada en BookingLockedCard, BookingAgencyStep1 y BookingStandardFields.
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
    <div className="bg-white border border-gray-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-brand-blue border border-blue-100 flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-mono tracking-wider uppercase font-semibold text-gray-400">
              CUENTA
            </p>
            <p className="text-xs sm:text-sm font-sora font-bold text-gray-900">
              {clientName}
            </p>
          </div>
        </div>

        <div className="flex flex-col text-left sm:text-right gap-1">
          {montoAbono > 0 ? (
            <p className="text-xs sm:text-sm font-sora font-extrabold text-gray-900 mt-0.5">
              ${Number(montoAbono).toLocaleString("es-MX")} MXN
            </p>
          ) : (
            <p className="text-xs sm:text-sm font-sora font-bold text-gray-900 mt-0.5">
              Reserva Activa
            </p>
          )}
          {abonoBadgeLabel && (
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-sora font-bold bg-amber-100 text-amber-800 border border-amber-200 self-start sm:self-end">
              {abonoBadgeLabel}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1 border-t border-gray-100">
        <div className="flex flex-col gap-0.5">
          <span className="text-gray-400">Banco: </span>
          <strong className="text-gray-900">{bankDetails.banco}</strong>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-gray-400">Beneficiario: </span>
          <strong
            className="text-gray-900 truncate inline-block max-w-[200px] align-bottom"
            title={bankDetails.beneficiario}
          >
            {bankDetails.beneficiario}
          </strong>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200/80 rounded-xl p-3 flex items-center justify-between gap-2 flex-wrap">
        <div>
          <span className="text-[9px] font-mono uppercase tracking-wider text-gray-400 block font-semibold">
            CLABE INTERBANCARIA
          </span>
          <span className="font-mono text-xs sm:text-sm font-bold text-gray-900 tracking-wider">
            {bankDetails.clabe}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopyClabe}
          className="h-8 px-3.5 rounded-full bg-blue-50 hover:bg-blue-100 text-brand-blue border border-blue-200 text-xs font-sora font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors active:scale-[0.98]"
        >
          {copiedClabe ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700">Copiada</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copiar CLABE</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
