/*
  # Create admin user
  
  1. Changes
    - Creates the initial admin user with the specified email and password
    - Sets the role as 'owner' for full admin privileges
*/

-- First, create the user in auth.users via a function call
CREATE OR REPLACE FUNCTION create_admin_user()
RETURNS void AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Insert into auth.users and get the id
  v_user_id := (SELECT id FROM auth.users WHERE email = 'donagustinviajes@gmail.com' LIMIT 1);
  
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
    
    INSERT INTO auth.users (
      id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      role_id
    )
    VALUES (
      v_user_id,
      'donagustinviajes@gmail.com',
      crypt('Don1234', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      false,
      1
    );
  END IF;

  -- Insert into our users table
  INSERT INTO public.users (id, email, role, password_hash)
  VALUES (
    v_user_id,
    'donagustinviajes@gmail.com',
    'owner',
    crypt('Don1234', gen_salt('bf'))
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    role = 'owner',
    password_hash = crypt('Don1234', gen_salt('bf'));
END;
$$ LANGUAGE plpgsql;

-- Execute the function
SELECT create_admin_user();

-- Drop the function as it's no longer needed
DROP FUNCTION create_admin_user();