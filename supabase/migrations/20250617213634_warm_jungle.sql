-- Create a bucket for trip PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('trip-pdfs', 'trip-pdfs', true)
ON CONFLICT (id) DO NOTHING;

-- Set up security policies for the bucket
-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload PDFs"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'trip-pdfs');

-- Allow authenticated users to update their own files
CREATE POLICY "Authenticated users can update their own PDFs"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'trip-pdfs' AND owner = auth.uid())
WITH CHECK (bucket_id = 'trip-pdfs' AND owner = auth.uid());

-- Allow authenticated users to delete their own files
CREATE POLICY "Authenticated users can delete their own PDFs"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'trip-pdfs' AND owner = auth.uid());

-- Allow public read access to all files in the bucket
CREATE POLICY "Public can read all PDFs"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'trip-pdfs');