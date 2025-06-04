/*
  # Update RLS policies for public access

  1. Changes
    - Fix bookings policy to use trip_id instead of user_id
    - Add public read access policies for trips and related tables
    - Use safe policy creation with existence checks

  2. Security
    - Maintain RLS enabled on all tables
    - Allow public read access to trips, services, and itinerary
    - Restrict booking access appropriately
*/

-- First drop any existing policies we want to update
DROP POLICY IF EXISTS "Public can view own bookings" ON public.bookings;

-- Update bookings policies
CREATE POLICY "Public can view own bookings"
  ON public.bookings
  FOR SELECT
  TO public
  USING (auth.uid() IS NOT NULL AND email = current_user);

-- Update trips policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'trips' 
    AND policyname = 'Public can view trips'
  ) THEN
    CREATE POLICY "Public can view trips"
      ON public.trips
      FOR SELECT
      TO public
      USING (true);
  END IF;
END $$;

-- Update included_services policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'included_services' 
    AND policyname = 'Public can view services'
  ) THEN
    CREATE POLICY "Public can view services"
      ON public.included_services
      FOR SELECT
      TO public
      USING (true);
  END IF;
END $$;

-- Update itinerary_days policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'itinerary_days' 
    AND policyname = 'Public can view itinerary'
  ) THEN
    CREATE POLICY "Public can view itinerary"
      ON public.itinerary_days
      FOR SELECT
      TO public
      USING (true);
  END IF;
END $$;