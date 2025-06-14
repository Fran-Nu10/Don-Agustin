/*
  # Agregar campo PDF a viajes

  1. Cambios en la tabla trips
    - Agregar columna `info_pdf_url` para almacenar la URL del PDF informativo
    - Agregar columna `info_pdf_name` para almacenar el nombre original del archivo

  2. Seguridad
    - Los campos son opcionales (nullable)
    - Solo los administradores pueden subir PDFs
*/

-- Agregar columnas para PDF informativo
ALTER TABLE trips 
ADD COLUMN IF NOT EXISTS info_pdf_url text,
ADD COLUMN IF NOT EXISTS info_pdf_name text;

-- Agregar comentarios para documentar los campos
COMMENT ON COLUMN trips.info_pdf_url IS 'URL del PDF con información adicional del viaje';
COMMENT ON COLUMN trips.info_pdf_name IS 'Nombre original del archivo PDF';