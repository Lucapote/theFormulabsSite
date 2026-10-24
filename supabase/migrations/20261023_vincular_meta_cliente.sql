-- Migración: Función atómica para vincular credenciales de Meta Graph API a clientes
-- Permite actualizar de forma segura fb_page_id, fb_page_access_token e ig_business_account_id

CREATE OR REPLACE FUNCTION public.vincular_meta_cliente_atomic(
  p_cliente_id uuid,
  p_fb_page_id text,
  p_fb_page_access_token text,
  p_ig_business_account_id text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cliente record;
BEGIN
  -- Validar que el cliente exista
  SELECT * INTO v_cliente FROM public.clientes WHERE id = p_cliente_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cliente no encontrado.');
  END IF;

  -- Actualizar credenciales y activar auto_publish_enabled
  UPDATE public.clientes
  SET
    fb_page_id = TRIM(p_fb_page_id),
    fb_page_access_token = TRIM(p_fb_page_access_token),
    ig_business_account_id = CASE 
      WHEN p_ig_business_account_id IS NOT NULL AND TRIM(p_ig_business_account_id) != '' 
      THEN TRIM(p_ig_business_account_id) 
      ELSE NULL 
    END,
    auto_publish_enabled = true,
    updated_at = now()
  WHERE id = p_cliente_id;

  RETURN jsonb_build_object(
    'success', true,
    'cliente_id', p_cliente_id,
    'fb_page_id', TRIM(p_fb_page_id),
    'ig_business_account_id', p_ig_business_account_id
  );
END;
$$;
