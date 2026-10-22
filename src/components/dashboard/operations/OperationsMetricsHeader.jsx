import { useMemo } from "react";
import { DollarSign, TrendingUp, Film, CalendarCheck } from "lucide-react";

/**
 * Encabezado de KPIs Operativos de Laboratorio
 * Diseñado con estética High-Tech Lab (bg-white, bordes quirúrgicos, tipografía Sora/Mono).
 */
export default function OperationsMetricsHeader({ ciclos = [] }) {
  const metrics = useMemo(() => {
    let facturacionTotal = 0;
    let facturacionCobrada = 0;
    let costosOperativos = 0;
    let totalSesiones = 0;
    let sesionesRealizadas = 0;
    let sesionesAgendadas = 0;
    let sesionesPendientes = 0;
    let calendariosVinculados = 0;

    ciclos.forEach((c) => {
      const cobrado = Number(c.monto_cobrado) || 0;
      const costo = Number(c.costo_operativo) || 0;
      facturacionTotal += cobrado;
      costosOperativos += costo;

      if (c.estado_pago === "pagado") {
        facturacionCobrada += cobrado;
      } else if (c.estado_pago === "primer_pago") {
        facturacionCobrada += Math.round(cobrado / 2);
      }

      if (c.calendario_id || c.calendario) {
        calendariosVinculados += 1;
      }

      const prods = Array.isArray(c.producciones) ? c.producciones : [];
      totalSesiones += prods.length;
      prods.forEach((p) => {
        if (["rodaje_completado", "en_edicion", "finalizada"].includes(p.estado)) {
          sesionesRealizadas += 1;
        } else if (["agendada", "pre_reservada", "fecha_propuesta"].includes(p.estado)) {
          sesionesAgendadas += 1;
        } else {
          sesionesPendientes += 1;
        }
      });
    });

    const margenNeto = facturacionCobrada - costosOperativos;
    const porcentajeCobrado = facturacionTotal > 0
      ? Math.round((facturacionCobrada / facturacionTotal) * 100)
      : 0;

    return {
      facturacionTotal,
      facturacionCobrada,
      costosOperativos,
      margenNeto,
      porcentajeCobrado,
      totalSesiones,
      sesionesRealizadas,
      sesionesAgendadas,
      sesionesPendientes,
      calendariosVinculados,
      totalCiclos: ciclos.length,
      calendariosPendientes: Math.max(0, ciclos.length - calendariosVinculados)
    };
  }, [ciclos]);

  const formatCurrency = (val) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0
    }).format(val);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
      {/* 1. Facturación del Mes */}
      <div className="bg-white border border-gray-100 shadow-xs rounded-xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-sora font-semibold text-gray-500 uppercase tracking-wider">
            Facturación Mensual
          </span>
          <div className="w-7 h-7 rounded-full bg-blue-50 text-brand-blue flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-sora font-bold text-gray-900 tracking-tight">
            {formatCurrency(metrics.facturacionTotal)}
          </div>
          <div className="mt-2.5">
            <div className="flex items-center justify-between text-xs text-gray-500 font-inter mb-1.5">
              <span>Cobrado: {formatCurrency(metrics.facturacionCobrada)}</span>
              <span className="font-sora font-semibold text-brand-blue">{metrics.porcentajeCobrado}%</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden flex">
              <div
                className={`h-full bg-gradient-to-r from-[#188ff0] to-emerald-500 rounded-full transition-all duration-500 ${
                  metrics.porcentajeCobrado >= 100
                    ? "w-full"
                    : metrics.porcentajeCobrado >= 75
                    ? "w-3/4"
                    : metrics.porcentajeCobrado >= 50
                    ? "w-1/2"
                    : metrics.porcentajeCobrado >= 25
                    ? "w-1/4"
                    : metrics.porcentajeCobrado > 0
                    ? "w-1/12"
                    : "w-0"
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Margen Neto Operativo */}
      <div className="bg-white border border-gray-100 shadow-xs rounded-xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-sora font-semibold text-gray-500 uppercase tracking-wider">
            Margen Neto Operativo
          </span>
          <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div
            className={`text-2xl font-sora font-bold tracking-tight ${
              metrics.margenNeto >= 0 ? "text-gray-900" : "text-rose-600"
            }`}
          >
            {formatCurrency(metrics.margenNeto)}
          </div>
          <div className="text-xs text-gray-500 mt-2 font-inter flex items-center justify-between">
            <span>Costos: {formatCurrency(metrics.costosOperativos)}</span>
            <span className="text-gray-400">Neto cobrado</span>
          </div>
        </div>
      </div>

      {/* 3. Control de Rodajes / Producciones */}
      <div className="bg-white border border-gray-100 shadow-xs rounded-xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-sora font-semibold text-gray-500 uppercase tracking-wider">
            Control de Rodajes
          </span>
          <div className="w-7 h-7 rounded-full bg-blue-50 text-brand-blue flex items-center justify-center">
            <Film className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-sora font-bold text-gray-900 tracking-tight">
            {metrics.totalSesiones} <span className="text-xs font-normal text-gray-500 font-inter">sesiones</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-sora font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
              {metrics.sesionesRealizadas} Realizadas
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-sora font-semibold bg-blue-50 text-brand-blue border border-blue-100">
              {metrics.sesionesAgendadas} Agendadas
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-sora font-semibold bg-gray-100 text-gray-600 border border-gray-200">
              {metrics.sesionesPendientes} Por agendar
            </span>
          </div>
        </div>
      </div>

      {/* 4. Estado Editorial */}
      <div className="bg-white border border-gray-100 shadow-xs rounded-xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-sora font-semibold text-gray-500 uppercase tracking-wider">
            Estado Editorial
          </span>
          <div className="w-7 h-7 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center">
            <CalendarCheck className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-sora font-bold text-gray-900 tracking-tight">
            {metrics.calendariosVinculados}{" "}
            <span className="text-xs font-normal text-gray-500 font-inter">
              / {metrics.totalCiclos} calendarios
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-2 font-inter flex items-center justify-between">
            <span className="text-pink-500 font-sora font-semibold text-[11px]">
              {metrics.calendariosPendientes > 0
                ? `${metrics.calendariosPendientes} pendientes`
                : "100% vinculados"}
            </span>
            <span className="text-gray-400">Total clientes: {metrics.totalCiclos}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
