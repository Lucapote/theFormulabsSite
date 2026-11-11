import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { getLocalDateString } from "@/utils/formatters";
import { getDayAgendaSummary, getWeekAgendaSummary } from "@/services/homeService";
import { updatePost, createPost } from "@/services/calendarService";
import HomeDateNavigator from "./HomeDateNavigator";
import HomeDayMetrics from "./HomeDayMetrics";
import HomeWeekStrip from "./HomeWeekStrip";
import HomePostsAgenda from "./HomePostsAgenda";
import HomeProductionsAgenda from "./HomeProductionsAgenda";
import PostModal from "@/components/dashboard/calendar/PostModal";
import ProductionDetailModal from "@/components/dashboard/operations/ProductionDetailModal";
import InstagramPostPreviewModal from "@/components/common/InstagramPostPreviewModal";

export default function HomeTabSection({ setActiveTab }) {
  const [selectedDate, setSelectedDate] = useState(getLocalDateString());
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [productions, setProductions] = useState([]);
  const [metrics, setMetrics] = useState({});

  const [isWeekOpen, setIsWeekOpen] = useState(false);
  const [weekData, setWeekData] = useState(null);

  const [editingPost, setEditingPost] = useState(null);
  const [previewPost, setPreviewPost] = useState(null);
  const [isSavingPost, setIsSavingPost] = useState(false);
  const [selectedProduction, setSelectedProduction] = useState(null);

  const loadDayAgenda = useCallback(async (dateStr) => {
    setLoading(true);
    const [dayRes, weekRes] = await Promise.all([
      getDayAgendaSummary(dateStr),
      getWeekAgendaSummary(dateStr)
    ]);

    if (dayRes.success && dayRes.data) {
      setPosts(dayRes.data.posts || []);
      setProductions(dayRes.data.productions || []);
      setMetrics(dayRes.data.metrics || {});
    } else {
      toast.error(dayRes.error || "No se pudo cargar la agenda del día.");
    }

    if (weekRes.success && weekRes.data) {
      setWeekData(weekRes.data);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadDayAgenda(selectedDate);
  }, [selectedDate, loadDayAgenda]);

  const handleSavePost = async (formData) => {
    setIsSavingPost(true);
    const targetId = formData.id || editingPost?.id;
    if (targetId) {
      const res = await updatePost(
        targetId,
        formData,
        formData.archivosAnteriores || editingPost?.archivos || []
      );
      if (res.success) {
        toast.success("Publicación actualizada con éxito.");
        setEditingPost(null);
        loadDayAgenda(selectedDate);
      } else {
        toast.error(res.error || "No se pudo actualizar el post.");
      }
    } else {
      const res = await createPost(formData);
      if (res.success) {
        toast.success("Publicación creada exitosamente.");
        setEditingPost(null);
        loadDayAgenda(selectedDate);
      } else {
        toast.error(res.error || "No se pudo crear la publicación.");
      }
    }
    setIsSavingPost(false);
  };

  return (
    <div className="space-y-6 font-inter pb-12">
      {/* 1. Date Navigator Toolbar */}
      <HomeDateNavigator
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        onRefresh={() => loadDayAgenda(selectedDate)}
        loading={loading}
      />

      {/* 2. Key Metrics Bar (including "En Esta Semana" toggle) */}
      <HomeDayMetrics
        metrics={metrics}
        weekData={weekData}
        isWeekOpen={isWeekOpen}
        onToggleWeek={() => setIsWeekOpen((prev) => !prev)}
      />

      {/* 3. Collapsible 7-Days Week Strip ("Pantallazo de lo que viene") */}
      {isWeekOpen && (
        <HomeWeekStrip
          weekData={weekData}
          selectedDate={selectedDate}
          onSelectDate={(newDate) => setSelectedDate(newDate)}
          onClose={() => setIsWeekOpen(false)}
        />
      )}

      {/* 4. Main Split Grid: Posts Agenda (left) & Productions Agenda (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 flex flex-col">
          <HomePostsAgenda
            posts={posts}
            onSelectPost={(post) => setEditingPost(post)}
            onPreviewPost={(post) => setPreviewPost(post)}
            onNavigateToCalendars={() => setActiveTab("calendars")}
          />
        </div>

        <div className="lg:col-span-5 flex flex-col">
          <HomeProductionsAgenda
            productions={productions}
            onSelectProduction={(prod) => setSelectedProduction(prod)}
            onNavigateToOperations={() => setActiveTab("operaciones")}
          />
        </div>
      </div>

      {/* Preview Modal */}
      {previewPost && (
        <InstagramPostPreviewModal
          post={previewPost}
          onClose={() => setPreviewPost(null)}
          onEdit={(post) => {
            setPreviewPost(null);
            setEditingPost(post);
          }}
          isInternal={true}
        />
      )}

      {/* Post Modal (View/Edit) */}
      {editingPost && (
        <PostModal
          isOpen={Boolean(editingPost)}
          onClose={() => setEditingPost(null)}
          onSave={handleSavePost}
          calendarioId={editingPost.calendario_id || editingPost.calendario?.id}
          initialData={editingPost}
          isSaving={isSavingPost}
        />
      )}

      {/* Production Detail Modal */}
      {selectedProduction && (
        <ProductionDetailModal
          isOpen={Boolean(selectedProduction)}
          onClose={() => setSelectedProduction(null)}
          produccion={selectedProduction}
          clienteNombre={selectedProduction.cliente?.nombre || selectedProduction.nombre_cliente}
          ciclo={selectedProduction.ciclo}
          onUpdated={() => {
            setSelectedProduction(null);
            loadDayAgenda(selectedDate);
          }}
          onDeleted={() => {
            setSelectedProduction(null);
            loadDayAgenda(selectedDate);
          }}
        />
      )}
    </div>
  );
}
