-- STEP 15: FIX LOGIN MISMATCH (The "Connector" Script)
-- v4: Uses Dynamic SQL to strictly prevent "Column does not exist" errors.

DO $do$
DECLARE
    r RECORD;
    has_reviews_col BOOLEAN;
    has_reqs_col BOOLEAN;
    has_cat_col BOOLEAN;
BEGIN
    -- 1. Check if columns exist BEFORE running queries
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reviews' AND column_name='provider_id') INTO has_reviews_col;
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='provider_requests' AND column_name='provider_id') INTO has_reqs_col;
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='category_requests' AND column_name='provider_id') INTO has_cat_col;

    FOR r IN 
        SELECT u.id AS new_id, p.id AS old_id, u.email 
        FROM auth.users u 
        JOIN public.profiles p ON LOWER(u.email) = LOWER(p.email) 
        WHERE u.id::text != p.id -- Only fix if broken
    LOOP
        RAISE NOTICE 'Fixing %...', r.email;

        -- 2. Update Reviews (Dynamic SQL avoids planner errors)
        IF has_reviews_col THEN
            EXECUTE 'UPDATE public.reviews SET provider_id = $1 WHERE provider_id = $2' USING r.new_id::text, r.old_id;
        END IF;

        -- 3. Update Provider Requests
        IF has_reqs_col THEN
            EXECUTE 'UPDATE public.provider_requests SET provider_id = $1 WHERE provider_id = $2' USING r.new_id::text, r.old_id;
        END IF;
        
        -- 4. Update Category Requests
        IF has_cat_col THEN
            EXECUTE 'UPDATE public.category_requests SET provider_id = $1 WHERE provider_id = $2' USING r.new_id::text, r.old_id;
        END IF;

        -- 5. Update Bookings (Safely update JSONB - always valid if table exists)
        BEGIN
             UPDATE public.bookings 
             SET meta = jsonb_set(meta, '{therapist_id}', to_jsonb(r.new_id::text)) 
             WHERE meta->>'therapist_id' = r.old_id;
        EXCEPTION WHEN undefined_table THEN 
             NULL; -- Ignore if bookings doesn't exist
        END;

        -- 6. Update Profile ID (The Main Fix)
        UPDATE public.profiles SET id = r.new_id::text WHERE id = r.old_id;
    END LOOP;
END $do$;

-- 2. Verify the Result
SELECT 
    p.name, 
    p.email, 
    CASE 
        WHEN u.id IS NULL THEN 'Missing Account (Sign Up Required)'
        WHEN p.id = u.id::text THEN '✅ Connected'
        ELSE '❌ Mismatch (Run Script Again)'
    END as status,
    p.id as profile_id, 
    u.id as auth_id
FROM public.profiles p
LEFT JOIN auth.users u ON LOWER(p.email) = LOWER(u.email);
