import { formatPrice } from "@/utils/formatters";

/**
 * ProposalLabPdfReport
 * Clinical lab-style printable PDF report container component (`print-only`).
 */
export default function ProposalLabPdfReport({
  clientData,
  currentPlanObj,
  selectedAddonList = [],
  pricingPlans = [],
  basePrice = 0,
  addonsPrice = 0,
  totalPrice = 0,
  contact = {}
}) {
  return (
    <div id="lab-result-pdf-report" className="print-only font-sans text-gray-800 bg-white p-6 max-w-4xl mx-auto">
      {/* ENCABEZADO DE LABORATORIO */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <img
            src={clientData.logoUrl || "/logo.png"}
            alt="The Formulab Logo"
            className="h-12 object-contain mb-1"
            onError={(e) => {
              const target = e.target;
              target.onerror = null;
              target.outerHTML = '<div class="font-black text-2xl tracking-tighter text-gray-900">the <span class="text-pink-500">formu</span>lab</div>';
            }}
          />
        </div>
        <div className="text-right text-[11px] text-gray-500 leading-tight space-y-0.5">
          <p>Hora de la propuesta: <span className="text-gray-800 font-semibold">{new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}</span></p>
          <p>Fecha de propuesta: <span className="text-gray-800 font-semibold">{new Date().toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit", year: "2-digit" })}</span></p>
          <p>Quien reporta: <span className="text-gray-800 font-semibold">{(contact.name || "The Formulab").toUpperCase()}</span></p>
          <p>Fecha del reporte: <span className="text-gray-800 font-semibold">{new Date().toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit", year: "numeric" })}</span></p>
          <p>Vigencia: <span className="text-gray-800 font-semibold">15 Días Naturales</span></p>
        </div>
      </div>

      {/* TÍTULO PRINCIPAL CON LÍNEA DOBLE */}
      <div className="border-b-2 border-gray-400 pb-1 mb-3">
        <h1 className="text-xl font-bold text-gray-700 tracking-tight text-center font-sora">
          Exámenes Laboratorio Clínico de Resultados y Diagnóstico
        </h1>
      </div>

      {/* METADATOS DEL CLIENTE / FICHA DE PACIENTE */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs text-gray-700 mb-4 pb-2 border-b border-gray-400">
        <div className="flex justify-between border-b border-gray-100 pb-1">
          <span className="text-gray-500 font-semibold">Paciente / Cliente:</span>
          <span className="font-bold text-gray-900 uppercase">{clientData.name}</span>
        </div>
        <div className="flex justify-between border-b border-gray-100 pb-1">
          <span className="text-gray-500 font-semibold">RUT / ID:</span>
          <span className="font-bold text-gray-900">2475317236</span>
        </div>

        <div className="flex justify-between border-b border-gray-100 pb-1">
          <span className="text-gray-500 font-semibold">Fecha de Solicitud:</span>
          <span className="font-bold text-gray-900">{new Date().toLocaleDateString("es-MX")}</span>
        </div>
        <div className="flex justify-between border-b border-gray-100 pb-1">
          <span className="text-gray-500 font-semibold">Dirección Creativa:</span>
          <span className="font-bold text-gray-900">{contact.name || "The Formulab"}</span>
        </div>

        <div className="flex justify-between pb-1">
          <span className="text-gray-500 font-semibold">Nº Historia / Folio:</span>
          <span className="font-bold text-gray-900">0036331</span>
        </div>
        <div className="flex justify-between pb-1">
          <span className="text-gray-500 font-semibold">Plan Solicitado:</span>
          <span className="font-bold text-gray-900 uppercase">Plan {currentPlanObj?.name || "SELECCIONADO"}</span>
        </div>
      </div>

      {/* TABLA DE RESULTADOS CLINICOS */}
      <table className="w-full text-xs border-collapse mb-3">
        <thead>
          <tr className="border-b-2 border-gray-400 text-gray-700 font-bold">
            <th className="py-1 text-left w-[45%]">Analito</th>
            <th className="py-1 text-center w-[30%]">Resultado</th>
            <th className="py-1 text-right w-[25%]">Valores de referencia</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-gray-800">
          {/* SECCIÓN 1: FÓRMULA Y BIOMETRÍA DE CONTENIDO */}
          <tr>
            <td colSpan={3} className="pt-3 pb-1 font-bold text-gray-900 uppercase text-[11px]">
              FÓRMULA Y BIOMETRÍA DE CONTENIDO BASE ({(currentPlanObj?.name || "BASE")?.toUpperCase()})
            </td>
          </tr>

          <tr>
            <td className="py-1 pl-3 font-semibold italic text-gray-700">REELS ORGÁNICOS (VERTICAL 9:16)</td>
            <td className="py-1 text-center font-bold text-gray-900">{currentPlanObj?.reels || 10}.00 x 10</td>
            <td className="py-1 text-right text-gray-500">5.00 - 12.00 Piezas</td>
          </tr>
          <tr>
            <td className="py-1 pl-3 font-semibold italic text-gray-700">CARRUSELES ESTRATÉGICOS</td>
            <td className="py-1 text-center font-bold text-gray-900">4.00 Piezas</td>
            <td className="py-1 text-right text-gray-500">4.00 Piezas / mes</td>
          </tr>
          <tr>
            <td className="py-1 pl-3 font-semibold italic text-gray-700">LEVANAMIENTO DE MUESTRA (VISITAS)</td>
            <td className="py-1 text-center font-bold text-gray-900">2.00 Visitas</td>
            <td className="py-1 text-right text-gray-500">2.00 Visitas / mes</td>
          </tr>
          <tr>
            <td className="py-1 pl-3 font-semibold italic text-gray-700">BANCO DE FOTOS Y CALENDARIOS</td>
            <td className="py-1 text-center font-bold text-gray-900">100.00 %</td>
            <td className="py-1 text-right text-gray-500">100.00 %</td>
          </tr>
          {currentPlanObj?.bonus && (
            <tr>
              <td className="py-1 pl-3 font-semibold italic text-gray-900">COLABORACIÓN FEED @PAUTHECREATIVE</td>
              <td className="py-1 text-center font-bold text-gray-900">1.00 Reel Incluido</td>
              <td className="py-1 text-right text-gray-700 font-semibold">Bonus Plan</td>
            </tr>
          )}

          <tr>
            <td colSpan={3} className="py-1 text-[10px] text-gray-500 italic">
              Tipo de muestra: Contenido Orgánico Vertical. Método: Levantamiento Presencial y Curaduría.
            </td>
          </tr>

          {/* SECCIÓN 2: MÓDULOS ADICIONALES */}
          <tr>
            <td colSpan={3} className="pt-3 pb-1 font-bold text-gray-900 uppercase text-[11px] border-t border-gray-300">
              MÓDULOS Y COMPLEMENTOS ADICIONALES
            </td>
          </tr>

          {selectedAddonList.length > 0 ? (
            selectedAddonList.map((addon, idx) => (
              <tr key={idx}>
                <td className="py-1 pl-3 font-semibold italic text-gray-700 uppercase">{addon.title}</td>
                <td className="py-1 text-center font-bold text-gray-900">+{formatPrice(addon.price)} MXN</td>
                <td className="py-1 text-right text-gray-500">Aplicado</td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="py-1 pl-3 font-semibold italic text-gray-500">COMPLEMENTOS EXTRA</td>
              <td className="py-1 text-center font-semibold text-gray-500">Sin adicionales</td>
              <td className="py-1 text-right text-gray-500">0.00 MXN</td>
            </tr>
          )}

          {/* SECCIÓN COMPARATIVA DE PLANES EN IMPRESIÓN/PDF */}
          <tr>
            <td colSpan={3} className="pt-3 pb-1 font-bold text-gray-900 uppercase text-[11px] border-t border-gray-300">
              ESTUDIO COMPARATIVO DE PLANES BASE
            </td>
          </tr>
          <tr>
            <td colSpan={3} className="py-2">
              <table className="w-full text-center text-[10px] border border-gray-300 border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-gray-800 font-bold border-b border-gray-300">
                    <th className="p-1.5 text-left w-[35%]">Plan</th>
                    <th className="p-1.5 w-[20%]">Reels / mes</th>
                    <th className="p-1.5 w-[20%]">Carruseles</th>
                    <th className="p-1.5 w-[25%] text-right pr-2 font-bold">Inversión Base</th>
                  </tr>
                </thead>
                <tbody>
                  {pricingPlans.map((plan) => (
                    <tr
                      key={plan.id}
                      className={`border-b border-gray-200 ${plan.id === currentPlanObj?.id ? "bg-pink-50 font-bold" : ""}`}
                    >
                      <td className="p-1.5 text-left font-semibold">
                        {plan.name} {plan.id === currentPlanObj?.id ? "✓ (SELECCIONADO)" : ""}
                      </td>
                      <td className="p-1.5">{plan.reels} Reels</td>
                      <td className="p-1.5">4 Carruseles</td>
                      <td className="p-1.5 text-right pr-2 text-gray-900 font-bold">{plan.priceLabel} MXN</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </td>
          </tr>

          {/* SECCIÓN 3: RESULTADOS Y SEROLOGÍA DE INVERSIÓN */}
          <tr>
            <td colSpan={3} className="pt-3 pb-1 font-bold text-gray-900 uppercase text-[11px] border-t border-gray-300">
              RESUMEN Y DICTAMEN DE RESULTADO FINANCIERO
            </td>
          </tr>

          <tr>
            <td className="py-1 pl-3 font-semibold italic text-gray-700">INVERSIÓN PLAN BASE ({(currentPlanObj?.name || "BASE")?.toUpperCase()})</td>
            <td className="py-1 text-center font-bold text-gray-900">{formatPrice(basePrice)} MXN</td>
            <td className="py-1 text-right text-gray-500">Tarifa Mensual</td>
          </tr>
          <tr>
            <td className="py-1 pl-3 font-semibold italic text-gray-700">INVERSIÓN COMPLEMENTOS ADICIONALES</td>
            <td className="py-1 text-center font-bold text-gray-900">{formatPrice(addonsPrice)} MXN</td>
            <td className="py-1 text-right text-gray-500">Módulos Extra</td>
          </tr>
          <tr className="border-t-2 border-b-2 border-gray-400 font-bold">
            <td className="py-2 pl-3 text-gray-900 font-black text-sm uppercase">INVERSIÓN ESTIMADA TOTAL RESULTADO</td>
            <td className="py-2 text-center text-sm font-black text-gray-900">{formatPrice(totalPrice)} MXN / mes</td>
            <td className="py-2 text-right text-sm font-black text-gray-900">Aprobado</td>
          </tr>
        </tbody>
      </table>

      {/* SECCIÓN DE FIRMAS */}
      <div className="mt-14 pt-4 flex justify-between items-end text-xs">
        <div className="text-center w-56">
          <div className="w-48 border-b border-gray-400 mx-auto mb-1" />
          <p className="font-bold text-gray-900">{contact.name || "The Formulab"}</p>
          <p className="text-[10px] text-gray-600 font-semibold">{contact.title || "Dirección de Estrategia"}</p>
          <p className="text-[9px] text-gray-400">Céd. Prof.: 3208142</p>
        </div>

        <div className="text-right text-[11px] text-gray-500">
          <p className="mb-8">CANCÚN, Q. ROO, {new Date().toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}</p>
          <div className="text-center w-56 inline-block">
            <div className="w-48 border-b border-gray-400 mx-auto mb-1" />
            <p className="font-bold text-gray-900">The Formulab Creative Labs</p>
            <p className="text-[10px] text-gray-600 font-semibold">Certificación de Diagnóstico</p>
          </div>
        </div>
      </div>

      {/* PIE DE PÁGINA FOOTER BANNER */}
      <div className="mt-8 pt-2 border-t border-gray-400 text-[8px] text-gray-500 text-center uppercase tracking-wider space-y-0.5 font-mono">
        <p>
          NOMBRE: THE FORMULAB S.A. DE C.V. DIRECCIÓN: CANCÚN, QUINTANA ROO ESTADO: QUINTANA ROO PAÍS: México E-MAIL: {contact.email || "hola@theformulab.io"} WEB: theformulab.io
        </p>
        <p>Página 1 de 1</p>
      </div>
    </div>
  );
}
