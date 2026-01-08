-- STEP 18: FIX PERMISSIONS (The "Access Denied" Fix)
-- Even if RLS says "Yes", if the 'anon' user doesn't have 'SELECT' permission on the table, it sees nothing.
-- This script explicitly grants these base permissions.

DO $do$
BEGIN
    -- 1. Grant Usage on Schema
    GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

    -- 2. Grant Table Permissions (Crucial for "No Provider Found")
    GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;

    -- 3. Grant Sequence Permissions (Crucial for "id serial" inserts)
    GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

    -- 4. Specific Grants for Profiles (Double Check)
    GRANT SELECT ON public.profiles TO anon;
    GRANT SELECT ON public.reviews TO anon;
    
    RAISE NOTICE 'Permissions Granted Successfully';
END $do$;

-- 5. Verification: Count visible rows for 'anon' (simulated)
-- We can't easily simulate 'anon' in SQL Editor without SET ROLE, 
-- but we can check if data exists at all.

SELECT 
    (SELECT count(*) FROM public.profiles) as total_profiles,
    CASE 
        WHEN (SELECT count(*) FROM public.profiles) > 0 THEN '✅ Data Exists'
        ELSE '❌ Table is Empty (Run Step 13)' 
    END as status;
