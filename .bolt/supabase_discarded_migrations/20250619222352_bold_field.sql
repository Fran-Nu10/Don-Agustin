/*
  # Update client status options

  1. Changes
    - Add 'cliente_perdido' status to clients table
    - Remove 'cerrado' status (redundant with 'cliente_cerrado')
    - Update the status check constraint

  2. Security
    - No changes to RLS policies
    - Maintains existing security model
*/

-- Drop the existing constraint
ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_status_check;

-- Add new constraint with updated status values
ALTER TABLE clients ADD CONSTRAINT clients_status_check 
  CHECK (status IN ('nuevo', 'presupuesto_enviado', 'en_seguimiento', 'cliente_cerrado', 'en_proceso', 'cliente_perdido'));

-- Update any existing clients with 'cerrado' status to 'cliente_cerrado'
UPDATE clients
SET status = 'cliente_cerrado'
WHERE status = 'cerrado';