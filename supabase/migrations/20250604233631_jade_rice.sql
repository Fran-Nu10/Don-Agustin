/*
  # Create initial owner user

  1. Changes
    - Creates an initial owner user with email 'admin@ejemplo.com'
    - Sets up password hash for the user
    - Assigns owner role

  2. Security
    - Password is hashed using Supabase Auth
    - User has owner role with full access
*/

-- First create the user in auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change_token_current,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@ejemplo.com',
  crypt('admin123', gen_salt('bf')), -- Using 'admin123' as the initial password
  now(),
  now(),
  now(),
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- Then add the user to our users table with owner role
INSERT INTO public.users (
  id,
  email,
  role,
  created_at
)
SELECT 
  id,
  email,
  'owner',
  created_at
FROM auth.users
WHERE email = 'admin@ejemplo.com'
ON CONFLICT (email) DO NOTHING;