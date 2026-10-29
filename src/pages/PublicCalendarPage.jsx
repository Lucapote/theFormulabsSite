import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getPublicCalendarioBySlug, formatCalendarUrlPath } from "@/services/calendarService";
import CalendarGridView from "@/components/calendar/CalendarGridView";
import InstagramPostPreviewModal from "@/components/common/InstagramPostPreviewModal";
import PublicCalendarHero from "@/components/calendar/PublicCalendarHero";
import PublicCalendarFeedView from "@/components/calendar/PublicCalendarFeedView";
import PublicCalendarHeader from "@/components/calendar/PublicCalendarHeader";
import { PublicCalendarLoading, PublicCalendarNotFound } from "@/components/calendar/PublicCalendarStates";

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

/**
 * PublicCalendarPage
 * Public-facing editorial calendar view for clients.
 * Decoupled under 200 lines per GEMINI.md Rule 4.B and Rule 5.
 */
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
    if (hasPrevPost) setSelectedPost(sortedPostsList[currentPostIndex - 1]);
  };

  const goToNextPost = (e) => {
    if (e) e.stopPropagation();
    if (hasNextPost) setSelectedPost(sortedPostsList[currentPostIndex + 1]);
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

  if (loading) return <PublicCalendarLoading />;
  if (errorMsg || !calendario) return <PublicCalendarNotFound errorMsg={errorMsg} />;

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

  const permiteDescargaFinal =
    calendario?.permite_descarga !== null && calendario?.permite_descarga !== undefined
      ? Boolean(calendario.permite_descarga)
      : Boolean(calendario?.cliente?.permite_descarga);

  const handlePostUpdated = (updatedPost) => {
    if (!updatedPost) return;
    setCalendario((prev) => {
      if (!prev) return prev;
      const updatedPosts = (prev.posts || []).map((p) =>
        p.id === updatedPost.id ? { ...p, ...updatedPost } : p
      );
      return { ...prev, posts: updatedPosts };
    });
    setSelectedPost((prev) => (prev?.id === updatedPost.id ? { ...prev, ...updatedPost } : prev));
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-inter pb-12 lg:pb-2 lg:h-screen lg:max-h-screen lg:overflow-hidden lg:flex lg:flex-col selection:bg-[#188ff0] selection:text-white">
      <PublicCalendarHeader
        clientName={clientName}
        viewMode={viewMode}
        onSelectViewMode={setViewMode}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-3 sm:pt-4 lg:pt-2 space-y-3 lg:space-y-2 flex-1 min-h-0 lg:flex lg:flex-col lg:overflow-hidden w-full">
        <PublicCalendarHero
          monthName={monthName}
          yearNum={yearNum}
          clientName={clientName}
          tipoContenido={tipoContenido}
          plataformas={plataformas}
          postsCount={postsList.length}
        />

        {viewMode === "grid" ? (
          <CalendarGridView
            mes={calendario.mes}
            anio={calendario.anio}
            posts={postsList}
            readOnly={true}
            permiteDescarga={permiteDescargaFinal}
            onPostUpdated={handlePostUpdated}
          />
        ) : (
          <PublicCalendarFeedView
            postsList={postsList}
            clientName={clientName}
            copiedPostId={copiedPostId}
            copyCaption={copyCaption}
          />
        )}
      </main>

      {selectedPost && (
        <InstagramPostPreviewModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          isInternal={false}
          hasPrevPost={hasPrevPost}
          hasNextPost={hasNextPost}
          onPrevPost={goToPrevPost}
          onNextPost={goToNextPost}
          permiteDescarga={permiteDescargaFinal}
          onPostUpdated={handlePostUpdated}
        />
      )}
    </div>
  );
}
