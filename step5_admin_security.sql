-- STEP 5: ADMIN SECURITY & ROLES
-- Run this script to implement Role-Based Access Control (RBAC)

-- 1. Add 'role' column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'provider' CHECK (role IN ('admin', 'provider', 'user'));

-- 2. Create Admin Policies (Superuser Access)
-- "Admins can do anything" policy for relevant tables

-- Profiles: Admins can view/edit all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (auth.uid()::text IN (SELECT id FROM public.profiles WHERE role = 'admin'));

CREATE POLICY "Admins can update all profiles" ON public.profiles
    FOR UPDATE USING (auth.uid()::text IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- Provider Requests: Admins can view/edit all requests
CREATE POLICY "Admins can view all requests" ON public.provider_requests
    FOR SELECT USING (auth.uid()::text IN (SELECT id::text FROM public.profiles WHERE role = 'admin'));

CREATE POLICY "Admins can update all requests" ON public.provider_requests
    FOR UPDATE USING (auth.uid()::text IN (SELECT id::text FROM public.profiles WHERE role = 'admin'));


-- 3. Create a Demo Admin User (Seed Data)
-- Ideally, you'd creates this via Auth, but we can update an existing one or just ensure the role is set if they exist.
-- For this demo, let's promote 'maria@demo.com' to admin temporarily OR you can manually sign up 'admin@demo.com' and run this:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@phhomeservice.com';

-- For now, let's just ensure database integrity.
-- NOTE: You will need to manually update a user's role to 'admin' in Supabase Table Editor after signing them up.
