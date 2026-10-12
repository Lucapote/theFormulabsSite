import { Layers, Film, Calendar, Clock } from "lucide-react";

/**
 * ParsedPostPreviewCard
 * Atomic card component displaying a post parsed from a Word (.docx) file.
 */
export default function ParsedPostPreviewCard({ post, index }) {
  return (
    <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-pink-200 transition-all space-y-2 font-inter">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs font-sora font-extrabold text-gray-400">
            #{index + 1}
          </span>

          {/* Format Badge */}
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
              post.tipo_post === "carrousel"
                ? "bg-blue-50 text-[#188ff0] border border-blue-100"
                : "bg-pink-50 text-pink-600 border border-pink-100"
            }`}
          >
            {post.tipo_post === "carrousel" ? (
              <Layers className="w-3 h-3" />
            ) : (
              <Film className="w-3 h-3" />
            )}
            {post.tipo_post === "carrousel" ? "Carrusel" : "Reel"}
          </span>

          {/* Status Badge */}
          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-md uppercase">
            Borrador
          </span>
        </div>

        {/* Date & Time Badge */}
        <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
          <Calendar className="w-3.5 h-3.5 text-gray-400" />
          <span>{post.fecha_programada || "Sin fecha asignada"}</span>
          {post.hora_programada && (
            <>
              <span className="text-gray-300">•</span>
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span>{post.hora_programada.substring(0, 5)}</span>
            </>
          )}
        </div>
      </div>

      {/* Caption Preview */}
      <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-700 font-normal leading-relaxed max-h-24 overflow-y-auto whitespace-pre-wrap">
        {post.caption ? (
          post.caption
        ) : (
          <span className="italic text-gray-400">
            (Sin texto de copywriting)
          </span>
        )}
      </div>
    </div>
  );
}
