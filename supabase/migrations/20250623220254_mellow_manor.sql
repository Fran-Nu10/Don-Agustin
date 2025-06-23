/*
  # Update trip tags to new system

  1. Changes
    - Update existing trips to use the new tag system
    - Convert old tags (dream, featured, popular, new, sale) to new tags
    - Add new tags (terrestre, vuelos, baja temporada, verano, eventos, exprés)
  
  2. Security
    - No changes to RLS policies
    - Maintains existing security model
*/

-- Update existing trips with old tags to use new tags
UPDATE trips
SET tags = ARRAY['terrestre']::text[]
WHERE 'dream' = ANY(tags) AND category = 'nacional';

UPDATE trips
SET tags = ARRAY['vuelos']::text[]
WHERE 'featured' = ANY(tags) AND category = 'internacional';

UPDATE trips
SET tags = ARRAY['eventos']::text[]
WHERE 'popular' = ANY(tags) AND category = 'grupal';

UPDATE trips
SET tags = ARRAY['baja temporada']::text[]
WHERE 'new' = ANY(tags);

UPDATE trips
SET tags = ARRAY['verano']::text[]
WHERE 'sale' = ANY(tags);

-- Add default tags to trips without tags
UPDATE trips
SET tags = ARRAY['terrestre']::text[]
WHERE tags IS NULL OR array_length(tags, 1) = 0 AND category = 'nacional';

UPDATE trips
SET tags = ARRAY['vuelos']::text[]
WHERE tags IS NULL OR array_length(tags, 1) = 0 AND category = 'internacional';

UPDATE trips
SET tags = ARRAY['eventos']::text[]
WHERE tags IS NULL OR array_length(tags, 1) = 0 AND category = 'grupal';

-- Add seasonal tags based on departure date
UPDATE trips
SET tags = array_append(tags, 'verano')
WHERE 
  NOT 'verano' = ANY(tags) AND
  (EXTRACT(MONTH FROM departure_date::timestamp) IN (12, 1, 2, 3));

UPDATE trips
SET tags = array_append(tags, 'baja temporada')
WHERE 
  NOT 'baja temporada' = ANY(tags) AND
  (EXTRACT(MONTH FROM departure_date::timestamp) IN (4, 5, 6, 7, 8, 9, 10, 11));

-- Add exprés tag to short trips (5 days or less)
UPDATE trips
SET tags = array_append(tags, 'exprés')
WHERE 
  NOT 'exprés' = ANY(tags) AND
  (EXTRACT(DAY FROM (return_date::timestamp - departure_date::timestamp)) <= 5);