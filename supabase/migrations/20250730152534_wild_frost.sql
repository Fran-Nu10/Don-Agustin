/*
  # Add Currency Support to Travel System

  1. New Columns
    - `trips.currency_type` (TEXT, NOT NULL, DEFAULT 'UYU')
      - Stores the currency type for trip prices ('UYU' or 'USD')
    - `quotations.trip_price_currency` (TEXT)
      - Stores the currency type for quotation trip prices ('UYU' or 'USD')
    - `clients.trip_value_currency` (TEXT)
      - Stores the currency type for client trip values ('UYU' or 'USD')

  2. Constraints
    - CHECK constraints to ensure only 'UYU' or 'USD' values are allowed
    - Default values set to 'UYU' for backward compatibility

  3. Data Migration
    - All existing records will default to 'UYU' currency
    - No data loss, fully backward compatible
*/

-- Add currency_type column to trips table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'trips' AND column_name = 'currency_type'
  ) THEN
    ALTER TABLE trips ADD COLUMN currency_type TEXT NOT NULL DEFAULT 'UYU';
    
    -- Add check constraint for currency_type
    ALTER TABLE trips ADD CONSTRAINT trips_currency_type_check 
    CHECK (currency_type = ANY (ARRAY['UYU'::text, 'USD'::text]));
  END IF;
END $$;

-- Add trip_price_currency column to quotations table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quotations' AND column_name = 'trip_price_currency'
  ) THEN
    ALTER TABLE quotations ADD COLUMN trip_price_currency TEXT;
    
    -- Add check constraint for trip_price_currency
    ALTER TABLE quotations ADD CONSTRAINT quotations_trip_price_currency_check 
    CHECK (trip_price_currency = ANY (ARRAY['UYU'::text, 'USD'::text]));
  END IF;
END $$;

-- Add trip_value_currency column to clients table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'trip_value_currency'
  ) THEN
    ALTER TABLE clients ADD COLUMN trip_value_currency TEXT;
    
    -- Add check constraint for trip_value_currency
    ALTER TABLE clients ADD CONSTRAINT clients_trip_value_currency_check 
    CHECK (trip_value_currency = ANY (ARRAY['UYU'::text, 'USD'::text]));
  END IF;
END $$;

-- Update existing quotations to inherit currency from their associated trips
UPDATE quotations 
SET trip_price_currency = (
  SELECT currency_type 
  FROM trips 
  WHERE trips.id = quotations.trip_id
)
WHERE trip_id IS NOT NULL AND trip_price_currency IS NULL;

-- Update existing clients to default to UYU currency for trip values
UPDATE clients 
SET trip_value_currency = 'UYU'
WHERE trip_value IS NOT NULL AND trip_value_currency IS NULL;