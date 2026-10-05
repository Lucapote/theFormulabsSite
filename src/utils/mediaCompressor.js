import imageCompression from "browser-image-compression";

/**
 * Compresor de archivos de medios (Imágenes PNG, JPG, WEBP y Videos MP4, WEBM)
 * Optimiza automáticamente archivos pesados directamente en el navegador del cliente.
 */
export async function compressMediaFile(file, options = {}) {
  if (!file) return { file, compressed: false };

  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/") || /\.(mp4|mov|webm|m4v|avi)$/i.test(file.name);

  // Si es un archivo de video, procesarlo con el compresor/recodificador de video
  if (isVideo) {
    return await compressVideoFile(file, options);
  }

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
 * Compresor de Video cliente usando HTML5 Canvas + MediaRecorder API
 * Re-codifica videos pesados a resolución óptima (máx 1080p / 2.5 Mbps bitrate)
 */
export async function compressVideoFile(file) {
  if (!file) return { file, compressed: false };

  // Si el video pesa menos de 10 MB, no requiere compresión
  if (file.size < 10 * 1024 * 1024) {
    return {
      file,
      originalSize: file.size,
      compressedSize: file.size,
      compressed: false
    };
  }

  if (typeof window === "undefined" || !window.MediaRecorder) {
    return { file, compressed: false };
  }

  return new Promise((resolve) => {
    try {
      const video = document.createElement("video");
      video.muted = false;
      video.volume = 0.0001; // Volumen mínimo para capturar audio sin emitir sonido estridente por altavoz
      const fileUrl = URL.createObjectURL(file);
      video.src = fileUrl;

      const cleanup = () => {
        try {
          URL.revokeObjectURL(fileUrl);
        } catch (_) {}
      };

      video.onloadedmetadata = () => {
        const targetWidth = Math.min(1080, video.videoWidth || 1080);
        const scale = targetWidth / (video.videoWidth || 1080);
        const targetHeight = Math.round((video.videoHeight || 1920) * scale);

        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext("2d");

        const canvasStream = canvas.captureStream(30);
        const videoElementStream = video.captureStream
          ? video.captureStream()
          : video.mozCaptureStream
          ? video.mozCaptureStream()
          : null;

        const stream = new MediaStream();

        // 1. Agregar pista de video desde el canvas redimensionado
        canvasStream.getVideoTracks().forEach((track) => stream.addTrack(track));

        // 2. Preservar y agregar pista de audio original del video
        if (videoElementStream && videoElementStream.getAudioTracks().length > 0) {
          videoElementStream.getAudioTracks().forEach((track) => stream.addTrack(track));
        }

        let mimeType = "video/webm;codecs=vp9";
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = "video/webm;codecs=vp8";
        }
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = "video/webm";
        }
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = "";
        }

        const options = { videoBitsPerSecond: 2500000 };
        if (mimeType) options.mimeType = mimeType;

        let mediaRecorder;
        try {
          mediaRecorder = new MediaRecorder(stream, options);
        } catch (_) {
          cleanup();
          return resolve({ file, compressed: false });
        }

        const chunks = [];
        mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) chunks.push(e.data);
        };

        mediaRecorder.onstop = () => {
          cleanup();
          const compressedBlob = new Blob(chunks, { type: mimeType || file.type });

          if (compressedBlob.size > 0 && compressedBlob.size < file.size) {
            const ext = mimeType.includes("webm") ? ".webm" : ".mp4";
            const newName = file.name.replace(/\.[^/.]+$/, "") + "_opt" + ext;
            const compressedFile = new File([compressedBlob], newName, {
              type: compressedBlob.type || file.type,
              lastModified: Date.now()
            });

            const savedPercentage = Math.round(
              ((file.size - compressedFile.size) / file.size) * 100
            );

            resolve({
              file: compressedFile,
              originalSize: file.size,
              compressedSize: compressedFile.size,
              savedPercentage: Math.max(0, savedPercentage),
              compressed: true
            });
          } else {
            resolve({
              file,
              originalSize: file.size,
              compressedSize: file.size,
              compressed: false
            });
          }
        };

        let animId;
        const draw = () => {
          if (!video.paused && !video.ended) {
            ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
            animId = requestAnimationFrame(draw);
          }
        };

        video.onplay = () => {
          mediaRecorder.start();
          draw();
        };

        video.onended = () => {
          cancelAnimationFrame(animId);
          if (mediaRecorder.state !== "inactive") {
            mediaRecorder.stop();
          }
        };

        video.onerror = () => {
          cleanup();
          resolve({ file, compressed: false });
        };

        video.playbackRate = 1.0; // Velocidad normal (1.0x) para mantener duración y audio exactos
        video.play().catch(() => {
          cleanup();
          resolve({ file, compressed: false });
        });
      };
    } catch (err) {
      console.warn("No se pudo recodificar el video, usando archivo original:", err);
      resolve({ file, compressed: false });
    }
  });
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
