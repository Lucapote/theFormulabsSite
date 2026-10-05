import { supabase } from "@/lib/supabase";

/**
 * Service for Clientes and Calendarios management (Fase 2)
 */

// Helper to create URL-friendly slug
export function generateSlug(text) {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9 -]/g, "") // Remove invalid chars
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/-+/g, "-"); // Replace multiple - with single -
}

/**
 * Obteine todos los clientes activos ordenados por created_at desc
 */
export async function getClientes() {
  try {
    if (!supabase) {
      return { success: false, data: [], error: "Supabase no configurado" };
    }

    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("getClientes error:", error);
      return { success: false, data: [], error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (err) {
    console.error("getClientes catch error:", err);
    return { success: false, data: [], error: err.message };
  }
}

/**
 * Inserta un nuevo cliente en la tabla clientes
 */
export async function createCliente({ nombre, empresa = "", email = "" }) {
  if (!nombre || !nombre.trim()) {
    return { success: false, error: "El nombre del cliente es obligatorio" };
  }

  try {
    if (!supabase) {
      return { success: false, error: "Supabase no configurado" };
    }

    const payload = {
      nombre: nombre.trim(),
      empresa: empresa.trim(),
      email: email.trim(),
      activo: true,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from("clientes")
      .insert([payload])
      .select();

    if (error) {
      console.error("createCliente error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data[0] };
  } catch (err) {
    console.error("createCliente catch error:", err);
    return { success: false, error: err.message };
  }
}

const BUCKET_NAME = "media-calendario";

// Helper to extract relative storage path from full URL or relative path
function extractStoragePath(urlOrPath) {
  if (!urlOrPath) return "";
  if (urlOrPath.includes("public/")) {
    const parts = urlOrPath.split("public/");
    const pathAndBucket = parts[1];
    const slashIdx = pathAndBucket.indexOf("/");
    if (slashIdx !== -1) {
      return pathAndBucket.substring(slashIdx + 1);
    }
  }
  return urlOrPath;
}

/**
 * Elimina un cliente por ID y limpia de forma segura TODOS los calendarios y archivos físicos en Storage asociados
 */
export async function deleteCliente(clienteId) {
  if (!clienteId) return { success: false, error: "ID de cliente no provisto" };

  try {
    if (!supabase) return { success: false, error: "Supabase no configurado" };

    // 1. Fetch all calendars belonging to this client
    const { data: cals } = await supabase
      .from("calendarios")
      .select("id")
      .eq("cliente_id", clienteId);

    if (cals && cals.length > 0) {
      const calIds = cals.map((c) => c.id);

      // 2. Fetch all media files for all calendars of this client
      const { data: files } = await supabase
        .from("archivos_galeria")
        .select("id, url")
        .in("calendario_id", calIds);

      if (files && files.length > 0) {
        const storagePaths = files
          .map((f) => extractStoragePath(f.url))
          .filter(Boolean);

        if (storagePaths.length > 0) {
          // Remove all physical files from Supabase Storage bucket media-calendario
          await supabase.storage.from(BUCKET_NAME).remove(storagePaths);
        }
      }
    }

    // 3. Delete client row (Postgres CASCADE automatically deletes rows in calendarios, archivos_galeria, and posts)
    const { error } = await supabase.from("clientes").delete().eq("id", clienteId);
    if (error) return { success: false, error: error.message };

    return { success: true };
  } catch (err) {
    console.error("deleteCliente error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Obtiene los calendarios asociados a un cliente específico
 */
export async function getCalendariosByCliente(clienteId) {
  if (!clienteId) return { success: true, data: [] };

  try {
    if (!supabase) {
      return { success: false, data: [], error: "Supabase no configurado" };
    }

    const { data, error } = await supabase
      .from("calendarios")
      .select("*")
      .eq("cliente_id", clienteId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("getCalendariosByCliente error:", error);
      return { success: false, data: [], error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (err) {
    console.error("getCalendariosByCliente catch error:", err);
    return { success: false, data: [], error: err.message };
  }
}

/**
 * Inserta un nuevo calendario en la tabla calendarios
 */
export async function createCalendario({ cliente_id, nombre, mes, anio, slug, tipo_contenido, plataformas }) {
  if (!cliente_id) return { success: false, error: "Cliente no seleccionado" };
  if (!nombre || !nombre.trim()) return { success: false, error: "El nombre del calendario es obligatorio" };

  const cleanSlug = slug
    ? generateSlug(slug)
    : generateSlug(nombre);

  if (!cleanSlug) return { success: false, error: "El slug del calendario es obligatorio" };

  try {
    if (!supabase) {
      return { success: false, error: "Supabase no configurado" };
    }

    const payload = {
      cliente_id,
      nombre: nombre.trim(),
      mes: Number(mes) || new Date().getMonth() + 1,
      anio: Number(anio) || new Date().getFullYear(),
      slug: cleanSlug,
      tipo_contenido: tipo_contenido || "Reels y Carruseles",
      plataformas: plataformas || "Instagram y Facebook",
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from("calendarios")
      .insert([payload])
      .select();

    if (error) {
      console.error("createCalendario error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data[0] };
  } catch (err) {
    console.error("createCalendario catch error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Elimina un calendario por ID y limpia de forma segura todos sus archivos en Supabase Storage
 */
export async function deleteCalendario(calendarioId) {
  if (!calendarioId) return { success: false, error: "ID de calendario no provisto" };

  try {
    if (!supabase) return { success: false, error: "Supabase no configurado" };

    // 1. Fetch all archivos_galeria for this calendar to clean up physical storage files
    const { data: files } = await supabase
      .from("archivos_galeria")
      .select("id, url")
      .eq("calendario_id", calendarioId);

    if (files && files.length > 0) {
      const storagePaths = files
        .map((f) => extractStoragePath(f.url))
        .filter(Boolean);

      if (storagePaths.length > 0) {
        await supabase.storage.from(BUCKET_NAME).remove(storagePaths);
      }
    }

    // 2. Delete calendar row
    const { error } = await supabase.from("calendarios").delete().eq("id", calendarioId);
    if (error) return { success: false, error: error.message };

    return { success: true };
  } catch (err) {
    console.error("deleteCalendario error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Uploads a media file (image/video) to Supabase Storage and inserts record in archivos_galeria
 */
export async function uploadMediaFile(calendarioId, file) {
  if (!calendarioId) return { success: false, error: "calendarioId no provisto" };
  if (!file) return { success: false, error: "Archivo no provisto" };

  try {
    if (!supabase) return { success: false, error: "Supabase no configurado" };

    const isVideo = file.type.startsWith("video/") || /\.(mp4|mov|webm|m4v|avi)$/i.test(file.name);
    const mediaType = isVideo ? "video" : "image";

    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const storagePath = `calendarios/${calendarioId}/${Date.now()}_${cleanFileName}`;

    // 1. Upload to Supabase Storage
    const uploadRes = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, file, { cacheControl: "3600", upsert: true });

    if (uploadRes.error) {
      console.error("uploadMediaFile storage error:", uploadRes.error);
      return { success: false, error: uploadRes.error.message };
    }

    // 2. Obtain Public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(storagePath);

    const publicUrl = urlData?.publicUrl || "";

    // 3. Insert record in DB table archivos_galeria
    const payload = {
      calendario_id: calendarioId,
      nombre_archivo: file.name,
      tipo: mediaType,
      url: publicUrl,
      en_uso: false,
      created_at: new Date().toISOString()
    };

    const { data: dbData, error: dbError } = await supabase
      .from("archivos_galeria")
      .insert([payload])
      .select();

    if (dbError) {
      console.error("uploadMediaFile DB error:", dbError);
      return { success: false, error: dbError.message };
    }

    return { success: true, data: dbData[0] };
  } catch (err) {
    console.error("uploadMediaFile catch error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Gets all media files for a calendar ordered by created_at desc
 */
export async function getArchivosByCalendario(calendarioId) {
  if (!calendarioId) return { success: true, data: [] };

  try {
    if (!supabase) return { success: false, data: [], error: "Supabase no configurado" };

    const { data, error } = await supabase
      .from("archivos_galeria")
      .select("*")
      .eq("calendario_id", calendarioId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("getArchivosByCalendario error:", error);
      return { success: false, data: [], error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (err) {
    console.error("getArchivosByCalendario catch error:", err);
    return { success: false, data: [], error: err.message };
  }
}

/**
 * Deletes a media file from Supabase Storage and DB table archivos_galeria
 */
export async function deleteArchivo(archivoId, storageUrlOrPath = "") {
  if (!archivoId) return { success: false, error: "archivoId no provisto" };

  try {
    if (!supabase) return { success: false, error: "Supabase no configurado" };

    let relativePath = storageUrlOrPath;
    if (storageUrlOrPath.includes("public/")) {
      const parts = storageUrlOrPath.split("public/");
      const pathAndBucket = parts[1];
      const slashIdx = pathAndBucket.indexOf("/");
      if (slashIdx !== -1) {
        relativePath = pathAndBucket.substring(slashIdx + 1);
      }
    }

    if (relativePath) {
      await supabase.storage.from(BUCKET_NAME).remove([relativePath]);
    }

    const { error: dbError } = await supabase
      .from("archivos_galeria")
      .delete()
      .eq("id", archivoId);

    if (dbError) {
      console.error("deleteArchivo DB error:", dbError);
      return { success: false, error: dbError.message };
    }

    return { success: true };
  } catch (err) {
    console.error("deleteArchivo catch error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Gets all posts for a calendar ordered by fecha_programada and hora_programada asc
 */
export async function getPostsByCalendario(calendarioId) {
  if (!calendarioId) return { success: true, data: [] };

  try {
    if (!supabase) return { success: false, data: [], error: "Supabase no configurado" };

    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("calendario_id", calendarioId)
      .order("fecha_programada", { ascending: true })
      .order("hora_programada", { ascending: true });

    if (error) {
      console.error("getPostsByCalendario error:", error);
      return { success: false, data: [], error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (err) {
    console.error("getPostsByCalendario catch error:", err);
    return { success: false, data: [], error: err.message };
  }
}

/**
 * Creates a post and updates en_uso = true for selected files in archivos_galeria
 */
export async function createPost({
  calendario_id,
  tipo_post,
  caption,
  fecha_programada,
  hora_programada,
  archivos = [],
  estado = "programado"
}) {
  if (!calendario_id) return { success: false, error: "calendario_id es requerido" };
  if (!tipo_post) return { success: false, error: "El tipo de post es requerido" };

  try {
    if (!supabase) return { success: false, error: "Supabase no configurado" };

    const payload = {
      calendario_id,
      tipo_post,
      caption: caption || "",
      fecha_programada: fecha_programada || null,
      hora_programada: hora_programada || "12:00",
      archivos: archivos || [],
      estado: estado || "programado",
      created_at: new Date().toISOString()
    };

    // 1. Insert post into DB
    const { data, error } = await supabase
      .from("posts")
      .insert([payload])
      .select();

    if (error) {
      console.error("createPost DB error:", error);
      return { success: false, error: error.message };
    }

    // 2. Mark assigned files as en_uso = true in archivos_galeria
    if (archivos && archivos.length > 0) {
      const fileIds = archivos.map((a) => a.id).filter(Boolean);
      if (fileIds.length > 0) {
        await supabase
          .from("archivos_galeria")
          .update({ en_uso: true })
          .in("id", fileIds);
      }
    }

    return { success: true, data: data[0] };
  } catch (err) {
    console.error("createPost catch error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Updates a post and synchronizes en_uso state for assigned files in archivos_galeria
 */
export async function updatePost(postId, postData, archivosAnteriores = []) {
  if (!postId) return { success: false, error: "postId es requerido" };

  try {
    if (!supabase) return { success: false, error: "Supabase no configurado" };

    const {
      tipo_post,
      caption,
      fecha_programada,
      hora_programada,
      archivos = [],
      estado
    } = postData;

    const payload = {
      tipo_post,
      caption,
      fecha_programada,
      hora_programada,
      archivos,
      estado
    };

    // 1. Update post in DB
    const { data, error } = await supabase
      .from("posts")
      .update(payload)
      .eq("id", postId)
      .select();

    if (error) {
      console.error("updatePost DB error:", error);
      return { success: false, error: error.message };
    }

    // 2. Sync en_uso in archivos_galeria
    const prevIds = (archivosAnteriores || []).map((a) => a.id).filter(Boolean);
    const newIds = (archivos || []).map((a) => a.id).filter(Boolean);

    const removedIds = prevIds.filter((id) => !newIds.includes(id));
    if (removedIds.length > 0) {
      await supabase
        .from("archivos_galeria")
        .update({ en_uso: false })
        .in("id", removedIds);
    }

    const addedIds = newIds.filter((id) => !prevIds.includes(id));
    if (addedIds.length > 0) {
      await supabase
        .from("archivos_galeria")
        .update({ en_uso: true })
        .in("id", addedIds);
    }

    return { success: true, data: data[0] };
  } catch (err) {
    console.error("updatePost catch error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Deletes a post and frees associated files in archivos_galeria (en_uso = false)
 */
export async function deletePost(postId, archivosAsociados = []) {
  if (!postId) return { success: false, error: "postId es requerido" };

  try {
    if (!supabase) return { success: false, error: "Supabase no configurado" };

    // 1. Free associated files in archivos_galeria
    const fileIds = (archivosAsociados || []).map((a) => a.id).filter(Boolean);
    if (fileIds.length > 0) {
      await supabase
        .from("archivos_galeria")
        .update({ en_uso: false })
        .in("id", fileIds);
    }

    // 2. Delete post row from DB
    const { error } = await supabase.from("posts").delete().eq("id", postId);
    if (error) {
      console.error("deletePost DB error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("deletePost catch error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Public query: Obtiene un calendario por su slug con datos del cliente y todos sus posts programados
 * Funciona de forma anónima (pública) y para admins
 */
export async function getPublicCalendarioBySlug(slug) {
  if (!slug) return { success: false, data: null, error: "Slug no provisto" };
  const cleanSlug = slug.toLowerCase().trim();

  try {
    if (!supabase) return { success: false, data: null, error: "Supabase no configurado" };

    // 1. Fetch calendar details with joined client name/empresa
    const { data: calData, error: calErr } = await supabase
      .from("calendarios")
      .select("*, cliente:clientes(nombre, empresa, email)")
      .eq("slug", cleanSlug)
      .single();

    if (calErr || !calData) {
      console.error("getPublicCalendarioBySlug error:", calErr);
      return { success: false, data: null, error: `No se encontró el calendario "${slug}".` };
    }

    // 2. Fetch posts associated with this calendar
    const { data: postsData, error: postsErr } = await supabase
      .from("posts")
      .select("*")
      .eq("calendario_id", calData.id)
      .order("fecha_programada", { ascending: true })
      .order("hora_programada", { ascending: true });

    if (postsErr) {
      console.warn("Error fetching posts for calendar:", postsErr);
    }

    return {
      success: true,
      data: {
        ...calData,
        posts: postsData || []
      }
    };
  } catch (err) {
    console.error("getPublicCalendarioBySlug catch error:", err);
    return { success: false, data: null, error: err.message };
  }
}

/**
 * Genera "cajas vacías" (publicaciones borrador) para un calendario
 * según la cantidad de reels y carruseles solicitados.
 */
export async function createDraftPlaceholderPosts({ calendarioId, cantReels = 0, cantCarruseles = 0, mes, anio }) {
  if (!calendarioId) return { success: false, error: "calendarioId es requerido" };
  const numReels = Math.max(0, Number(cantReels) || 0);
  const numCarruseles = Math.max(0, Number(cantCarruseles) || 0);
  const totalPosts = numReels + numCarruseles;
  if (totalPosts <= 0) return { success: true, count: 0 };

  try {
    if (!supabase) return { success: false, error: "Supabase no configurado" };

    const targetMes = Number(mes) || (new Date().getMonth() + 1);
    const targetAnio = Number(anio) || new Date().getFullYear();
    const mm = String(targetMes).padStart(2, "0");

    const daysInMonth = new Date(targetAnio, targetMes, 0).getDate();
    const step = Math.max(1, Math.floor(daysInMonth / (totalPosts + 1)));

    const postsToInsert = [];

    // 1. Agregar Reels sin fecha asignada por defecto (fecha_programada: null)
    for (let i = 0; i < numReels; i++) {
      postsToInsert.push({
        calendario_id: calendarioId,
        tipo_post: "reel",
        caption: "",
        fecha_programada: null,
        hora_programada: "18:00",
        archivos: [],
        estado: "borrador",
        created_at: new Date().toISOString()
      });
    }

    // 2. Agregar Carruseles sin fecha asignada por defecto (fecha_programada: null)
    for (let i = 0; i < numCarruseles; i++) {
      postsToInsert.push({
        calendario_id: calendarioId,
        tipo_post: "carrousel",
        caption: "",
        fecha_programada: null,
        hora_programada: "18:00",
        archivos: [],
        estado: "borrador",
        created_at: new Date().toISOString()
      });
    }

    const { data, error } = await supabase
      .from("posts")
      .insert(postsToInsert)
      .select();

    if (error) {
      console.error("createDraftPlaceholderPosts error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, count: data.length, data };
  } catch (err) {
    console.error("createDraftPlaceholderPosts catch error:", err);
    return { success: false, error: err.message };
  }
}

