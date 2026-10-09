import { CheckCircle, Clock, Image as ImageIcon, Video as VideoIcon } from "lucide-react";

/**
 * MediaGalleryFilterBar
 * Filter toolbar for filtering media items by availability status and media type.
 */
export default function MediaGalleryFilterBar({
  statusFilter = "all",
  setStatusFilter,
  typeFilter = "all",
  setTypeFilter,
  totalCount = 0,
  disponiblesCount = 0,
  enUsoCount = 0
}) {
  return (
    <div className="bg-white rounded-[2rem] p-4 shadow-xl border border-gray-100 flex flex-wrap items-center justify-between gap-3 font-sora">
      {/* Status Pills */}
      <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-full border border-gray-200 overflow-x-auto max-w-full">
        <button
          type="button"
          onClick={() => setStatusFilter("all")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold cursor-pointer transition-all whitespace-nowrap ${
            statusFilter === "all"
              ? "bg-gray-900 text-white shadow-xs"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Todos ({totalCount})
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("disponibles")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold cursor-pointer transition-all flex items-center gap-1.5 whitespace-nowrap ${
            statusFilter === "disponibles" || statusFilter === "disponible"
              ? "bg-emerald-600 text-white shadow-xs"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <CheckCircle className="w-3.5 h-3.5" /> Disponibles ({disponiblesCount})
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("en_uso")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold cursor-pointer transition-all flex items-center gap-1.5 whitespace-nowrap ${
            statusFilter === "en_uso"
              ? "bg-purple-600 text-white shadow-xs"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Clock className="w-3.5 h-3.5" /> En uso ({enUsoCount})
        </button>
      </div>

      {/* Type Filters */}
      <div className="flex items-center bg-gray-100 p-1 rounded-full border border-gray-200 overflow-x-auto max-w-full">
        <button
          type="button"
          onClick={() => setTypeFilter("all")}
          className={`px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all whitespace-nowrap ${
            typeFilter === "all"
              ? "bg-[#188ff0] text-white shadow-xs"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Todos
        </button>
        <button
          type="button"
          onClick={() => setTypeFilter("image")}
          className={`px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all flex items-center gap-1 whitespace-nowrap ${
            typeFilter === "image"
              ? "bg-[#188ff0] text-white shadow-xs"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" /> Imágenes
        </button>
        <button
          type="button"
          onClick={() => setTypeFilter("video")}
          className={`px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all flex items-center gap-1 whitespace-nowrap ${
            typeFilter === "video"
              ? "bg-[#188ff0] text-white shadow-xs"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <VideoIcon className="w-3.5 h-3.5" /> Videos
        </button>
      </div>
    </div>
  );
}
