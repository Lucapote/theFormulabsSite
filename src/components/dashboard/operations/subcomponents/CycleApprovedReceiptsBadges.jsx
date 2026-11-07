import { FileText, ExternalLink } from "lucide-react";

/**
 * CycleApprovedReceiptsBadges
 * Fila de píldoras compactas para ver comprobantes históricos validados.
 */
export default function CycleApprovedReceiptsBadges({
  isComp1Aprobado = false,
  isComp2Aprobado = false,
  comprobante1 = null,
  comprobante2 = null,
  extraApprovedReceipts = []
}) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap pt-0.5 border-t border-gray-100">
      {isComp1Aprobado && (
        <a
          href={comprobante1}
          target="_blank"
          rel="noopener noreferrer"
          className="h-5 px-2 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[9px] font-mono font-semibold inline-flex items-center gap-1"
          title="Ver comprobante del 1er abono validado"
        >
          <FileText className="w-2.5 h-2.5 text-emerald-600" />
          <span>1er Abono</span>
          <ExternalLink className="w-2 h-2 opacity-60" />
        </a>
      )}
      {isComp2Aprobado && (
        <a
          href={comprobante2}
          target="_blank"
          rel="noopener noreferrer"
          className="h-5 px-2 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[9px] font-mono font-semibold inline-flex items-center gap-1"
          title="Ver comprobante del 2do abono validado"
        >
          <FileText className="w-2.5 h-2.5 text-emerald-600" />
          <span>2do Abono</span>
          <ExternalLink className="w-2 h-2 opacity-60" />
        </a>
      )}
      {extraApprovedReceipts.map((p) => (
        <a
          key={p.id}
          href={p.comprobante_url}
          target="_blank"
          rel="noopener noreferrer"
          className="h-5 px-2 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[9px] font-mono font-semibold inline-flex items-center gap-1"
          title={`Ver comprobante de ${p.nombre || `Sesión #${p.numero_sesion}`}`}
        >
          <FileText className="w-2.5 h-2.5 text-emerald-600" />
          <span>{p.nombre ? p.nombre.slice(0, 8) : `Ext #${p.numero_sesion}`}</span>
          <ExternalLink className="w-2 h-2 opacity-60" />
        </a>
      ))}
    </div>
  );
}

