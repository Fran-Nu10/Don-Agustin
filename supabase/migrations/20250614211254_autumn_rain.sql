/*
  # Update clients table priority constraint

  1. Changes
    - Drop the existing `clients_priority_check` constraint
    - Add a new constraint that allows more priority values: 'baja', 'normal', 'media', 'alta', 'urgente', 'muy_alta'
  
  2. Security
    - No changes to RLS policies
    - Maintains data integrity with updated valid priority values
*/

-- Drop the existing priority check constraint
ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_priority_check;

-- Add the new priority check constraint with expanded values
ALTER TABLE clients ADD CONSTRAINT clients_priority_check 
  CHECK (priority = ANY (ARRAY['baja'::text, 'normal'::text, 'media'::text, 'alta'::text, 'urgente'::text, 'muy_alta'::text]));