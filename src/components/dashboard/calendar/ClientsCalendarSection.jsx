import MediaGallery from "@/components/dashboard/gallery/MediaGallery";
import ScheduledPostsList from "./ScheduledPostsList";
import ClientListSidebar from "./ClientListSidebar";
import ClientCalendarsGrid from "./ClientCalendarsGrid";
import CreateClientModal from "./CreateClientModal";
import EditClientModal from "./EditClientModal";
import CreateCalendarModal from "./CreateCalendarModal";
import ActiveCalendarHeader from "./ActiveCalendarHeader";
import ConfirmDeleteModal from "@/components/common/ConfirmDeleteModal";
import ClientsCalendarHeaderCard from "./subcomponents/ClientsCalendarHeaderCard";
import { useClientsCalendarManager } from "@/hooks/useClientsCalendarManager";

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const TIPO_CONTENIDO_OPTIONS = [
  "Reels", "Carruseles", "Fotos / Estáticos", "Historias / Stories"
];

const PLATAFORMAS_OPTIONS = [
  "Instagram", "Facebook", "TikTok", "LinkedIn", "YouTube"
];

/**
 * ClientsCalendarSection
 * Contenedor orquestador modular para gestión de clientes y calendarios de contenido.
 * Desacoplado con hook useClientsCalendarManager y subcomponentes especializados.
 */
export default function ClientsCalendarSection({
  initialClienteId = null,
  initialCalendarId = null,
  onClearInitial = null
}) {
  const {
    clientes,
    loadingClientes,
    selectedCliente,
    setSelectedCliente,
    calendarios,
    loadingCalendarios,
    activeCalendar,
    setActiveCalendar,
    calendarSubTab,
    setCalendarSubTab,
    galleryRefreshKey,
    handlePostUpdated,
    showClientModal,
    setShowClientModal,
    showCalendarModal,
    setShowCalendarModal,
    clientForm,
    setClientForm,
    isSavingClient,
    editingClient,
    setEditingClient,
    calendarForm,
    setCalendarForm,
    isSavingCalendar,
    copiedSlug,
    deletingId,
    confirmModal,
    setConfirmModal,
    loadClientes,
    handleOpenClientModal,
    handleCloseClientModal,
    openNewCalendarModal,
    toggleTipoContenido,
    togglePlataforma,
    handleSaveClient,
    handleToggleDownloadPermission,
    handleSaveCalendar,
    handleCalendarNameChange,
    handleDeleteClient,
    handleDeleteCalendar,
    copyCalendarLink
  } = useClientsCalendarManager({
    initialClienteId,
    initialCalendarId,
    onClearInitial
  });

  if (activeCalendar) {
    return (
      <div className="space-y-6 font-inter">
        <ActiveCalendarHeader
          activeCalendar={activeCalendar}
          selectedCliente={selectedCliente}
          calendarSubTab={calendarSubTab}
          copiedSlug={copiedSlug}
          onBack={() => setActiveCalendar(null)}
          onCopyCalendarLink={copyCalendarLink}
          onSetSubTab={setCalendarSubTab}
          onToggleDownloadPermission={handleToggleDownloadPermission}
        />

        {calendarSubTab === "posts" ? (
          <ScheduledPostsList
            calendarioId={activeCalendar.id}
            calendarioNombre={activeCalendar.nombre}
            calendarioSlug={activeCalendar.slug}
            calendarioMes={activeCalendar.mes}
            calendarioAnio={activeCalendar.anio}
            tipoContenido={activeCalendar.tipo_contenido}
            plataformas={activeCalendar.plataformas}
            onPostUpdated={handlePostUpdated}
          />
        ) : (
          <div className="space-y-8">
            <MediaGallery
              refreshTrigger={galleryRefreshKey}
              calendarioId={activeCalendar.id}
              calendarioNombre={activeCalendar.nombre}
            />
            <ScheduledPostsList
              calendarioId={activeCalendar.id}
              calendarioNombre={activeCalendar.nombre}
              calendarioSlug={activeCalendar.slug}
              calendarioMes={activeCalendar.mes}
              calendarioAnio={activeCalendar.anio}
              tipoContenido={activeCalendar.tipo_contenido}
              plataformas={activeCalendar.plataformas}
              forceViewMode="list"
              hideViewModeSwitcher={true}
              showOnlyDrafts={true}
              onPostUpdated={handlePostUpdated}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8 font-inter">
      {/* Cabecera Modularizada */}
      <ClientsCalendarHeaderCard
        isLoading={loadingClientes || loadingCalendarios}
        selectedCliente={selectedCliente}
        onReload={() => loadClientes(selectedCliente?.id)}
        onNewClient={handleOpenClientModal}
        onNewCalendar={() => openNewCalendarModal()}
      />

      {/* Main Grid: Client Sidebar + Calendars Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <ClientListSidebar
          clientes={clientes}
          loadingClientes={loadingClientes}
          selectedCliente={selectedCliente}
          deletingId={deletingId}
          onSelectClient={setSelectedCliente}
          onOpenClientModal={handleOpenClientModal}
          onDeleteClient={handleDeleteClient}
          onEditClient={(c) => setEditingClient(c)}
        />

        <ClientCalendarsGrid
          selectedCliente={selectedCliente}
          calendarios={calendarios}
          loadingCalendarios={loadingCalendarios}
          copiedSlug={copiedSlug}
          onOpenCalendarModal={openNewCalendarModal}
          onDeleteCalendar={handleDeleteCalendar}
          onCopyCalendarLink={copyCalendarLink}
          onSelectActiveCalendar={setActiveCalendar}
          onToggleDownloadPermission={handleToggleDownloadPermission}
          onEditClient={(c) => setEditingClient(c)}
        />
      </div>

      {/* Modals */}
      <CreateClientModal
        isOpen={showClientModal}
        onClose={handleCloseClientModal}
        clientForm={clientForm}
        setClientForm={setClientForm}
        onSubmit={handleSaveClient}
        isSaving={isSavingClient}
      />

      <EditClientModal
        isOpen={Boolean(editingClient)}
        cliente={editingClient}
        clients={clientes}
        onClose={() => setEditingClient(null)}
        onClientUpdated={async (updatedCliente) => {
          await loadClientes(updatedCliente.id);
          if (selectedCliente?.id === updatedCliente.id) {
            setSelectedCliente(updatedCliente);
          }
        }}
      />

      <CreateCalendarModal
        isOpen={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        selectedCliente={selectedCliente}
        calendarForm={calendarForm}
        setCalendarForm={setCalendarForm}
        onSubmit={handleSaveCalendar}
        isSaving={isSavingCalendar}
        onNameChange={handleCalendarNameChange}
        toggleTipoContenido={toggleTipoContenido}
        togglePlataforma={togglePlataforma}
        monthNames={MONTH_NAMES}
        tipoOptions={TIPO_CONTENIDO_OPTIONS}
        plataformaOptions={PLATAFORMAS_OPTIONS}
      />

      <ConfirmDeleteModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        isProcessing={confirmModal.isProcessing}
        onClose={() =>
          setConfirmModal({
            isOpen: false,
            title: "",
            message: "",
            confirmText: "Eliminar",
            onConfirm: null,
            isProcessing: false
          })
        }
        onConfirm={() => confirmModal.onConfirm && confirmModal.onConfirm()}
      />
    </div>
  );
}
