/*
  # Actualizar estados de clientes en CRM

  1. Cambios en tabla clients
    - Actualizar constraint de status para incluir nuevos estados
    - Migrar datos de bookings a clients
    - Agregar clientes de ejemplo con diferentes estados

  2. Nuevos estados
    - 'nuevo' - Cliente recién llegado
    - 'presupuesto_enviado' - Presupuesto ya enviado  
    - 'en_seguimiento' - Cliente en proceso de seguimiento
    - 'cliente_cerrado' - Cliente que completó el proceso
*/

-- Primero, verificar y actualizar el constraint existente
ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_status_check;

-- Crear el nuevo constraint con todos los estados permitidos
ALTER TABLE clients ADD CONSTRAINT clients_status_check 
  CHECK (status IN ('nuevo', 'presupuesto_enviado', 'en_seguimiento', 'cliente_cerrado'));

-- Migrar datos de bookings a clients si la tabla existe
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bookings') THEN
    -- Insertar bookings como nuevos clientes en CRM
    INSERT INTO clients (name, email, phone, message, status, created_at)
    SELECT 
      b.name,
      b.email,
      b.phone,
      CONCAT('Reserva para viaje: ', COALESCE(t.title, 'Viaje no especificado'), 
             '. Destino: ', COALESCE(t.destination, 'No especificado'),
             '. Precio: $', COALESCE(t.price::text, '0')) as message,
      'nuevo' as status,
      b.created_at
    FROM bookings b
    LEFT JOIN trips t ON b.trip_id = t.id
    WHERE NOT EXISTS (
      SELECT 1 FROM clients c 
      WHERE c.email = b.email 
      AND c.name = b.name
    );
  END IF;
END $$;

-- Actualizar algunos clientes existentes con nuevos estados (solo si existen)
UPDATE clients 
SET status = 'presupuesto_enviado' 
WHERE email = 'maria.gonzalez@email.com' AND EXISTS (SELECT 1 FROM clients WHERE email = 'maria.gonzalez@email.com');

UPDATE clients 
SET status = 'en_seguimiento' 
WHERE email = 'luis.silva@email.com' AND EXISTS (SELECT 1 FROM clients WHERE email = 'luis.silva@email.com');

UPDATE clients 
SET status = 'cliente_cerrado' 
WHERE email = 'carlos.rodriguez@email.com' AND EXISTS (SELECT 1 FROM clients WHERE email = 'carlos.rodriguez@email.com');

-- Agregar más clientes de ejemplo con diferentes estados
INSERT INTO clients (name, email, phone, message, status, scheduled_date) VALUES
  ('Patricia López', 'patricia.lopez@email.com', '+598 94 321 098', 'Consulta sobre viajes a Europa para septiembre', 'presupuesto_enviado', '2024-06-19 10:30:00'),
  ('Roberto García', 'roberto.garcia@email.com', '+598 93 210 987', 'Interesado en viajes familiares a Disney', 'en_seguimiento', '2024-06-20 15:00:00'),
  ('Carmen Vega', 'carmen.vega@email.com', '+598 92 109 876', 'Viaje de egresados completado satisfactoriamente', 'cliente_cerrado', NULL),
  ('Diego Morales', 'diego.morales@email.com', '+598 91 098 765', 'Solicita cotización para luna de miel en Maldivas', 'nuevo', '2024-06-21 11:15:00'),
  ('Sofía Herrera', 'sofia.herrera@email.com', '+598 90 987 654', 'Presupuesto enviado para viaje grupal a Machu Picchu', 'presupuesto_enviado', '2024-06-22 14:45:00')
ON CONFLICT (email) DO NOTHING;