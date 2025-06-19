/*
  # Update client status options
  
  1. Changes
    - Add 'cliente_perdido' status option
    - Remove 'cerrado' status (redundant with 'cliente_cerrado')
    - Update existing clients with 'cerrado' status to 'cliente_cerrado'
    
  2. Security
    - No changes to RLS policies
    - Maintains existing security model
*/

-- First update any existing clients with 'cerrado' status to 'cliente_cerrado'
UPDATE clients
SET status = 'cliente_cerrado'
WHERE status = 'cerrado';

-- Now drop the existing constraint
ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_status_check;

-- Add new constraint with updated status values
ALTER TABLE clients ADD CONSTRAINT clients_status_check 
  CHECK (status IN ('nuevo', 'presupuesto_enviado', 'en_seguimiento', 'cliente_cerrado', 'en_proceso', 'cliente_perdido'));