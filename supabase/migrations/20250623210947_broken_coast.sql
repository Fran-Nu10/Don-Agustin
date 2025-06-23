/*
  # Create blog-images storage bucket

  1. Storage Setup
    - Create 'blog-images' bucket for blog post images
    - Configure public access for image viewing
    - Set up appropriate file size and type restrictions

  2. Security
    - Allow public read access for published blog images
    - Allow authenticated admin users to upload/manage images
    - Set file size limits and allowed file types
*/

-- Create the blog-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'blog-images',
  'blog-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Allow public read access to blog images
CREATE POLICY "Public read access for blog images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'blog-images');

-- Allow authenticated admin users to upload blog images
CREATE POLICY "Admin users can upload blog images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'blog-images' AND
  EXISTS (
    SELECT 1 FROM users
    WHERE users.user_id = auth.uid()
    AND users.role IN ('owner', 'employee')
  )
);

-- Allow authenticated admin users to update blog images
CREATE POLICY "Admin users can update blog images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'blog-images' AND
  EXISTS (
    SELECT 1 FROM users
    WHERE users.user_id = auth.uid()
    AND users.role IN ('owner', 'employee')
  )
)
WITH CHECK (
  bucket_id = 'blog-images' AND
  EXISTS (
    SELECT 1 FROM users
    WHERE users.user_id = auth.uid()
    AND users.role IN ('owner', 'employee')
  )
);

-- Allow authenticated admin users to delete blog images
CREATE POLICY "Admin users can delete blog images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'blog-images' AND
  EXISTS (
    SELECT 1 FROM users
    WHERE users.user_id = auth.uid()
    AND users.role IN ('owner', 'employee')
  )
);