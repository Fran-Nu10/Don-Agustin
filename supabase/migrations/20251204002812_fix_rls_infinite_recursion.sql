/*
  # Corrección de Recursión Infinita en Políticas RLS
  
  ## Problema Identificado
  Las políticas RLS causaban recursión infinita porque intentaban leer de la tabla 'users'
  dentro de las propias políticas de 'users' y otras tablas. Esto creaba un ciclo infinito.
  
  ## Solución Implementada
  
  ### 1. Función Segura para Obtener Rol de Usuario
  - Se crea la función `get_user_role()` con SECURITY DEFINER
  - Esta función bypasea RLS y puede leer directamente de la tabla users
  - Devuelve el rol del usuario autenticado actual
  - Retorna NULL si el usuario no está autenticado o no existe en la tabla
  
  ### 2. Función Segura para Verificar si el Usuario Existe
  - Se crea la función `user_exists()` con SECURITY DEFINER
  - Verifica si el usuario autenticado existe en la tabla users
  - Útil para políticas que solo necesitan saber si el usuario está registrado
  
  ### 3. Eliminación de Políticas Problemáticas
  Se eliminan todas las políticas que causaban recursión:
  - "Owners can manage users" (tabla users)
  - "Admins can view bookings" (tabla bookings)
  - "Authenticated users can manage itinerary" (tabla itinerary_days)
  - "Authenticated users can manage services" (tabla included_services)
  - "Authenticated users can view all posts" (tabla blog_posts)
  - "Authenticated users can manage posts" (tabla blog_posts)
  - "Authenticated users can manage categories" (tabla blog_categories)
  - "Authenticated users can manage tags" (tabla blog_tags)
  - "Authenticated users can manage post tags" (tabla blog_posts_tags)
  - "Admins can view clients" (tabla clients)
  - "Admins can update clients" (tabla clients)
  - "Admins can delete clients" (tabla clients)
  - "Admins can view quotations" (tabla quotations)
  - "Admins can update quotations" (tabla quotations)
  - "Admins can delete quotations" (tabla quotations)
  
  ### 4. Nuevas Políticas Sin Recursión
  Se recrean todas las políticas usando las funciones seguras:
  - Uso de `get_user_role()` en lugar de subconsultas a users
  - Uso de `user_exists()` para verificación simple de existencia
  - Políticas más simples y eficientes
  - Sin riesgo de recursión infinita
  
  ## Seguridad
  - Las funciones SECURITY DEFINER se ejecutan con privilegios del creador
  - Solo devuelven información del usuario autenticado (auth.uid())
  - No exponen datos de otros usuarios
  - Mantienen el mismo nivel de seguridad que las políticas anteriores
*/

-- =====================================================
-- PASO 1: CREAR FUNCIONES SEGURAS
-- =====================================================

-- Función para obtener el rol del usuario actual sin pasar por RLS
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role
  FROM users
  WHERE user_id = auth.uid();
  
  RETURN user_role;
END;
$$;

-- Función para verificar si el usuario actual existe en la tabla users
CREATE OR REPLACE FUNCTION user_exists()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  exists_flag boolean;
BEGIN
  SELECT EXISTS(
    SELECT 1
    FROM users
    WHERE user_id = auth.uid()
  ) INTO exists_flag;
  
  RETURN exists_flag;
END;
$$;

-- =====================================================
-- PASO 2: ELIMINAR POLÍTICAS PROBLEMÁTICAS
-- =====================================================

-- Políticas de users
DROP POLICY IF EXISTS "Owners can manage users" ON users;

-- Políticas de bookings
DROP POLICY IF EXISTS "Admins can view bookings" ON bookings;

-- Políticas de itinerary_days
DROP POLICY IF EXISTS "Authenticated users can manage itinerary" ON itinerary_days;

-- Políticas de included_services
DROP POLICY IF EXISTS "Authenticated users can manage services" ON included_services;

-- Políticas de blog_posts
DROP POLICY IF EXISTS "Authenticated users can view all posts" ON blog_posts;
DROP POLICY IF EXISTS "Authenticated users can manage posts" ON blog_posts;

-- Políticas de blog_categories
DROP POLICY IF EXISTS "Authenticated users can manage categories" ON blog_categories;

-- Políticas de blog_tags
DROP POLICY IF EXISTS "Authenticated users can manage tags" ON blog_tags;

