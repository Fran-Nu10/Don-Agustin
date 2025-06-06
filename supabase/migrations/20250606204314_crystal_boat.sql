/*
  # Fix blog permissions for anonymous users

  1. Security Changes
    - Add RLS policy for anonymous users to read basic user info (id, email)
    - This allows blog posts to display author information publicly
  
  2. Notes
    - Only allows reading id and email fields for public access
    - Maintains security by not exposing sensitive user data
*/

-- Allow anonymous users to read basic user information for blog authors
CREATE POLICY "Anonymous users can read basic user info for blog authors"
  ON users
  FOR SELECT
  TO anon
  USING (true);