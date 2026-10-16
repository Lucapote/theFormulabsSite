-- Migration: 20261015_phase1_atomic_integrity_and_rls.sql
-- Description: Implementa Fase 1 de GEMINI.md (Atomicidad en mutaciones, normalización de contratos y endurecimiento de RLS)

-- 1. Normalización del contrato esquema_pago en tabla clientes
UPDATE public.clientes 
SET esquema_pago = 'dos_pagos' 
WHERE esquema_pago = 'quincenal';

ALTER TABLE public.clientes 
DROP CONSTRAINT IF EXISTS clientes_esquema_pago_check;

ALTER TABLE public.clientes 
ADD CONSTRAINT clientes_esquema_pago_check 
CHECK (esquema_pago IN ('mensual', 'dos_pagos'));

-- 2. Función RPC Atómica para Onboarding de Cliente y Ciclo Inicial
CREATE OR REPLACE FUNCTION public.onboard_cliente_atomic(
  p_cliente jsonb,
  p_cant_producciones integer DEFAULT 1,
  p_monto numeric DEFAULT 0,
  p_mes integer DEFAULT NULL,
  p_anio integer DEFAULT NULL,
  p_lead_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  v_cliente record;
  v_ciclo record;
  v_propuesta_id uuid;
  v_existing_client record;
  v_mes integer;
  v_anio integer;
  v_esquema text;
  v_tipo_sesion text;
  v_total_sessions integer;
  v_prod_duracion integer;
  v_producciones_json jsonb;
  i integer;
BEGIN
  -- 2.1 Validar si ya existe un cliente con esta propuesta
  IF p_cliente->>'propuesta_origen_id' IS NOT NULL AND p_cliente->>'propuesta_origen_id' <> '' THEN
    v_propuesta_id := (p_cliente->>'propuesta_origen_id')::uuid;
    SELECT id, nombre INTO v_existing_client 
    FROM public.clientes 
    WHERE propuesta_origen_id = v_propuesta_id 
    LIMIT 1;

    IF v_existing_client.id IS NOT NULL THEN
      RETURN jsonb_build_object(
        'success', false,
        'already_converted', true,
        'cliente', row_to_json(v_existing_client),
        'error', 'Esta propuesta ya fue convertida previamente en el cliente "' || v_existing_client.nombre || '".'
      );
    END IF;
  END IF;

  -- 2.2 Normalizar esquema de pago ('dos_pagos' o 'mensual')
  v_esquema := LOWER(COALESCE(p_cliente->>'esquema_pago', 'mensual'));
  IF v_esquema = 'quincenal' OR v_esquema = 'dos_pagos' THEN
    v_esquema := 'dos_pagos';
  ELSE
    v_esquema := 'mensual';
  END IF;

  -- 2.3 Normalizar tipo de sesión default contra el check producciones_tipo_check
  v_tipo_sesion := LOWER(COALESCE(p_cliente->>'tipo_sesion_default', 'organica'));
  IF v_tipo_sesion NOT IN ('reels_batch', 'fotos', 'evento', 'hibrido', 'organica', 'profesional') THEN
    v_tipo_sesion := 'organica';
  END IF;

  -- 2.4 Inserción atómica en clientes
  INSERT INTO public.clientes (
    nombre,
    empresa,
    email,
    activo,
    permite_descarga,
    monto_retainer,
    esquema_pago,
    dia_corte_pago,
    dia_corte_pago_2,
    producciones_por_mes,
    tipo_sesion_default,
    locacion_default,
    propuesta_origen_id,
    created_at
  ) VALUES (
    TRIM(COALESCE(p_cliente->>'nombre', 'Nuevo Cliente')),
    TRIM(COALESCE(p_cliente->>'empresa', p_cliente->>'nombre', 'Nuevo Cliente')),
    NULLIF(TRIM(p_cliente->>'email'), ''),
    COALESCE((p_cliente->>'activo')::boolean, true),
    COALESCE((p_cliente->>'permite_descarga')::boolean, false),
    GREATEST(0, COALESCE((p_cliente->>'monto_retainer')::numeric, p_monto, 0)),
    v_esquema,
    LEAST(31, GREATEST(1, COALESCE((p_cliente->>'dia_corte_pago')::integer, 1))),
    CASE WHEN v_esquema = 'dos_pagos' 
      THEN LEAST(31, GREATEST(1, COALESCE((p_cliente->>'dia_corte_pago_2')::integer, 15))) 
      ELSE NULL 
    END,
    GREATEST(0, COALESCE((p_cliente->>'producciones_por_mes')::integer, p_cant_producciones, 1)),
    v_tipo_sesion,
    NULLIF(TRIM(p_cliente->>'locacion_default'), ''),
    v_propuesta_id,
    NOW()
  )
  RETURNING * INTO v_cliente;

  -- 2.5 Si proviene de un lead, actualizar su status a cliente_activo
  IF p_lead_id IS NOT NULL THEN
    UPDATE public.leads 
    SET status = 'cliente_activo' 
    WHERE id = p_lead_id;
  END IF;

  -- 2.6 Inicializar ciclo mensual y producciones si aplica
  v_mes := COALESCE(p_mes, EXTRACT(MONTH FROM CURRENT_DATE)::integer);
  v_anio := COALESCE(p_anio, EXTRACT(YEAR FROM CURRENT_DATE)::integer);
  v_total_sessions := GREATEST(1, v_cliente.producciones_por_mes);

  IF v_cliente.monto_retainer > 0 OR v_cliente.producciones_por_mes > 0 THEN
    INSERT INTO public.ciclos_mensuales (
      cliente_id,
      mes,
      anio,
      monto_cobrado,
      costo_operativo,
      estado_pago,
      created_at
    ) VALUES (
      v_cliente.id,
      v_mes,
      v_anio,
      v_cliente.monto_retainer,
      0,
      'pendiente',
      NOW()
    )
    RETURNING * INTO v_ciclo;

    v_prod_duracion := CASE WHEN v_cliente.tipo_sesion_default = 'profesional' THEN 6 ELSE 4 END;

    FOR i IN 1..v_total_sessions LOOP
      INSERT INTO public.producciones (
        cliente_id,
        ciclo_id,
        numero_sesion,
        tipo,
        duracion_horas,
        locacion,
        estado,
        token_reserva,
        created_at
      ) VALUES (
        v_cliente.id,
        v_ciclo.id,
        i,
        v_cliente.tipo_sesion_default,
        v_prod_duracion,
        v_cliente.locacion_default,
        'pendiente_agendamiento',
        encode(extensions.gen_random_bytes(12), 'hex'),
        NOW()
      );
    END LOOP;

    SELECT json_agg(row_to_json(p)) INTO v_producciones_json 
    FROM public.producciones p 
    WHERE p.ciclo_id = v_ciclo.id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'cliente', row_to_json(v_cliente),
    'ciclo', CASE WHEN v_ciclo.id IS NOT NULL THEN row_to_json(v_ciclo) ELSE NULL END,
    'producciones', COALESCE(v_producciones_json, '[]'::jsonb)
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- 3. Función RPC Atómica para asegurar Ciclo Mensual (ensure_ciclo_actual_atomic)
CREATE OR REPLACE FUNCTION public.ensure_ciclo_actual_atomic(
  p_cliente_id uuid,
  p_mes integer DEFAULT NULL,
  p_anio integer DEFAULT NULL,
  p_monto_default numeric DEFAULT 0,
  p_cant_producciones integer DEFAULT 1,
  p_tipo_sesion text DEFAULT 'organica',
  p_locacion_default text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  v_existing_ciclo record;
  v_cliente record;
  v_nuevo_ciclo record;
  v_target_mes integer;
  v_target_anio integer;
  v_total_sessions integer;
  v_final_tipo text;
  v_final_locacion text;
  v_prod_duracion integer;
  v_producciones_json jsonb;
  i integer;
BEGIN
  v_target_mes := COALESCE(p_mes, EXTRACT(MONTH FROM CURRENT_DATE)::integer);
  v_target_anio := COALESCE(p_anio, EXTRACT(YEAR FROM CURRENT_DATE)::integer);

  -- 3.1 Verificar si el ciclo ya existe
  SELECT * INTO v_existing_ciclo 
  FROM public.ciclos_mensuales 
  WHERE cliente_id = p_cliente_id AND mes = v_target_mes AND anio = v_target_anio 
  LIMIT 1;

  IF v_existing_ciclo.id IS NOT NULL THEN
    SELECT json_agg(row_to_json(p)) INTO v_producciones_json 
    FROM public.producciones p 
    WHERE p.ciclo_id = v_existing_ciclo.id;

    RETURN jsonb_build_object(
      'success', true,
      'is_new', false,
      'ciclo', row_to_json(v_existing_ciclo),
      'producciones', COALESCE(v_producciones_json, '[]'::jsonb)
    );
  END IF;

  -- 3.2 Obtener defaults del cliente
  SELECT * INTO v_cliente 
  FROM public.clientes 
  WHERE id = p_cliente_id 
  LIMIT 1;

  IF v_cliente.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cliente no encontrado');
  END IF;

  v_final_locacion := COALESCE(NULLIF(TRIM(p_locacion_default), ''), v_cliente.locacion_default);
  v_final_tipo := LOWER(COALESCE(p_tipo_sesion, v_cliente.tipo_sesion_default, 'organica'));
  IF v_final_tipo NOT IN ('reels_batch', 'fotos', 'evento', 'hibrido', 'organica', 'profesional') THEN
    v_final_tipo := 'organica';
  END IF;
  v_total_sessions := GREATEST(1, COALESCE(p_cant_producciones, v_cliente.producciones_por_mes, 1));

  -- 3.3 Crear ciclo y producciones atómicamente
  INSERT INTO public.ciclos_mensuales (
    cliente_id,
    mes,
    anio,
    monto_cobrado,
    costo_operativo,
    estado_pago,
    created_at
  ) VALUES (
    p_cliente_id,
    v_target_mes,
    v_target_anio,
    GREATEST(0, COALESCE(p_monto_default, v_cliente.monto_retainer, 0)),
    0,
    'pendiente',
    NOW()
  )
  RETURNING * INTO v_nuevo_ciclo;

  v_prod_duracion := CASE WHEN v_final_tipo = 'profesional' THEN 6 ELSE 4 END;

  FOR i IN 1..v_total_sessions LOOP
    INSERT INTO public.producciones (
      cliente_id,
      ciclo_id,
      numero_sesion,
      tipo,
      duracion_horas,
      locacion,
      estado,
      token_reserva,
      created_at
    ) VALUES (
      p_cliente_id,
      v_nuevo_ciclo.id,
      i,
      v_final_tipo,
      v_prod_duracion,
      v_final_locacion,
      'pendiente_agendamiento',
      encode(extensions.gen_random_bytes(12), 'hex'),
      NOW()
    );
  END LOOP;

  SELECT json_agg(row_to_json(p)) INTO v_producciones_json 
  FROM public.producciones p 
  WHERE p.ciclo_id = v_nuevo_ciclo.id;

  RETURN jsonb_build_object(
    'success', true,
    'is_new', true,
    'ciclo', row_to_json(v_nuevo_ciclo),
    'producciones', COALESCE(v_producciones_json, '[]'::jsonb)
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- 4. Función RPC Atómica para Confirmar Auto-Reserva con Gatekeeper
CREATE OR REPLACE FUNCTION public.confirmar_reserva_produccion_rpc(
  p_token text,
  p_fecha date,
  p_locacion text DEFAULT NULL,
  p_notas text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_prod record;
  v_ciclo record;
  v_cliente record;
  v_desbloqueada boolean := false;
  v_motivo_bloqueo text := NULL;
  v_locacion_final text;
  v_prod_actualizada record;
BEGIN
  IF p_token IS NULL OR TRIM(p_token) = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Token de reserva no proporcionado.');
  END IF;

  -- 4.1 Buscar producción por token
  SELECT * INTO v_prod 
  FROM public.producciones 
  WHERE token_reserva = TRIM(p_token) 
  LIMIT 1;

  IF v_prod.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'La sesión no existe o el enlace es inválido.');
  END IF;

  SELECT * INTO v_ciclo 
  FROM public.ciclos_mensuales 
  WHERE id = v_prod.ciclo_id;

  SELECT * INTO v_cliente 
  FROM public.clientes 
  WHERE id = v_prod.cliente_id;

  -- 4.2 Gatekeeper: Regla de desbloqueo condicional
  IF v_cliente.esquema_pago = 'dos_pagos' AND COALESCE(v_cliente.producciones_por_mes, 1) >= 2 THEN
    IF v_prod.numero_sesion = 1 THEN
      v_desbloqueada := (v_ciclo.estado_pago = 'primer_pago' OR v_ciclo.estado_pago = 'pagado');
      IF NOT v_desbloqueada THEN
        v_motivo_bloqueo := 'esperando_primer_pago';
      END IF;
    ELSE
      v_desbloqueada := (v_ciclo.estado_pago = 'pagado');
      IF NOT v_desbloqueada THEN
        v_motivo_bloqueo := 'esperando_segundo_pago';
      END IF;
    END IF;
  ELSE
    v_desbloqueada := (v_ciclo.estado_pago = 'pagado');
    IF NOT v_desbloqueada THEN
      v_motivo_bloqueo := 'esperando_pago_completo';
    END IF;
  END IF;

  IF NOT v_desbloqueada THEN
    RETURN jsonb_build_object(
      'success', false,
      'motivo_bloqueo', v_motivo_bloqueo,
      'error', CASE 
        WHEN v_motivo_bloqueo = 'esperando_segundo_pago' 
          THEN 'Esta sesión corresponde a tu segundo corte operativo. Se desbloqueará de inmediato al validar el segundo abono del mes.'
        ELSE 'La reserva se encuentra bloqueada. El pago del ciclo aún no ha sido confirmado por la agencia.'
      END
    );
  END IF;

  -- 4.3 Actualizar producción de forma segura
  v_locacion_final := COALESCE(NULLIF(TRIM(p_locacion), ''), v_cliente.locacion_default, v_prod.locacion, '');

  UPDATE public.producciones
  SET 
    fecha_produccion = p_fecha,
    locacion = v_locacion_final,
    notas_brief = COALESCE(p_notas, ''),
    estado = 'agendada'
  WHERE id = v_prod.id
  RETURNING * INTO v_prod_actualizada;

  RETURN jsonb_build_object(
    'success', true,
    'produccion', row_to_json(v_prod_actualizada),
    'cliente', row_to_json(v_cliente),
    'ciclo', row_to_json(v_ciclo)
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- 5. Endurecimiento de Políticas RLS
-- Eliminar la política UPDATE anon permisiva en producciones
DROP POLICY IF EXISTS "Actualizacion publica producciones por token" ON public.producciones;

-- La actualización pública de producciones ahora se ejecuta exclusivamente a través de confirmar_reserva_produccion_rpc (SECURITY DEFINER)
-- Los administradores siguen teniendo acceso ALL completo
