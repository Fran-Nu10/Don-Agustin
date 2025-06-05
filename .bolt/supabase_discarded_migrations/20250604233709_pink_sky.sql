/*
  # Create admin user
  
  1. Changes
    - Creates admin user in auth.users table
    - Creates corresponding user in public.users table with owner role
    - Sets up password and role correctly
*/

DO $$
DECLARE
  new_user_id uuid := gen_random_uuid();
BEGIN
  -- Insert into auth.users
  INSERT INTO auth.users (
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin
  ) VALUES (
    new_user_id,
    'authenticated',
    'authenticated',
    'donagustinviajes@gmail.com',
    crypt('Don1234', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false
  );

  -- Insert into public.users
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
  );
END
$$;