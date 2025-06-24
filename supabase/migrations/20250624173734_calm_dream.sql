/*
  # Update foreign key constraint for clients table

  1. Changes
    - Modify the foreign key constraint clients_last_booked_trip_id_fkey
    - Add ON DELETE SET NULL to automatically set last_booked_trip_id to NULL when a trip is deleted
    - This prevents orphaned references when trips are deleted

  2. Security
    - No changes to RLS policies
    - Maintains data integrity by properly handling deleted trips
*/

-- First drop the existing constraint if it exists
ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_last_booked_trip_id_fkey;

-- Create the constraint with ON DELETE SET NULL
ALTER TABLE clients
ADD CONSTRAINT clients_last_booked_trip_id_fkey
FOREIGN KEY (last_booked_trip_id)
REFERENCES trips(id)
ON DELETE SET NULL;