-- STEP 4: REVIEWS & REQUESTS SCHEMA
-- Run this script to add support for Reviews and Service Expansion Requests

-- 1. Create REVIEWS Table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    provider_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    booking_reference TEXT, -- Optional: verify against a booking
    is_verified BOOLEAN DEFAULT FALSE -- Backend can set this to true if booking_reference matches
);

-- Enable RLS for Reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read reviews
DROP POLICY IF EXISTS "Public reviews are viewable by everyone" ON public.reviews;
CREATE POLICY "Public reviews are viewable by everyone" ON public.reviews
    FOR SELECT USING (true);

-- Policy: Anyone can insert a review (Verified by backend logic later)
DROP POLICY IF EXISTS "Anyone can insert reviews" ON public.reviews;
CREATE POLICY "Anyone can insert reviews" ON public.reviews
    FOR INSERT WITH CHECK (true);


-- 2. Create PROVIDER_REQUESTS Table
CREATE TABLE IF NOT EXISTS public.provider_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    provider_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
    requested_category TEXT NOT NULL,
    requested_sub_services TEXT[], -- Array of service IDs
    experience_years TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT
);

-- Enable RLS for Requests
ALTER TABLE public.provider_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Providers can view their own requests
DROP POLICY IF EXISTS "Providers can view own requests" ON public.provider_requests;
CREATE POLICY "Providers can view own requests" ON public.provider_requests
    FOR SELECT USING (auth.uid()::text = provider_id);

-- Policy: Providers can insert requests
DROP POLICY IF EXISTS "Providers can insert requests" ON public.provider_requests;
CREATE POLICY "Providers can insert requests" ON public.provider_requests
    FOR INSERT WITH CHECK (auth.uid()::text = provider_id);

-- 3. (Optional) Insert some MOCK Reviews for Demo Data if needed
-- INSERT INTO public.reviews (provider_id, author_name, rating, comment) 
-- VALUES ('<UUID>', 'Happy Client', 5, 'Great service!');
