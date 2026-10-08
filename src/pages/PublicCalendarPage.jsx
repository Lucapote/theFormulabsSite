import { useState, useEffect, useRef } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import {
  Calendar as CalendarIcon,
  LayoutGrid,
  ListFilter,
  Sparkles,
  AlertCircle,
  Video as VideoIcon,
  Layers,
  Clock,
  Check,
  Copy,
  Play,
  Building2,
  Smartphone,
  BarChart2,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  X,
  Film,
  ExternalLink,
  Share2,
  Monitor
} from "lucide-react";
import { toast } from "sonner";
import { getPublicCalendarioBySlug, generateSlug } from "@/services/calendarService";
import CalendarGridView, { formatTimeHHMM } from "@/components/calendar/CalendarGridView";
import MediaCarousel from "@/components/common/MediaCarousel";

const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre"
];

export default function PublicCalendarPage() {
  const { slug, clientSlug, calendarSlug } = useParams();
  const activeSlug = slug || (clientSlug && calendarSlug ? `${clientSlug}-${calendarSlug}` : "");

  const [calendario, setCalendario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  // View state: 'grid' (Cuadrícula) or 'feed' (Feed / Lista)
  const [viewMode, setViewMode] = useState("grid");

  // Selected post for Lightbox preview modal
  const [selectedPost, setSelectedPost] = useState(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [copiedPostId, setCopiedPostId] = useState(null);
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

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    async function loadPublicCalendar() {
      if (!activeSlug) return;
      setLoading(true);
      setErrorMsg(null);
      let res = await getPublicCalendarioBySlug(activeSlug);

      // Fallback if clientSlug/calendarSlug was accessed directly as calendarSlug
      if (!res.success && calendarSlug) {
        res = await getPublicCalendarioBySlug(calendarSlug);
      }

      if (res.success && res.data) {
        setCalendario(res.data);

        // If accessed via legacy /calendario/... URL, redirect cleanly to /clientSlug/calendarSlug
        if (location.pathname.startsWith("/calendario/")) {
          const clientName = res.data.cliente?.nombre || "";
          const targetPath = formatCalendarUrlPath(res.data.slug || activeSlug, clientName);
          if (targetPath && targetPath !== location.pathname) {
            navigate(targetPath, { replace: true });
          }
        }
      } else {
        setErrorMsg(res.error || "No se encontró el calendario editorial solicitado.");
      }
      setLoading(false);
    }

    loadPublicCalendar();
  }, [activeSlug, calendarSlug, location.pathname, navigate]);

  // Post Navigation State (Instagram style navigation between posts)
  const postsList = calendario?.posts || [];
  const sortedPostsList = [...postsList].sort((a, b) => {
    const dateA = `${a.fecha_programada || ''} ${a.hora_programada || ''}`;
    const dateB = `${b.fecha_programada || ''} ${b.hora_programada || ''}`;
    return dateA.localeCompare(dateB);
  });

  const currentPostIndex = selectedPost
    ? sortedPostsList.findIndex((p) => p.id === selectedPost.id)
    : -1;
  const hasPrevPost = currentPostIndex > 0;
  const hasNextPost = currentPostIndex !== -1 && currentPostIndex < sortedPostsList.length - 1;

  const goToPrevPost = (e) => {
    if (e) e.stopPropagation();
    if (hasPrevPost) {
      setSelectedPost(sortedPostsList[currentPostIndex - 1]);
      setActiveMediaIndex(0);
    }
  };

  const goToNextPost = (e) => {
    if (e) e.stopPropagation();
    if (hasNextPost) {
      setSelectedPost(sortedPostsList[currentPostIndex + 1]);
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
          setSelectedPost(sortedPostsList[currentPostIndex - 1]);
          setActiveMediaIndex(0);
        }
      } else if (e.key === "ArrowRight") {
        if (hasNextPost) {
          setSelectedPost(sortedPostsList[currentPostIndex + 1]);
          setActiveMediaIndex(0);
        }
      } else if (e.key === "Escape") {
        setSelectedPost(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPost, currentPostIndex, hasPrevPost, hasNextPost, sortedPostsList]);

  const copyCaption = (text, postId = null) => {
    if (!text) {
      toast.error("Esta publicación no tiene texto redactado.");
      return;
    }
    navigator.clipboard.writeText(text);
    if (postId) {
      setCopiedPostId(postId);
      setTimeout(() => setCopiedPostId(null), 2000);
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    toast.success("Copywriting copiado al portapapeles.");
  };

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col justify-center items-center p-6 font-inter">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto shadow-sm">
            <Sparkles className="w-8 h-8 text-brand-blue animate-spin" />
          </div>
          <h2 className="font-sora text-xl font-bold tracking-tight text-gray-900">
            Cargando Calendario de Contenidos...
          </h2>
          <p className="text-xs text-gray-500">Obteniendo publicaciones y plan editorial.</p>
        </div>
      </div>
    );
  }

  // Not Found State
  if (errorMsg || !calendario) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col items-center justify-center p-6 font-inter">
        <div className="max-w-md w-full bg-white border border-gray-100 rounded-[2.5rem] p-8 text-center space-y-6 shadow-xl">
          <div className="w-16 h-16 rounded-full bg-red-50 border border-red-100 text-red-500 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-sora font-extrabold text-gray-900">Calendario No Encontrado</h1>
            <p className="text-xs text-gray-500 leading-relaxed">{errorMsg}</p>
          </div>

          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 h-11 px-6 rounded-full bg-[#188ff0] hover:bg-blue-600 text-white text-xs font-sora font-bold uppercase tracking-wider transition-all shadow-md shadow-blue-200"
            >
              Ir al Inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const clientName = calendario.cliente?.nombre || "Cliente";
  const clientEmpresa = calendario.cliente?.empresa || "";
  const monthName = MONTH_NAMES[(calendario.mes || 1) - 1];
  const yearNum = calendario.anio || new Date().getFullYear();
  const tipoContenido = calendario.tipo_contenido || "Reels y Carruseles";
  const plataformas = calendario.plataformas || "Instagram y Facebook";

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-inter pb-20 selection:bg-[#188ff0] selection:text-white">
      {/* PUBLIC HEADER - Matching Dashboard Navbar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-xs py-2">
        <div className="max-w-7xl mx-auto px-5 md:px-8 h-14 flex items-center justify-between">
          {/* Official Agency Logo */}
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center shrink-0">
              <img src="/logo.png" alt="The Formulab" className="h-9 w-auto object-contain" />
            </a>

            <div className="h-5 w-px bg-gray-200 hidden sm:block" />

            {/* Client Badge */}
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
                onClick={() => setViewMode("grid")}
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
                onClick={() => setViewMode("feed")}
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

      {/* MAIN CONTENT CONTAINER */}
      <main className="max-w-7xl mx-auto px-5 md:px-8 pt-8 space-y-6">
        {/* HERO CARD - BRAND CELESTE BLUE GRADIENT */}
        <div className="bg-gradient-to-r from-sky-500 via-blue-600 to-[#188ff0] text-white rounded-[2.5rem] p-6 md:p-8 shadow-xl border border-sky-400/30 relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 relative z-10">
            <div className="inline-flex items-center gap-2 text-sky-100 font-bold tracking-widest uppercase text-xs font-sora">
              <CalendarIcon className="w-4 h-4 text-white" />
              <span>CALENDARIO DE CONTENIDOS</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black font-sora tracking-tight text-white leading-tight">
              {monthName} {yearNum}
            </h1>

            {/* Consolidated Badges & Metadata (NO OS EMOJIS, USE LUCIDE ICONS) */}
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
                {postsList.length} publicaciones
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

        {/* VIEW 1: MONTHLY GRID (CUADRÍCULA) */}
        {viewMode === "grid" ? (
          <CalendarGridView
            mes={calendario.mes}
            anio={calendario.anio}
            posts={postsList}
            readOnly={true}
          />
        ) : (
          /* VIEW 2: FEED / SEQUENTIAL LIST VIEW */
          <div className="max-w-3xl mx-auto space-y-8">
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
                {postsList.map((post) => {
                  const firstFile = post.archivos && post.archivos.length > 0 ? post.archivos[0] : null;

                  return (
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
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* FEED PREVIEW LIGHTBOX MODAL */}
      {selectedPost && (
        <div
          onClick={() => setSelectedPost(null)}
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 overflow-y-auto"
        >
          {/* Post-to-Post Instagram Navigation Arrows (Desktop only) */}
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
            className="bg-white rounded-[2.5rem] max-w-4xl w-full h-[90vh] md:h-auto my-auto overflow-hidden shadow-2xl relative border border-gray-100 flex flex-col md:flex-row md:max-h-[90vh]"
          >
            {/* Top Floating Close Button for Mobile & Desktop */}
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-3 right-3 z-30 w-9 h-9 rounded-full bg-black/60 hover:bg-black text-white backdrop-blur-md flex items-center justify-center transition-all cursor-pointer shadow-lg"
              title="Cerrar (Esc)"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Media Area - Reusable Media Carousel */}
            <div className="flex-1 md:w-3/5 bg-gray-950 flex flex-col items-center justify-center relative w-full h-full min-h-0 overflow-hidden">
              <MediaCarousel
                files={selectedPost.archivos}
                initialIndex={activeMediaIndex}
                onIndexChange={setActiveMediaIndex}
                containerClassName="w-full h-full min-h-0"
                imageClassName="max-h-full md:max-h-[65vh] w-full h-full object-contain rounded-xl select-none"
                showControls={true}
                showDots={true}
                activeDotColorClass="bg-pink-500 w-5"
              />
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
                  <span
                    className={`inline-flex items-center gap-1 font-sora font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                      selectedPost.tipo_post === "reel"
                        ? "bg-pink-50 text-pink-600 border border-pink-200"
                        : "bg-blue-50 text-[#188ff0] border border-blue-200"
                    }`}
                  >
                    {selectedPost.tipo_post === "reel" ? "Reel" : `Carrusel (${selectedPost.archivos?.length || 0})`}
                  </span>

                  <button
                    onClick={() => setSelectedPost(null)}
                    className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 font-bold"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mb-4">
                  <span className="inline-flex items-center gap-1.5 text-xs font-sora font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded-full">
                    <CalendarIcon className="w-3.5 h-3.5 text-gray-500" /> {selectedPost.fecha_programada} • {formatTimeHHMM(selectedPost.hora_programada)}
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-sora font-bold uppercase text-gray-400">
                    Copywriting
                  </h4>
                  <p className="text-sm text-gray-800 font-medium whitespace-pre-wrap leading-relaxed max-h-[240px] overflow-y-auto pr-1">
                    {selectedPost.caption || <em className="text-gray-400 font-normal">Sin copy en esta publicación.</em>}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <button
                  onClick={() => copyCaption(selectedPost.caption)}
                  className="w-full h-11 bg-pink-500 hover:bg-pink-600 text-white font-sora font-bold text-xs uppercase tracking-wider rounded-full shadow-md shadow-pink-200 inline-flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {copied ? (
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
