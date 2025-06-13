/*
  # Fix RLS policy for anonymous client creation - Final Fix

  1. Changes
    - Drop ALL existing policies on clients table to start fresh
    - Recreate only the necessary policies with correct permissions
    - Ensure anonymous users can insert clients for booking forms

  2. Security
    - Allows anonymous users to create bookings through public forms
    - Maintains proper access control for other operations
    - Uses explicit role targeting for maximum clarity
*/

-- Drop ALL existing policies on clients table to eliminate any conflicts
DROP POLICY IF EXISTS "Anonymous users can create clients" ON clients;
DROP POLICY IF EXISTS "Authenticated users can create clients" ON clients;
DROP POLICY IF EXISTS "Public can create clients" ON clients;
DROP POLICY IF EXISTS "Allow anonymous client creation" ON clients;
DROP POLICY IF EXISTS "Users can insert clients" ON clients;
DROP POLICY IF EXISTS "Allow client creation for all users" ON clients;
DROP POLICY IF EXISTS "Public insert for booking" ON clients;
DROP POLICY IF EXISTS "Admins can view all clients" ON clients;
DROP POLICY IF EXISTS "Admins can update clients" ON clients;
DROP POLICY IF EXISTS "Admins can delete clients" ON clients;

-- Create INSERT policy that explicitly allows all user types
CREATE POLICY "Allow public client creation"
  ON clients
  FOR INSERT
  TO anon, public, authenticated
  WITH CHECK (true);

-- Recreate SELECT policy for admins
CREATE POLICY "Admins can view all clients"
  ON clients
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'admin@example.com'
    )
  );

-- Recreate UPDATE policy for admins
CREATE POLICY "Admins can update clients"
  ON clients
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'admin@example.com'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'admin@example.com'
    )
  );

-- Recreate DELETE policy for admins
CREATE POLICY "Admins can delete clients"
  ON clients
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'admin@example.com'
    )
  );