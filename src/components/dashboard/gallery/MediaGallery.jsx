import { useState, useRef } from "react";
import {
  RefreshCw,
  Loader2,
  Film,
  ArrowLeft
} from "lucide-react";
import { useUpload } from "@/context/UploadContext";
import MediaDetailModal from "@/components/common/MediaDetailModal";
import PostModal from "@/components/dashboard/calendar/PostModal";
import GalleryItemCard from "./GalleryItemCard";
import MediaGalleryUploader from "./MediaGalleryUploader";
import MediaGalleryFilterBar from "./MediaGalleryFilterBar";
import MediaGalleryEmptyState from "./MediaGalleryEmptyState";
import FloatingBatchToolbar from "@/components/dashboard/calendar/FloatingBatchToolbar";
import ConfirmDeleteModal from "@/components/common/ConfirmDeleteModal";
import { useMediaGalleryManager } from "@/hooks/useMediaGalleryManager";

/**
 * MediaGallery
 * Orchestrator component for viewing, uploading, filtering, and managing gallery media.
 */
export default function MediaGallery({
  calendarioId,
  calendarioNombre = "Calendario",
  onBack,
  refreshTrigger = 0
}) {
  const {
    archivos,
    posts,
    loading,
    fetchGallery,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    filteredArchivos,
    enUsoCount,
    disponiblesCount,
    isMediaInUse,
    isSelectMode,
    selectedFileIds,
    setSelectedFileIds,
    handleCardLongPress,
    handleCardClick,
    handleSelectAll,
    previewMedia,
    setPreviewMedia,
    deletingMedia,
    setDeletingMedia,
    isDeleting,
    handleConfirmDelete,
    showBatchDeleteConfirm,
    setShowBatchDeleteConfirm,
    handleConfirmBatchDelete,
    editingPost,
    setEditingPost,
    isSavingPost,
    handleSavePostFromGallery,
    handleAssignPost,
    handleAddToExistingPost
  } = useMediaGalleryManager(calendarioId, refreshTrigger);

  // Global Upload Context
  const { startUpload, uploadState } = useUpload();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const isUploading = uploadState.isUploading && uploadState.calendarId === calendarioId;
  const uploadProgress = {
    current: uploadState.current,
    total: uploadState.total,
    phase: uploadState.phase,
    compressPercent: uploadState.compressPercent,
    uploadPercent: uploadState.uploadPercent,
    currentFileName: uploadState.currentFileName
  };

  const handleUploadFiles = (filesList) => {
    startUpload(calendarioId, calendarioNombre, filesList, fetchGallery);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUploadFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-6 font-inter relative pb-12">
      {/* INTEGRATED HEADER BAR */}
      <div className="bg-white rounded-[2rem] p-5 sm:p-6 shadow-xl border border-gray-100 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all cursor-pointer shrink-0 active:scale-95"
              title="Volver a los calendarios"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <div className="inline-flex items-center gap-2 text-brand-magenta font-bold tracking-widest uppercase text-xs mb-1 font-sora">
              <Film className="w-4 h-4 text-brand-blue" />
              <span>BANCO DE MEDIOS Y GALERÍA</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-sora font-extrabold text-gray-900 tracking-tight">
              {calendarioNombre}
            </h2>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchGallery}
          className="p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all cursor-pointer shrink-0 active:scale-95"
          title="Actualizar banco de medios"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-brand-magenta" : ""}`} />
        </button>
      </div>

      {/* 2-COLUMN MAIN CONTENT (1/3 Upload, 2/3 Gallery Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <MediaGalleryUploader
          isDragging={isDragging}
          fileInputRef={fileInputRef}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onUploadFiles={handleUploadFiles}
        />

        <div className="lg:col-span-8 space-y-4">
          <MediaGalleryFilterBar
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            totalCount={archivos.length}
            disponiblesCount={disponiblesCount}
            enUsoCount={enUsoCount}
          />

          {loading ? (
            <div className="bg-white rounded-[2rem] p-12 text-center shadow-xl border border-gray-100">
              <Loader2 className="w-8 h-8 text-brand-magenta animate-spin mx-auto mb-3" />
              <p className="text-sm font-sora font-bold text-gray-700">Cargando banco de medios...</p>
            </div>
          ) : filteredArchivos.length === 0 ? (
            <MediaGalleryEmptyState
              archivosCount={archivos.length}
              statusFilter={statusFilter}
              typeFilter={typeFilter}
              onResetFilters={() => {
                setStatusFilter("all");
                setTypeFilter("all");
              }}
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
              {filteredArchivos.map((item) => (
                <GalleryItemCard
                  key={item.id}
                  item={item}
                  isSelectMode={isSelectMode}
                  isSelected={selectedFileIds.includes(item.id)}
                  isInUse={isMediaInUse(item)}
                  onLongPress={handleCardLongPress}
                  onClickItem={handleCardClick}
                  onSingleDelete={(media) => setDeletingMedia(media)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <FloatingBatchToolbar
        selectedCount={selectedFileIds.length}
        isAllSelected={selectedFileIds.length > 0 && selectedFileIds.length === filteredArchivos.length}
        onSelectAll={() => handleSelectAll(filteredArchivos)}
        onCancelSelection={() => setSelectedFileIds([])}
        onOpenDeleteConfirm={() => setShowBatchDeleteConfirm(true)}
      />

      {/* LIGHTBOX PREVIEW MODAL */}
      {previewMedia && (
        <MediaDetailModal
          media={previewMedia}
          posts={posts}
          onClose={() => setPreviewMedia(null)}
          onDelete={(media) => setDeletingMedia(media)}
          showDelete={true}
          onEditPost={(p) => setEditingPost(p)}
          onAssignPost={handleAssignPost}
          onAddToExistingPost={handleAddToExistingPost}
        />
      )}

      {/* EDIT POST MODAL */}
      {editingPost && (
        <PostModal
          isOpen={Boolean(editingPost)}
          onClose={() => setEditingPost(null)}
          onSave={handleSavePostFromGallery}
          calendarioId={calendarioId}
          initialData={editingPost}
          isSaving={isSavingPost}
        />
      )}

      {/* SINGLE DELETE CONFIRMATION MODAL */}
      <ConfirmDeleteModal
        isOpen={Boolean(deletingMedia)}
        title="¿Eliminar archivo?"
        message={`¿Estás seguro de que deseas eliminar "${deletingMedia?.nombre_archivo || 'este archivo'}" de la galería? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        isProcessing={isDeleting}
        onClose={() => setDeletingMedia(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* BATCH DELETE CONFIRMATION MODAL */}
      <ConfirmDeleteModal
        isOpen={showBatchDeleteConfirm}
        title={`¿Eliminar ${selectedFileIds.length} archivo(s)?`}
        message={`Esta acción eliminará de forma permanente los ${selectedFileIds.length} archivos seleccionados de la galería y de Cloudflare R2.`}
        confirmText="Confirmar Borrado"
        isProcessing={isDeleting}
        onClose={() => setShowBatchDeleteConfirm(false)}
        onConfirm={handleConfirmBatchDelete}
      />
    </div>
  );
}
