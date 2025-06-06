/*
  # Mejoras al sistema de viajes

  1. Nuevas tablas
    - `itinerary_days` - Días del itinerario de cada viaje
    - `included_services` - Servicios incluidos en cada viaje
  
  2. Mejoras a trips
    - Agregar columna `created_by` si no existe
    - Actualizar constraint de categorías
  
  3. Seguridad
    - Habilitar RLS en nuevas tablas
    - Políticas para acceso público de lectura
    - Políticas para gestión por usuarios autenticados
    - Trigger para establecer created_by automáticamente
*/

-- Agregar columna created_by a trips si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'trips' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE trips ADD COLUMN created_by uuid REFERENCES auth.users(id);
  END IF;
END $$;

-- Actualizar constraint de categorías
ALTER TABLE trips DROP CONSTRAINT IF EXISTS trips_category_check;
ALTER TABLE trips ADD CONSTRAINT trips_category_check 
  CHECK (category = ANY (ARRAY['nacional'::text, 'internacional'::text, 'grupal'::text]));

-- Crear tabla itinerary_days si no existe
CREATE TABLE IF NOT EXISTS itinerary_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE,
  day integer NOT NULL,
  title text NOT NULL,
  description text
);

-- Crear tabla included_services si no existe
CREATE TABLE IF NOT EXISTS included_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE,
  icon text,
  title text NOT NULL,
  description text
);

-- Habilitar RLS en las nuevas tablas
ALTER TABLE itinerary_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE included_services ENABLE ROW LEVEL SECURITY;

-- Función para establecer created_by automáticamente
CREATE OR REPLACE FUNCTION set_created_by()
RETURNS TRIGGER AS $$
BEGIN
  NEW.created_by := auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para establecer created_by en trips
DROP TRIGGER IF EXISTS trg_set_created_by ON trips;
CREATE TRIGGER trg_set_created_by
  BEFORE INSERT ON trips
  FOR EACH ROW
  EXECUTE FUNCTION set_created_by();

-- Eliminar políticas existentes para itinerary_days
DROP POLICY IF EXISTS "Public read access" ON itinerary_days;
DROP POLICY IF EXISTS "Anyone can view itinerary" ON itinerary_days;
DROP POLICY IF EXISTS "Public can view itinerary" ON itinerary_days;
DROP POLICY IF EXISTS "Authenticated users can manage itinerary" ON itinerary_days;

-- Crear políticas para itinerary_days
CREATE POLICY "Public read access" ON itinerary_days
  FOR SELECT TO public USING (true);

CREATE POLICY "Authenticated users can manage itinerary" ON itinerary_days
  FOR ALL TO public
  USING (auth.uid() IN (SELECT id FROM users));

-- Eliminar políticas existentes para included_services
DROP POLICY IF EXISTS "Public read access" ON included_services;
DROP POLICY IF EXISTS "Anyone can view services" ON included_services;
DROP POLICY IF EXISTS "Public can view services" ON included_services;
DROP POLICY IF EXISTS "Authenticated users can manage services" ON included_services;

-- Crear políticas para included_services
CREATE POLICY "Public read access" ON included_services
  FOR SELECT TO public USING (true);

CREATE POLICY "Authenticated users can manage services" ON included_services
  FOR ALL TO public
  USING (auth.uid() IN (SELECT id FROM users));

-- Actualizar políticas de trips
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON trips;
DROP POLICY IF EXISTS "Enable update for trip owners" ON trips;
DROP POLICY IF EXISTS "Enable delete for trip owners" ON trips;

CREATE POLICY "Enable insert for authenticated users" ON trips
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for trip owners" ON trips
  FOR UPDATE TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Enable delete for trip owners" ON trips
  FOR DELETE TO authenticated
  USING (auth.uid() = created_by);