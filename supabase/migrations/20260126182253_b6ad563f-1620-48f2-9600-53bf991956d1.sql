-- Create enum for donation request status
CREATE TYPE public.donation_status AS ENUM ('pending', 'approved', 'rejected');

-- Create enum for blood types
CREATE TYPE public.blood_type AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown');

-- Create profiles table for user data
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    email TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create donation requests table
CREATE TABLE public.donation_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Personal Information
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    identity_number TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    email TEXT,
    date_of_birth DATE NOT NULL,
    blood_type blood_type DEFAULT 'unknown',
    address TEXT,
    
    -- Eligibility answers (stored as JSONB)
    eligibility_answers JSONB NOT NULL DEFAULT '{}',
    is_eligible BOOLEAN NOT NULL DEFAULT true,
    ineligibility_reason TEXT,
    
    -- Request status
    status donation_status DEFAULT 'pending' NOT NULL,
    appointment_date TIMESTAMP WITH TIME ZONE,
    admin_notes TEXT,
    
    -- Terms acceptance
    terms_accepted BOOLEAN NOT NULL DEFAULT false,
    terms_accepted_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donation_requests ENABLE ROW LEVEL SECURITY;

-- Create security definer function for admin check
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE user_id = _user_id
          AND is_admin = true
    )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for donation_requests
-- Anyone can submit a donation request (public form)
CREATE POLICY "Anyone can submit donation request"
ON public.donation_requests FOR INSERT
WITH CHECK (true);

-- Only admins can view all donation requests
CREATE POLICY "Admins can view all donation requests"
ON public.donation_requests FOR SELECT
USING (public.is_admin(auth.uid()));

-- Only admins can update donation requests
CREATE POLICY "Admins can update donation requests"
ON public.donation_requests FOR UPDATE
USING (public.is_admin(auth.uid()));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_donation_requests_updated_at
BEFORE UPDATE ON public.donation_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, email, is_admin)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.email = 'hopitalsahloul56@gmail.com'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();