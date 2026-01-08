-- STEP 22: MAKE ME AN ADMIN (For Testing)
-- To check the Admin Dashboard (/admin), you need 'role = admin'.
-- By default, Maria is a 'provider'. This promotes her for testing.

UPDATE public.profiles
SET role = 'admin'
WHERE email = 'maria@demo.com';

-- Verify it worked
SELECT id, name, email, role FROM public.profiles WHERE email = 'maria@demo.com';
