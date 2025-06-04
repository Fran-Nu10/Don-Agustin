/*
  # Create initial owner user

  1. Changes
    - Creates initial owner user in auth.users
    - Adds user to public.users table with owner role
    
  2. Security
    - Sets up initial admin credentials
    - Password should be changed after first login
*/

-- First create the user in auth.users
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Insert into auth.users and get the id
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
    'donagustinviajes@gmail.com',
    crypt('Don1234', gen_salt('bf')),
    now(),
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
  ON CONFLICT (email) DO 
  UPDATE SET encrypted_password = crypt('Don1234', gen_salt('bf'))
  RETURNING id INTO new_user_id;

  -- Add user to public.users table with owner role
  INSERT INTO public.users (
    id,
    email,
    role,
    password_hash,
    created_at
  ) VALUES (
    new_user_id,
    'donagustinviajes@gmail.com',
    'owner',
    crypt('Don1234', gen_salt('bf')),
    now()
  )
  ON CONFLICT (id) DO 
  UPDATE SET 
    role = 'owner',
    password_hash = crypt('Don1234', gen_salt('bf'));
END
$$;