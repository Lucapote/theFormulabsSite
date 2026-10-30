import {
  Calendar as CalendarIcon,
  Building2,
  Video as VideoIcon,
  Smartphone,
  BarChart2
} from "lucide-react";

/**
 * PublicCalendarHero
 * Hero banner component for public calendar pages.
 * En pantallas Laptop y Desktop (>= 1024px) adopta un formato horizontal compacto
 * para permitir que el calendario completo entre en el viewport sin scroll.
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
    <div className="bg-gradient-to-r from-sky-500 via-blue-600 to-[#188ff0] text-white rounded-[2rem] lg:rounded-2xl p-4 sm:p-6 lg:py-2.5 lg:px-6 shadow-lg border border-sky-400/30 relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-3 lg:gap-4 font-inter shrink-0">
      <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4 relative z-10 min-w-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/25">
            <CalendarIcon className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-lg font-black font-sora tracking-tight text-white leading-tight truncate">
            {monthName} {yearNum}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pt-0.5 lg:pt-0">
          <span className="hidden sm:inline-flex items-center gap-1 font-sora font-bold text-[11px] text-white bg-white/20 backdrop-blur-md border border-white/30 px-2.5 py-0.5 rounded-full shadow-2xs">
            <VideoIcon className="w-3 h-3 text-white shrink-0" />
            <span>{tipoContenido}</span>
          </span>

          <span className="hidden md:inline-flex items-center gap-1 font-sora font-bold text-[11px] text-white bg-white/20 backdrop-blur-md border border-white/30 px-2.5 py-0.5 rounded-full shadow-2xs">
            <Smartphone className="w-3 h-3 text-white shrink-0" />
            <span>{plataformas}</span>
          </span>

          <span className="inline-flex items-center gap-1 font-sora font-medium text-[11px] text-white bg-black/20 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/20">
            <BarChart2 className="w-3 h-3 text-white shrink-0" />
            <span>{postsCount} posts</span>
          </span>
        </div>
      </div>

      <div className="hidden lg:flex items-center shrink-0 relative z-10">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-sora font-semibold text-white bg-white/15 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full shadow-2xs">
          <span>Haz click en cualquier post para previsualizar</span>
        </span>
      </div>
    </div>
  );
}
