/*
  # Crear tabla de clientes para CRM

  1. Nueva tabla
    - `clients`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text)
      - `phone` (text)
      - `message` (text)
      - `status` (text) - 'nuevo', 'en_proceso', 'cerrado'
      - `internal_notes` (text)
      - `scheduled_date` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Seguridad
    - Habilitar RLS
    - Solo admins pueden ver y gestionar clientes
    - Público puede crear nuevos clientes (formulario de contacto)
*/

-- Crear tabla de clientes
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text,
  status text NOT NULL DEFAULT 'nuevo' CHECK (status IN ('nuevo', 'en_proceso', 'cerrado')),
  internal_notes text,
  scheduled_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Política para que el público pueda crear clientes (formulario de contacto)
CREATE POLICY "Public can create clients"
  ON clients
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Política para que solo admins puedan ver todos los clientes
CREATE POLICY "Admins can view all clients"
  ON clients
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.user_id = auth.uid() 
      AND u.role IN ('owner', 'employee')
    )
  );

-- Política para que solo admins puedan actualizar clientes
CREATE POLICY "Admins can update clients"
  ON clients
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

-- Política para que solo admins puedan eliminar clientes
CREATE POLICY "Admins can delete clients"
  ON clients
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.user_id = auth.uid() 
      AND u.role IN ('owner', 'employee')
    )
  );

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insertar algunos datos de ejemplo
INSERT INTO clients (name, email, phone, message, status, scheduled_date) VALUES
  ('Juan Pérez', 'juan.perez@email.com', '+598 99 123 456', 'Interesado en viaje a Europa para julio', 'nuevo', '2024-06-15 10:00:00'),
  ('María González', 'maria.gonzalez@email.com', '+598 98 765 432', 'Consulta sobre viajes familiares a Brasil', 'en_proceso', '2024-06-16 14:30:00'),
  ('Carlos Rodríguez', 'carlos.rodriguez@email.com', '+598 97 654 321', 'Quiere información sobre Bariloche', 'cerrado', '2024-06-10 09:15:00'),
  ('Ana Martínez', 'ana.martinez@email.com', '+598 96 543 210', 'Interesada en cruceros por el Mediterráneo', 'nuevo', '2024-06-17 11:00:00'),
  ('Luis Silva', 'luis.silva@email.com', '+598 95 432 109', 'Consulta sobre viajes de luna de miel', 'en_proceso', '2024-06-18 16:00:00');