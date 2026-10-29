-- Migración: Soporte para los 5 estados de publicación y retroalimentación de cambios del cliente
-- Archivo: supabase/migrations/20261026_estados_publicacion_y_feedback.sql

-- 1. Actualizar restricción de estados en la tabla posts
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_estado_check;
ALTER TABLE public.posts ADD CONSTRAINT posts_estado_check
  CHECK (estado IN ('sin_empezar', 'en_edicion', 'en_aprobacion', 'aprobado', 'programado', 'publicado', 'error', 'borrador'));

-- 2. Añadir columnas de notas y fecha de solicitud de cambios
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS notas_cambios text;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS fecha_cambios timestamp with time zone;

-- 3. Índice para consultas del Centro de Notificaciones en posts que requieren atención
CREATE INDEX IF NOT EXISTS idx_posts_estado_cambios ON public.posts (estado, fecha_cambios)
  WHERE notas_cambios IS NOT NULL;

-- 4. Funciones RPC seguras para aprobación y retroalimentación pública (Zero Trust)
CREATE OR REPLACE FUNCTION public.aprobar_post_publico(p_post_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_post record;
BEGIN
  SELECT p.* INTO v_post
  FROM public.posts p
  JOIN public.calendarios c ON c.id = p.calendario_id
  WHERE p.id = p_post_id AND c.slug IS NOT NULL;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Publicación no encontrada o no pertenece a un calendario público');
  END IF;

  UPDATE public.posts
  SET estado = 'programado',
      notas_cambios = NULL,
      fecha_cambios = NULL
  WHERE id = p_post_id;

  RETURN jsonb_build_object('success', true, 'nuevo_estado', 'programado');
END;
$$;

CREATE OR REPLACE FUNCTION public.solicitar_cambios_post(p_post_id uuid, p_notas text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_post record;
BEGIN
  SELECT p.* INTO v_post
  FROM public.posts p
  JOIN public.calendarios c ON c.id = p.calendario_id
  WHERE p.id = p_post_id AND c.slug IS NOT NULL;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Publicación no encontrada o no pertenece a un calendario público');
  END IF;

  UPDATE public.posts
  SET estado = 'en_edicion',
      notas_cambios = trim(p_notas),
      fecha_cambios = now()
  WHERE id = p_post_id;

  RETURN jsonb_build_object('success', true, 'nuevo_estado', 'en_edicion');
END;
$$;

GRANT EXECUTE ON FUNCTION public.aprobar_post_publico(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.solicitar_cambios_post(uuid, text) TO anon, authenticated;
