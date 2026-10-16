-- Tabla de configuraciones globales de la agencia (Key-Value con JSONB)
CREATE TABLE IF NOT EXISTS configuraciones (
  clave text PRIMARY KEY,
  valor jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE configuraciones ENABLE ROW LEVEL SECURITY;

-- Admins gestionan configuraciones
CREATE POLICY "Admins gestionan configuraciones"
ON configuraciones FOR ALL
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Lectura pública para valores necesarios en vistas de clientes (como datos bancarios)
CREATE POLICY "Lectura publica configuraciones publicas"
ON configuraciones FOR SELECT
TO anon
USING (clave IN ('datos_bancarios'));

-- Insertar valores base iniciales
INSERT INTO configuraciones (clave, valor)
VALUES (
  'datos_bancarios',
  '{"banco": "BBVA México", "beneficiario": "The Formulabs", "clabe": "012345678901234567", "concepto_default": "Servicio de Contenido"}'::jsonb
)
ON CONFLICT (clave) DO NOTHING;
