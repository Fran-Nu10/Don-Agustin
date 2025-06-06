/*
  # Revertir políticas RLS de users a su estado original

  1. Cambios
    - Eliminar todas las políticas actuales de users
    - Restaurar las políticas originales que permitían el login
    - Mantener las políticas de blog funcionando sin depender de joins complejos

  2. Seguridad
    - Restaurar acceso de autenticación
    - Mantener restricciones apropiadas para roles
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
  WITH CHECK (uid() = user_id);

CREATE POLICY "users_update_own"
  ON users
  FOR UPDATE
  TO authenticated
  USING (uid() = user_id)
  WITH CHECK (uid() = user_id);

CREATE POLICY "users_owners_all"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.user_id = uid() 
      AND u.role = 'owner'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.user_id = uid() 
      AND u.role = 'owner'
    )
  );