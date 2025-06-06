/*
  # Fix blog user permissions for anonymous access

  1. Security Changes
    - Remove conflicting policies on users table
    - Add specific policy for anonymous users to read basic user info for blog authors
    - Ensure blog posts can be read by anonymous users with author information

  2. Changes
    - Drop all existing conflicting policies on users table
    - Create a single policy that allows anonymous users to read basic user info
    - This enables the blog functionality to work properly for public users
*/

-- Drop all existing policies on users table to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated users to read public user info" ON users;
DROP POLICY IF EXISTS "Allow users to read own complete profile" ON users;
DROP POLICY IF EXISTS "Anonymous users can read basic user info for blog authors" ON users;
DROP POLICY IF EXISTS "Allow users to read own data" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Public can read basic user info" ON users;

-- Create a comprehensive policy that allows both anonymous and authenticated users to read basic user info
CREATE POLICY "Public can read basic user info"
  ON users
  FOR SELECT
  TO public
  USING (true);

-- Allow users to read their own complete profile
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow owners to manage all users
CREATE POLICY "Owners can manage users"
  ON users
  FOR ALL
  TO authenticated
  USING ((auth.jwt() ->> 'role') = 'owner')
  WITH CHECK ((auth.jwt() ->> 'role') = 'owner');

-- Allow users to insert their own data
CREATE POLICY "Users can insert their own data"
  ON users
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = id);

-- Allow users to update their own data
CREATE POLICY "Users can update their own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow users to update their own password
CREATE POLICY "Users can update own password"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);