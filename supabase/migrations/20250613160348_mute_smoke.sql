/*
  # Fix RLS policy for anonymous client creation

  1. Changes
    - Add RLS policy to allow anonymous users to insert into clients table
    - This allows public booking forms to create client records
    - Maintain existing admin policies for viewing and managing clients

  2. Security
    - Only allows INSERT operations for anonymous users
    - Admins still need authentication to view/edit client data
    - Maintains data security while enabling public form submissions
*/

-- Drop existing public insert policy if it exists
DROP POLICY IF EXISTS "Public can create clients" ON clients;
DROP POLICY IF EXISTS "Allow anonymous client creation" ON clients;

-- Create policy that allows anonymous users to insert client records
CREATE POLICY "Anonymous users can create clients"
  ON clients
  FOR INSERT
  TO anon, public
  WITH CHECK (true);

-- Ensure authenticated users can also create clients (for admin forms)
CREATE POLICY "Authenticated users can create clients"
  ON clients
  FOR INSERT
  TO authenticated
  WITH CHECK (true);