import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
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
  X,
  Film,
  ExternalLink,
  Share2,
  Monitor
} from "lucide-react";
import { toast } from "sonner";
import { getPublicCalendarioBySlug } from "@/services/calendarService";
import CalendarGridView, { formatTimeHHMM } from "@/components/calendar/CalendarGridView";

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
  const { slug } = useParams();
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

  useEffect(() => {
    async function loadPublicCalendar() {
      if (!slug) return;
      setLoading(true);
      setErrorMsg(null);
      const res = await getPublicCalendarioBySlug(slug);
      if (res.success && res.data) {
        setCalendario(res.data);
      } else {
        setErrorMsg(res.error || `No se encontró el calendario editorial en "/calendario/${slug}".`);
      }
      setLoading(false);
    }

    loadPublicCalendar();
  }, [slug]);

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
  const postsList = calendario.posts || [];
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
                {clientName} {clientEmpresa && `• ${clientEmpresa}`}
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
                {clientName} {clientEmpresa && `(${clientEmpresa})`}
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
              <span>Haz clic en cualquier post para ver los archivos multimedia y copiar el copy.</span>
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
                      className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-xl hover:border-pink-200 transition-all group"
                    >
                      {/* Media Container */}
                      <div className="bg-gray-950 min-h-[300px] md:min-h-[400px] max-h-[500px] flex items-center justify-center relative overflow-hidden">
                        {firstFile ? (
                          firstFile.tipo === "video" ? (
                            <div className="w-full h-full relative flex items-center justify-center bg-gray-950">
                              <video
                                src={firstFile.url}
                                controls
                                className="max-h-[480px] w-full object-contain"
                              />
                            </div>
                          ) : (
                            <img
                              src={firstFile.url}
                              alt="Post media"
                              className="max-h-[480px] w-full object-contain cursor-pointer"
                              onClick={() => {
                                setSelectedPost(post);
                                setActiveMediaIndex(0);
                              }}
                            />
                          )
                        ) : (
                          <div className="p-8 text-center text-gray-500">
                            <Film className="w-12 h-12 mx-auto mb-2 opacity-40" />
                            <p className="text-xs">Sin archivo multimedia</p>
                          </div>
                        )}

                        {/* Badges Overlay */}
                        <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 font-sora font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full backdrop-blur-md shadow-md ${
                              post.tipo_post === "reel"
                                ? "bg-pink-500 text-white"
                                : "bg-blue-600 text-white"
                            }`}
                          >
                            {post.tipo_post === "reel" ? (
                              <>
                                <VideoIcon className="w-3 h-3" /> Reel
                              </>
                            ) : (
                              <>
                                <Layers className="w-3 h-3" /> Carrusel ({post.archivos?.length || 0})
                              </>
                            )}
                          </span>

                          <span className="inline-flex items-center gap-1.5 text-xs font-sora font-bold text-white bg-black/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                            <CalendarIcon className="w-3.5 h-3.5 text-white" /> {post.fecha_programada} • {formatTimeHHMM(post.hora_programada)} hrs
                          </span>
                        </div>
                      </div>

                      {/* Content Info & Copywriting */}
                      <div className="p-6 md:p-8 space-y-6">
                        <div className="space-y-2">
                          <h4 className="text-xs font-sora font-bold uppercase text-gray-400 tracking-wider">
                            Copywriting del Post
                          </h4>
                          <p className="text-sm text-gray-800 font-medium whitespace-pre-wrap leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100">
                            {post.caption || <em className="text-gray-400 font-normal">Sin copy redactado.</em>}
                          </p>
                        </div>

                        {/* Copy Action Button */}
                        <div className="flex items-center justify-between gap-4 pt-2">
                          <button
                            onClick={() => copyCaption(post.caption, post.id)}
                            className="h-11 px-6 bg-pink-500 hover:bg-pink-600 text-white font-sora font-bold text-xs uppercase tracking-wider rounded-full shadow-md shadow-pink-200 inline-flex items-center gap-2 transition-all cursor-pointer"
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

                          {post.archivos && post.archivos.length > 1 && (
                            <button
                              onClick={() => {
                                setSelectedPost(post);
                                setActiveMediaIndex(0);
                              }}
                              className="h-11 px-5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-sora font-bold text-xs rounded-full inline-flex items-center gap-2 transition-all cursor-pointer"
                            >
                              Ver Galería Completa ({post.archivos.length})
                            </button>
                          )}
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] max-w-4xl w-full overflow-hidden shadow-2xl relative border border-gray-100 flex flex-col md:flex-row max-h-[90vh]">
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

                  {/* Carousel controls */}
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

                  {/* Indicators */}
                  {selectedPost.archivos.length > 1 && (
                    <div className="absolute bottom-3 flex items-center gap-1.5 bg-black/50 px-3 py-1 rounded-full backdrop-blur-md">
                      {selectedPost.archivos.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveMediaIndex(idx)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            idx === activeMediaIndex ? "bg-pink-500 w-4" : "bg-white/40"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-gray-400 text-center">
                  <Film className="w-12 h-12 mx-auto mb-2 opacity-40" />
                  <p className="text-xs">Sin media disponible</p>
                </div>
              )}
            </div>

            {/* Content Details Area */}
            <div className="md:w-2/5 p-6 flex flex-col justify-between bg-white space-y-6">
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
                    <CalendarIcon className="w-3.5 h-3.5 text-gray-500" /> {selectedPost.fecha_programada} • {formatTimeHHMM(selectedPost.hora_programada)} hrs
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
        </div>
      )}
    </div>
  );
}
