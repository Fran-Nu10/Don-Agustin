/*
  # Initial Schema Setup

  1. New Tables
    - `users`
      - User accounts with role-based access
    - `trips`
      - Travel packages and tours
    - `bookings`
      - Customer trip reservations
    - `itinerary_days`
      - Daily itinerary for trips
    - `included_services`
      - Services included in each trip

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Add policies for public access where needed
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('owner', 'employee')),
  created_at timestamptz DEFAULT now()
);

-- Create trips table
CREATE TABLE IF NOT EXISTS trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  destination text NOT NULL,
  description text NOT NULL,
  price numeric NOT NULL CHECK (price >= 0),
  departure_date timestamptz NOT NULL,
  return_date timestamptz NOT NULL,
  available_spots integer NOT NULL CHECK (available_spots >= 0),
  image_url text NOT NULL,
  category text NOT NULL CHECK (category IN ('nacional', 'internacional', 'grupal')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES trips ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  created_at timestamptz DEFAULT now()
);

-- Create itinerary_days table
CREATE TABLE IF NOT EXISTS itinerary_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES trips ON DELETE CASCADE,
  day integer NOT NULL,
  title text NOT NULL,
  description text
);

-- Create included_services table
CREATE TABLE IF NOT EXISTS included_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES trips ON DELETE CASCADE,
  icon text NOT NULL,
  title text NOT NULL,
  description text
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE included_services ENABLE ROW LEVEL SECURITY;

-- Policies for users
CREATE POLICY "Users can view own data" ON users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Owners can manage users" ON users
  FOR ALL
  USING (auth.uid() IN (
    SELECT id FROM users WHERE role = 'owner'
  ));

-- Policies for trips
CREATE POLICY "Public can view trips" ON trips
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Authenticated users can manage trips" ON trips
  FOR ALL
  USING (auth.uid() IN (
    SELECT id FROM users
  ));

-- Policies for bookings
CREATE POLICY "Public can create bookings" ON bookings
  FOR INSERT
  TO PUBLIC
  WITH CHECK (true);

CREATE POLICY "Owners can view all bookings" ON bookings
  FOR SELECT
  USING (auth.uid() IN (
    SELECT id FROM users WHERE role = 'owner'
  ));

-- Policies for itinerary_days
CREATE POLICY "Public can view itinerary" ON itinerary_days
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Authenticated users can manage itinerary" ON itinerary_days
  FOR ALL
  USING (auth.uid() IN (
    SELECT id FROM users
  ));

-- Policies for included_services
CREATE POLICY "Public can view services" ON included_services
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Authenticated users can manage services" ON included_services
  FOR ALL
  USING (auth.uid() IN (
    SELECT id FROM users
  ));

-- Insert initial owner user
INSERT INTO users (email, role) VALUES
  ('owner@donagustinviajes.com.uy', 'owner');

-- Insert sample trips
INSERT INTO trips (title, destination, description, price, departure_date, return_date, available_spots, image_url, category) VALUES
  ('Termas de Guaviyú', 'Paysandú, Uruguay', 'Disfruta de un fin de semana relajante en las termas de Guaviyú.', 12000, '2024-07-05', '2024-07-07', 20, 'https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg', 'nacional'),
  ('París Romántico', 'París, Francia', 'Descubre la Ciudad de la Luz en un viaje romántico de 8 días.', 120000, '2024-09-10', '2024-09-18', 15, 'https://images.pexels.com/photos/699466/pexels-photo-699466.jpeg', 'internacional'),
  ('Europa Grupal 2024', 'Europa', 'Recorrido grupal de 21 días por las principales ciudades de Europa.', 250000, '2024-09-01', '2024-09-22', 25, 'https://images.pexels.com/photos/705764/pexels-photo-705764.jpeg', 'grupal');