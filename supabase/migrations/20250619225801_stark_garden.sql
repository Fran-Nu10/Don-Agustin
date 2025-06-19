/*
  # Add seguimientos_proximos status to clients table
  
  1. Changes
    - Modifies the clients_status_check constraint to include 'seguimientos_proximos' as a valid status option
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