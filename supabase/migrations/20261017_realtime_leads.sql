-- Asegurar que la tabla leads esté incluida en la publicación de Realtime de Supabase
ALTER PUBLICATION supabase_realtime ADD TABLE leads;

-- Garantizar que los payloads de realtime incluyan la fila completa en inserciones y actualizaciones
ALTER TABLE leads REPLICA IDENTITY FULL;
