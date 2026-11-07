-- Migration: 20261106_requerimientos_produccion_checklist.sql
-- Descripción: Agrega soporte para requerimientos tipo checklist personalizados por sesión de producción
-- y función RPC segura para que el cliente actualice el estado de los requerimientos mediante su token.

-- 1. Agregar columna requerimientos (JSONB) en la tabla producciones
ALTER TABLE public.producciones
ADD COLUMN IF NOT EXISTS requerimientos jsonb DEFAULT '[]'::jsonb;

-- 2. Función RPC para actualizar el checklist de requerimientos usando el token de reserva
CREATE OR REPLACE FUNCTION public.actualizar_checklist_produccion_rpc(
  p_token text,
  p_requerimientos jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_prod_id uuid;
  v_result jsonb;
BEGIN
  -- Validar parámetro de token
  IF p_token IS NULL OR trim(p_token) = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Token de reserva inválido.');
  END IF;

  -- Buscar la sesión asociada al token
  SELECT id INTO v_prod_id
  FROM public.producciones
  WHERE token_reserva = trim(p_token);

  IF v_prod_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Sesión de producción no encontrada.');
  END IF;

  -- Asegurar formato jsonb array
  IF p_requerimientos IS NULL OR jsonb_typeof(p_requerimientos) != 'array' THEN
    p_requerimientos := '[]'::jsonb;
  END IF;

  -- Actualizar columna requerimientos
  UPDATE public.producciones
  SET requerimientos = p_requerimientos
  WHERE id = v_prod_id;

  RETURN jsonb_build_object(
    'success', true,
    'produccion_id', v_prod_id,
    'requerimientos', p_requerimientos
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Otorgar permiso de ejecución al rol anónimo y autenticado
GRANT EXECUTE ON FUNCTION public.actualizar_checklist_produccion_rpc(text, jsonb) TO anon, authenticated, service_role;

