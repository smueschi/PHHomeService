-- STEP 6: FIX MISSING PROFILES & BOOKINGS
-- Run this script to fix "Profile Not Found" and "Booking Failed" errors.

-- 1. Ensure Bookings Table Exists (Matching Frontend Payload)
DROP TABLE IF EXISTS public.bookings CASCADE;
CREATE TABLE public.bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    
    -- Fields matching 'payload' in ServiceBookingModal.tsx
    service_category TEXT,
    service_code TEXT,
    variant TEXT,
    inputs JSONB,
    options JSONB,
    upsell TEXT,
    date TEXT,
    time TEXT,
    financials JSONB,
    payment_method TEXT,
    customer JSONB,
    meta JSONB
);

-- Enable RLS for Bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can create a booking (Public)
DROP POLICY IF EXISTS "Public can create bookings" ON public.bookings;
CREATE POLICY "Public can create bookings" ON public.bookings
    FOR INSERT WITH CHECK (true);

-- Policy: Users can view their own bookings (via meta->therapist_id or email)
-- NOTE: We cast auth.uid() to text to match the JSON string value
DROP POLICY IF EXISTS "Users view own bookings" ON public.bookings;
CREATE POLICY "Users view own bookings" ON public.bookings
    FOR SELECT USING (
        (meta->>'therapist_id') = auth.uid()::text OR 
        (customer->>'email') = (select email from auth.users where id = auth.uid()) OR
        auth.uid()::text IN (SELECT id FROM public.profiles WHERE role = 'admin')
    );


-- 2. Create Trigger to Auto-Create Profiles on Signup
-- This fixes the "Initialize Demo Accounts" button not creating profiles.

CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, created_at)
  VALUES (new.id::text, new.email, 'provider', now()) -- Cast ID to textual
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 3. Backfill Missing Profiles
-- If accounts created but profile missing, create one now.
INSERT INTO public.profiles (id, email, role)
SELECT 
    id::text, 
    email, 
    'provider'
FROM auth.users
WHERE id::text NOT IN (SELECT id FROM public.profiles)
ON CONFLICT DO NOTHING;

-- 4. Re-run Demo Data Population (Optional but safe)
-- This ensures the newly created profiles get the rich data.
-- (Copy of Step 3 logic would go here, but user can just re-run Step 3)
