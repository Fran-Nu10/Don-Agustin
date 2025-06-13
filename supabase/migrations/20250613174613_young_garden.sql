/*
  # Fix RLS policy for anonymous client creation

  1. Changes
    - Drop all existing INSERT policies on clients table
    - Create a single, comprehensive policy that allows anonymous users to insert
    - Ensure the policy works for all user types (anon, public, authenticated)

  2. Security
    - Allows anonymous users to create bookings through public forms
    - Maintains existing policies for viewing and managing clients
    - Only affects INSERT operations for maximum security
*/

-- Drop ALL existing INSERT policies on clients table to eliminate conflicts
DROP POLICY IF EXISTS "Anonymous users can create clients" ON clients;
DROP POLICY IF EXISTS "Authenticated users can create clients" ON clients;
DROP POLICY IF EXISTS "Public can create clients" ON clients;
DROP POLICY IF EXISTS "Allow anonymous client creation" ON clients;
DROP POLICY IF EXISTS "Users can insert clients" ON clients;
DROP POLICY IF EXISTS "Allow client creation for all users" ON clients;

-- Create a single, comprehensive INSERT policy
CREATE POLICY "Public insert for booking" 
  ON clients
  FOR INSERT
  TO anon, public, authenticated
  WITH CHECK (true);

-- Verify that other policies remain intact (just for documentation)
-- These should already exist and remain unchanged:
-- - "Admins can view all clients" (SELECT policy)
-- - "Admins can update clients" (UPDATE policy) 
-- - "Admins can delete clients" (DELETE policy)