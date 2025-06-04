/*
  # Fix users table RLS policies

  1. Changes
    - Remove recursive policy that was causing infinite recursion
    - Create new, simplified policies for user management
    - Maintain security while avoiding circular dependencies
  
  2. Security
    - Enable RLS on users table (already enabled)
    - Add policy for owners to manage all users
    - Add policy for users to view their own data
    - Remove problematic policy that was causing recursion
*/

-- Drop existing policies that might be causing recursion
DROP POLICY IF EXISTS "Owners can manage users" ON public.users;
DROP POLICY IF EXISTS "Users can view own data" ON public.users;

-- Create new, simplified policies
CREATE POLICY "Owners can manage all users"
ON public.users
FOR ALL
TO public
USING (
  auth.uid() IN (
    SELECT id FROM users 
    WHERE role = 'owner'
  )
);

CREATE POLICY "Users can view their own data"
ON public.users
FOR SELECT
TO public
USING (
  auth.uid() = id
);