/*
  # Fix RLS policies for clients table

  1. Security Changes
    - Drop conflicting policies that prevent public access
    - Create a clear policy allowing anonymous users to insert client records
    - Maintain admin-only access for read, update, and delete operations
    - Ensure public users can create bookings and contact submissions

  This migration resolves the RLS policy violation that prevents booking forms and contact forms from working.
*/

-- Drop existing conflicting policies
DROP POLICY IF EXISTS "Allow public client creation" ON clients;
DROP POLICY IF EXISTS "Permitir reservas anónimas" ON clients;
DROP POLICY IF EXISTS "Admins can view all clients" ON clients;
DROP POLICY IF EXISTS "Admins can update clients" ON clients;
DROP POLICY IF EXISTS "Admins can delete clients" ON clients;

-- Create a clear policy for public client creation (bookings and contact forms)
CREATE POLICY "Enable public client creation"
  ON clients
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create policies for admin access (authenticated users with proper roles)
CREATE POLICY "Enable admin read access"
  ON clients
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.user_id = auth.uid() 
      AND users.role IN ('owner', 'employee')
    )
  );

CREATE POLICY "Enable admin update access"
  ON clients
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.user_id = auth.uid() 
      AND users.role IN ('owner', 'employee')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.user_id = auth.uid() 
      AND users.role IN ('owner', 'employee')
    )
  );

CREATE POLICY "Enable admin delete access"
  ON clients
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.user_id = auth.uid() 
      AND users.role IN ('owner', 'employee')
    )
  );