/*
  # Fix RLS policy for itinerary_days table

  1. Security Updates
    - Update the RLS policy for itinerary_days to properly check user authentication
    - Fix the policy to work with the current authentication system
    - Ensure authenticated users with proper roles can manage itinerary days

  2. Changes
    - Drop the existing problematic policy
    - Create a new policy that properly checks for authenticated users with admin roles
    - Align with the existing users table structure and authentication flow
*/

-- Drop the existing problematic policy
DROP POLICY IF EXISTS "Authenticated users can manage itinerary" ON itinerary_days;

-- Create a new policy that allows authenticated users with admin roles to manage itinerary
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

-- Also update the included_services table policy to match
DROP POLICY IF EXISTS "Authenticated users can manage services" ON included_services;

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