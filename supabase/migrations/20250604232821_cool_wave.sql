/*
  # Add password authentication
  
  1. Changes
    - Add password_hash column to users table
    - Add password hashing functionality
    - Update RLS policies for password management
  
  2. Security
    - Passwords are hashed using bcrypt
    - RLS policies ensure users can only manage their own passwords
    - Owner role maintains full access control
*/

-- Enable pgcrypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Add password field
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password_hash text;

-- Function to hash password
CREATE OR REPLACE FUNCTION hash_password()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.password_hash IS DISTINCT FROM OLD.password_hash) THEN
    NEW.password_hash = crypt(NEW.password_hash, gen_salt('bf'));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to hash password on insert/update
DROP TRIGGER IF EXISTS hash_password_trigger ON users;
CREATE TRIGGER hash_password_trigger
  BEFORE INSERT OR UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION hash_password();

-- Update RLS policies
DROP POLICY IF EXISTS "Owners can manage users" ON users;
DROP POLICY IF EXISTS "Users can view their own data" ON users;

-- Policy for owners to manage users
CREATE POLICY "Owners can manage users"
ON users
FOR ALL 
TO authenticated
USING (
  (auth.jwt() ->> 'role')::text = 'owner'::text
)
WITH CHECK (
  (auth.jwt() ->> 'role')::text = 'owner'::text
);

-- Policy for users to view their own data
CREATE POLICY "Users can view their own data"
ON users
FOR SELECT
TO authenticated
USING (
  auth.uid() = id
);

-- Policy for users to update their own password
CREATE POLICY "Users can update own password"
ON users
FOR UPDATE
TO authenticated
USING (
  auth.uid() = id
)
WITH CHECK (
  auth.uid() = id
);