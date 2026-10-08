import { supabase } from "@/lib/supabase";

// Límite por defecto de la cuota gratuita de Cloudflare R2 (10 GB storage) y Supabase (500 MB DB)
export const STORAGE_LIMIT_BYTES = 10 * 1024 * 1024 * 1024; // 10 GB Cloudflare R2
export const DB_LIMIT_BYTES = 500 * 1024 * 1024; // 500 MB Supabase DB

/**
 * Servicio para consultar y calcular en tiempo real el espacio ocupado
 * en Cloudflare R2 (archivos_galeria) y las tablas de la Base de Datos PostgreSQL en Supabase.
 * Nota: Los archivos se almacenan 100% en Cloudflare R2; Supabase se utiliza exclusivamente
 * como Base de Datos relacional PostgreSQL.
 */
export async function getStorageAndDatabaseMetrics() {
  try {
    if (!supabase) {
      return { success: false, error: "Supabase no está configurado." };
    }

    // 1. Obtener registros de la tabla archivos_galeria
    const { data: archivos, error: archivosErr } = await supabase
      .from("archivos_galeria")
      .select("*");

    if (archivosErr) {
      console.error("Error al obtener archivos de galeria:", archivosErr);
    }

    const totalArchivosCount = archivos ? archivos.length : 0;
    const imagenes = (archivos || []).filter((a) => a.tipo === "image");
    const videos = (archivos || []).filter((a) => a.tipo === "video");
    const archivosEnUso = (archivos || []).filter((a) => a.en_uso);
    const archivosLibres = (archivos || []).filter((a) => !a.en_uso);

    // 2. Calcular pesos en Cloudflare R2 a partir de los metadatos registrados
    let imagesBucketBytes = 0;
    let videosBucketBytes = 0;
    let totalBucketBytes = 0;

    (archivos || []).forEach((archivo) => {
      // Si el archivo tiene peso guardado en metadatos o peso estimado
      const fileBytes = archivo.tamano_bytes || archivo.size || 0;
      if (archivo.tipo === "video") {
        const estimatedVideoBytes = fileBytes > 0 ? fileBytes : 6 * 1024 * 1024; // ~6MB por video transcodificado
        videosBucketBytes += estimatedVideoBytes;
      } else {
        const estimatedImageBytes = fileBytes > 0 ? fileBytes : 350 * 1024; // ~350KB por imagen WebP/JPEG
        imagesBucketBytes += estimatedImageBytes;
      }
    });

    totalBucketBytes = imagesBucketBytes + videosBucketBytes;

    // 3. Consultar conteos de tablas de la Base de Datos
    const [
      { count: clientesCount },
      { count: calendariosCount },
      { count: postsCount },
      { count: propuestasCount },
      { count: diagnosticsCount },
      { data: postsData }
    ] = await Promise.all([
      supabase.from("clientes").select("*", { count: "exact", head: true }),
      supabase.from("calendarios").select("*", { count: "exact", head: true }),
      supabase.from("posts").select("*", { count: "exact", head: true }),
      supabase.from("propuestas").select("*", { count: "exact", head: true }),
      supabase.from("diagnostics").select("*", { count: "exact", head: true }),
      supabase.from("posts").select("tipo_post, estado")
    ]);

    // Desglose de publicaciones
    const reelsCount = (postsData || []).filter((p) => p.tipo_post === "reel").length;
    const carrouselCount = (postsData || []).filter((p) => p.tipo_post === "carrousel").length;
    const borradoresCount = (postsData || []).filter((p) => p.estado === "borrador").length;
    const programadosCount = (postsData || []).filter((p) => p.estado === "programado").length;

    // 4. Estimación de peso en la Base de Datos (Payload JSON + overhead PostgreSQL)
    const dbRowsTotal =
      (clientesCount || 0) +
      (calendariosCount || 0) +
      (postsCount || 0) +
      (totalArchivosCount || 0) +
      (propuestasCount || 0) +
      (diagnosticsCount || 0);

    // Promedio ~2.5 KB por registro incluyendo índices y claves primarias UUID
    const estimatedDbBytes = Math.max(1024 * 128, dbRowsTotal * 2560);

    return {
      success: true,
      timestamp: new Date().toISOString(),
      storage: {
        totalBytes: totalBucketBytes,
        limitBytes: STORAGE_LIMIT_BYTES,
        usedPercentage: Math.min(100, parseFloat(((totalBucketBytes / STORAGE_LIMIT_BYTES) * 100).toFixed(2))),
        totalFiles: totalArchivosCount,
        imagesCount: imagenes.length,
        imagesBytes: imagesBucketBytes,
        videosCount: videos.length,
        videosBytes: videosBucketBytes,
        filesInUse: archivosEnUso.length,
        filesFree: archivosLibres.length
      },
      database: {
        totalRows: dbRowsTotal,
        estimatedBytes: estimatedDbBytes,
        limitBytes: DB_LIMIT_BYTES,
        usedPercentage: Math.min(100, parseFloat(((estimatedDbBytes / DB_LIMIT_BYTES) * 100).toFixed(2))),
        tables: {
          clientes: clientesCount || 0,
          calendarios: calendariosCount || 0,
          posts: postsCount || 0,
          archivos_galeria: totalArchivosCount,
          propuestas: propuestasCount || 0,
          diagnostics: diagnosticsCount || 0
        },
        postsBreakdown: {
          reels: reelsCount,
          carrousels: carrouselCount,
          borradores: borradoresCount,
          programados: programadosCount
        }
      }
    };
  } catch (err) {
    console.error("getStorageAndDatabaseMetrics catch error:", err);
    return { success: false, error: err.message };
  }
}
