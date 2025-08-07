/*
  # Políticas RLS para el bucket trip-pdfs

  1. Políticas de Storage
    - Permitir lectura pública de archivos PDF
    - Permitir subida de PDFs para usuarios autenticados
    - Permitir eliminación de PDFs para usuarios autenticados
    - Permitir actualización de PDFs para usuarios autenticados

  2. Seguridad
    - Los archivos PDF son públicamente legibles (necesario para que los clientes puedan ver/descargar)
    - Solo usuarios autenticados pueden subir, actualizar o eliminar archivos
    - Las políticas están específicamente limitadas al bucket 'trip-pdfs'
*/

-- Política para permitir lectura pública de archivos PDF
CREATE POLICY "Allow public read access to trip PDFs"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'trip-pdfs');

-- Política para permitir subida de PDFs a usuarios autenticados
CREATE POLICY "Allow authenticated users to upload trip PDFs"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'trip-pdfs' 
    AND auth.uid() IS NOT NULL
  );

-- Política para permitir eliminación de PDFs a usuarios autenticados
CREATE POLICY "Allow authenticated users to delete trip PDFs"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'trip-pdfs' 
    AND auth.uid() IS NOT NULL
  );

-- Política para permitir actualización de PDFs a usuarios autenticados
CREATE POLICY "Allow authenticated users to update trip PDFs"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'trip-pdfs' 
    AND auth.uid() IS NOT NULL
  )
  WITH CHECK (
    bucket_id = 'trip-pdfs' 
    AND auth.uid() IS NOT NULL
  );

-- Política adicional para permitir que usuarios autenticados listen los objetos del bucket
CREATE POLICY "Allow authenticated users to list trip PDFs"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'trip-pdfs');