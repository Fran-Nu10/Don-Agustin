/*
  # Update client status constraint to include all required values

  1. Changes
    - Drop existing status constraint on clients table
    - Add new constraint that includes all required status values:
      - 'nuevo'
      - 'presupuesto_enviado' 
      - 'en_seguimiento'
      - 'cliente_cerrado'
      - 'en_proceso' (keeping existing)
      - 'cerrado' (keeping existing)

  2. Security
    - Maintain existing RLS policies
    - No changes to data access permissions
*/

-- Drop the existing constraint
ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_status_check;

-- Add new constraint with all required status values
ALTER TABLE clients ADD CONSTRAINT clients_status_check 
  CHECK (status IN ('nuevo', 'presupuesto_enviado', 'en_seguimiento', 'cliente_cerrado', 'en_proceso', 'cerrado'));