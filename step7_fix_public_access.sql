-- STEP 7: FIX PUBLIC ACCESS & RLS
-- Run this script to allow everyone to view profiles and reviews.

-- 1. Profiles: Public Read Access
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

-- 2. Profiles: Provider Update Access (Self)
DROP POLICY IF EXISTS "Providers can update own profile" ON public.profiles;
CREATE POLICY "Providers can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid()::text = id);

-- 3. Reviews: Public Read Access
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews
    FOR SELECT USING (true);
    
-- 4. Reviews: Clients can create reviews
DROP POLICY IF EXISTS "Clients can create reviews" ON public.reviews;
CREATE POLICY "Clients can create reviews" ON public.reviews
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
