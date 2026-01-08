-- STEP 17: MASTER SYNC & SECURE (The Final Fixer)
-- Combines Login Finding (Step 15) and Security Restoration (Step 16)
-- Run this if you ever see "No Provider Found" or "User not found".

DO $do$
DECLARE
    r RECORD;
    has_reviews_col BOOLEAN;
BEGIN
    -- 1. DETECT & FIX LOGIN MISMATCHES (Sync IDs)
    -- This repairs the link if Step 13 (Reset) was run recently.
    
    -- Check for columns first to prevent crashes
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reviews' AND column_name='provider_id') INTO has_reviews_col;

    FOR r IN 
        SELECT u.id AS new_id, p.id AS old_id, u.email 
        FROM auth.users u 
        JOIN public.profiles p ON LOWER(u.email) = LOWER(p.email) 
        WHERE u.id::text != p.id -- Only fix if broken
    LOOP
        RAISE NOTICE 'Restoring Link for %...', r.email;

        -- Update FK References (Using Dynamic SQL for safety)
        IF has_reviews_col THEN
            EXECUTE 'UPDATE public.reviews SET provider_id = $1 WHERE provider_id = $2' USING r.new_id::text, r.old_id;
        END IF;
        
        -- Update requests if they exist (ignoring errors if table missing)
        BEGIN
            EXECUTE 'UPDATE public.provider_requests SET provider_id = $1 WHERE provider_id = $2' USING r.new_id::text, r.old_id;
            EXECUTE 'UPDATE public.category_requests SET provider_id = $1 WHERE provider_id = $2' USING r.new_id::text, r.old_id;
        EXCEPTION WHEN OTHERS THEN NULL; END;

        -- Update Bookings (JSONB is safe)
        UPDATE public.bookings 
        SET meta = jsonb_set(meta, '{therapist_id}', to_jsonb(r.new_id::text)) 
        WHERE meta->>'therapist_id' = r.old_id;

        -- Fix Profile ID
        UPDATE public.profiles SET id = r.new_id::text WHERE id = r.old_id;
    END LOOP;

    -- 2. RESTORE SECURITY (RLS)
    -- This ensures policies are active so the API returns data.
    
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

    -- Public Read (Crucial for Homepage)
    DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
    CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

    -- Owner Write (Crucial for Dashboard)
    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
    CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid()::text = id);

END $do$;

-- 3. FINAL STATUS REPORT
SELECT 
    p.name, 
    p.email, 
    CASE 
        WHEN u.id IS NULL THEN '⚠️ No Login Account'
        WHEN p.id = u.id::text THEN '✅ Linked & Secure'
        ELSE '❌ Mismatch (Run Again)'
    END as status,
    (SELECT count(*) FROM pg_policies WHERE tablename = 'profiles') as active_policies
FROM public.profiles p
LEFT JOIN auth.users u ON LOWER(p.email) = LOWER(u.email);
