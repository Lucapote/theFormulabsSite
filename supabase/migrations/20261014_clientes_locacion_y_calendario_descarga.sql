-- ==============================================================================
-- Migración: FASE 1 - Core de Gestión de Clientes, Locaciones y Flexibilidad de Descargas
-- Archivo: supabase/migrations/20261014_clientes_locacion_y_calendario_descarga.sql
-- ==============================================================================

-- 1. Agregar locación base de grabación al cliente (dirección física o URL de Maps)
ALTER TABLE public.clientes
  ADD COLUMN IF NOT EXISTS locacion_default text;

-- 2. Permitir anulación o especificación de descarga por calendario
-- Si es NULL: hereda cliente.permite_descarga
-- Si es true/false: sobreescribe el permiso exclusivamente para ese calendario
ALTER TABLE public.calendarios
  ADD COLUMN IF NOT EXISTS permite_descarga boolean DEFAULT NULL;
