-- ==============================================================================
-- Migración: Fase 3 - RLS para Auto-Reserva Pública de Producciones por Token
-- Archivo: supabase/migrations/20261012_rls_reserva_producciones.sql
-- ==============================================================================

-- 1. Permitir actualización pública sobre producciones cuando se tiene el token_reserva
DROP POLICY IF EXISTS "Actualizacion publica producciones por token" ON public.producciones;
CREATE POLICY "Actualizacion publica producciones por token" ON public.producciones
  FOR UPDATE TO anon
  USING (token_reserva IS NOT NULL)
  WITH CHECK (token_reserva IS NOT NULL);

-- 2. Permitir lectura pública de ciclos_mensuales vinculados a una producción válida
DROP POLICY IF EXISTS "Lectura publica ciclos por produccion" ON public.ciclos_mensuales;
CREATE POLICY "Lectura publica ciclos por produccion" ON public.ciclos_mensuales
  FOR SELECT TO anon
  USING (
    EXISTS (
      SELECT 1 FROM public.producciones
      WHERE public.producciones.ciclo_id = public.ciclos_mensuales.id
      AND public.producciones.token_reserva IS NOT NULL
    )
  );

-- 3. Permitir lectura pública de clientes vinculados a una producción válida
DROP POLICY IF EXISTS "Lectura publica clientes por produccion" ON public.clientes;
CREATE POLICY "Lectura publica clientes por produccion" ON public.clientes
  FOR SELECT TO anon
  USING (
    EXISTS (
      SELECT 1 FROM public.producciones
      WHERE public.producciones.cliente_id = public.clientes.id
      AND public.producciones.token_reserva IS NOT NULL
    )
  );
