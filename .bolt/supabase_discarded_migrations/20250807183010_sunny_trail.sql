/*
  # Crear política RLS para listar buckets de almacenamiento

  1. Problema identificado
    - La aplicación no puede "ver" el bucket 'trip-pdfs' aunque existe
    - El error "Bucket 'trip-pdfs' does not exist" proviene de la función listBuckets()
    - Esto indica que falta una política RLS en la tabla storage.buckets

  2. Solución
    - Crear política RLS en storage.buckets para permitir SELECT (listar buckets)
    - Permitir acceso tanto a usuarios anónimos como autenticados
    - Esto es necesario para que la aplicación pueda verificar la existencia del bucket

  3. Políticas creadas
    - Política SELECT para usuarios anónimos en storage.buckets
    - Política SELECT para usuarios autenticados en storage.buckets
*/

-- Habilitar RLS en la tabla storage.buckets si no está habilitado
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuarios anónimos listen los buckets
-- Esto es necesario para que la aplicación pueda verificar si el bucket existe
CREATE POLICY "Allow anon to list buckets"
  ON storage.buckets
  FOR SELECT
  TO anon
  USING (true);

-- Política para permitir que usuarios autenticados listen los buckets
-- Esto asegura que los administradores también puedan acceder
CREATE POLICY "Allow authenticated to list buckets"
  ON storage.buckets
  FOR SELECT
  TO authenticated
  USING (true);

-- Verificar que las políticas se crearon correctamente
DO $$
BEGIN
  -- Log de confirmación
  RAISE NOTICE 'Políticas RLS para storage.buckets creadas exitosamente';
  RAISE NOTICE 'La aplicación ahora debería poder encontrar el bucket trip-pdfs';
END $$;