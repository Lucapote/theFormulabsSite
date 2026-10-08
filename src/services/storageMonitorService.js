import { supabase } from "@/lib/supabase";

const BUCKET_NAME = "media-videos-calendario";

// Límite por defecto de la cuota gratuita de Cloudflare R2 (10 GB storage) y Supabase (500 MB DB)
export const STORAGE_LIMIT_BYTES = 10 * 1024 * 1024 * 1024; // 10 GB Cloudflare R2
export const DB_LIMIT_BYTES = 500 * 1024 * 1024; // 500 MB Supabase DB

/**
 * Servicio para consultar y calcular en tiempo real el espacio ocupado
 * en el Bucket de Cloudflare R2 y las tablas de la Base de Datos PostgreSQL en Supabase.
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

    // 2. Escanear pesos reales del Bucket en Supabase Storage
    let totalBucketBytes = 0;
    let imagesBucketBytes = 0;
    let videosBucketBytes = 0;

    // Intentar listar objetos desde la carpeta 'calendarios/' en Storage
    try {
      const { data: folderList } = await supabase.storage
        .from(BUCKET_NAME)
        .list("calendarios", { limit: 100 });

      if (folderList && folderList.length > 0) {
        for (const item of folderList) {
          if (!item.id) {
            // Es un subdirectorio de calendario (ej: calendarios/<calId>/)
            const { data: subFiles } = await supabase.storage
              .from(BUCKET_NAME)
              .list(`calendarios/${item.name}`, { limit: 1000 });

            if (subFiles && subFiles.length > 0) {
              subFiles.forEach((f) => {
                const size = f.metadata?.size || f.size || 0;
                totalBucketBytes += size;
                const isVid = /\.(mp4|mov|webm|m4v|avi)$/i.test(f.name);
                if (isVid) {
                  videosBucketBytes += size;
                } else {
                  imagesBucketBytes += size;
                }
              });
            }
          } else {
            const size = item.metadata?.size || item.size || 0;
            totalBucketBytes += size;
          }
        }
      }
    } catch (storageErr) {
      console.warn("No se pudo escanear Storage directamente por API, aplicando estimación:", storageErr);
    }

    // Si la lectura directa del bucket da 0 pero hay archivos registrados, aplicar tamaño promedio por tipo
    if (totalBucketBytes === 0 && totalArchivosCount > 0) {
      // Estimación razonable: ~400 KB por imagen optimizada, ~8 MB por video
      imagesBucketBytes = imagenes.length * 400 * 1024;
      videosBucketBytes = videos.length * 8 * 1024 * 1024;
      totalBucketBytes = imagesBucketBytes + videosBucketBytes;
    }

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
