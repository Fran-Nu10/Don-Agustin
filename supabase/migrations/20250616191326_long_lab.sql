/*
  # Add trip_value field to clients table

  1. Changes
    - Add trip_value column to clients table to store the value of the client's trip
    - This allows tracking revenue per client in the CRM
    - Will be used in financial reports

  2. Security
    - No changes to RLS policies
    - Maintains existing security model
*/

-- Add trip_value column to clients table
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS trip_value numeric DEFAULT 0;

-- Add comment to document the field
COMMENT ON COLUMN clients.trip_value IS 'Valor del viaje para este cliente (en pesos uruguayos)';