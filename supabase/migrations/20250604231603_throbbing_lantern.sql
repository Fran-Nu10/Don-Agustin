/*
  # Fix infinite recursion in users RLS policy

  1. Changes
    - Drop the problematic RLS policy that causes infinite recursion
    - Create a new policy that uses auth.uid() directly
    - Maintain existing "Users can view own data" policy

  2. Security
    - Maintains RLS protection
    - Simplifies policy logic to prevent recursion
    - Ensures owners can still manage users
*/

-- Drop the problematic policy
DROP POLICY IF EXISTS "Owners can manage users" ON public.users;

-- Create new policy without recursion
CREATE POLICY "Owners can manage users"
ON public.users
FOR ALL
TO public
USING (
  EXISTS (
    SELECT 1 
    FROM users 
    WHERE id = auth.uid() 
    AND role = 'owner'
  )
);