/*
  # Add user_id column and RLS policies

  1. Changes
    - Add user_id column to users table
    - Add foreign key constraint to auth.users
    - Update RLS policies for user data protection
    - Add trigger to automatically set user_id on insert

  2. Security
    - Enable RLS on users table
    - Add policies for read/write access
    - Ensure users can only access their own data
*/

-- Add user_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE users ADD COLUMN user_id uuid REFERENCES auth.users(id);
  END IF;
END $$;

-- Update RLS policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Users can insert their own data" ON users;

-- Create new policies
CREATE POLICY "Users can view their own data"
ON users
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own data"
ON users
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own data"
ON users
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create trigger to automatically set user_id on insert
CREATE OR REPLACE FUNCTION set_user_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id := auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS set_user_id_trigger ON users;
CREATE TRIGGER set_user_id_trigger
  BEFORE INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION set_user_id();