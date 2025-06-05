/*
  # Add user_id field and RLS policies to users table
  
  1. Changes
    - Add user_id column to users table
    - Add foreign key constraint to auth.users
    - Update RLS policies for user management
    
  2. Security
    - Enable RLS on users table
    - Add policies for users to manage their own data
    - Ensure user_id matches auth.uid()
*/

-- Add user_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE users ADD COLUMN user_id uuid;
  END IF;
END $$;

-- Add foreign key constraint to auth.users
ALTER TABLE users
ADD CONSTRAINT users_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;

-- Create new RLS policies
CREATE POLICY "Users can view own data" ON users
FOR SELECT USING (
  auth.uid() = user_id
);

CREATE POLICY "Users can update own data" ON users
FOR UPDATE USING (
  auth.uid() = user_id
) WITH CHECK (
  auth.uid() = user_id
);

CREATE POLICY "Users can insert own data" ON users
FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

-- Update existing users to set user_id = id
UPDATE users SET user_id = id WHERE user_id IS NULL;