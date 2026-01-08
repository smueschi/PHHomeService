-- STEP 20: DYNAMIC POLICY WIPER (The "Nuclear Option" for Policies)
-- Since we don't know the exact name of the bad policy causing recursion,
-- we will find ALL policies on 'profiles' and drop them programmatically.

DO $do$
DECLARE
    pol RECORD;
BEGIN
    -- 1. Loop through every policy attached to 'public.profiles'
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'profiles'
    LOOP
        RAISE NOTICE 'Dropping policy: %', pol.policyname;
        EXECUTE format('DROP POLICY %I ON public.profiles', pol.policyname);
    END LOOP;

    -- 2. Add back the ONE safe policy we need
    -- Public Read: Everyone can see profiles (required for Homepage)
    EXECUTE 'CREATE POLICY "Public Read Safe" ON public.profiles FOR SELECT USING (true)';
    
    -- Owner Write: Users can edit their own profile
    EXECUTE 'CREATE POLICY "Owner Write Safe" ON public.profiles FOR UPDATE USING (auth.uid()::text = id)';

    RAISE NOTICE 'All old policies wiped. Safe policies applied.';
END $do$;

-- 3. Verification
SELECT 
    policyname, 
    cmd -- 'SELECT' or 'UPDATE'
FROM pg_policies 
WHERE tablename = 'profiles';
