-- ==============================================================================
-- Migración: Auto-publicación Programada de Posts en Meta (Instagram & Facebook)
-- Archivo: supabase/migrations/20261024_autopublicacion_meta_posts.sql
-- ==============================================================================

-- 1. Añadir columnas de control de publicación en Meta a la tabla posts
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS meta_container_id text,
  ADD COLUMN IF NOT EXISTS meta_post_id text,
  ADD COLUMN IF NOT EXISTS meta_permalink text,
  ADD COLUMN IF NOT EXISTS meta_publicado_at timestamptz,
  ADD COLUMN IF NOT EXISTS error_mensaje text,
  ADD COLUMN IF NOT EXISTS reintentos integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS plataformas_publicadas jsonb DEFAULT '[]'::jsonb;

-- 2. Actualizar o asegurar restricción de estados en posts
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT conname 
    FROM pg_constraint 
    WHERE conrelid = 'public.posts'::regclass 
      AND contype = 'c' 
      AND pg_get_constraintdef(oid) LIKE '%estado%'
  ) LOOP
    EXECUTE 'ALTER TABLE public.posts DROP CONSTRAINT ' || quote_ident(r.conname);
  END LOOP;
END $$;

ALTER TABLE public.posts
  ADD CONSTRAINT posts_estado_check
  CHECK (estado IN ('borrador', 'programado', 'procesando', 'publicado', 'error'));

-- 3. Crear índice compuesto para optimizar las consultas periódicas del cron job
CREATE INDEX IF NOT EXISTS idx_posts_autopublish 
  ON public.posts (estado, fecha_programada, hora_programada);

COMMENT ON COLUMN public.posts.meta_container_id IS 'ID temporal del contenedor de medios en Instagram Graph API mientras transcodifica';
COMMENT ON COLUMN public.posts.meta_post_id IS 'ID definitivo de la publicación creada en Instagram / Facebook';
COMMENT ON COLUMN public.posts.meta_permalink IS 'Enlace público directo a la publicación en vivo';
COMMENT ON COLUMN public.posts.meta_publicado_at IS 'Timestamp de confirmación de publicación exitosa';
COMMENT ON COLUMN public.posts.error_mensaje IS 'Detalle del error devuelto por la API de Meta si falla la publicación';
COMMENT ON COLUMN public.posts.reintentos IS 'Contador de intentos de publicación automática';
COMMENT ON COLUMN public.posts.plataformas_publicadas IS 'Arreglo JSON de redes donde se publicó efectivamente ej. ["instagram", "facebook"]';
