-- Add email format validation constraint
ALTER TABLE public.donation_requests 
ADD CONSTRAINT email_format CHECK (
  email IS NULL OR email ~ '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'
);