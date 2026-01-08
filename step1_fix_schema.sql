-- STEP 1: SCHEMA FIX
-- Run this script FIRST. It ensures the table structure is correct.
-- If you see "already exists" errors, that is fine/safe.

-- 1. Add 'email' column (This is the one causing the error)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email text;

-- 2. Add contact fields (Just in case they are missing too)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS contact_number text;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS contact_preference text DEFAULT 'any';

-- 3. Add constraint for contact preference
DO $$ BEGIN
    ALTER TABLE profiles ADD CONSTRAINT check_contact_preference CHECK (contact_preference IN ('sms', 'whatsapp', 'any'));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
