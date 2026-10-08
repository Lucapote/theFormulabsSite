import imageCompression from "browser-image-compression";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

let ffmpegInstance = null;
let ffmpegLoadingPromise = null;

/**
 * Singleton para inicializar y cargar FFmpeg WebAssembly una única vez
 */
export async function getFFmpeg() {
  if (ffmpegInstance && ffmpegInstance.loaded) {
    return ffmpegInstance;
  }

  if (ffmpegLoadingPromise) {
    return ffmpegLoadingPromise;
  }

  ffmpegLoadingPromise = (async () => {
    const ffmpeg = new FFmpeg();
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";

    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
    });

    ffmpegInstance = ffmpeg;
    return ffmpeg;
  })();

  return ffmpegLoadingPromise;
}

/**
 * Extracción de miniatura ligera (image/webp ~40-60 KB)
 * Lee el archivo en un elemento <video> invisible, salta al segundo 0.5
 * y dibuja el fotograma en un canvas escalado (máximo 720px de ancho).
 */
export async function generateVideoThumbnail(file) {
  return new Promise((resolve, reject) => {
    try {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.muted = true;
      video.playsInline = true;
      const fileUrl = URL.createObjectURL(file);
      video.src = fileUrl;

      const cleanup = () => {
        try {
          URL.revokeObjectURL(fileUrl);
        } catch (_) {}
      };

      video.onloadedmetadata = () => {
        // Saltar al segundo 0.5 (o la mitad del video si dura menos)
        const seekTime = Math.min(0.5, (video.duration || 1) / 2);
        video.currentTime = seekTime;
      };

      video.onseeked = () => {
        try {
          const maxDim = 720;
          const originalWidth = video.videoWidth || 720;
          const originalHeight = video.videoHeight || 1280;

          let targetWidth = originalWidth;
          let targetHeight = originalHeight;

          if (originalWidth > maxDim) {
            targetWidth = maxDim;
            targetHeight = Math.round((originalHeight * maxDim) / originalWidth);
          }

          const canvas = document.createElement("canvas");
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(video, 0, 0, targetWidth, targetHeight);

          canvas.toBlob(
            (blob) => {
              cleanup();
              if (blob) {
                const baseName = file.name.replace(/\.[^/.]+$/, "");
                const thumbFile = new File([blob], `${baseName}_thumb.webp`, {
                  type: "image/webp",
                  lastModified: Date.now(),
                });
                resolve(thumbFile);
              } else {
                reject(new Error("No se pudo generar el Blob de la miniatura WebP"));
              }
            },
            "image/webp",
            0.8
          );
        } catch (err) {
          cleanup();
          reject(err);
        }
      };

      video.onerror = () => {
        cleanup();
        reject(new Error("No se pudo cargar el video para generar la miniatura"));
      };
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Transcodificación a MP4 con índice FastStart (moov atom al inicio) usando FFmpeg WebAssembly.
 * Optimiza videos pesados (.mov o .mp4) para reproducción web instantánea.
 */
export async function compressVideo(file, onProgress) {
  if (!file) return { file, compressed: false };

  const isMp4 = file.type === "video/mp4" || file.name.toLowerCase().endsWith(".mp4");

  // Si el archivo ya es menor a 12 MB y ya es .mp4, déjalo pasar directo sin procesar
  if (file.size < 12 * 1024 * 1024 && isMp4) {
    return {
      file,
      originalSize: file.size,
      compressedSize: file.size,
      compressed: false,
    };
  }

  try {
    const ffmpeg = await getFFmpeg();

    const progressHandler = ({ progress }) => {
      if (typeof onProgress === "function") {
        const percent = Math.min(100, Math.max(0, Math.round(progress * 100)));
        onProgress(percent);
      }
    };

    ffmpeg.on("progress", progressHandler);

    // Cargar archivo en memoria virtual de FFmpeg
    const inputExt = file.name.split(".").pop() || "mov";
    const inputName = `input.${inputExt}`;
    await ffmpeg.writeFile(inputName, await fetchFile(file));

    // Ejecutar comando de transcodificación y optimización web
    await ffmpeg.exec([
      "-i", inputName,
      "-vf", "scale=w=1080:h=1920:force_original_aspect_ratio=decrease,pad=ceil(iw/2)*2:ceil(ih/2)*2",
      "-c:v", "libx264",
      "-crf", "26",
      "-preset", "ultrafast",
      "-b:v", "3500k",
      "-c:a", "aac",
      "-b:a", "128k",
      "-movflags", "+faststart",
      "output.mp4"
    ]);

    // Leer archivo transcodificado resultante
    const outputData = await ffmpeg.readFile("output.mp4");

    // Limpiar archivos de memoria virtual
    try {
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile("output.mp4");
    } catch (_) {}

    ffmpeg.off("progress", progressHandler);

    const cleanBaseName = file.name.replace(/\.[^/.]+$/, "");
    const compressedFile = new File([outputData.buffer], `${cleanBaseName}.mp4`, {
      type: "video/mp4",
      lastModified: Date.now(),
    });

    const savedPercentage = Math.round(
      ((file.size - compressedFile.size) / file.size) * 100
    );

    return {
      file: compressedFile,
      originalSize: file.size,
      compressedSize: compressedFile.size,
      savedPercentage: Math.max(0, savedPercentage),
      compressed: true,
    };
  } catch (err) {
    console.warn("Fallo transcodificación FFmpeg WASM, conservando archivo original:", err);
    return {
      file,
      originalSize: file.size,
      compressedSize: file.size,
      compressed: false,
      error: err.message,
    };
  }
}

export const compressVideoFile = compressVideo;

/**
 * Compresor de archivos de medios (Imágenes PNG, JPG, WEBP y Videos MP4, MOV)
 */
export async function compressMediaFile(file, options = {}) {
  if (!file) return { file, compressed: false };

  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/") || /\.(mp4|mov|webm|m4v|avi)$/i.test(file.name);

  if (isVideo) {
    return await compressVideo(file, options.onProgress);
  }

  if (!isImage) {
    return {
      file,
      originalSize: file.size,
      compressedSize: file.size,
      compressed: false,
    };
  }

  // Si la imagen ya pesa menos de 300 KB, no requiere compresión
  if (file.size < 300 * 1024) {
    return {
      file,
      originalSize: file.size,
      compressedSize: file.size,
      compressed: false,
    };
  }

  const defaultOptions = {
    maxSizeMB: 1, // Tamaño máximo objetivo ~1MB
    maxWidthOrHeight: 1920, // Dimensión máxima 1920px (Full HD)
    useWebWorker: true,
    initialQuality: 0.85,
    fileType: file.type === "image/png" ? "image/png" : "image/jpeg",
    ...options,
  };

  try {
    const compressedBlob = await imageCompression(file, defaultOptions);

    const compressedFile = new File([compressedBlob], file.name, {
      type: compressedBlob.type || file.type,
      lastModified: Date.now(),
    });

    const savedPercentage = Math.round(
      ((file.size - compressedFile.size) / file.size) * 100
    );

    return {
      file: compressedFile,
      originalSize: file.size,
      compressedSize: compressedFile.size,
      savedPercentage: Math.max(0, savedPercentage),
      compressed: true,
    };
  } catch (err) {
    console.warn("No se pudo comprimir la imagen, usando archivo original:", err);
    return {
      file,
      originalSize: file.size,
      compressedSize: file.size,
      compressed: false,
      error: err.message,
    };
  }
}

export const compressImage = compressMediaFile;

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
