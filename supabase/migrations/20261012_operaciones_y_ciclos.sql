-- ==============================================================================
-- Migración: Fase 1 - Operaciones, Retainers y Producciones
-- Archivo: supabase/migrations/20261012_operaciones_y_ciclos.sql
-- ==============================================================================

-- 1. Alterar tabla clientes con campos de operación y retainer
ALTER TABLE public.clientes
  ADD COLUMN IF NOT EXISTS monto_retainer numeric(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS dia_corte_pago int DEFAULT 1,
  ADD COLUMN IF NOT EXISTS producciones_por_mes int DEFAULT 1,
  ADD COLUMN IF NOT EXISTS propuesta_origen_id uuid REFERENCES public.propuestas(id) ON DELETE SET NULL;

-- 2. Crear tabla ciclos_mensuales
CREATE TABLE IF NOT EXISTS public.ciclos_mensuales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  mes int NOT NULL,
  anio int NOT NULL,
  calendario_id uuid REFERENCES public.calendarios(id) ON DELETE SET NULL,
  monto_cobrado numeric(10,2) NOT NULL DEFAULT 0,
  costo_operativo numeric(10,2) NOT NULL DEFAULT 0,
  estado_pago text NOT NULL DEFAULT 'pendiente' CHECK (estado_pago IN ('pendiente', 'pagado', 'vencido')),
  fecha_pago date,
  comprobante_url text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT uq_ciclo_cliente_mes_anio UNIQUE (cliente_id, mes, anio)
);

-- 3. Crear tabla producciones
CREATE TABLE IF NOT EXISTS public.producciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  ciclo_id uuid NOT NULL REFERENCES public.ciclos_mensuales(id) ON DELETE CASCADE,
  numero_sesion int NOT NULL DEFAULT 1,
  tipo text NOT NULL DEFAULT 'reels_batch' CHECK (tipo IN ('reels_batch', 'fotos', 'evento', 'hibrido')),
  estado text NOT NULL DEFAULT 'pendiente_agendamiento' CHECK (estado IN ('pendiente_agendamiento', 'agendada', 'rodaje_completado', 'en_edicion', 'finalizada')),
  fecha_produccion timestamptz,
  locacion text,
  notas_brief text,
  token_reserva text UNIQUE DEFAULT encode(gen_random_bytes(12), 'hex'),
  created_at timestamptz DEFAULT now()
);

-- Índices de consulta frecuente
CREATE INDEX IF NOT EXISTS idx_ciclos_periodo ON public.ciclos_mensuales (anio, mes);
CREATE INDEX IF NOT EXISTS idx_ciclos_cliente ON public.ciclos_mensuales (cliente_id);
CREATE INDEX IF NOT EXISTS idx_producciones_ciclo ON public.producciones (ciclo_id);
CREATE INDEX IF NOT EXISTS idx_producciones_cliente ON public.producciones (cliente_id);
CREATE INDEX IF NOT EXISTS idx_producciones_token ON public.producciones (token_reserva);

-- 4. Habilitar y configurar Row Level Security (RLS)
ALTER TABLE public.ciclos_mensuales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.producciones ENABLE ROW LEVEL SECURITY;

-- Políticas para ciclos_mensuales
DROP POLICY IF EXISTS "Admins gestionan ciclos_mensuales" ON public.ciclos_mensuales;
CREATE POLICY "Admins gestionan ciclos_mensuales" ON public.ciclos_mensuales
  FOR ALL TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Políticas para producciones
DROP POLICY IF EXISTS "Admins gestionan producciones" ON public.producciones;
CREATE POLICY "Admins gestionan producciones" ON public.producciones
  FOR ALL TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Lectura publica producciones por token" ON public.producciones;
CREATE POLICY "Lectura publica producciones por token" ON public.producciones
  FOR SELECT TO anon
  USING (token_reserva IS NOT NULL);
