-- Migración: Integración de credenciales de Meta Graph API en clientes
-- Fecha: Octubre 2026

-- 1. Agregamos las columnas opcionales a la tabla 'clientes'
ALTER TABLE clientes 
ADD COLUMN IF NOT EXISTS fb_page_id text,
ADD COLUMN IF NOT EXISTS fb_page_access_token text,
ADD COLUMN IF NOT EXISTS ig_business_account_id text,
ADD COLUMN IF NOT EXISTS auto_publish_enabled boolean DEFAULT false;

-- 2. Documentación interna (Data Dictionary)
COMMENT ON COLUMN clientes.fb_page_id IS 'ID numérico de la Fanpage de Facebook vinculada al cliente.';
COMMENT ON COLUMN clientes.fb_page_access_token IS 'User Access Token o Page Access Token permanente para autenticar la Graph API.';
COMMENT ON COLUMN clientes.ig_business_account_id IS 'ID numérico de la cuenta de Instagram Business o Creador asociada a la página.';
COMMENT ON COLUMN clientes.auto_publish_enabled IS 'Bandera de seguridad: true permite que el cron job publique automáticamente, false pausa la integración.';
