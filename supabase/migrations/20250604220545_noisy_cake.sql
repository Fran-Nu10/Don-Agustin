/*
  # Update RLS policies for public access

  1. Changes
    - Update booking policies to allow public inserts
    - Add policies for public read access to trips and services
    - Ensure proper authentication checks

  2. Security
    - Maintain data integrity while allowing necessary public access
    - Protect sensitive operations behind authentication
*/

-- Update bookings policies
CREATE POLICY "Public can create bookings"
  ON public.bookings
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can view own bookings"
  ON public.bookings
  FOR SELECT
  TO public
  USING (auth.uid() IS NOT NULL AND auth.uid()::text = user_id::text);

-- Update trips policies
CREATE POLICY "Public can view trips"
  ON public.trips
  FOR SELECT
  TO public
  USING (true);

-- Update included_services policies
CREATE POLICY "Public can view services"
  ON public.included_services
  FOR SELECT
  TO public
  USING (true);

-- Update itinerary_days policies
CREATE POLICY "Public can view itinerary"
  ON public.itinerary_days
  FOR SELECT
  TO public
  USING (true);