/*
  # Add tags array to trips table
  
  1. Changes
    - Add tags column to trips table as text array
    - Default to empty array
    - Add comment to document the field
  
  2. Security
    - No changes to RLS policies
    - Maintains existing security model
*/

-- Add tags column to trips table
ALTER TABLE trips 
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- Add comment to document the field
COMMENT ON COLUMN trips.tags IS 'Tags para categorizar viajes (ej: dream, featured, popular)';