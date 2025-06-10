/*
  # Fix quotations RLS policy for public access

  1. Security Updates
    - Drop existing conflicting policies
    - Create new policy that explicitly allows anonymous users to insert quotations
    - Ensure the policy works with both 'public' and 'anon' roles

  2. Changes
    - Remove restrictive policies that might conflict
    - Add clear policy for public quotation creation
*/

-- Drop existing public insert policy to recreate it properly
DROP POLICY IF EXISTS "Public can create quotations" ON quotations;

-- Create a new policy that explicitly allows anonymous users to create quotations
CREATE POLICY "Allow anonymous quotation creation"
  ON quotations
  FOR INSERT
  TO anon, public
  WITH CHECK (true);

-- Ensure the policy also works for authenticated users who might not be admins
CREATE POLICY "Allow authenticated quotation creation"
  ON quotations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);