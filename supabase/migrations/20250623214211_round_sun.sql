/*
  # Create trip-pdfs storage bucket

  1. Storage Setup
    - Create 'trip-pdfs' bucket for storing PDF files
    - Set up appropriate policies for public access to PDFs
    - Configure bucket settings for PDF file storage

  2. Security
    - Allow public read access to PDFs (so they can be downloaded)
    - Allow authenticated users to upload PDFs
    - Restrict file types to PDFs only
*/

-- Create the trip-pdfs bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'trip-pdfs',
  'trip-pdfs', 
  true,
  10485760, -- 10MB limit
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to PDFs
CREATE POLICY "Public read access for trip PDFs"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'trip-pdfs');

-- Allow authenticated users to upload PDFs
CREATE POLICY "Authenticated users can upload trip PDFs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'trip-pdfs' AND
  (storage.foldername(name))[1] IS NOT NULL -- Ensure files are in a folder (trip_id)
);

-- Allow authenticated users to update their uploaded PDFs
CREATE POLICY "Authenticated users can update trip PDFs"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'trip-pdfs')
WITH CHECK (bucket_id = 'trip-pdfs');

-- Allow authenticated users to delete PDFs
CREATE POLICY "Authenticated users can delete trip PDFs"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'trip-pdfs');