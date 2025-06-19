/*
  # Add trip-related fields to quotations table

  1. Changes
    - Add trip_id, trip_title, trip_destination, and trip_price columns to quotations table
    - These fields allow tracking which trip a quotation is for
    - Improves reporting and follow-up capabilities

  2. Security
    - No changes to RLS policies
    - Maintains existing security model
*/

-- Add trip-related columns to quotations table if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quotations' AND column_name = 'trip_id'
  ) THEN
    ALTER TABLE quotations ADD COLUMN trip_id uuid REFERENCES trips(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quotations' AND column_name = 'trip_title'
  ) THEN
    ALTER TABLE quotations ADD COLUMN trip_title text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quotations' AND column_name = 'trip_destination'
  ) THEN
    ALTER TABLE quotations ADD COLUMN trip_destination text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quotations' AND column_name = 'trip_price'
  ) THEN
    ALTER TABLE quotations ADD COLUMN trip_price numeric;
  END IF;
END $$;

-- Add comments to document the fields
COMMENT ON COLUMN quotations.trip_id IS 'Reference to the trip being quoted';
COMMENT ON COLUMN quotations.trip_title IS 'Title of the trip being quoted';
COMMENT ON COLUMN quotations.trip_destination IS 'Destination of the trip being quoted';
COMMENT ON COLUMN quotations.trip_price IS 'Price of the trip being quoted';