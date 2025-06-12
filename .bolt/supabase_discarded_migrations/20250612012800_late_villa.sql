/*
  # Arreglar constraint de clientes para incluir todos los estados

  1. Cambios
    - Eliminar constraint existente que está causando problemas
    - Actualizar todos los registros para que tengan estados válidos
    - Crear nuevo constraint con todos los estados permitidos
    - Migrar datos de bookings a clients
    - Agregar clientes de ejemplo

  2. Estados permitidos
    - 'nuevo': Cliente recién llegado
    - 'presupuesto_enviado': Presupuesto ya enviado
    - 'en_seguimiento': Cliente en proceso de seguimiento
    - 'cliente_cerrado': Cliente que completó el proceso
*/

-- Primero, eliminar completamente el constraint problemático
ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_status_check;

-- Verificar y actualizar todos los registros existentes
UPDATE clients 
SET status = CASE 
  WHEN status = 'en_proceso' THEN 'en_seguimiento'
  WHEN status = 'cerrado' THEN 'cliente_cerrado'
  WHEN status = 'nuevo' THEN 'nuevo'
  WHEN status = 'presupuesto_enviado' THEN 'presupuesto_enviado'
  WHEN status = 'en_seguimiento' THEN 'en_seguimiento'
  WHEN status = 'cliente_cerrado' THEN 'cliente_cerrado'
  ELSE 'nuevo'
END;

-- Crear el nuevo constraint con TODOS los estados permitidos
ALTER TABLE clients ADD CONSTRAINT clients_status_check 
  CHECK (status = ANY (ARRAY['nuevo'::text, 'presupuesto_enviado'::text, 'en_seguimiento'::text, 'cliente_cerrado'::text]));

-- Migrar datos de bookings a clients si la tabla existe
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bookings') THEN
    -- Insertar bookings como nuevos clientes en CRM
    INSERT INTO clients (name, email, phone, message, status, created_at)
    SELECT 
      b.name,
      b.email,
      COALESCE(b.phone, ''),
      CONCAT('Reserva para viaje: ', COALESCE(t.title, 'Viaje no especificado'), 
             '. Destino: ', COALESCE(t.destination, 'No especificado'),
             '. Precio: $', COALESCE(t.price::text, '0')) as message,
      'nuevo'::text as status,
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

-- Agregar clientes de ejemplo con diferentes estados (solo si no existen)
INSERT INTO clients (name, email, phone, message, status, scheduled_date) 
SELECT * FROM (VALUES
  ('Patricia López', 'patricia.lopez@email.com', '+598 94 321 098', 'Consulta sobre viajes a Europa para septiembre', 'presupuesto_enviado'::text, '2024-06-19 10:30:00'::timestamptz),
  ('Roberto García', 'roberto.garcia@email.com', '+598 93 210 987', 'Interesado en viajes familiares a Disney', 'en_seguimiento'::text, '2024-06-20 15:00:00'::timestamptz),
  ('Carmen Vega', 'carmen.vega@email.com', '+598 92 109 876', 'Viaje de egresados completado satisfactoriamente', 'cliente_cerrado'::text, NULL),
  ('Diego Morales', 'diego.morales@email.com', '+598 91 098 765', 'Solicita cotización para luna de miel en Maldivas', 'nuevo'::text, '2024-06-21 11:15:00'::timestamptz),
  ('Sofía Herrera', 'sofia.herrera@email.com', '+598 90 987 654', 'Presupuesto enviado para viaje grupal a Machu Picchu', 'presupuesto_enviado'::text, '2024-06-22 14:45:00'::timestamptz)
) AS new_clients(name, email, phone, message, status, scheduled_date)
WHERE NOT EXISTS (
  SELECT 1 FROM clients c WHERE c.email = new_clients.email
);