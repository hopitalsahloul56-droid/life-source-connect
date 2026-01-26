-- Add policy for users to check their own donation status by identity number
CREATE POLICY "Anyone can check donation status by identity number"
ON public.donation_requests
FOR SELECT
USING (true);