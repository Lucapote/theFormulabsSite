-- ==============================================================================
-- Migración: FASE 4 - Versionado e Historial de Iteraciones de Propuestas
-- Archivo: supabase/migrations/20261015_versionado_propuestas.sql
-- ==============================================================================

-- 1. Agregar soporte para versionado de propuestas comerciales
ALTER TABLE public.propuestas
  ADD COLUMN IF NOT EXISTS version int NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS propuesta_padre_id uuid REFERENCES public.propuestas(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS notas_version text;

-- 2. Índice para optimizar la consulta de árboles de versiones
CREATE INDEX IF NOT EXISTS idx_propuestas_padre ON public.propuestas(propuesta_padre_id);
