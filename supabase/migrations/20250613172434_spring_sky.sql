/*
  # Fix anonymous client creation for booking forms

  1. Changes
    - Drop all existing INSERT policies on clients table to avoid conflicts
    - Create a single comprehensive policy that allows both anonymous and authenticated users to insert
    - Ensure anonymous users can create bookings without authentication

  2. Security
    - Allows INSERT operations for both anonymous (anon, public) and authenticated users
    - Maintains existing SELECT/UPDATE/DELETE policies for authenticated users only
    - Enables public booking forms while keeping admin data secure
*/

-- Drop all existing INSERT policies on clients table to avoid conflicts
DROP POLICY IF EXISTS "Anonymous users can create clients" ON clients;
DROP POLICY IF EXISTS "Authenticated users can create clients" ON clients;
DROP POLICY IF EXISTS "Public can create clients" ON clients;
DROP POLICY IF EXISTS "Allow anonymous client creation" ON clients;
DROP POLICY IF EXISTS "Users can insert clients" ON clients;

-- Create a comprehensive INSERT policy for both anonymous and authenticated users
CREATE POLICY "Allow client creation for all users"
  ON clients
  FOR INSERT
  TO anon, public, authenticated
  WITH CHECK (true);