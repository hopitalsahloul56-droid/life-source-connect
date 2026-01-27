-- Add input validation constraints to prevent abuse
ALTER TABLE public.donation_requests 
ADD CONSTRAINT first_name_length CHECK (length(first_name) <= 100),
ADD CONSTRAINT last_name_length CHECK (length(last_name) <= 100),
ADD CONSTRAINT phone_number_length CHECK (length(phone_number) <= 20),
ADD CONSTRAINT email_length CHECK (email IS NULL OR length(email) <= 255),
ADD CONSTRAINT address_length CHECK (address IS NULL OR length(address) <= 500),
ADD CONSTRAINT admin_notes_length CHECK (admin_notes IS NULL OR length(admin_notes) <= 1000),
ADD CONSTRAINT identity_number_format CHECK (identity_number ~ '^\d{8}$');

-- Add unique partial index to prevent duplicate active submissions
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_donation_request 
ON public.donation_requests(identity_number) 
WHERE status IN ('pending', 'approved');