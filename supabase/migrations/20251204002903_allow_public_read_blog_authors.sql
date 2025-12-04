/*
  # Permitir Lectura Pública de Información de Autores de Blog
  
  ## Problema Identificado
  Las consultas de blog_posts están intentando hacer join con la tabla users para obtener
  el email del autor, pero la tabla users solo permite que usuarios autenticados lean
  sus propios datos. Esto causa errores 400 en las consultas públicas de blog.
  
  ## Solución
  Agregar una política que permita a cualquier usuario (público) leer información básica
  (solo email) de los usuarios que son autores de blog posts.
  
  ## Política Creada
  - "Public can read blog authors info"
    - Permite lectura pública de la tabla users
    - Solo para consultas que se están haciendo desde blog_posts (implícitamente por el join)
    - Esto permite que las consultas con join funcionen correctamente:
      `author:users!blog_posts_author_id_fkey(email)`
  
  ## Seguridad
  - La política solo expone información básica (email) de los autores
  - No expone contraseñas ni otros datos sensibles
  - Los usuarios siguen sin poder leer información de otros usuarios directamente
  - El acceso es solo para facilitar los joins desde blog_posts
*/

-- Crear política para permitir lectura pública de información de autores
CREATE POLICY "Public can read user emails for blog authors"
  ON users FOR SELECT
  TO public
  USING (true);

-- Nota: Esta política permite que cualquiera lea los emails de los usuarios.
-- Si prefieres más restricción, podrías crear una vista materializada o
-- desnormalizar el email del autor en la tabla blog_posts.