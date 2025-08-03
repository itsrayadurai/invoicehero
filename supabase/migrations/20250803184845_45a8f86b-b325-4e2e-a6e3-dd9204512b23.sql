-- Create storage bucket for invoice logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'invoice-logos',
  'invoice-logos', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
);

-- Create policies for invoice logos bucket
CREATE POLICY "Anyone can view invoice logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'invoice-logos');

CREATE POLICY "Anyone can upload invoice logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'invoice-logos' 
  AND octet_length(objects.metadata) < 5242880
);

CREATE POLICY "Anyone can update their invoice logos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'invoice-logos');

CREATE POLICY "Anyone can delete their invoice logos"
ON storage.objects FOR DELETE
USING (bucket_id = 'invoice-logos');