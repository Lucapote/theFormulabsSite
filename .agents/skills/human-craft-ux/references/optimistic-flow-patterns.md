# Patrones de Código: Optimistic UI y Flujos sin Fricción

Guía práctica con implementaciones de referencia en React para asegurar cero latencia percibida y prevención de errores.

---

## 1. Patrón Optimistic UI con Reversión Automática (Rollback)

Este patrón actualiza la interfaz al instante (0ms) y ejecuta la llamada asíncrona en segundo plano. Si la red falla, revierte el estado y notifica al usuario con opción de reintentar:

```jsx
import { useState } from "react";
import { toast } from "sonner";
import { updatePostStatus } from "@/services/calendarService";

export function useOptimisticPostApproval(initialPosts) {
  const [posts, setPosts] = useState(initialPosts);

  const toggleApproval = async (postId, nextStatus) => {
    // 1. Guardar copia previa para rollback en caso de fallo
    const previousPosts = [...posts];

    // 2. Actualización optimista inmediata en la UI (0ms de latencia percibida)
    setPosts((current) =>
      current.map((p) =>
        p.id === postId ? { ...p, estado: nextStatus } : p
      )
    );

    try {
      // 3. Mutación en segundo plano hacia Supabase
      const res = await updatePostStatus(postId, nextStatus);
      if (!res.success) {
        throw new Error(res.error || "Fallo en el servidor");
      }
      toast.success(
        nextStatus === "aprobado"
          ? "Publicación aprobada y lista para programar"
          : "Publicación devuelta a borrador"
      );
    } catch (err) {
      // 4. Reversión elegante (Rollback) si ocurre un error de red
      setPosts(previousPosts);
      toast.error("No se pudo actualizar el estado.", {
        description: "Revisa tu conexión a internet.",
        action: {
          label: "Reintentar",
          onClick: () => toggleApproval(postId, nextStatus)
        }
      });
    }
  };

  return { posts, toggleApproval };
}
```

---

## 2. Patrón de Divulgación Progresiva (Progressive Disclosure)

Agrupa configuraciones complejas en capas visuales. Muestra primero lo esencial y revela lo avanzado bajo demanda:

```jsx
export function ClientConfigForm({ formData, setFormData }) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="space-y-4">
      {/* Capa 1: Esencial para el 90% de los usuarios */}
      <div className="space-y-3">
        <label className="text-xs font-sora font-bold text-gray-700 block">
          Nombre del Cliente *
        </label>
        <input
          type="text"
          value={formData.nombre}
          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
          className="w-full h-10 px-3 text-xs rounded-xl border border-gray-200"
        />
      </div>

      {/* Capa 2: Gatillo de Divulgación Progresiva */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs font-sora font-semibold text-brand-blue hover:underline flex items-center gap-1.5 cursor-pointer"
        >
          <Settings2 className="w-3.5 h-3.5" />
          <span>{showAdvanced ? "Ocultar opciones avanzadas" : "Configuración técnica y de Meta..."}</span>
        </button>
      </div>

      {/* Capa 3: Opciones Técnicas Avanzadas Reveladas */}
      {showAdvanced && (
        <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-3 animate-in fade-in-50 duration-200">
          <p className="text-[11px] text-gray-500 font-inter">
            Ajustes de webhooks, tokens permanentes e identificadores de Meta Graph API.
          </p>
          {/* Inputs técnicos aquí... */}
        </div>
      )}
    </div>
  );
}
```

---

## 3. Patrón de Prevención de Doble Envío (Idempotent Submit Guard)

Bloquea clics duplicados y añade feedback visual inmediato de procesamiento:

```jsx
export function SafeSubmitButton({ isSubmitting, onClick, label = "Guardar Cambios" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isSubmitting}
      className="h-11 px-6 rounded-full bg-[#188ff0] hover:bg-blue-600 disabled:opacity-50 text-white text-xs font-sora font-bold uppercase tracking-wider shadow-md shadow-blue-200 transition-all inline-flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
    >
      {isSubmitting ? (
        <>
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Procesando solicitud...</span>
        </>
      ) : (
        <span>{label}</span>
      )}
    </button>
  );
}
```
