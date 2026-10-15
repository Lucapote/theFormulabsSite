-- ==============================================================================
-- Migración: Soporte para 'primer_pago' en estado_pago de ciclos_mensuales
-- Archivo: supabase/migrations/20261015_estado_pago_primer_abono.sql
-- ==============================================================================

-- 1. Eliminar la restricción check previa que limitaba a 'pendiente', 'pagado', 'vencido'
ALTER TABLE public.ciclos_mensuales
  DROP CONSTRAINT IF EXISTS ciclos_mensuales_estado_pago_check;

-- 2. Agregar la nueva restricción check que incluye 'primer_pago' para esquemas de 2 cortes/pagos
ALTER TABLE public.ciclos_mensuales
  ADD CONSTRAINT ciclos_mensuales_estado_pago_check
  CHECK (estado_pago IN ('pendiente', 'primer_pago', 'pagado', 'vencido'));
