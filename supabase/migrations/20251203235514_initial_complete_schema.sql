/*
  # Sistema Completo de Don Agustín Viajes
  
  ## Descripción
  Crea todas las tablas y estructuras necesarias para el sistema de gestión de viajes, incluyendo:
  - Sistema de usuarios y autenticación
  - Gestión de viajes y reservas
  - Sistema de blog
  - CRM para clientes
  - Sistema de cotizaciones
  - Soporte para múltiples monedas (UYU/USD)
  
  ## Tablas Creadas
  
  ### 1. users
  - Tabla de usuarios del sistema (propietarios y empleados)
  - Campos: id, user_id, email, role, password_hash, created_at
  - user_id: referencia a auth.users para integración con autenticación de Supabase
  
  ### 2. trips
  - Paquetes de viajes disponibles
  - Campos: id, title, destination, description, price, currency_type, departure_date, return_date, 
    available_spots, image_url, category, created_by, created_at, updated_at
  - Soporta categorías: nacional, internacional, grupal
  - Soporta monedas: UYU, USD
  
  ### 3. bookings
  - Reservas de clientes
  - Campos: id, trip_id, name, email, phone, created_at
  
  ### 4. itinerary_days
  - Itinerario diario de cada viaje
  - Campos: id, trip_id, day, title, description
  
  ### 5. included_services
  - Servicios incluidos en cada viaje
  - Campos: id, trip_id, icon, title, description
  
  ### 6. blog_posts
  - Publicaciones del blog
  - Campos: id, title, slug, excerpt, content, image_url, category, author_id, status, 
    published_at, created_at, updated_at
  
  ### 7. blog_categories
  - Categorías del blog
  - Campos: id, name, slug, created_at
  
  ### 8. blog_tags
  - Etiquetas del blog
  - Campos: id, name, slug, created_at
  
  ### 9. blog_posts_tags
  - Relación muchos-a-muchos entre posts y tags
  - Campos: post_id, tag_id
  
  ### 10. clients
  - CRM de clientes
  - Campos: id, name, email, phone, message, status, internal_notes, scheduled_date,
    last_booked_trip_id, last_booked_trip_title, last_booked_trip_destination,
    last_booked_trip_date, preferred_destination, trip_value, trip_value_currency,
    created_at, updated_at
  - Soporta monedas: UYU, USD para trip_value
  
  ### 11. quotations
  - Solicitudes de cotización
  - Campos: id, name, email, phone, destination, departure_date, return_date, department,
    flexible_dates, adults, children, observations, status, trip_id, trip_title,
    trip_destination, trip_price, trip_price_currency, created_at, updated_at
  - Soporta monedas: UYU, USD para trip_price
  
  ## Seguridad (RLS)
  - Todas las tablas tienen RLS habilitado
  - Acceso público para lectura de viajes, blog y servicios
  - Acceso público para crear bookings, clients y quotations
  - Acceso restringido para usuarios autenticados en gestión de contenido
  - Políticas específicas para roles owner y employee
  
  ## Funciones y Triggers
  - update_updated_at_column(): Actualiza automáticamente el campo updated_at
  - set_created_by(): Establece automáticamente created_by en trips
  - Triggers para actualización automática de timestamps
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================================================
-- TABLA: users
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('owner', 'employee')),
  password_hash text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- TABLA: trips
-- =====================================================
CREATE TABLE IF NOT EXISTS trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  destination text NOT NULL,
  description text NOT NULL,
  price numeric NOT NULL CHECK (price >= 0),
  currency_type text NOT NULL DEFAULT 'UYU' CHECK (currency_type IN ('UYU', 'USD')),
  departure_date timestamptz NOT NULL,
  return_date timestamptz NOT NULL,
  available_spots integer NOT NULL CHECK (available_spots >= 0),
  image_url text NOT NULL,
  category text NOT NULL CHECK (category IN ('nacional', 'internacional', 'grupal')),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- TABLA: bookings
-- =====================================================
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES trips ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- TABLA: itinerary_days
-- =====================================================
CREATE TABLE IF NOT EXISTS itinerary_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES trips ON DELETE CASCADE,
  day integer NOT NULL,
  title text NOT NULL,
  description text
);

ALTER TABLE itinerary_days ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- TABLA: included_services
-- =====================================================
CREATE TABLE IF NOT EXISTS included_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES trips ON DELETE CASCADE,
  icon text,
  title text NOT NULL,
  description text
);

ALTER TABLE included_services ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- TABLA: blog_posts
-- =====================================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text,
  content text NOT NULL,
  image_url text NOT NULL,
  category text NOT NULL,
  author_id uuid REFERENCES auth.users NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- TABLA: blog_categories
-- =====================================================
CREATE TABLE IF NOT EXISTS blog_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- TABLA: blog_tags
-- =====================================================
CREATE TABLE IF NOT EXISTS blog_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- TABLA: blog_posts_tags
-- =====================================================
CREATE TABLE IF NOT EXISTS blog_posts_tags (
  post_id uuid REFERENCES blog_posts ON DELETE CASCADE,
  tag_id uuid REFERENCES blog_tags ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

ALTER TABLE blog_posts_tags ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- TABLA: clients
-- =====================================================
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text,
  status text NOT NULL DEFAULT 'nuevo' CHECK (status IN ('nuevo', 'en_proceso', 'cerrado')),
  internal_notes text,
  scheduled_date timestamptz,
  last_booked_trip_id uuid REFERENCES trips(id) ON DELETE SET NULL,
  last_booked_trip_title text,
  last_booked_trip_destination text,
  last_booked_trip_date timestamptz,
  preferred_destination text,
  trip_value numeric DEFAULT 0,
  trip_value_currency text CHECK (trip_value_currency IN ('UYU', 'USD')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- TABLA: quotations
-- =====================================================
CREATE TABLE IF NOT EXISTS quotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  destination text,
  departure_date date,
  return_date date,
  department text,
  flexible_dates boolean DEFAULT false,
  adults integer DEFAULT 1,
  children integer DEFAULT 0,
  observations text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'quoted', 'closed')),
  trip_id uuid REFERENCES trips(id),
  trip_title text,
  trip_destination text,
  trip_price numeric,
  trip_price_currency text CHECK (trip_price_currency IN ('UYU', 'USD')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para establecer created_by automáticamente
CREATE OR REPLACE FUNCTION set_created_by()
RETURNS TRIGGER AS $$
BEGIN
  NEW.created_by := auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers para trips
CREATE TRIGGER trg_set_created_by
  BEFORE INSERT ON trips
  FOR EACH ROW
  EXECUTE FUNCTION set_created_by();

CREATE TRIGGER update_trips_updated_at
  BEFORE UPDATE ON trips
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Triggers para blog_posts
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Triggers para clients
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Triggers para quotations
CREATE TRIGGER update_quotations_updated_at
  BEFORE UPDATE ON quotations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- POLÍTICAS RLS - USERS
-- =====================================================

CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Owners can manage users"
  ON users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.user_id = auth.uid() 
      AND u.role = 'owner'
    )
  );

-- =====================================================
-- POLÍTICAS RLS - TRIPS
-- =====================================================

CREATE POLICY "Public can view trips"
  ON trips FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert trips"
  ON trips FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Trip owners can update trips"
  ON trips FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Trip owners can delete trips"
  ON trips FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- =====================================================
-- POLÍTICAS RLS - BOOKINGS
-- =====================================================

CREATE POLICY "Public can create bookings"
  ON bookings FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admins can view bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.user_id = auth.uid() 
      AND u.role IN ('owner', 'employee')
    )
  );

-- =====================================================
-- POLÍTICAS RLS - ITINERARY_DAYS
-- =====================================================

CREATE POLICY "Public can view itinerary"
  ON itinerary_days FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage itinerary"
  ON itinerary_days FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.user_id = auth.uid()
    )
  );

-- =====================================================
-- POLÍTICAS RLS - INCLUDED_SERVICES
-- =====================================================

CREATE POLICY "Public can view services"
  ON included_services FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage services"
  ON included_services FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.user_id = auth.uid()
    )
  );

-- =====================================================
-- POLÍTICAS RLS - BLOG_POSTS
-- =====================================================

CREATE POLICY "Public can view published posts"
  ON blog_posts FOR SELECT
  USING (status = 'published');

CREATE POLICY "Authenticated users can view all posts"
  ON blog_posts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can manage posts"
  ON blog_posts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.user_id = auth.uid()
    )
  );

-- =====================================================
-- POLÍTICAS RLS - BLOG_CATEGORIES
-- =====================================================

CREATE POLICY "Public can view categories"
  ON blog_categories FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage categories"
  ON blog_categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.user_id = auth.uid()
    )
  );

-- =====================================================
-- POLÍTICAS RLS - BLOG_TAGS
-- =====================================================

CREATE POLICY "Public can view tags"
  ON blog_tags FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage tags"
  ON blog_tags FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.user_id = auth.uid()
    )
  );

-- =====================================================
-- POLÍTICAS RLS - BLOG_POSTS_TAGS
-- =====================================================

CREATE POLICY "Public can view post tags"
  ON blog_posts_tags FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage post tags"
  ON blog_posts_tags FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.user_id = auth.uid()
    )
  );

-- =====================================================
-- POLÍTICAS RLS - CLIENTS
-- =====================================================

CREATE POLICY "Public can create clients"
  ON clients FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admins can view clients"
  ON clients FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.user_id = auth.uid() 
      AND u.role IN ('owner', 'employee')
    )
  );

CREATE POLICY "Admins can update clients"
  ON clients FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.user_id = auth.uid() 
      AND u.role IN ('owner', 'employee')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.user_id = auth.uid() 
      AND u.role IN ('owner', 'employee')
    )
  );

CREATE POLICY "Admins can delete clients"
  ON clients FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.user_id = auth.uid() 
      AND u.role IN ('owner', 'employee')
    )
  );

-- =====================================================
-- POLÍTICAS RLS - QUOTATIONS
-- =====================================================

CREATE POLICY "Public can create quotations"
  ON quotations FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admins can view quotations"
  ON quotations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.user_id = auth.uid() 
      AND u.role IN ('owner', 'employee')
    )
  );

CREATE POLICY "Admins can update quotations"
  ON quotations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.user_id = auth.uid() 
      AND u.role IN ('owner', 'employee')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.user_id = auth.uid() 
      AND u.role IN ('owner', 'employee')
    )
  );

CREATE POLICY "Admins can delete quotations"
  ON quotations FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.user_id = auth.uid() 
      AND u.role IN ('owner', 'employee')
    )
  );

-- =====================================================
-- DATOS INICIALES
-- =====================================================

-- Insertar categorías de blog
INSERT INTO blog_categories (name, slug) VALUES
  ('Tips para viajar', 'tips'),
  ('Destinos', 'destinos'),
  ('Consejos', 'consejos'),
  ('Experiencias', 'experiencias'),
  ('Cultura', 'cultura')
ON CONFLICT (slug) DO NOTHING;

-- Insertar tags de blog
INSERT INTO blog_tags (name, slug) VALUES
  ('Viajes', 'viajes'),
  ('Aventura', 'aventura'),
  ('Gastronomía', 'gastronomia'),
  ('Cultura', 'cultura'),
  ('Naturaleza', 'naturaleza'),
  ('Playa', 'playa'),
  ('Montaña', 'montana'),
  ('Ciudad', 'ciudad'),
  ('Presupuesto', 'presupuesto'),
  ('Alojamiento', 'alojamiento')
ON CONFLICT (slug) DO NOTHING;