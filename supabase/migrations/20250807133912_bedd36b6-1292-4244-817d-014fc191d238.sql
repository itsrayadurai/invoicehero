-- Allow service role to bypass RLS for uploaded_files table
CREATE POLICY "Service role can manage all uploaded files" 
ON public.uploaded_files 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);