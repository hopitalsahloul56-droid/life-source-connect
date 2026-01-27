-- Add policy to allow admins to delete donation requests
CREATE POLICY "Admins can delete donation requests"
ON public.donation_requests
FOR DELETE
USING (is_admin(auth.uid()));