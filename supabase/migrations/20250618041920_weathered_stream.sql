/*
  # Refactor bookings and clients tables

  1. Changes
    - Add client_id column to bookings table
    - Migrate existing bookings data to clients
    - Update RLS policies for bookings
    - Add trigger to update trip available_spots when bookings change

  2. Security
    - Maintain RLS protection
    - Allow public booking creation
    - Restrict viewing to owners of bookings and admin users
*/

-- Add client_id column to bookings table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'client_id'
  ) THEN
    ALTER TABLE bookings ADD COLUMN client_id uuid REFERENCES clients(id);
  END IF;
END $$;

-- Create a function to migrate existing bookings data to clients
CREATE OR REPLACE FUNCTION migrate_bookings_to_clients()
RETURNS void AS $$
DECLARE
  booking_record RECORD;
  new_client_id uuid;
BEGIN
  -- Process each booking that doesn't have a client_id yet
  FOR booking_record IN 
    SELECT id, name, email, phone, trip_id, created_at
    FROM bookings 
    WHERE bookings.client_id IS NULL
      AND name IS NOT NULL
      AND email IS NOT NULL
  LOOP
    -- Check if client with this email already exists
    SELECT id INTO new_client_id
    FROM clients
    WHERE email = booking_record.email
    LIMIT 1;
    
    -- If client doesn't exist, create a new one
    IF new_client_id IS NULL THEN
      INSERT INTO clients (
        name, 
        email, 
        phone, 
        message, 
        status,
        created_at
      ) VALUES (
        booking_record.name,
        booking_record.email,
        booking_record.phone,
        'Reserva automática para viaje ID: ' || booking_record.trip_id,
        'cliente_cerrado',
        booking_record.created_at
      )
      RETURNING id INTO new_client_id;
    END IF;
    
    -- Update booking with client_id
    UPDATE bookings
    SET client_id = new_client_id
    WHERE id = booking_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the migration function
SELECT migrate_bookings_to_clients();

-- Drop the migration function as it's no longer needed
DROP FUNCTION migrate_bookings_to_clients();

-- Update RLS policies for bookings
DROP POLICY IF EXISTS "Anyone can create bookings" ON bookings;
DROP POLICY IF EXISTS "Anyone can view bookings" ON bookings;
DROP POLICY IF EXISTS "Public can create bookings" ON bookings;
DROP POLICY IF EXISTS "Public can view own bookings" ON bookings;
DROP POLICY IF EXISTS "Admin users can view all bookings" ON bookings;

-- Create new policies
CREATE POLICY "Public can create bookings"
  ON bookings
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy for public users to view their own bookings
CREATE POLICY "Public can view own bookings"
  ON bookings
  FOR SELECT
  TO public
  USING (client_id IN (
    SELECT id FROM clients WHERE email = current_user
  ));

-- Policy for admin users to view all bookings
CREATE POLICY "Admin users can view all bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.user_id = auth.uid() 
      AND users.role IN ('owner', 'employee')
    )
  );

-- Create a trigger function to update trip available_spots when a booking is created
CREATE OR REPLACE FUNCTION update_trip_available_spots()
RETURNS TRIGGER AS $$
BEGIN
  -- Decrease available_spots by 1 when a new booking is created
  IF (TG_OP = 'INSERT') THEN
    UPDATE trips
    SET available_spots = available_spots - 1
    WHERE id = NEW.trip_id AND available_spots > 0;
  END IF;
  
  -- Increase available_spots by 1 when a booking is deleted
  IF (TG_OP = 'DELETE') THEN
    UPDATE trips
    SET available_spots = available_spots + 1
    WHERE id = OLD.trip_id;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on bookings table
DROP TRIGGER IF EXISTS update_trip_spots_trigger ON bookings;
CREATE TRIGGER update_trip_spots_trigger
  AFTER INSERT OR DELETE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_trip_available_spots();