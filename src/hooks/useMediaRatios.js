import { useState, useEffect, useMemo } from "react";

/**
 * useMediaRatios
 * Hook personalizado para detectar y validar las proporciones naturales de imágenes
 * asignadas a una publicación según los estándares de Instagram (entre 4:5 [0.80] y 1.91:1).
 */
export function useMediaRatios(archivos = [], tipoPost = "reel") {
  const [mediaRatios, setMediaRatios] = useState({});

  useEffect(() => {
    if (!archivos || archivos.length === 0) return;
    archivos.forEach((file) => {
      if (file.tipo === "video" || /\.(mp4|mov|webm)$/i.test(file.url || "")) return;
      if (mediaRatios[file.id]) return;

      const img = new Image();
      img.onload = () => {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        const ratio = w / h;
        const isValid = ratio >= 0.79 && ratio <= 1.93;
        setMediaRatios((prev) => ({
          ...prev,
          [file.id]: { width: w, height: h, ratio, isValid }
        }));
      };
      img.src = file.url;
    });
  }, [archivos, mediaRatios]);

  const invalidFiles = useMemo(() => {
    if (tipoPost === "reel") return [];
    return archivos.filter((file) => {
      if (file.tipo === "video" || /\.(mp4|mov|webm)$/i.test(file.url || "")) return false;
      const meta = mediaRatios[file.id];
      return meta && !meta.isValid;
    });
  }, [archivos, mediaRatios, tipoPost]);

  return { mediaRatios, invalidFiles };
}