-- Políticas de blog_posts_tags
DROP POLICY IF EXISTS "Authenticated users can manage post tags" ON blog_posts_tags;

-- Políticas de clients
DROP POLICY IF EXISTS "Admins can view clients" ON clients;
DROP POLICY IF EXISTS "Admins can update clients" ON clients;
DROP POLICY IF EXISTS "Admins can delete clients" ON clients;

-- Políticas de quotations
DROP POLICY IF EXISTS "Admins can view quotations" ON quotations;
DROP POLICY IF EXISTS "Admins can update quotations" ON quotations;
DROP POLICY IF EXISTS "Admins can delete quotations" ON quotations;

-- =====================================================
-- PASO 3: CREAR NUEVAS POLÍTICAS SIN RECURSIÓN
-- =====================================================

-- ==================== USERS ====================

CREATE POLICY "Owners can manage all users"
  ON users FOR ALL
  TO authenticated
  USING (get_user_role() = 'owner');

CREATE POLICY "Users can insert themselves"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ==================== BOOKINGS ====================

CREATE POLICY "Staff can view all bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (get_user_role() IN ('owner', 'employee'));

CREATE POLICY "Staff can manage bookings"
  ON bookings FOR ALL
  TO authenticated
  USING (get_user_role() IN ('owner', 'employee'));

-- ==================== ITINERARY_DAYS ====================

CREATE POLICY "Staff can manage itinerary"
  ON itinerary_days FOR ALL
  TO authenticated
  USING (user_exists());

-- ==================== INCLUDED_SERVICES ====================

CREATE POLICY "Staff can manage services"
  ON included_services FOR ALL
  TO authenticated
  USING (user_exists());

-- ==================== BLOG_POSTS ====================

CREATE POLICY "Staff can view all blog posts"
  ON blog_posts FOR SELECT
  TO authenticated
  USING (user_exists());

CREATE POLICY "Staff can insert blog posts"
  ON blog_posts FOR INSERT
  TO authenticated
  WITH CHECK (user_exists() AND auth.uid() = author_id);

CREATE POLICY "Authors can update own posts"
  ON blog_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id OR get_user_role() = 'owner')
  WITH CHECK (auth.uid() = author_id OR get_user_role() = 'owner');

CREATE POLICY "Owners can delete any post"
  ON blog_posts FOR DELETE
  TO authenticated
  USING (get_user_role() = 'owner' OR auth.uid() = author_id);

-- ==================== BLOG_CATEGORIES ====================

CREATE POLICY "Staff can manage categories"
  ON blog_categories FOR ALL
  TO authenticated
  USING (user_exists());

-- ==================== BLOG_TAGS ====================

CREATE POLICY "Staff can manage tags"
  ON blog_tags FOR ALL
  TO authenticated
  USING (user_exists());

-- ==================== BLOG_POSTS_TAGS ====================

CREATE POLICY "Staff can manage post tags"
  ON blog_posts_tags FOR ALL
  TO authenticated
  USING (user_exists());

-- ==================== CLIENTS ====================

CREATE POLICY "Staff can view all clients"
  ON clients FOR SELECT
  TO authenticated
  USING (get_user_role() IN ('owner', 'employee'));

CREATE POLICY "Staff can update clients"
  ON clients FOR UPDATE
  TO authenticated
  USING (get_user_role() IN ('owner', 'employee'))
  WITH CHECK (get_user_role() IN ('owner', 'employee'));

CREATE POLICY "Staff can delete clients"
  ON clients FOR DELETE
  TO authenticated
  USING (get_user_role() IN ('owner', 'employee'));

-- ==================== QUOTATIONS ====================

CREATE POLICY "Staff can view all quotations"
  ON quotations FOR SELECT
  TO authenticated
  USING (get_user_role() IN ('owner', 'employee'));

CREATE POLICY "Staff can update quotations"
  ON quotations FOR UPDATE
  TO authenticated
  USING (get_user_role() IN ('owner', 'employee'))
  WITH CHECK (get_user_role() IN ('owner', 'employee'));

CREATE POLICY "Staff can delete quotations"
  ON quotations FOR DELETE
  TO authenticated
  USING (get_user_role() IN ('owner', 'employee'));

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Comentarios para verificación:
-- Las funciones get_user_role() y user_exists() ahora permiten que las políticas
-- verifiquen roles y existencia de usuarios sin crear recursión infinita.
-- Todas las operaciones de lectura/escritura ahora funcionarán correctamente.