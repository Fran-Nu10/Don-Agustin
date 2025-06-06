/*
  # Update trips table RLS policies

  1. Changes
    - Add RLS policies for trips table to allow authenticated users to manage trips
    - Policies added:
      - Allow authenticated users to insert trips
      - Allow authenticated users to update their own trips
      - Allow authenticated users to delete their own trips
      - Allow public to view all trips
  
  2. Security
    - Enable RLS on trips table (already enabled)
    - Add policies for CRUD operations
    - Ensure only authenticated users can manage trips
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Usuarios autenticados pueden insertar viajes" ON trips;

-- Create comprehensive RLS policies
CREATE POLICY "Enable read access for all users" 
ON trips FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Enable insert for authenticated users" 
ON trips FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for trip owners" 
ON trips FOR UPDATE 
TO authenticated 
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Enable delete for trip owners" 
ON trips FOR DELETE 
TO authenticated 
USING (auth.uid() = created_by);