import { useState, useEffect, useRef } from "react";
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
  ChevronUp,
  ChevronDown,
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
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);
  const carouselRef = useRef(null);

  const scrollToSlide = (idx) => {
    setActiveMediaIndex(idx);
    if (carouselRef.current) {
      const slideWidth = carouselRef.current.clientWidth;
      carouselRef.current.scrollTo({
        left: idx * slideWidth,
        behavior: "smooth"
      });
    }
  };

  const handleCarouselScroll = () => {
    if (!carouselRef.current) return;
    const slideWidth = carouselRef.current.clientWidth;
    if (slideWidth > 0) {
      const idx = Math.round(carouselRef.current.scrollLeft / slideWidth);
      if (idx >= 0 && idx < (selectedPost?.archivos?.length || 0)) {
        setActiveMediaIndex(idx);
      }
    }
  };

  useEffect(() => {
    if (selectedPost) {
      setIsCaptionExpanded(false);
      if (carouselRef.current) {
        carouselRef.current.scrollLeft = 0;
      }
    }
  }, [selectedPost]);

  // Post Navigation State (Instagram style navigation between posts)
  const sortedPosts = [...posts].sort((a, b) => {
    const dateA = `${a.fecha_programada || ''} ${a.hora_programada || ''}`;
    const dateB = `${b.fecha_programada || ''} ${b.hora_programada || ''}`;
    return dateA.localeCompare(dateB);
  });

  const currentPostIndex = selectedPost
    ? sortedPosts.findIndex((p) => p.id === selectedPost.id)
    : -1;
  const hasPrevPost = currentPostIndex > 0;
  const hasNextPost = currentPostIndex !== -1 && currentPostIndex < sortedPosts.length - 1;

  const goToPrevPost = (e) => {
    if (e) e.stopPropagation();
    if (hasPrevPost) {
      setSelectedPost(sortedPosts[currentPostIndex - 1]);
      setActiveMediaIndex(0);
    }
  };

  const goToNextPost = (e) => {
    if (e) e.stopPropagation();
    if (hasNextPost) {
      setSelectedPost(sortedPosts[currentPostIndex + 1]);
      setActiveMediaIndex(0);
    }
  };

  const touchStartPos = useRef({ x: 0, y: 0 });

  const handleModalTouchStart = (e) => {
    touchStartPos.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleModalTouchEnd = (e) => {
    if (!touchStartPos.current) return;
    const deltaX = e.changedTouches[0].clientX - touchStartPos.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStartPos.current.y;

    // Detect vertical swipe gesture (distance >= 55px and predominantly vertical)
    if (Math.abs(deltaY) > 55 && Math.abs(deltaY) > Math.abs(deltaX) * 1.3) {
      if (deltaY < 0 && hasNextPost) {
        goToNextPost();
      } else if (deltaY > 0 && hasPrevPost) {
        goToPrevPost();
      }
    }
  };

  const drawerTouchStartPos = useRef({ y: 0 });

  const handleDrawerTouchStart = (e) => {
    drawerTouchStartPos.current = { y: e.touches[0].clientY };
  };

  const handleDrawerTouchEnd = (e) => {
    if (!drawerTouchStartPos.current) return;
    const deltaY = e.changedTouches[0].clientY - drawerTouchStartPos.current.y;
    if (deltaY > 35) {
      setIsCaptionExpanded(false);
    }
  };

  useEffect(() => {
    if (!selectedPost) return;

    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        if (hasPrevPost) {
          setSelectedPost(sortedPosts[currentPostIndex - 1]);
          setActiveMediaIndex(0);
        }
      } else if (e.key === "ArrowRight") {
        if (hasNextPost) {
          setSelectedPost(sortedPosts[currentPostIndex + 1]);
          setActiveMediaIndex(0);
        }
      } else if (e.key === "Escape") {
        setSelectedPost(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPost, currentPostIndex, hasPrevPost, hasNextPost, sortedPosts]);

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
    if (e && typeof e.stopPropagation === "function") {
      e.stopPropagation();
    }
    setSelectedPost(post);
    setActiveMediaIndex(0);
    if (onPostClick) {
      onPostClick(post);
    }
  };

  // Mobile selected day state
  const [selectedMobileDate, setSelectedMobileDate] = useState(todayStr);

  return (
    <div className="space-y-4 font-inter">
      {/* DESKTOP CALENDAR GRID CONTAINER (hidden md:block) */}
      <div className="hidden md:block bg-white rounded-[2.5rem] p-4 sm:p-6 shadow-xl border border-gray-100 space-y-4">
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
                onClick={(e) => {
                  if (hasPosts && dayPosts.length > 0) {
                    handlePostCardClick(dayPosts[0], e);
                  } else if (!readOnly && cell.isCurrentMonth && onDayClick) {
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
                                {firstFile.thumbnail_url ? (
                                  <img
                                    src={firstFile.thumbnail_url}
                                    alt="Video thumbnail"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <video
                                    src={firstFile.url}
                                    muted
                                    preload="metadata"
                                    playsInline
                                    className="w-full h-full object-cover"
                                  />
                                )}
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

      {/* MOBILE NATIVE-STYLE CALENDAR (block md:hidden) */}
      <div className="block md:hidden space-y-4">
        {/* MOBILE SELECTED DAY AGENDA DRAWER (Rendered FIRST on top) */}
        {selectedMobileDate && (
          <div className="bg-white rounded-[2rem] p-5 shadow-xl border border-gray-100 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-sora font-bold text-pink-500 uppercase tracking-widest block">
                  PUBLICACIONES DEL DÍA
                </span>
                <h4 className="font-sora font-extrabold text-gray-900 text-base">
                  {selectedMobileDate}
                </h4>
              </div>

              {!readOnly && (
                <button
                  type="button"
                  onClick={() => {
                    if (onDayClick) onDayClick(selectedMobileDate);
                  }}
                  className="h-8 px-3.5 bg-pink-50 hover:bg-pink-100 text-pink-600 rounded-full font-sora font-bold text-xs inline-flex items-center gap-1 cursor-pointer border border-pink-200"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Programar</span>
                </button>
              )}
            </div>

            {/* Selected Day Posts List */}
            {(() => {
              const activeDayPosts = posts.filter((p) => p.fecha_programada === selectedMobileDate);

              if (activeDayPosts.length === 0) {
                return (
                  <div className="p-6 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <CalendarIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs font-sora font-bold text-gray-700">
                      Sin publicaciones para este día
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5 mb-3">
                      No hay nada programado aún para esta fecha.
                    </p>
                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() => {
                          if (onDayClick) onDayClick(selectedMobileDate);
                        }}
                        className="h-9 px-4 bg-pink-500 hover:bg-pink-600 text-white font-sora font-bold text-xs rounded-full shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Programar Post
                      </button>
                    )}
                  </div>
                );
              }

              return (
                <div className="space-y-2.5">
                  {activeDayPosts.map((post) => {
                    const firstFile = post.archivos && post.archivos.length > 0 ? post.archivos[0] : null;

                    return (
                      <div
                        key={post.id}
                        onClick={(e) => handlePostCardClick(post, e)}
                        className="p-3 bg-gray-50 hover:bg-blue-50/40 rounded-2xl border border-gray-100 hover:border-blue-200 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {/* Thumbnail */}
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-900 shrink-0 relative border border-gray-200">
                            {firstFile ? (
                              firstFile.tipo === "video" ? (
                                <div className="w-full h-full relative bg-gray-950 flex items-center justify-center">
                                  {firstFile.thumbnail_url ? (
                                    <img
                                      src={firstFile.thumbnail_url}
                                      alt="Video thumbnail"
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <video
                                      src={firstFile.url}
                                      muted
                                      preload="metadata"
                                      playsInline
                                      className="w-full h-full object-cover"
                                    />
                                  )}
                                  <Play className="w-3 h-3 text-white absolute fill-current" />
                                </div>
                              ) : (
                                <img src={firstFile.url} alt="Media" className="w-full h-full object-cover" />
                              )
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white">
                                {post.tipo_post === "reel" ? (
                                  <VideoIcon className="w-4 h-4 text-pink-400" />
                                ) : (
                                  <Layers className="w-4 h-4 text-[#188ff0]" />
                                )}
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span
                                className={`text-[9px] font-sora font-extrabold uppercase px-2 py-0.5 rounded-full ${
                                  post.tipo_post === "reel"
                                    ? "bg-pink-100 text-pink-600"
                                    : "bg-blue-100 text-[#188ff0]"
                                }`}
                              >
                                {post.tipo_post === "reel" ? "Reel" : "Carrusel"}
                              </span>
                              <span className="text-[10px] font-mono text-gray-500 font-semibold flex items-center gap-1">
                                <Clock className="w-3 h-3 text-gray-400" />
                                {formatTimeHHMM(post.hora_programada)}
                              </span>
                            </div>
                            <p className="text-xs font-sora font-bold text-gray-900 truncate">
                              {post.caption || "Sin caption asignado"}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onPostClick) onPostClick(post);
                          }}
                          className="p-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors shrink-0"
                          title="Editar publicación"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* MOBILE COMPACT CALENDAR GRID (Rendered SECOND below agenda) */}
        <div className="bg-white rounded-[2rem] p-4 shadow-xl border border-gray-100 space-y-3">
          {/* Weekday Header */}
          <div className="grid grid-cols-7 text-gray-500 font-sora text-[11px] font-extrabold text-center">
            {WEEKDAYS.map((w, idx) => (
              <div key={idx} className="py-1">
                {w}
              </div>
            ))}
          </div>

          {/* Compact Mobile Grid Days */}
          <div className="grid grid-cols-7 gap-1">
            {gridCells.map((cell, idx) => {
              const dayPosts = cell.isCurrentMonth
                ? posts.filter((p) => p.fecha_programada === cell.dateString)
                : [];
              const hasPosts = dayPosts.length > 0;
              const isSelected = cell.isCurrentMonth && cell.dateString === selectedMobileDate;

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={!cell.isCurrentMonth}
                  onClick={(e) => {
                    if (cell.isCurrentMonth) {
                      setSelectedMobileDate(cell.dateString);
                      if (hasPosts && dayPosts.length > 0) {
                        handlePostCardClick(dayPosts[0], e);
                      }
                    }
                  }}
                  className={`h-11 rounded-2xl flex flex-col items-center justify-center relative transition-all cursor-pointer ${
                    !cell.isCurrentMonth
                      ? "text-gray-300 opacity-20 cursor-default"
                      : isSelected
                      ? "bg-[#188ff0] text-white font-sora font-extrabold shadow-md scale-105 z-10"
                      : cell.isToday
                      ? "bg-pink-100 text-pink-700 font-sora font-extrabold border border-pink-300"
                      : hasPosts
                      ? "bg-pink-500 text-white font-sora font-extrabold shadow-xs"
                      : "bg-sky-50/60 text-sky-900 font-sora font-bold hover:bg-sky-100"
                  }`}
                >
                  <span className="text-xs leading-none">{cell.dayNumber}</span>

                  {/* Indicator Dot for Days with Posts if not selected or highlighted */}
                  {hasPosts && !isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white mt-1 shadow-xs" />
                  )}
                  {hasPosts && isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white mt-1" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Mobile Color Legend Bar */}
          <div className="pt-2 border-t border-gray-100 flex items-center justify-around font-sora text-[10px] font-bold text-gray-600">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
              <span>Con publicaciones</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#188ff0]" />
              <span>Seleccionado</span>
            </div>
          </div>
        </div>
      </div>

      {/* POST DETAIL / LIGHTBOX MODAL */}
      {selectedPost && (
        <div
          onClick={() => setSelectedPost(null)}
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-[100] flex items-center justify-center p-3 sm:p-4 font-inter animate-in fade-in duration-200 overflow-y-auto"
        >
          {/* Post-to-Post Instagram Navigation Arrows (Desktop only to prevent mobile overlap) */}
          {hasPrevPost && (
            <button
              onClick={goToPrevPost}
              className="hidden md:flex fixed left-3 md:left-6 top-1/2 -translate-y-1/2 z-[120] w-12 h-12 rounded-full bg-black/60 hover:bg-black text-white backdrop-blur-md items-center justify-center transition-all cursor-pointer border border-white/20 shadow-2xl group hover:scale-110"
              title="Publicación anterior (Flecha izquierda ←)"
            >
              <ChevronLeft className="w-7 h-7 group-hover:-translate-x-0.5 transition-transform text-white" />
            </button>
          )}

          {hasNextPost && (
            <button
              onClick={goToNextPost}
              className="hidden md:flex fixed right-3 md:right-6 top-1/2 -translate-y-1/2 z-[120] w-12 h-12 rounded-full bg-black/60 hover:bg-black text-white backdrop-blur-md items-center justify-center transition-all cursor-pointer border border-white/20 shadow-2xl group hover:scale-110"
              title="Siguiente publicación (Flecha derecha →)"
            >
              <ChevronRight className="w-7 h-7 group-hover:translate-x-0.5 transition-transform text-white" />
            </button>
          )}

          <div
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleModalTouchStart}
            onTouchEnd={handleModalTouchEnd}
            className="bg-white rounded-[2rem] max-w-2xl w-full h-[90vh] md:h-auto my-auto overflow-hidden shadow-2xl relative border border-gray-100 flex flex-col md:flex-row md:max-h-[88dvh]"
          >
            {/* Top Floating Close Button for Mobile & Desktop */}
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-3 right-3 z-30 w-9 h-9 rounded-full bg-black/60 hover:bg-black text-white backdrop-blur-md flex items-center justify-center transition-all cursor-pointer shadow-lg"
              title="Cerrar (Esc)"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Media Area - Horizontal Touch Swipe Snap Carousel */}
            <div className="flex-1 md:w-3/5 bg-gray-950 flex flex-col items-center justify-center relative w-full h-full min-h-0 overflow-hidden">
              {selectedPost.archivos && selectedPost.archivos.length > 0 ? (
                <>
                  <div
                    ref={carouselRef}
                    onScroll={handleCarouselScroll}
                    className="w-full h-full flex overflow-x-auto snap-x snap-mandatory scroll-smooth touch-pan-x"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                  >
                    {selectedPost.archivos.map((file, idx) => (
                      <div
                        key={file.id || idx}
                        className="w-full h-full flex-none snap-center flex items-center justify-center relative p-3 sm:p-4"
                      >
                        {file.tipo === "video" ? (
                          <video
                            src={file.url}
                            controls
                            autoPlay={idx === activeMediaIndex}
                            preload="metadata"
                            playsInline
                            poster={file.thumbnail_url || undefined}
                            className="max-h-full md:max-h-[65vh] w-full h-full object-contain rounded-xl"
                          />
                        ) : (
                          <img
                            src={file.url}
                            alt={`Media ${idx + 1}`}
                            loading="eager"
                            className="max-h-full md:max-h-[65vh] w-full h-full object-contain rounded-xl select-none"
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Desktop Carousel navigation controls */}
                  {selectedPost.archivos.length > 1 && (
                    <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center justify-between pointer-events-none z-10">
                      <button
                        onClick={() =>
                          scrollToSlide(
                            activeMediaIndex === 0
                              ? selectedPost.archivos.length - 1
                              : activeMediaIndex - 1
                          )
                        }
                        className="p-2 rounded-full bg-black/60 hover:bg-black text-white backdrop-blur-md pointer-events-auto cursor-pointer transition-all shadow-md"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() =>
                          scrollToSlide(
                            activeMediaIndex === selectedPost.archivos.length - 1
                              ? 0
                              : activeMediaIndex + 1
                          )
                        }
                        className="p-2 rounded-full bg-black/60 hover:bg-black text-white backdrop-blur-md pointer-events-auto cursor-pointer transition-all shadow-md"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  )}

                  {/* Carousel indicator dots */}
                  {selectedPost.archivos.length > 1 && (
                    <div className="absolute bottom-3 z-10 flex items-center gap-1.5 bg-black/50 px-3 py-1 rounded-full backdrop-blur-md">
                      {selectedPost.archivos.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => scrollToSlide(idx)}
                          className={`h-2 rounded-full transition-all cursor-pointer ${
                            idx === activeMediaIndex ? "bg-white w-4" : "bg-white/40 w-2"
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

            {/* Mobile Instagram-Style Teaser Card (Visible only on mobile md:hidden) */}
            <div
              onClick={() => setIsCaptionExpanded(true)}
              className="md:hidden p-4 bg-gray-900 text-white border-t border-gray-800 cursor-pointer flex flex-col gap-1.5 transition-all hover:bg-black shrink-0"
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-sora font-extrabold px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/30 uppercase">
                  {selectedPost.tipo_post === "reel" ? "Reel" : `Carrusel (${selectedPost.archivos?.length || 0})`}
                </span>
                <span className="text-[10px] font-mono text-gray-400 font-semibold">
                  {selectedPost.fecha_programada} • {formatTimeHHMM(selectedPost.hora_programada)}
                </span>
              </div>

              <p className="text-xs text-gray-200 line-clamp-2 font-medium leading-relaxed">
                {selectedPost.caption || <em className="text-gray-500 font-normal">Sin copy en esta publicación.</em>}
              </p>
            </div>

            {/* Content Details Area - Desktop view (hidden on mobile md:flex) */}
            <div className="hidden md:flex md:w-2/5 p-6 flex-col justify-between bg-white space-y-6">
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
                    {selectedPost.fecha_programada} • {formatTimeHHMM(selectedPost.hora_programada)}
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

          {/* Instagram-style Expandable Caption Bottom Sheet (Mobile) */}
          {isCaptionExpanded && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                setIsCaptionExpanded(false);
              }}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[150] flex flex-col justify-end animate-in fade-in duration-200 md:hidden"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                onTouchStart={handleDrawerTouchStart}
                onTouchEnd={handleDrawerTouchEnd}
                className="bg-gray-900 text-white rounded-t-[2.5rem] p-6 space-y-4 max-h-[78vh] flex flex-col border-t border-gray-800 shadow-2xl animate-in slide-in-from-bottom duration-300 relative"
              >
                {/* Header / Drag Handle (Clicking handle closes drawer) */}
                <div
                  onClick={() => setIsCaptionExpanded(false)}
                  className="flex flex-col items-center cursor-pointer shrink-0 space-y-2 pb-2 border-b border-gray-800"
                >
                  <div className="w-12 h-1.5 bg-gray-600 hover:bg-gray-400 rounded-full mx-auto" />
                  <span className="text-[11px] font-mono text-gray-400 px-3 py-0.5 rounded-full bg-gray-800 font-semibold">
                    {selectedPost.fecha_programada} • {formatTimeHHMM(selectedPost.hora_programada)}
                  </span>
                </div>

                <div className="overflow-y-auto flex-1 pr-1 space-y-3">
                  <p className="text-sm text-gray-100 font-normal whitespace-pre-wrap leading-relaxed">
                    {selectedPost.caption || <em className="text-gray-500 font-normal">Sin copy redactado.</em>}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-800 flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => copyCaption(selectedPost.caption)}
                    className="flex-1 h-11 bg-pink-500 hover:bg-pink-600 text-white font-sora font-bold text-xs uppercase tracking-wider rounded-full inline-flex items-center justify-center gap-2 shadow-md shadow-pink-500/20"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copy Copiado" : "Copiar Copywriting"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
