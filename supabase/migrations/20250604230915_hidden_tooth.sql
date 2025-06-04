/*
  # Update RLS policies for public access

  1. Changes
    - Remove authentication requirements from all policies
    - Allow public access to create bookings
    - Allow public access to view all content
    - Enable public read access across all tables
    
  2. Security
    - Maintain basic RLS structure for future auth implementation
    - Keep policies permissive but controlled
*/

-- Drop existing policies that we'll replace
DROP POLICY IF EXISTS "Public can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Public can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Public can view trips" ON public.trips;
DROP POLICY IF EXISTS "Public can view services" ON public.included_services;
DROP POLICY IF EXISTS "Public can view itinerary" ON public.itinerary_days;

-- Bookings policies
CREATE POLICY "Anyone can create bookings"
  ON public.bookings
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can view bookings"
  ON public.bookings
  FOR SELECT
  TO public
  USING (true);

-- Trips policies
CREATE POLICY "Anyone can view trips"
  ON public.trips
  FOR SELECT
  TO public
  USING (true);

-- Included services policies
CREATE POLICY "Anyone can view services"
  ON public.included_services
  FOR SELECT
  TO public
  USING (true);

-- Itinerary days policies
CREATE POLICY "Anyone can view itinerary"
  ON public.itinerary_days
  FOR SELECT
  TO public
  USING (true);