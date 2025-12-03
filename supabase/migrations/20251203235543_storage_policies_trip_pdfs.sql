/*
  # Políticas RLS para el bucket trip-pdfs
  
  ## Descripción
  Configura las políticas de acceso para el bucket de almacenamiento 'trip-pdfs'
  que permite gestionar archivos PDF de cotizaciones de viajes.
  
  ## Políticas de Storage
  
  1. **Lectura Pública**
     - Permite que cualquier usuario (público) pueda ver y descargar PDFs
     - Necesario para que los clientes puedan acceder a sus cotizaciones
  
  2. **Subida de PDFs**
     - Solo usuarios autenticados pueden subir archivos PDF
     - Limitado al bucket 'trip-pdfs'
  
  3. **Eliminación de PDFs**
     - Solo usuarios autenticados pueden eliminar archivos PDF
     - Limitado al bucket 'trip-pdfs'
  
  4. **Actualización de PDFs**
     - Solo usuarios autenticados pueden actualizar/reemplazar archivos PDF
     - Limitado al bucket 'trip-pdfs'
  
  5. **Listar PDFs**
     - Usuarios autenticados pueden listar los archivos del bucket
     - Útil para la gestión administrativa de archivos
  
  ## Seguridad
  - Los archivos PDF son públicamente legibles (necesario para compartir con clientes)
  - Solo usuarios autenticados pueden subir, actualizar o eliminar archivos
  - Todas las operaciones de escritura verifican que el usuario esté autenticado
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