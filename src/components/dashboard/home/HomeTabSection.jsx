import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { getLocalDateString } from "@/utils/formatters";
import { getDayAgendaSummary } from "@/services/homeService";
import { updatePost, createPost } from "@/services/calendarService";
import HomeDateNavigator from "./HomeDateNavigator";
import HomeDayMetrics from "./HomeDayMetrics";
import HomePostsAgenda from "./HomePostsAgenda";
import HomeProductionsAgenda from "./HomeProductionsAgenda";
import PostModal from "@/components/dashboard/calendar/PostModal";
import ProductionDetailModal from "@/components/dashboard/operations/ProductionDetailModal";

/**
 * HomeTabSection
 * Principal orchestrator view for the "Inicio" / Agenda Diaria Mission Control.
 */
export default function HomeTabSection({ setActiveTab }) {
  const [selectedDate, setSelectedDate] = useState(getLocalDateString());
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [productions, setProductions] = useState([]);
  const [metrics, setMetrics] = useState({});

  // Modals state
  const [editingPost, setEditingPost] = useState(null);
  const [isSavingPost, setIsSavingPost] = useState(false);
  const [selectedProduction, setSelectedProduction] = useState(null);

  // Load agenda data for the selected date
  const loadDayAgenda = useCallback(async (dateStr) => {
    setLoading(true);
    const res = await getDayAgendaSummary(dateStr);
    if (res.success && res.data) {
      setPosts(res.data.posts || []);
      setProductions(res.data.productions || []);
      setMetrics(res.data.metrics || {});
    } else {
      toast.error(res.error || "No se pudo cargar la agenda del día.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadDayAgenda(selectedDate);
  }, [selectedDate, loadDayAgenda]);

  // Handle saving post edits directly from Home agenda
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

      {/* 2. Key Metrics Bar */}
      <HomeDayMetrics
        metrics={metrics}
        posts={posts}
        productions={productions}
      />

      {/* 3. Main Split Grid: Posts Agenda (left) & Productions Agenda (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left column (7 cols): Publicaciones del día */}
        <div className="lg:col-span-7">
          <HomePostsAgenda
            posts={posts}
            onSelectPost={(post) => setEditingPost(post)}
            onNavigateToCalendars={() => setActiveTab("calendars")}
          />
        </div>

        {/* Right column (5 cols): Rodajes y logística del día */}
        <div className="lg:col-span-5">
          <HomeProductionsAgenda
            productions={productions}
            onSelectProduction={(prod) => setSelectedProduction(prod)}
            onNavigateToOperations={() => setActiveTab("operaciones")}
          />
        </div>
      </div>

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
