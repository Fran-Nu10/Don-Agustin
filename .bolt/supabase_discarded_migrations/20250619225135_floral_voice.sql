/*
  # Add Seguimientos Próximos status to clients

  1. Changes
    - Add 'seguimientos_proximos' as a valid status option for clients
    - Update the clients_status_check constraint to include the new status
*/

-- Modify the check constraint to include the new status
ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_status_check;

-- Add the new constraint with the updated status options
ALTER TABLE clients ADD CONSTRAINT clients_status_check 
  CHECK (status = ANY (ARRAY[
    'nuevo'::text, 
    'presupuesto_enviado'::text, 
    'en_seguimiento'::text, 
    'cliente_cerrado'::text, 
    'en_proceso'::text, 
    'cliente_perdido'::text,
    'seguimientos_proximos'::text
  ]));

-- Update any existing clients with upcoming follow-ups to the new status
-- This is optional and can be commented out if not needed
UPDATE clients 
SET status = 'seguimientos_proximos' 
WHERE next_follow_up IS NOT NULL 
  AND next_follow_up > NOW() 
  AND status NOT IN ('cliente_cerrado', 'cliente_perdido');