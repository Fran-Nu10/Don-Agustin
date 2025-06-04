/*
  # Fix recursive RLS policies on users table

  1. Changes
    - Remove recursive policy on users table
    - Add simplified policies for user management
    
  2. Security
    - Replace recursive owner policy with direct role check
    - Maintain existing user data access policy
    - Ensure proper access control without recursion
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Owners can manage all users" ON users;

-- Create new non-recursive policies
CREATE POLICY "Owners can manage users"
ON users
FOR ALL
TO authenticated
USING (auth.jwt() ->> 'role' = 'owner')
WITH CHECK (auth.jwt() ->> 'role' = 'owner');

-- Keep existing policy for users viewing their own data
-- This policy is already correct and non-recursive
-- "Users can view their own data" policy remains unchanged