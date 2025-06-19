/*
  # Update quotations table for trip details

  1. Changes
    - Add trip_id column to quotations table with foreign key to trips
    - Add trip_title, trip_destination, and trip_price columns
    - These columns allow storing trip details directly in the quotation
    - Enables better reporting and tracking of quotation sources

  2. Security
    - Maintain existing RLS policies
    - No changes to access permissions
*/

-- Add trip-related columns to quotations table
ALTER TABLE quotations 
ADD COLUMN IF NOT EXISTS trip_id uuid REFERENCES trips(id),
ADD COLUMN IF NOT EXISTS trip_title text,
ADD COLUMN IF NOT EXISTS trip_destination text,
ADD COLUMN IF NOT EXISTS trip_price numeric;

-- Add comments to document the fields
COMMENT ON COLUMN quotations.trip_id IS 'Reference to the trip being quoted';
COMMENT ON COLUMN quotations.trip_title IS 'Title of the trip being quoted';
COMMENT ON COLUMN quotations.trip_destination IS 'Destination of the trip being quoted';
COMMENT ON COLUMN quotations.trip_price IS 'Price of the trip being quoted';