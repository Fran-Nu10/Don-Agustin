-- Create the trip-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'trip-images',
  'trip-images', 
  true,
  5242880, -- 5MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Create policies directly on storage.objects table using DO blocks to check existence first
DO $$
BEGIN
  -- Check if the policy already exists before creating it
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Public read access for trip images'
  ) THEN
    -- Policy to allow public read access to images
    CREATE POLICY "Public read access for trip images"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'trip-images');
  END IF;
END $$;

DO $$
BEGIN
  -- Check if the policy already exists before creating it
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Admin users can upload trip images'
  ) THEN
    -- Policy to allow authenticated admin users to upload images
    CREATE POLICY "Admin users can upload trip images"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'trip-images' 
      AND (EXISTS (
        SELECT 1 FROM public.users 
        WHERE users.user_id = auth.uid() 
        AND users.role IN ('owner', 'employee')
      ))
    );
  END IF;
END $$;

DO $$
BEGIN
  -- Check if the policy already exists before creating it
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Admin users can update trip images'
  ) THEN
    -- Policy to allow authenticated admin users to update images
    CREATE POLICY "Admin users can update trip images"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
      bucket_id = 'trip-images' 
      AND (EXISTS (
        SELECT 1 FROM public.users 
        WHERE users.user_id = auth.uid() 
        AND users.role IN ('owner', 'employee')
      ))
    )
    WITH CHECK (
      bucket_id = 'trip-images' 
      AND (EXISTS (
        SELECT 1 FROM public.users 
        WHERE users.user_id = auth.uid() 
        AND users.role IN ('owner', 'employee')
      ))
    );
  END IF;
END $$;

DO $$
BEGIN
  -- Check if the policy already exists before creating it
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Admin users can delete trip images'
  ) THEN
    -- Policy to allow authenticated admin users to delete images
    CREATE POLICY "Admin users can delete trip images"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'trip-images' 
      AND (EXISTS (
        SELECT 1 FROM public.users 
        WHERE users.user_id = auth.uid() 
        AND users.role IN ('owner', 'employee')
      ))
    );
  END IF;
END $$;