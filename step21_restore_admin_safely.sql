-- STEP 21: RESTORE ADMIN POWERS (SAFELY)
-- The Goal: Allow Admins to update ANY profile, without causing "Infinite Recursion".
-- The Trick: Use a "SECURITY DEFINER" function.
-- This function runs with "superuser" privileges, so it can check the table
-- without triggering the Row Level Security policy that called it.

-- 1. Create the Safe Check Function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- This query runs as the database owner, bypassing RLS
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()::text
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Apply the Admin Policy
-- "If I am an Admin (checked safely), let me update ANY row."

DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile" ON public.profiles
    FOR UPDATE
    USING (public.is_admin());

-- 3. Also restore Admin capabilities for Requests (just in case)
DROP POLICY IF EXISTS "Admins can view all requests" ON public.provider_requests;
CREATE POLICY "Admins can view all requests" ON public.provider_requests
    FOR SELECT
    USING (auth.uid()::text = provider_id OR public.is_admin());

DROP POLICY IF EXISTS "Admins can update requests" ON public.provider_requests;
CREATE POLICY "Admins can update requests" ON public.provider_requests
    FOR UPDATE
    USING (public.is_admin());

-- 4. Verify
SELECT 
    'Admin Powers Restored' as status,
    (SELECT count(*) FROM pg_policies WHERE policyname = 'Admins can update any profile') as policy_exists;
