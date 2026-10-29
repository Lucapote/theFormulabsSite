import { LayoutGrid, ListFilter, Building2 } from "lucide-react";

/**
 * PublicCalendarHeader
 * Top navigation bar for the public calendar with brand logo, client indicator, and view switcher.
 */
export default function PublicCalendarHeader({ clientName, viewMode, onSelectViewMode }) {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-xs py-1.5 shrink-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 h-12 sm:h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a href="/" className="flex items-center shrink-0">
            <img src="/logo.png" alt="The Formulab" className="h-8 sm:h-9 w-auto object-contain" />
          </a>
          <div className="h-5 w-px bg-gray-200 hidden sm:block" />
          <div className="hidden sm:flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-xs font-sora font-bold text-brand-blue">
              <Building2 className="w-3.5 h-3.5 text-brand-blue" />
              {clientName}
            </span>
          </div>
        </div>

        {/* View Switcher Pills */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-100 p-1 rounded-full border border-gray-200">
            <button
              type="button"
              onClick={() => onSelectViewMode("grid")}
              className={`h-8 px-3.5 rounded-full font-sora text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === "grid"
                  ? "bg-gray-900 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cuadrícula</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectViewMode("feed")}
              className={`h-8 px-3.5 rounded-full font-sora text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === "feed"
                  ? "bg-gray-900 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Feed / Lista</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

