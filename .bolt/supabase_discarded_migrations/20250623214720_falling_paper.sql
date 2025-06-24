/*
  # Create storage bucket for trip PDFs

  1. Storage Setup
    - Create 'trip-pdfs' bucket for storing PDF files
    - Configure bucket to be publicly accessible
    - Set appropriate file size limits and allowed file types

  2. Security
    - Enable RLS on the bucket
    - Add policies for public read access
    - Add policies for authenticated admin users to upload/delete files

  3. Configuration
    - Set file size limit to 10MB
    - Allow only PDF file types
    - Enable public access for file downloads
*/

-- Create the trip-pdfs bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'trip-pdfs',
  'trip-pdfs', 
  true,
  10485760, -- 10MB in bytes
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on the bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy to allow public read access to PDFs
CREATE POLICY "Public read access for trip PDFs"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'trip-pdfs');

-- Policy to allow authenticated admin users to upload PDFs
CREATE POLICY "Admin users can upload trip PDFs"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'trip-pdfs' 
  AND (EXISTS (
    SELECT 1 FROM users 
    WHERE users.user_id = auth.uid() 
    AND users.role IN ('owner', 'employee')
  ))
);

-- Policy to allow authenticated admin users to update PDFs
CREATE POLICY "Admin users can update trip PDFs"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'trip-pdfs' 
  AND (EXISTS (
    SELECT 1 FROM users 
    WHERE users.user_id = auth.uid() 
    AND users.role IN ('owner', 'employee')
  ))
)
WITH CHECK (
  bucket_id = 'trip-pdfs' 
  AND (EXISTS (
    SELECT 1 FROM users 
    WHERE users.user_id = auth.uid() 
    AND users.role IN ('owner', 'employee')
  ))
);

-- Policy to allow authenticated admin users to delete PDFs
CREATE POLICY "Admin users can delete trip PDFs"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'trip-pdfs' 
  AND (EXISTS (
    SELECT 1 FROM users 
    WHERE users.user_id = auth.uid() 
    AND users.role IN ('owner', 'employee')
  ))
);