-- Create the trip-pdfs bucket directly in storage.buckets table
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'trip-pdfs',
  'trip-pdfs', 
  true,
  10485760, -- 10MB in bytes
  ARRAY['application/pdf']::text[]
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
    AND policyname = 'Public read access for trip PDFs'
  ) THEN
    -- Policy to allow public read access to PDFs
    CREATE POLICY "Public read access for trip PDFs"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'trip-pdfs');
  END IF;
END $$;

DO $$
BEGIN
  -- Check if the policy already exists before creating it
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Admin users can upload trip PDFs'
  ) THEN
    -- Policy to allow authenticated admin users to upload PDFs
    CREATE POLICY "Admin users can upload trip PDFs"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'trip-pdfs' 
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
    AND policyname = 'Admin users can update trip PDFs'
  ) THEN
    -- Policy to allow authenticated admin users to update PDFs
    CREATE POLICY "Admin users can update trip PDFs"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
      bucket_id = 'trip-pdfs' 
      AND (EXISTS (
        SELECT 1 FROM public.users 
        WHERE users.user_id = auth.uid() 
        AND users.role IN ('owner', 'employee')
      ))
    )
    WITH CHECK (
      bucket_id = 'trip-pdfs' 
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
    AND policyname = 'Admin users can delete trip PDFs'
  ) THEN
    -- Policy to allow authenticated admin users to delete PDFs
    CREATE POLICY "Admin users can delete trip PDFs"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'trip-pdfs' 
      AND (EXISTS (
        SELECT 1 FROM public.users 
        WHERE users.user_id = auth.uid() 
        AND users.role IN ('owner', 'employee')
      ))
    );
  END IF;
END $$;