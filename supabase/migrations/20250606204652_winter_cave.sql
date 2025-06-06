/*
  # Fix RLS policies comprehensively for users and blog tables

  1. Clean up all existing policies on users table
  2. Create simple, non-conflicting policies for users table
  3. Ensure blog_posts policies work correctly with users table
  4. Test that anonymous users can read blog posts with author info
*/

-- First, disable RLS temporarily to clean up
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies on users table
DO $$ 
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'users' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON users';
    END LOOP;
END $$;

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create simple, comprehensive policies for users table
-- Policy 1: Allow everyone (anonymous and authenticated) to read basic user info
CREATE POLICY "users_select_public"
  ON users
  FOR SELECT
  TO public
  USING (true);

-- Policy 2: Allow authenticated users to insert their own record
CREATE POLICY "users_insert_own"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy 3: Allow users to update their own data
CREATE POLICY "users_update_own"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy 4: Allow owners to manage all users
CREATE POLICY "users_owners_all"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.user_id = auth.uid() 
      AND u.role = 'owner'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.user_id = auth.uid() 
      AND u.role = 'owner'
    )
  );

-- Now fix blog_posts policies to ensure they work with the users table
-- Drop existing blog_posts policies that might conflict
DROP POLICY IF EXISTS "Public can view published posts" ON blog_posts;
DROP POLICY IF EXISTS "Owners can manage all posts" ON blog_posts;

-- Create clean blog_posts policies
-- Policy 1: Allow everyone to read published posts
CREATE POLICY "blog_posts_select_published"
  ON blog_posts
  FOR SELECT
  TO public
  USING (status = 'published');

-- Policy 2: Allow authenticated users to read all posts (for admin)
CREATE POLICY "blog_posts_select_all_authenticated"
  ON blog_posts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.user_id = auth.uid() 
      AND u.role IN ('owner', 'employee')
    )
  );

-- Policy 3: Allow owners and employees to manage all posts
CREATE POLICY "blog_posts_manage_admin"
  ON blog_posts
  FOR ALL
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

-- Ensure blog_categories and blog_tags have proper policies
-- Drop existing policies
DROP POLICY IF EXISTS "Public can view categories" ON blog_categories;
DROP POLICY IF EXISTS "Owners can manage categories" ON blog_categories;
DROP POLICY IF EXISTS "Public can view tags" ON blog_tags;
DROP POLICY IF EXISTS "Owners can manage tags" ON blog_tags;

-- Create simple policies for blog_categories
CREATE POLICY "blog_categories_select_public"
  ON blog_categories
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "blog_categories_manage_admin"
  ON blog_categories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.user_id = auth.uid() 
      AND u.role = 'owner'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.user_id = auth.uid() 
      AND u.role = 'owner'
    )
  );

-- Create simple policies for blog_tags
CREATE POLICY "blog_tags_select_public"
  ON blog_tags
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "blog_tags_manage_admin"
  ON blog_tags
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.user_id = auth.uid() 
      AND u.role = 'owner'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.user_id = auth.uid() 
      AND u.role = 'owner'
    )
  );

-- Fix blog_posts_tags junction table policies
DROP POLICY IF EXISTS "Public can view post tags" ON blog_posts_tags;
DROP POLICY IF EXISTS "Owners can manage post tags" ON blog_posts_tags;

CREATE POLICY "blog_posts_tags_select_public"
  ON blog_posts_tags
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "blog_posts_tags_manage_admin"
  ON blog_posts_tags
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.user_id = auth.uid() 
      AND u.role = 'owner'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.user_id = auth.uid() 
      AND u.role = 'owner'
    )
  );