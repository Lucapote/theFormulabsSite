import { useEffect, useRef } from "react";

// Pila global en memoria para registrar callbacks de cierre de modales activos (LIFO)
const modalStack = [];
let isPopstateListenerActive = false;
let isProgrammaticBack = false;

function handlePopState() {
  // Si el popstate fue originado por nuestra propia limpieza (history.back programático), ignorarlo
  if (isProgrammaticBack) {
    isProgrammaticBack = false;
    return;
  }

  // Si hay al menos un modal abierto en la pila, cerrar el más reciente (LIFO)
  if (modalStack.length > 0) {
    const topEntry = modalStack.pop();
    if (topEntry) {
      topEntry.isPoppedByUser = true;
      if (typeof topEntry.close === "function") {
        topEntry.close();
      }
    }
  }
}

function ensurePopstateListener() {
  if (!isPopstateListenerActive && typeof window !== "undefined") {
    window.addEventListener("popstate", handlePopState);
    isPopstateListenerActive = true;
  }
}

/**
 * useModalHistoryBack
 * Intercepta el botón Atrás (físico, virtual o gestual en móviles Android/iOS)
 * para cerrar modales en pila LIFO en lugar de navegar fuera de la aplicación o hacia el login.
 *
 * @param {boolean} isOpen - Estado de visibilidad del modal
 * @param {Function} onClose - Callback ejecutado para cerrar el modal
 * @param {string|number|null} modalId - Identificador opcional para depuración
 */
export function useModalHistoryBack(isOpen, onClose, modalId = null) {
  const isPushedRef = useRef(false);
  const entryRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    ensurePopstateListener();

    if (isOpen) {
      const entryId = modalId || `modal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

      // Insertar entrada sintética en el historial del navegador
      if (typeof window !== "undefined" && window.history) {
        window.history.pushState({ modalOpen: true, modalId: entryId }, "");
        isPushedRef.current = true;
      }

      const modalEntry = {
        id: entryId,
        isPoppedByUser: false,
        close: () => {
          if (onCloseRef.current) {
            onCloseRef.current();
          }
        }
      };

      entryRef.current = modalEntry;
      modalStack.push(modalEntry);

      return () => {
        const currentEntry = entryRef.current;
        if (!currentEntry) return;

        // Remover de la pila en memoria si aún está registrado
        const idx = modalStack.indexOf(currentEntry);
        if (idx !== -1) {
          modalStack.splice(idx, 1);
        }

        // Si se cerró por UI (botón X, Cancelar, clic fuera) y la entrada aún está en el historial
        if (isPushedRef.current && !currentEntry.isPoppedByUser) {
          isPushedRef.current = false;
          if (typeof window !== "undefined" && window.history) {
            isProgrammaticBack = true;
            window.history.back();
          }
        }
      };
    }
  }, [isOpen, modalId]);
}

