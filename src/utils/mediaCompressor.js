import imageCompression from "browser-image-compression";

/**
 * Compresor de archivos de medios (Imágenes PNG, JPG, WEBP y Videos MP4, WEBM)
 * Optimiza automáticamente archivos pesados directamente en el navegador del cliente.
 */
export async function compressMediaFile(file, options = {}) {
  if (!file) return { file, compressed: false };

  const isImage = file.type.startsWith("image/");

  // Los videos no se comprimen; se retornan intactos
  if (!isImage) {
    return {
      file,
      originalSize: file.size,
      compressedSize: file.size,
      compressed: false
    };
  }

  // Si la imagen ya pesa menos de 300 KB, no requiere compresión
  if (file.size < 300 * 1024) {
    return {
      file,
      originalSize: file.size,
      compressedSize: file.size,
      compressed: false
    };
  }

  const defaultOptions = {
    maxSizeMB: 1, // Tamaño máximo objetivo ~1MB
    maxWidthOrHeight: 1920, // Dimensión máxima 1920px (Full HD ideal para redes sociales)
    useWebWorker: true, // Procesa en hilo secundario sin congelar la interfaz
    initialQuality: 0.85, // Calidad visual alta 85%
    fileType: file.type === "image/png" ? "image/png" : "image/jpeg",
    ...options
  };

  try {
    const compressedBlob = await imageCompression(file, defaultOptions);

    const compressedFile = new File([compressedBlob], file.name, {
      type: compressedBlob.type || file.type,
      lastModified: Date.now()
    });

    const savedPercentage = Math.round(
      ((file.size - compressedFile.size) / file.size) * 100
    );

    return {
      file: compressedFile,
      originalSize: file.size,
      compressedSize: compressedFile.size,
      savedPercentage: Math.max(0, savedPercentage),
      compressed: true
    };
  } catch (err) {
    console.warn("No se pudo comprimir la imagen, usando archivo original:", err);
    return {
      file,
      originalSize: file.size,
      compressedSize: file.size,
      compressed: false,
      error: err.message
    };
  }
}

/**
  * Obsoleto: Los videos ya no se comprimen para preservar calidad y formatos nativos.
  */
export async function compressVideoFile(file) {
  return { file, originalSize: file?.size || 0, compressedSize: file?.size || 0, compressed: false };
}

/**
 * Formatea bytes a cadena legible (ej: 450 KB, 4.2 MB)
 */
export function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}
