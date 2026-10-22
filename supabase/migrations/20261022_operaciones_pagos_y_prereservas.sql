-- ==============================================================================
-- Migración: Correlación Pagos-Sesiones Configurable, Fecha Propuesta (24h) y Pre-Reservas con Comprobante
-- Archivo: supabase/migrations/20261022_operaciones_pagos_y_prereservas.sql
-- ==============================================================================

-- 1. Agregar sesiones_primer_pago a clientes (configurable para esquemas de 2 pagos)
ALTER TABLE public.clientes
  ADD COLUMN IF NOT EXISTS sesiones_primer_pago integer DEFAULT NULL;

-- 2. Agregar soporte de 2do comprobante y bandera de revisión en ciclos_mensuales
ALTER TABLE public.ciclos_mensuales
  ADD COLUMN IF NOT EXISTS comprobante_2_url text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS comprobante_en_revision boolean DEFAULT false;

-- 3. Ampliar estados permitidos en producciones ('fecha_propuesta' y 'pre_reservada')
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'producciones_estado_check'
  ) THEN
    ALTER TABLE public.producciones DROP CONSTRAINT producciones_estado_check;
  END IF;
END $$;

ALTER TABLE public.producciones
  ADD CONSTRAINT producciones_estado_check
  CHECK (estado IN (
    'pendiente_agendamiento',
    'fecha_propuesta',
    'pre_reservada',
    'agendada',
    'rodaje_completado',
    'en_edicion',
    'finalizada'
  ));

-- 4. Actualizar onboard_cliente_atomic para incluir sesiones_primer_pago
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
  v_sesiones_p1 integer;
  v_prod_duracion integer;
  v_producciones_json jsonb;
  i integer;
BEGIN
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

  v_esquema := LOWER(COALESCE(p_cliente->>'esquema_pago', 'mensual'));
  IF v_esquema = 'quincenal' OR v_esquema = 'dos_pagos' THEN
    v_esquema := 'dos_pagos';
  ELSE
    v_esquema := 'mensual';
  END IF;

  v_tipo_sesion := LOWER(COALESCE(p_cliente->>'tipo_sesion_default', 'organica'));
  IF v_tipo_sesion NOT IN ('reels_batch', 'fotos', 'evento', 'hibrido', 'organica', 'profesional') THEN
    v_tipo_sesion := 'organica';
  END IF;

  v_total_sessions := GREATEST(0, COALESCE((p_cliente->>'producciones_por_mes')::integer, p_cant_producciones, 1));

  IF v_esquema = 'dos_pagos' AND v_total_sessions >= 2 THEN
    v_sesiones_p1 := COALESCE(
      NULLIF(p_cliente->>'sesiones_primer_pago', '')::integer,
      GREATEST(1, FLOOR(v_total_sessions / 2.0)::integer)
    );
    v_sesiones_p1 := LEAST(v_total_sessions - 1, GREATEST(1, v_sesiones_p1));
  ELSE
    v_sesiones_p1 := NULL;
  END IF;

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
    sesiones_primer_pago,
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
    v_total_sessions,
    v_sesiones_p1,
    v_tipo_sesion,
    NULLIF(TRIM(p_cliente->>'locacion_default'), ''),
    v_propuesta_id,
    NOW()
  )
  RETURNING * INTO v_cliente;

  IF p_lead_id IS NOT NULL THEN
    UPDATE public.leads
    SET status = 'cliente_activo'
    WHERE id = p_lead_id;
  END IF;

  v_mes := COALESCE(p_mes, EXTRACT(MONTH FROM CURRENT_DATE)::integer);
  v_anio := COALESCE(p_anio, EXTRACT(YEAR FROM CURRENT_DATE)::integer);

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

    FOR i IN 1..GREATEST(1, v_cliente.producciones_por_mes) LOOP
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

-- 5. Reemplazar confirmar_reserva_produccion_rpc para soportar:
--    a) sesiones_primer_pago configurable
--    b) confirmación de fecha propuesta por agencia ('fecha_propuesta')
--    c) pre-reserva temporal con comprobante subido ('pre_reservada')
DROP FUNCTION IF EXISTS public.confirmar_reserva_produccion_rpc(text, date, text, text);
DROP FUNCTION IF EXISTS public.confirmar_reserva_produccion_rpc(text, timestamptz, text, text, text);

