/*
  # Fix trip deletion RLS policies

  1. Changes
    - Update RLS policies for trips table to allow proper deletion
    - Fix policies for itinerary_days and included_services
    - Ensure authenticated admin users can delete trips and related data

  2. Security
    - Maintain RLS protection
    - Allow only authenticated users with admin roles to delete
    - Ensure cascade deletion works properly
*/

-- Drop existing problematic policies for trips
DROP POLICY IF EXISTS "Enable delete for trip owners" ON trips;

-- Create new delete policy for trips that works with admin roles
CREATE POLICY "Admin users can delete trips"
  ON trips
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE public.users.user_id = auth.uid() 
      AND public.users.role IN ('owner', 'employee')
    )
  );

-- Update insert and update policies to also use admin roles instead of created_by
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON trips;
DROP POLICY IF EXISTS "Enable update for trip owners" ON trips;

CREATE POLICY "Admin users can insert trips"
  ON trips
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE public.users.user_id = auth.uid() 
      AND public.users.role IN ('owner', 'employee')
    )
  );

CREATE POLICY "Admin users can update trips"
  ON trips
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE public.users.user_id = auth.uid() 
      AND public.users.role IN ('owner', 'employee')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE public.users.user_id = auth.uid() 
      AND public.users.role IN ('owner', 'employee')
    )
  );

-- Update policies for itinerary_days to allow deletion
DROP POLICY IF EXISTS "Admin users can manage itinerary" ON itinerary_days;

CREATE POLICY "Admin users can manage itinerary"
  ON itinerary_days
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE public.users.user_id = auth.uid() 
      AND public.users.role IN ('owner', 'employee')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE public.users.user_id = auth.uid() 
      AND public.users.role IN ('owner', 'employee')
    )
  );

-- Update policies for included_services to allow deletion
DROP POLICY IF EXISTS "Admin users can manage services" ON included_services;

CREATE POLICY "Admin users can manage services"
  ON included_services
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE public.users.user_id = auth.uid() 
      AND public.users.role IN ('owner', 'employee')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE public.users.user_id = auth.uid() 
      AND public.users.role IN ('owner', 'employee')
    )
  );