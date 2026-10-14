-- ==============================================================================
-- Migración: Soporte para Esquema Quincenal y Tipo de Sesión (Orgánica 4h / Profesional 6h)
-- Archivo: supabase/migrations/20261013_esquema_quincenal_y_sesiones.sql
-- ==============================================================================

-- 1. Ampliar campos operativos en clientes
ALTER TABLE public.clientes
  ADD COLUMN IF NOT EXISTS esquema_pago text DEFAULT 'mensual',
  ADD COLUMN IF NOT EXISTS dia_corte_pago_2 int DEFAULT 15,
  ADD COLUMN IF NOT EXISTS tipo_sesion_default text DEFAULT 'organica';

-- 2. Ampliar campos y constraints en producciones
ALTER TABLE public.producciones
  ADD COLUMN IF NOT EXISTS duracion_horas int DEFAULT 4,
  ADD COLUMN IF NOT EXISTS nombre text;

-- Asegurar que la constraint CHECK permita los tipos oficiales
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'producciones_tipo_check'
  ) THEN
    ALTER TABLE public.producciones DROP CONSTRAINT producciones_tipo_check;
  END IF;
END $$;

ALTER TABLE public.producciones
  ADD CONSTRAINT producciones_tipo_check
  CHECK (tipo IN ('reels_batch', 'fotos', 'evento', 'hibrido', 'organica', 'profesional'));