CREATE OR REPLACE FUNCTION public.confirmar_reserva_produccion_rpc(
  p_token text,
  p_fecha timestamptz,
  p_locacion text DEFAULT NULL,
  p_notas text DEFAULT NULL,
  p_comprobante_url text DEFAULT NULL
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
  v_total_sesiones integer;
  v_max_primer_pago integer;
  v_pago_acreditado boolean := false;
  v_es_propuesta_agencia boolean := false;
  v_tiene_comprobante boolean := false;
  v_motivo_bloqueo text := NULL;
  v_locacion_final text;
  v_nuevo_estado text;
  v_prod_actualizada record;
  v_ciclo_actualizado record;
BEGIN
  IF p_token IS NULL OR TRIM(p_token) = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Token de reserva no proporcionado.');
  END IF;

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

  v_total_sesiones := GREATEST(1, COALESCE(v_cliente.producciones_por_mes, 1));
  v_max_primer_pago := COALESCE(
    v_cliente.sesiones_primer_pago,
    GREATEST(1, FLOOR(v_total_sesiones / 2.0)::integer)
  );

  -- Evaluar si el tramo de pago para esta sesión ya está acreditado
  IF v_cliente.esquema_pago = 'dos_pagos' AND v_total_sesiones >= 2 THEN
    IF v_prod.numero_sesion <= v_max_primer_pago THEN
      v_pago_acreditado := (v_ciclo.estado_pago IN ('primer_pago', 'pagado'));
      IF NOT v_pago_acreditado THEN
        v_motivo_bloqueo := 'esperando_primer_pago';
      END IF;
    ELSE
      v_pago_acreditado := (v_ciclo.estado_pago = 'pagado');
      IF NOT v_pago_acreditado THEN
        v_motivo_bloqueo := 'esperando_segundo_pago';
      END IF;
    END IF;
  ELSE
    v_pago_acreditado := (v_ciclo.estado_pago = 'pagado');
    IF NOT v_pago_acreditado THEN
      v_motivo_bloqueo := 'esperando_pago_completo';
    END IF;
  END IF;

  v_es_propuesta_agencia := (v_prod.estado = 'fecha_propuesta');
  v_tiene_comprobante := (p_comprobante_url IS NOT NULL AND TRIM(p_comprobante_url) <> '');

  -- Si el cliente adjuntó comprobante, registrarlo en el ciclo mensual
  IF v_tiene_comprobante THEN
    IF v_cliente.esquema_pago = 'dos_pagos' AND v_ciclo.estado_pago = 'primer_pago' THEN
      UPDATE public.ciclos_mensuales
      SET
        comprobante_2_url = TRIM(p_comprobante_url),
        comprobante_en_revision = true
      WHERE id = v_ciclo.id
      RETURNING * INTO v_ciclo_actualizado;
    ELSE
      UPDATE public.ciclos_mensuales
      SET
        comprobante_url = TRIM(p_comprobante_url),
        comprobante_en_revision = true
      WHERE id = v_ciclo.id
      RETURNING * INTO v_ciclo_actualizado;
    END IF;
    v_ciclo := v_ciclo_actualizado;
  END IF;

  -- Gatekeeper: Permitir si (1) pago acreditado, (2) fecha propuesta por agencia, o (3) adjuntó comprobante para pre-reserva
  IF NOT v_pago_acreditado AND NOT v_es_propuesta_agencia AND NOT v_tiene_comprobante THEN
    RETURN jsonb_build_object(
      'success', false,
      'motivo_bloqueo', v_motivo_bloqueo,
      'error', CASE
        WHEN v_motivo_bloqueo = 'esperando_segundo_pago'
          THEN 'Esta sesión corresponde a tu segundo corte operativo. Sube tu comprobante del segundo abono para pre-reservar tu fecha.'
        ELSE 'Para reservar tu fecha es necesario subir el comprobante de pago o contar con la validación de la agencia.'
      END
    );
  END IF;

  -- Determinar estado destino de la sesión
  IF v_pago_acreditado THEN
    v_nuevo_estado := 'agendada';
  ELSIF v_tiene_comprobante THEN
    v_nuevo_estado := 'pre_reservada';
  ELSIF v_es_propuesta_agencia THEN
    v_nuevo_estado := 'agendada';
  ELSE
    v_nuevo_estado := 'pre_reservada';
  END IF;

  v_locacion_final := COALESCE(NULLIF(TRIM(p_locacion), ''), v_cliente.locacion_default, v_prod.locacion, '');

  UPDATE public.producciones
  SET
    fecha_produccion = COALESCE(p_fecha, v_prod.fecha_produccion),
    locacion = v_locacion_final,
    notas_brief = COALESCE(p_notas, v_prod.notas_brief, ''),
    estado = v_nuevo_estado
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
