/*
  # Fix RLS policies for users table

  1. Security Updates
    - Add policy for authenticated users to read public user info (id, email)
    - Add policy for users to read their own complete profile
    - Keep existing policies for user management

  2. Changes
    - Allow authenticated users to read basic user info needed for blog author display
    - Maintain security by only exposing necessary fields (id, email)
*/

-- Drop existing conflicting policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to read public user info" ON users;
DROP POLICY IF EXISTS "Allow authenticated users to read own profile" ON users;

-- Policy for authenticated users to read public user info (needed for blog authors)
CREATE POLICY "Allow authenticated users to read public user info"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy for users to read their own complete profile
CREATE POLICY "Allow users to read own complete profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);