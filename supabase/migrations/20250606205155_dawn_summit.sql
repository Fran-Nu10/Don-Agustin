/*
  # Revertir políticas RLS de users a su estado original

  1. Cambios en políticas
    - Eliminar todas las políticas existentes de users
    - Restaurar las políticas originales que funcionaban correctamente
    - Usar auth.uid() en lugar de uid()

  2. Seguridad
    - Mantener RLS habilitado
    - Permitir acceso público para lectura
    - Permitir a usuarios autenticados gestionar sus propios datos
    - Permitir a owners gestionar todos los datos
*/

-- Deshabilitar RLS temporalmente para limpiar
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Eliminar TODAS las políticas existentes de users
DO $$ 
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'users' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON users';
    END LOOP;
END $$;

-- Re-habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Restaurar las políticas originales de users que funcionaban
CREATE POLICY "users_select_public"
  ON users
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "users_insert_own"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_owners_all"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.user_id = auth.uid() 
      AND u.role = 'owner'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.user_id = auth.uid() 
      AND u.role = 'owner'
    )
  );