-- ==============================================================================
-- Migración de Seguridad: Restricción de Políticas RLS para Acceso Anónimo (anon)
-- Archivo: supabase/migrations/20261011_reforzar_seguridad_rls.sql
-- ==============================================================================

-- 1. Restringir lectura anónima sobre clientes
-- Evita el scraping masivo de clientes. Anon solo puede ver clientes asociados a calendarios existentes.
DROP POLICY IF EXISTS "Lectura publica clientes" ON public.clientes;

CREATE POLICY "Lectura publica restringida clientes" ON public.clientes
FOR SELECT TO anon
USING (
  EXISTS (
    SELECT 1 FROM public.calendarios
    WHERE public.calendarios.cliente_id = public.clientes.id
  )
);

-- 2. Restringir lectura anónima sobre propuestas
-- Las propuestas privadas con token quedan bloqueadas para consultas anónimas directas en Supabase.
-- Deben consultarse a través de /api/proposal?slug=...&token=... que valida el token en el servidor.
DROP POLICY IF EXISTS "Lectura pública por slug" ON public.propuestas;

CREATE POLICY "Lectura publica propuestas no privadas" ON public.propuestas
FOR SELECT TO anon
USING (
  (contenido->>'token') IS NULL OR (contenido->>'token') = ''
);
