import {
  Calendar as CalendarIcon,
  Video as VideoIcon,
  Layers,
  Check,
  Copy
} from "lucide-react";
import MediaCarousel from "@/components/common/MediaCarousel";
import { formatTimeHHMM } from "./CalendarGridView";

/**
 * PublicCalendarFeedView
 * Sequential feed list view for public calendar pages.
 */
export default function PublicCalendarFeedView({
  postsList = [],
  clientName = "Cliente",
  copiedPostId,
  copyCaption
}) {
  return (
    <div className="max-w-3xl mx-auto space-y-8 font-inter">
      <div className="text-center space-y-1 mb-6">
        <span className="inline-block text-[10px] font-sora font-bold text-pink-600 bg-pink-50 border border-pink-200 px-3 py-1 rounded-full uppercase tracking-widest">
          VISTA FEED SECUENCIAL
        </span>
        <h2 className="text-2xl font-sora font-extrabold text-gray-900">
          Publicaciones Programadas ({postsList.length})
        </h2>
      </div>

      {postsList.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-[2rem] p-12 text-center text-gray-400 shadow-xl">
          <CalendarIcon className="w-12 h-12 text-pink-300 mx-auto mb-3" />
          <p className="font-sora font-bold text-gray-900 text-base">Sin publicaciones aún</p>
          <p className="text-xs text-gray-500 mt-1">
            Este calendario aún no contiene posts programados.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {postsList.map((post) => (
            <div
              key={post.id}
              className="bg-white border border-gray-100 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-xl hover:border-pink-200 transition-all group"
            >
              {/* Instagram Post Card Header */}
              <div className="px-5 py-3.5 flex items-center justify-between border-b border-gray-100 bg-white">
                <div className="min-w-0">
                  <h3 className="font-sora font-extrabold text-sm text-gray-900 leading-tight truncate">
                    {clientName}
                  </h3>
                  <p className="text-[11px] text-gray-500 font-medium">
                    {post.fecha_programada} • {formatTimeHHMM(post.hora_programada)}
                  </p>
                </div>

                <span
                  className={`inline-flex items-center gap-1 font-sora font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shrink-0 ${
                    post.tipo_post === "reel"
                      ? "bg-pink-50 text-pink-600 border border-pink-200"
                      : "bg-blue-50 text-[#188ff0] border border-blue-200"
                  }`}
                >
                  {post.tipo_post === "reel" ? (
                    <>
                      <VideoIcon className="w-3 h-3" /> Reel
                    </>
                  ) : (
                    <>
                      <Layers className="w-3 h-3" /> Carrusel
                    </>
                  )}
                </span>
              </div>

              {/* Media Carousel Container */}
              <MediaCarousel
                files={post.archivos}
                containerClassName="min-h-[280px] md:min-h-[400px] max-h-[500px]"
                imageClassName="max-h-[480px] w-full object-contain"
                showControls={true}
                showDots={true}
              />

              {/* Content Info & Copywriting */}
              <div className="p-5 md:p-6 space-y-4">
                <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-100">
                  <p className="text-sm text-gray-800 leading-relaxed font-normal whitespace-pre-wrap">
                    {post.caption || <em className="text-gray-400 font-normal">Sin copy redactado.</em>}
                  </p>
                </div>

                {/* Actions Row */}
                <div className="flex items-center justify-start pt-1">
                  <button
                    onClick={() => copyCaption(post.caption, post.id)}
                    className="h-10 px-5 bg-pink-500 hover:bg-pink-600 text-white font-sora font-bold text-xs uppercase tracking-wider rounded-full shadow-md shadow-pink-200 inline-flex items-center gap-2 transition-all cursor-pointer"
                  >
                    {copiedPostId === post.id ? (
                      <>
                        <Check className="w-4 h-4" /> Copy Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" /> Copiar Copywriting
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
