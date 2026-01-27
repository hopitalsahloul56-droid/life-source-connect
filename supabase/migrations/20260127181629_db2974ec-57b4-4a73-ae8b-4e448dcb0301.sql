-- Drop the insecure policy that exposes all PII
DROP POLICY IF EXISTS "Anyone can check donation status by identity number" ON public.donation_requests;