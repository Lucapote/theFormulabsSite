import {
  Calendar as CalendarIcon,
  Building2,
  Video as VideoIcon,
  Smartphone,
  BarChart2,
  Sparkles
} from "lucide-react";

/**
 * PublicCalendarHero
 * Hero banner component for public calendar pages.
 */
export default function PublicCalendarHero({
  monthName,
  yearNum,
  clientName,
  tipoContenido,
  plataformas,
  postsCount = 0
}) {
  return (
    <div className="bg-gradient-to-r from-sky-500 via-blue-600 to-[#188ff0] text-white rounded-[2.5rem] p-6 md:p-8 shadow-xl border border-sky-400/30 relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6 font-inter">
      <div className="space-y-3 relative z-10">
        <div className="inline-flex items-center gap-2 text-sky-100 font-bold tracking-widest uppercase text-xs font-sora">
          <CalendarIcon className="w-4 h-4 text-white" />
          <span>CALENDARIO DE CONTENIDOS</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-black font-sora tracking-tight text-white leading-tight">
          {monthName} {yearNum}
        </h1>

        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <span className="inline-flex items-center gap-1.5 font-sora font-bold text-xs text-white bg-white/20 backdrop-blur-md border border-white/30 px-3.5 py-1 rounded-full shadow-xs">
            <Building2 className="w-3.5 h-3.5 text-white shrink-0" />
            {clientName}
          </span>

          <span className="inline-flex items-center gap-1.5 font-sora font-bold text-xs text-white bg-white/20 backdrop-blur-md border border-white/30 px-3.5 py-1 rounded-full shadow-xs">
            <VideoIcon className="w-3.5 h-3.5 text-white shrink-0" />
            {tipoContenido}
          </span>

          <span className="inline-flex items-center gap-1.5 font-sora font-bold text-xs text-white bg-white/20 backdrop-blur-md border border-white/30 px-3.5 py-1 rounded-full shadow-xs">
            <Smartphone className="w-3.5 h-3.5 text-white shrink-0" />
            {plataformas}
          </span>

          <span className="inline-flex items-center gap-1.5 font-sora font-medium text-xs text-white bg-black/20 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/20">
            <BarChart2 className="w-3.5 h-3.5 text-white shrink-0" />
            {postsCount} publicaciones
          </span>
        </div>
      </div>

      <div className="self-start lg:self-center shrink-0 relative z-10">
        <span className="inline-flex items-start gap-2 text-xs font-sora font-medium text-white bg-white/15 backdrop-blur-md border border-white/20 px-4 py-3 rounded-2xl max-w-xs leading-relaxed shadow-sm">
          <Sparkles className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
          <span>Haz click en cualquier post para ver como se vería.</span>
        </span>
      </div>
    </div>
  );
}
