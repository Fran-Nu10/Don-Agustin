/*
  # Add trip details to clients table

  1. New Columns
    - `last_booked_trip_id` - UUID reference to the trip
    - `last_booked_trip_title` - Title of the booked trip
    - `last_booked_trip_destination` - Destination of the booked trip
    - `last_booked_trip_date` - Departure date of the booked trip
    - `preferred_destination` - Client's preferred destination (if different from booked)

  2. Security
    - Maintain existing RLS policies
    - No changes to access permissions
*/

-- Add trip-related columns to clients table
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS last_booked_trip_id uuid REFERENCES trips(id),
ADD COLUMN IF NOT EXISTS last_booked_trip_title text,
ADD COLUMN IF NOT EXISTS last_booked_trip_destination text,
ADD COLUMN IF NOT EXISTS last_booked_trip_date timestamptz,
ADD COLUMN IF NOT EXISTS preferred_destination text;

-- Add comments to document the fields
COMMENT ON COLUMN clients.last_booked_trip_id IS 'Reference to the last trip booked by this client';
COMMENT ON COLUMN clients.last_booked_trip_title IS 'Title of the last trip booked by this client';
COMMENT ON COLUMN clients.last_booked_trip_destination IS 'Destination of the last trip booked by this client';
COMMENT ON COLUMN clients.last_booked_trip_date IS 'Departure date of the last trip booked by this client';
COMMENT ON COLUMN clients.preferred_destination IS 'Client''s preferred destination (may differ from booked trip)';