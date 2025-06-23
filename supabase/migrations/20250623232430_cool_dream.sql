/*
  # Fix price display to always show in USD

  1. Changes
    - Add a view to convert prices from UYU to USD
    - Add a function to convert prices for API responses
    - Update existing trips to store prices in a consistent format
    - Add a trigger to ensure new prices are stored correctly

  2. Security
    - No changes to RLS policies
    - Maintains existing security model
*/

-- Create a function to convert UYU to USD
CREATE OR REPLACE FUNCTION convert_uyu_to_usd(price_uyu numeric)
RETURNS numeric AS $$
BEGIN
  -- Using an approximate conversion rate of 40 UYU = 1 USD
  RETURN ROUND(price_uyu / 40);
END;
$$ LANGUAGE plpgsql;

-- Create a view that shows trips with prices in USD
CREATE OR REPLACE VIEW trips_usd AS
SELECT 
  id,
  title,
  destination,
  description,
  convert_uyu_to_usd(price) AS price_usd,
  price AS price_uyu,
  departure_date,
  return_date,
  available_spots,
  image_url,
  category,
  created_at,
  updated_at,
  created_by,
  info_pdf_url,
  info_pdf_name,
  tags
FROM trips;

-- Add a function to ensure consistent price format in the database
CREATE OR REPLACE FUNCTION ensure_price_format()
RETURNS TRIGGER AS $$
BEGIN
  -- If price is too small (likely already in USD), multiply by 40
  IF NEW.price < 1000 AND NEW.price > 0 THEN
    NEW.price := NEW.price * 40;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to ensure prices are stored consistently
DROP TRIGGER IF EXISTS ensure_price_format_trigger ON trips;
CREATE TRIGGER ensure_price_format_trigger
  BEFORE INSERT OR UPDATE ON trips
  FOR EACH ROW
  EXECUTE FUNCTION ensure_price_format();

-- Update existing trips to ensure consistent price format
UPDATE trips
SET price = price * 40
WHERE price < 1000 AND price > 0;