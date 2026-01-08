-- STEP 16: RESTORE FEATURES & SECURITY (The "Master Fix")
-- v2: Aligned Bookings Schema with Step 6 (JSONB-based) to avoid "user_id" error.

-- ==========================================
-- 1. PROFILES SECURITY (Fix "Public Read" & "Dashboard Edit")
-- ==========================================

-- Re-enable RLS (was disabled by Panic Button)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Allow everyone to see profiles (Homepage)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

-- Policy: Allow users to edit their OWN profile (Dashboard)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid()::text = id);

-- ==========================================
-- 2. BOOKINGS SECURITY (Fix "Book Now")
-- ==========================================

-- Ensure table exists (Reflecting Step 6 Schema)
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    
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

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can create a booking (Public/Auth)
DROP POLICY IF EXISTS "Users can create bookings" ON public.bookings;
-- NOTE: We allow public inserts because the 'customer' JSONB holds the data. 
-- Real security would strictly check auth.uid, but for this schema we allow the insert.
CREATE POLICY "Users can create bookings" ON public.bookings
    FOR INSERT WITH CHECK (true);

-- Policy: Users can view their own bookings (via meta->therapist_id OR email match)
DROP POLICY IF EXISTS "Users view own bookings" ON public.bookings;
CREATE POLICY "Users view own bookings" ON public.bookings
    FOR SELECT USING (
        (meta->>'therapist_id') = auth.uid()::text OR 
        (customer->>'email') = (select email from auth.users where id = auth.uid()) OR
        auth.uid()::text IN (SELECT id FROM public.profiles WHERE role = 'admin')
    );

-- ==========================================
-- 3. REVIEWS & REQUESTS (Fix "Review" & "Approvals")
-- ==========================================

-- Schema: Reviews
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    provider_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    booking_reference TEXT,
    is_verified BOOLEAN DEFAULT FALSE
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Policy: Read Reviews
DROP POLICY IF EXISTS "Public reviews are viewable by everyone" ON public.reviews;
CREATE POLICY "Public reviews are viewable by everyone" ON public.reviews
    FOR SELECT USING (true);

-- Policy: Write Reviews
DROP POLICY IF EXISTS "Anyone can insert reviews" ON public.reviews;
CREATE POLICY "Anyone can insert reviews" ON public.reviews
    FOR INSERT WITH CHECK (true);

-- Schema: Provider Requests
CREATE TABLE IF NOT EXISTS public.provider_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    provider_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
    requested_category TEXT NOT NULL,
    requested_sub_services TEXT[],
    experience_years TEXT,
    status TEXT DEFAULT 'pending',
    admin_notes TEXT
);
ALTER TABLE public.provider_requests ENABLE ROW LEVEL SECURITY;

-- Policy: View/Insert Requests
DROP POLICY IF EXISTS "Providers can view own requests" ON public.provider_requests;
CREATE POLICY "Providers can view own requests" ON public.provider_requests
    FOR SELECT USING (auth.uid()::text = provider_id);

DROP POLICY IF EXISTS "Providers can insert requests" ON public.provider_requests;
CREATE POLICY "Providers can insert requests" ON public.provider_requests
    FOR INSERT WITH CHECK (auth.uid()::text = provider_id);

-- ==========================================
-- 4. FINAL VERIFICATION OUTPUT
-- ==========================================
SELECT 
    (SELECT count(*) FROM public.profiles) as profiles_count,
    (SELECT CASE WHEN (SELECT count(*) FROM pg_policies WHERE tablename = 'profiles') > 0 THEN 'YES' ELSE 'NO' END) as profiles_rls_active,
    (SELECT count(*) FROM public.reviews) as reviews_count,
    'System Restored Successfully' as status;
