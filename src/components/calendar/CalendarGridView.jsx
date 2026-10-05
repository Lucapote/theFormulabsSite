import { useState } from "react";
import {
  Video as VideoIcon,
  Layers,
  Plus,
  Clock,
  Calendar as CalendarIcon,
  X,
  Copy,
  Check,
  Play,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Eye,
  Film,
  Edit2
} from "lucide-react";
import { toast } from "sonner";

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

// Helper to format time as HH:MM (ignoring seconds if present)
export function formatTimeHHMM(timeStr) {
  if (!timeStr) return "18:00";
  const parts = timeStr.toString().split(":");
  if (parts.length >= 2) {
    return `${parts[0]}:${parts[1]}`;
  }
  return timeStr;
}

export default function CalendarGridView({
  mes = new Date().getMonth() + 1,
  anio = new Date().getFullYear(),
  posts = [],
  readOnly = false,
  onDayClick,
  onPostClick
}) {
  const [selectedPost, setSelectedPost] = useState(null);
  const [copied, setCopied] = useState(false);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  // Month navigation or formatting helpers
  const monthIndex = Number(mes) - 1;
  const currentYear = Number(anio);

  // Days in month calculation (Monday-first)
  const firstDay = new Date(currentYear, monthIndex, 1);
  const daysInMonth = new Date(currentYear, monthIndex + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, monthIndex, 0).getDate();

  // (getDay() returns 0 for Sun, 1 for Mon... so Monday-first offset is (getDay() + 6) % 7)
  const startOffset = (firstDay.getDay() + 6) % 7;

  const todayStr = new Date().toISOString().split("T")[0];

  // Construct grid cells (35 or 42 slots)
  const gridCells = [];

  // Previous month padding
  for (let i = startOffset - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    gridCells.push({
      dayNumber: dayNum,
      dateString: "",
      isCurrentMonth: false
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const monthStr = String(monthIndex + 1).padStart(2, "0");
    const dayStr = String(d).padStart(2, "0");
    const dateString = `${currentYear}-${monthStr}-${dayStr}`;
    const isToday = dateString === todayStr;

    gridCells.push({
      dayNumber: d,
      dateString,
      isCurrentMonth: true,
      isToday
    });
  }

  // Next month padding to reach full rows (multiples of 7)
  const totalSlots = Math.ceil(gridCells.length / 7) * 7;
  const nextPadding = totalSlots - gridCells.length;
  for (let n = 1; n <= nextPadding; n++) {
    gridCells.push({
      dayNumber: n,
      dateString: "",
      isCurrentMonth: false
    });
  }

  // Copy caption handler
  const copyCaption = (text) => {
    if (!text) {
      toast.error("Esta publicación no tiene texto para copiar.");
      return;
    }
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copywriting copiado al portapapeles.");
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePostCardClick = (post, e) => {
    e.stopPropagation();
    setSelectedPost(post);
    setActiveMediaIndex(0);
  };

  return (
    <div className="space-y-4 font-inter">
      {/* HIGH-IMPACT CALENDAR GRID CONTAINER */}
      <div className="bg-white rounded-[2.5rem] p-4 sm:p-6 shadow-xl border border-gray-100 space-y-4">
        {/* Weekday Header Columns */}
        <div className="grid grid-cols-7 text-gray-900 font-sora text-xs font-black text-center mb-1">
          {WEEKDAYS.map((w, idx) => (
            <div key={idx} className="py-1 uppercase tracking-wider">
              {w}
            </div>
          ))}
        </div>

        {/* Calendar Grid Days */}
        <div className="grid grid-cols-7 gap-2">
          {gridCells.map((cell, idx) => {
            const dayPosts = cell.isCurrentMonth
              ? posts.filter((p) => p.fecha_programada === cell.dateString)
              : [];
            const hasPosts = dayPosts.length > 0;

            return (
              <div
                key={idx}
                onClick={() => {
                  if (!readOnly && cell.isCurrentMonth && onDayClick) {
                    onDayClick(cell.dateString);
                  }
                }}
                className={`min-h-[90px] sm:min-h-[110px] p-2.5 rounded-2xl transition-all flex flex-col justify-between relative group ${
                  !cell.isCurrentMonth
                    ? "bg-gray-100/50 text-gray-300 opacity-40 pointer-events-none"
                    : hasPosts
                    ? "bg-gradient-to-tr from-pink-500 to-pink-600 text-white shadow-md shadow-pink-500/25 border-2 border-pink-400 hover:scale-[1.02] cursor-pointer"
                    : "bg-sky-50/70 border border-sky-200/70 hover:bg-sky-100/80 text-sky-900 cursor-pointer"
                }`}
              >
                {/* Day Number Header */}
                <div className="flex items-center justify-between z-10">
                  <span
                    className={`font-sora text-xs font-black ${
                      cell.isToday
                        ? "w-6 h-6 rounded-full bg-white text-pink-600 flex items-center justify-center shadow-xs"
                        : hasPosts
                        ? "text-white"
                        : "text-sky-900"
                    }`}
                  >
                    {cell.dayNumber}
                  </span>

                  {/* Plus button on hover for admin edit mode */}
                  {!readOnly && cell.isCurrentMonth && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onDayClick) onDayClick(cell.dateString);
                      }}
                      className={`w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-2xs ${
                        hasPosts
                          ? "bg-white text-pink-600 hover:bg-pink-100"
                          : "bg-pink-500 text-white hover:bg-pink-600"
                      }`}
                      title="Programar post para este día"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Posts Cards inside Cell */}
                <div className="space-y-1 flex-1 overflow-y-auto max-h-[80px] mt-1 pr-0.5">
                  {dayPosts.map((post) => {
                    const firstFile = post.archivos && post.archivos.length > 0 ? post.archivos[0] : null;

                    return (
                      <div
                        key={post.id}
                        onClick={(e) => handlePostCardClick(post, e)}
                        className="p-1 rounded-xl text-left transition-all cursor-pointer flex items-center gap-1.5 bg-black/30 hover:bg-black/50 text-white backdrop-blur-xs border border-white/20 shadow-2xs"
                      >
                        {/* Thumbnail */}
                        <div className="w-5 h-5 rounded-lg overflow-hidden bg-gray-900 shrink-0 relative">
                          {firstFile ? (
                            firstFile.tipo === "video" ? (
                              <div className="w-full h-full relative bg-gray-950 flex items-center justify-center">
                                <video src={firstFile.url} muted className="w-full h-full object-cover" />
                                <Play className="w-2.5 h-2.5 text-white absolute fill-current" />
                              </div>
                            ) : (
                              <img src={firstFile.url} alt="Media" className="w-full h-full object-cover" />
                            )
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white">
                              {post.tipo_post === "reel" ? (
                                <VideoIcon className="w-2.5 h-2.5 text-white" />
                              ) : (
                                <Layers className="w-2.5 h-2.5 text-white" />
                              )}
                            </div>
                          )}
                        </div>

                        {/* Format & Time (HH:MM) */}
                        <div className="min-w-0 flex-1 leading-none">
                          <span className="font-sora font-extrabold text-[9px] truncate block text-white">
                            {post.tipo_post === "reel" ? "Reel" : "Carrusel"}
                          </span>
                          <span className="text-[8px] font-mono text-white/90 font-semibold">
                            {formatTimeHHMM(post.hora_programada)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* COLOR LEGEND BAR */}
        <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-center gap-3 font-sora text-xs font-extrabold">
          <div className="h-9 px-5 rounded-full bg-pink-500 text-white shadow-md shadow-pink-500/20 inline-flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
            <span>Días que se publica</span>
          </div>

          <div className="h-9 px-5 rounded-full bg-[#188ff0] text-white shadow-md shadow-blue-500/20 inline-flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-white/60" />
            <span>Días que no se publica</span>
          </div>
        </div>
      </div>

      {/* POST DETAIL / LIGHTBOX MODAL */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] max-w-3xl w-full overflow-hidden shadow-2xl relative border border-gray-100 flex flex-col md:flex-row max-h-[90vh]">
            {/* Media Area */}
            <div className="md:w-3/5 bg-gray-950 flex flex-col items-center justify-center relative p-4 min-h-[320px]">
              {selectedPost.archivos && selectedPost.archivos.length > 0 ? (
                <>
                  {selectedPost.archivos[activeMediaIndex]?.tipo === "video" ? (
                    <video
                      src={selectedPost.archivos[activeMediaIndex].url}
                      controls
                      autoPlay
                      className="max-h-[65vh] w-full object-contain rounded-xl"
                    />
                  ) : (
                    <img
                      src={selectedPost.archivos[activeMediaIndex]?.url}
                      alt="Media detail"
                      className="max-h-[65vh] w-full object-contain rounded-xl"
                    />
                  )}

                  {/* Carousel navigation controls */}
                  {selectedPost.archivos.length > 1 && (
                    <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 flex items-center justify-between pointer-events-none">
                      <button
                        onClick={() =>
                          setActiveMediaIndex((prev) =>
                            prev === 0 ? selectedPost.archivos.length - 1 : prev - 1
                          )
                        }
                        className="p-2 rounded-full bg-black/60 hover:bg-black text-white backdrop-blur-md pointer-events-auto cursor-pointer transition-all"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() =>
                          setActiveMediaIndex((prev) =>
                            prev === selectedPost.archivos.length - 1 ? 0 : prev + 1
                          )
                        }
                        className="p-2 rounded-full bg-black/60 hover:bg-black text-white backdrop-blur-md pointer-events-auto cursor-pointer transition-all"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  )}

                  {/* Carousel indicator dots */}
                  {selectedPost.archivos.length > 1 && (
                    <div className="absolute bottom-3 flex items-center gap-1.5 bg-black/50 px-3 py-1 rounded-full backdrop-blur-md">
                      {selectedPost.archivos.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveMediaIndex(idx)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            idx === activeMediaIndex ? "bg-white w-4" : "bg-white/40"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-gray-400 text-center">
                  <Film className="w-12 h-12 mx-auto mb-2 opacity-40" />
                  <p className="text-xs">Sin archivo multimedia</p>
                </div>
              )}
            </div>

            {/* Content Details Area */}
            <div className="md:w-2/5 p-6 flex flex-col justify-between bg-white space-y-6">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 font-sora font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        selectedPost.tipo_post === "reel"
                          ? "bg-pink-50 text-pink-600 border border-pink-200"
                          : "bg-blue-50 text-[#188ff0] border border-blue-200"
                      }`}
                    >
                      {selectedPost.tipo_post === "reel" ? (
                        <>
                          <VideoIcon className="w-3 h-3" /> Reel
                        </>
                      ) : (
                        <>
                          <Layers className="w-3 h-3" /> Carrusel ({selectedPost.archivos?.length || 0})
                        </>
                      )}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedPost(null)}
                    className="text-gray-400 hover:text-gray-700 font-bold p-1 rounded-full hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Schedule & Status */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="inline-flex items-center gap-1.5 text-xs font-sora font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded-full">
                    <CalendarIcon className="w-3.5 h-3.5 text-gray-500" />
                    {selectedPost.fecha_programada} • {formatTimeHHMM(selectedPost.hora_programada)} hrs
                  </span>

                  <span
                    className={`inline-flex items-center gap-1.5 font-sora font-bold text-[10px] px-2.5 py-1 rounded-full ${
                      selectedPost.estado === "publicado"
                        ? "bg-purple-100 text-purple-700"
                        : selectedPost.estado === "borrador"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        selectedPost.estado === "publicado"
                          ? "bg-purple-500"
                          : selectedPost.estado === "borrador"
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                      }`}
                    />
                    {selectedPost.estado === "publicado"
                      ? "Publicado"
                      : selectedPost.estado === "borrador"
                      ? "Borrador"
                      : "Programado"}
                  </span>
                </div>

                {/* Caption / Copy */}
                <div>
                  <h4 className="text-xs font-sora font-bold uppercase text-gray-400 mb-1.5">
                    Copywriting del Post
                  </h4>
                  <p className="text-sm text-gray-800 font-medium whitespace-pre-wrap leading-relaxed max-h-[220px] overflow-y-auto pr-1">
                    {selectedPost.caption || <em className="text-gray-400 font-normal">Sin copy en este post.</em>}
                  </p>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-gray-100 flex items-center gap-2">
                <button
                  onClick={() => copyCaption(selectedPost.caption)}
                  className="flex-1 h-11 bg-pink-500 hover:bg-pink-600 text-white font-sora font-bold text-xs uppercase tracking-wider rounded-full shadow-md shadow-pink-200 inline-flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" /> Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" /> Copiar Copy
                    </>
                  )}
                </button>

                {!readOnly && onPostClick && (
                  <button
                    onClick={() => {
                      const postToEdit = selectedPost;
                      setSelectedPost(null);
                      onPostClick(postToEdit);
                    }}
                    className="h-11 px-4 bg-gray-900 hover:bg-gray-800 text-white font-sora font-bold text-xs uppercase tracking-wider rounded-full transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                    title="Editar publicación"
                  >
                    <Edit2 className="w-4 h-4" /> Editar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
