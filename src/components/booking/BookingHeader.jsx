/**
 * BookingHeader
 * Top navigation bar for the production booking portal with company logo.
 * Altura compacta en mobile (h-12) para maximizar espacio vertical útil.
 */
export default function BookingHeader() {
  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40 shadow-2xs">
      <div className="max-w-xl lg:max-w-5xl 2xl:max-w-6xl mx-auto px-4 sm:px-6 h-12 sm:h-16 flex items-center justify-between">
        <a href="/" className="inline-flex items-center">
          <img src="/logo.png" alt="The Formulab" className="h-7 sm:h-9 w-auto object-contain" />
        </a>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-xs font-sora font-semibold bg-blue-50 text-brand-blue border border-blue-100">
          <span>Auto-Reserva de Producción</span>
        </span>
      </div>
    </header>
  );
}
