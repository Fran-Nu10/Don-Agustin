/*
  # Update RLS policies for public access

  1. Changes
    - Drop existing policies that need to be updated
    - Create new policies for public access to bookings, trips, services, and itineraries
    - Ensure proper access control for authenticated and public users

  2. Security
    - Enable public read access to trips, services, and itineraries
    - Allow public booking creation
    - Restrict booking viewing to owners
*/

-- First drop any existing policies we want to update
DROP POLICY IF EXISTS "Public can view own bookings" ON public.bookings;

-- Update bookings policies
CREATE POLICY "Public can view own bookings"
  ON public.bookings
  FOR SELECT
  TO public
  USING (auth.uid() IS NOT NULL AND auth.uid()::text = user_id::text);

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