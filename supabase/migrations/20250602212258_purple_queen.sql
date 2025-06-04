/*
  # Blog System Implementation

  1. New Tables
    - `blog_posts`
      - `id` (uuid, primary key)
      - `title` (text)
      - `slug` (text, unique)
      - `excerpt` (text)
      - `content` (text)
      - `image_url` (text)
      - `category` (text)
      - `author_id` (uuid, references users)
      - `status` (text)
      - `published_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    - `blog_categories`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `slug` (text, unique)
      - `created_at` (timestamptz)
    - `blog_tags`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `slug` (text, unique)
      - `created_at` (timestamptz)
    - `blog_posts_tags`
      - `post_id` (uuid, references blog_posts)
      - `tag_id` (uuid, references blog_tags)
      - Primary key (post_id, tag_id)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage blog content
    - Add policies for public read access
*/

-- Create blog_posts table
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

-- Create blog_categories table
CREATE TABLE IF NOT EXISTS blog_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create blog_tags table
CREATE TABLE IF NOT EXISTS blog_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create blog_posts_tags junction table
CREATE TABLE IF NOT EXISTS blog_posts_tags (
  post_id uuid REFERENCES blog_posts ON DELETE CASCADE,
  tag_id uuid REFERENCES blog_tags ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- Enable RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts_tags ENABLE ROW LEVEL SECURITY;

-- Policies for blog_posts
CREATE POLICY "Public can view published posts" ON blog_posts
  FOR SELECT
  USING (status = 'published');

CREATE POLICY "Owners can manage all posts" ON blog_posts
  FOR ALL
  USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE role = 'owner'
  ));

-- Policies for blog_categories
CREATE POLICY "Public can view categories" ON blog_categories
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Owners can manage categories" ON blog_categories
  FOR ALL
  USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE role = 'owner'
  ));

-- Policies for blog_tags
CREATE POLICY "Public can view tags" ON blog_tags
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Owners can manage tags" ON blog_tags
  FOR ALL
  USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE role = 'owner'
  ));

-- Policies for blog_posts_tags
CREATE POLICY "Public can view post tags" ON blog_posts_tags
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Owners can manage post tags" ON blog_posts_tags
  FOR ALL
  USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE role = 'owner'
  ));

-- Insert initial categories
INSERT INTO blog_categories (name, slug) VALUES
  ('Tips para viajar', 'tips'),
  ('Destinos', 'destinos'),
  ('Consejos', 'consejos'),
  ('Experiencias', 'experiencias'),
  ('Cultura', 'cultura');

-- Insert initial tags
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
  ('Alojamiento', 'alojamiento');