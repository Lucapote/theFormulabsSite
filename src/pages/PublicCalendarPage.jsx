import { useState, useEffect } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  ListFilter,
  Sparkles,
  AlertCircle,
  Building2
} from "lucide-react";
import { toast } from "sonner";
import { getPublicCalendarioBySlug, formatCalendarUrlPath } from "@/services/calendarService";
import CalendarGridView from "@/components/calendar/CalendarGridView";
import InstagramPostPreviewModal from "@/components/common/InstagramPostPreviewModal";
import PublicCalendarHero from "@/components/calendar/PublicCalendarHero";
import PublicCalendarFeedView from "@/components/calendar/PublicCalendarFeedView";

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export default function PublicCalendarPage() {
  const { slug, clientSlug, calendarSlug } = useParams();
  const activeSlug = slug || (clientSlug && calendarSlug ? `${clientSlug}-${calendarSlug}` : "");

  const [calendario, setCalendario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [selectedPost, setSelectedPost] = useState(null);
  const [copiedPostId, setCopiedPostId] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    async function loadPublicCalendar() {
      if (!activeSlug) return;
      setLoading(true);
      setErrorMsg(null);
      let res = await getPublicCalendarioBySlug(activeSlug);

      if (!res.success && calendarSlug) {
        res = await getPublicCalendarioBySlug(calendarSlug);
      }

      if (res.success && res.data) {
        setCalendario(res.data);

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
    }
  };

  const goToNextPost = (e) => {
    if (e) e.stopPropagation();
    if (hasNextPost) {
      setSelectedPost(sortedPostsList[currentPostIndex + 1]);
    }
  };

  const copyCaption = (text, postId = null) => {
    if (!text) {
      toast.error("Esta publicación no tiene texto redactado.");
      return;
    }
    navigator.clipboard.writeText(text);
    if (postId) {
      setCopiedPostId(postId);
      setTimeout(() => setCopiedPostId(null), 2000);
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

  const clientName =
    calendario.cliente?.nombre ||
    (calendario.slug
      ? calendario.slug.split("-")[0].charAt(0).toUpperCase() + calendario.slug.split("-")[0].slice(1)
      : "") ||
    "Cliente";
  const monthName = MONTH_NAMES[(calendario.mes || 1) - 1];
  const yearNum = calendario.anio || new Date().getFullYear();
  const tipoContenido = calendario.tipo_contenido || "Reels y Carruseles";
  const plataformas = calendario.plataformas || "Instagram y Facebook";

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-inter pb-20 selection:bg-[#188ff0] selection:text-white">
      {/* PUBLIC HEADER */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-xs py-2">
        <div className="max-w-7xl mx-auto px-5 md:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center shrink-0">
              <img src="/logo.png" alt="The Formulab" className="h-9 w-auto object-contain" />
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
        <PublicCalendarHero
          monthName={monthName}
          yearNum={yearNum}
          clientName={clientName}
          tipoContenido={tipoContenido}
          plataformas={plataformas}
          postsCount={postsList.length}
        />

        {/* VIEW 1: MONTHLY GRID */}
        {viewMode === "grid" ? (
          <CalendarGridView
            mes={calendario.mes}
            anio={calendario.anio}
            posts={postsList}
            readOnly={true}
            permiteDescarga={Boolean(calendario?.cliente?.permite_descarga)}
          />
        ) : (
          /* VIEW 2: FEED / SEQUENTIAL LIST VIEW */
          <PublicCalendarFeedView
            postsList={postsList}
            clientName={clientName}
            copiedPostId={copiedPostId}
            copyCaption={copyCaption}
          />
        )}
      </main>

      {/* FEED PREVIEW LIGHTBOX MODAL */}
      {selectedPost && (
        <InstagramPostPreviewModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          isInternal={false}
          hasPrevPost={hasPrevPost}
          hasNextPost={hasNextPost}
          onPrevPost={goToPrevPost}
          onNextPost={goToNextPost}
          permiteDescarga={Boolean(calendario?.cliente?.permite_descarga)}
        />
      )}
    </div>
  );
}
