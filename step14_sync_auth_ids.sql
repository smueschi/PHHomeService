-- STEP 14: SYNC AUTH USERS TO PROFILES (The "Login Fixer")
-- This script connects the real "Login Users" (auth.users) to the "Demo Profiles" (public.profiles).
-- It does this by finding matching emails and updating the Profile ID to match the Login ID.

DO $$
DECLARE
    r RECORD;
BEGIN
    -- Loop through all users who exist in BOTH Auth and Profiles, but have different IDs
    FOR r IN 
        SELECT u.id AS new_id, p.id AS old_id, u.email 
        FROM auth.users u 
        JOIN public.profiles p ON u.email = p.email 
        WHERE u.id::text != p.id -- Only sync if they are disconnected
    LOOP
        RAISE NOTICE 'Syncing User: % (Old: %, New: %)', r.email, r.old_id, r.new_id;

        -- 1. Update References in Child Tables (if any exist)
        
        -- Reviews reference 'provider_id'
        UPDATE public.reviews 
        SET provider_id = r.new_id 
        WHERE provider_id = r.old_id;

        -- Provider Requests reference 'provider_id'
        UPDATE public.provider_requests 
        SET provider_id = r.new_id 
        WHERE provider_id = r.old_id;

        -- Category Requests reference 'provider_id'
        UPDATE public.category_requests 
        SET provider_id = r.new_id 
        WHERE provider_id = r.old_id;

        -- Bookings store therapist_id inside the 'meta' JSONB column
        UPDATE public.bookings 
        SET meta = jsonb_set(meta, '{therapist_id}', to_jsonb(r.new_id::text)) 
        WHERE meta->>'therapist_id' = r.old_id;

        -- 2. Update the Main Profile ID
        -- We disable triggers temporarily if needed, but standard update should work
        UPDATE public.profiles 
        SET id = r.new_id 
        WHERE id = r.old_id;
        
    END LOOP;
END $$;

-- 3. Verify the sync
SELECT p.name, p.email, p.id AS profile_id, u.id AS auth_id 
FROM public.profiles p 
LEFT JOIN auth.users u ON p.email = u.email;
