/*
  # Create admin user

  1. Changes
    - Creates or updates admin user in auth.users
    - Creates or updates admin user in public.users
    - Sets proper role and password
*/

DO $$
DECLARE
  existing_user_id uuid;
  new_user_id uuid := gen_random_uuid();
BEGIN
  -- Check if user exists in auth.users
  SELECT id INTO existing_user_id
  FROM auth.users
  WHERE email = 'donagustinviajes@gmail.com';

  IF existing_user_id IS NULL THEN
    -- Insert new user into auth.users
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
    
    -- Insert into public.users with new id
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
  ELSE
    -- Update existing user in auth.users
    UPDATE auth.users
    SET 
      encrypted_password = crypt('Don1234', gen_salt('bf')),
      updated_at = now()
    WHERE id = existing_user_id;

    -- Update or insert into public.users
    INSERT INTO public.users (
      id,
      email,
      role,
      password_hash,
      created_at
    ) VALUES (
      existing_user_id,
      'donagustinviajes@gmail.com',
      'owner',
      crypt('Don1234', gen_salt('bf')),
      now()
    )
    ON CONFLICT (id) DO UPDATE
    SET 
      role = 'owner',
      password_hash = crypt('Don1234', gen_salt('bf'));
  END IF;
END
$$;