/*
  # Crear tabla de cotizaciones

  1. Nueva tabla
    - `quotations`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text)
      - `phone` (text)
      - `destination` (text)
      - `departure_date` (date)
      - `return_date` (date)
      - `department` (text)
      - `flexible_dates` (boolean)
      - `adults` (integer)
      - `children` (integer)
      - `observations` (text)
      - `status` (text) - 'pending', 'processing', 'quoted', 'closed'
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Seguridad
    - Habilitar RLS
    - Permitir inserción pública
    - Solo admins pueden ver y gestionar cotizaciones
*/

-- Crear tabla de cotizaciones
CREATE TABLE IF NOT EXISTS quotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  destination text,
  departure_date date,
  return_date date,
  department text,
  flexible_dates boolean DEFAULT false,
  adults integer DEFAULT 1,
  children integer DEFAULT 0,
  observations text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'quoted', 'closed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;

-- Política para que el público pueda crear cotizaciones
CREATE POLICY "Public can create quotations"
  ON quotations
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Política para que solo admins puedan ver todas las cotizaciones
CREATE POLICY "Admins can view all quotations"
  ON quotations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.user_id = auth.uid() 
      AND u.role IN ('owner', 'employee')
    )
  );

-- Política para que solo admins puedan actualizar cotizaciones
CREATE POLICY "Admins can update quotations"
  ON quotations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.user_id = auth.uid() 
      AND u.role IN ('owner', 'employee')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.user_id = auth.uid() 
      AND u.role IN ('owner', 'employee')
    )
  );

-- Política para que solo admins puedan eliminar cotizaciones
CREATE POLICY "Admins can delete quotations"
  ON quotations
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.user_id = auth.uid() 
      AND u.role IN ('owner', 'employee')
    )
  );

-- Trigger para actualizar updated_at
CREATE TRIGGER update_quotations_updated_at
  BEFORE UPDATE ON quotations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();