/*
  # Create storage bucket for trip PDFs

  1. Changes
    - Create a storage bucket for trip PDFs
    - Set appropriate permissions for the bucket
    - Allow public read access
    - Restrict write access to authenticated admin users
*/

-- Create the trip-pdfs bucket using the storage API
SELECT storage.create_bucket(
  'trip-pdfs',
  'Public bucket for trip PDF documents',
  public := true,
  file_size_limit := 10485760, -- 10MB in bytes
  allowed_mime_types := ARRAY['application/pdf']::text[]
);

-- Create policies for the bucket using the storage API
-- Policy to allow public read access to PDFs
BEGIN;
  SELECT storage.create_policy(
    'trip-pdfs',
    'Public read access for trip PDFs',
    'SELECT',
    'public',
    true,
    true
  );

  -- Policy to allow authenticated admin users to upload PDFs
  SELECT storage.create_policy(
    'trip-pdfs',
    'Admin users can upload trip PDFs',
    'INSERT',
    'authenticated',
    'bucket_id = ''trip-pdfs'' AND (EXISTS (SELECT 1 FROM users WHERE users.user_id = auth.uid() AND users.role IN (''owner'', ''employee'')))',
    true
  );

  -- Policy to allow authenticated admin users to update PDFs
  SELECT storage.create_policy(
    'trip-pdfs',
    'Admin users can update trip PDFs',
    'UPDATE',
    'authenticated',
    'bucket_id = ''trip-pdfs'' AND (EXISTS (SELECT 1 FROM users WHERE users.user_id = auth.uid() AND users.role IN (''owner'', ''employee'')))',
    true
  );

  -- Policy to allow authenticated admin users to delete PDFs
  SELECT storage.create_policy(
    'trip-pdfs',
    'Admin users can delete trip PDFs',
    'DELETE',
    'authenticated',
    'bucket_id = ''trip-pdfs'' AND (EXISTS (SELECT 1 FROM users WHERE users.user_id = auth.uid() AND users.role IN (''owner'', ''employee'')))',
    true
  );
COMMIT;