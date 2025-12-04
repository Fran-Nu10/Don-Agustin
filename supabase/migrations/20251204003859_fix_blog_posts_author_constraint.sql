/*
  # Fix blog_posts author foreign key constraint
  
  1. Schema Changes
    - Drop existing foreign key that references auth.users
    - Update all author_id values to reference public.users.id
    - Add new foreign key constraint referencing public.users(id)
  
  2. Notes
    - Current constraint points to auth.users(id) which doesn't work with the app code
    - App code expects to JOIN with public.users table
    - This migration aligns the schema with the application code
*/

-- Step 1: Drop the existing foreign key constraint
ALTER TABLE blog_posts DROP CONSTRAINT IF EXISTS blog_posts_author_id_fkey;

-- Step 2: Update existing blog_posts to use public.users.id instead of auth.users.id
UPDATE blog_posts 
SET author_id = (
  SELECT u.id 
  FROM users u 
  WHERE u.user_id = blog_posts.author_id
)
WHERE EXISTS (
  SELECT 1 
  FROM users u 
  WHERE u.user_id = blog_posts.author_id
);

-- Step 3: Add the correct foreign key constraint referencing public.users
ALTER TABLE blog_posts 
ADD CONSTRAINT blog_posts_author_id_fkey 
FOREIGN KEY (author_id) 
REFERENCES users(id) 
ON DELETE CASCADE;