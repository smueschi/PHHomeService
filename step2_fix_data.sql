-- STEP 2: DATA & TRIGGER FIX
-- Run this script AFTER Step 1 is successful.

-- 1. Create Trigger (With ID casting and Default Category)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  -- We cast ID to text and set default category to 'MASSAGE'
  INSERT INTO public.profiles (id, name, email, category)
  VALUES (new.id::text, split_part(new.email, '@', 1), new.email, 'MASSAGE');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Attach Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Fix existing missing profiles
INSERT INTO public.profiles (id, name, email, category)
SELECT 
    id::text, 
    split_part(email, '@', 1), 
    email,
    'MASSAGE' -- Default value to satisfy NOT NULL constraint
FROM auth.users
WHERE id::text NOT IN (SELECT id::text FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- 4. Restore Demo Account Details
UPDATE profiles SET name = 'Maria Santos', category = 'MASSAGE' WHERE email = 'maria@demo.com';
UPDATE profiles SET name = 'Elena Cruz', category = 'MASSAGE' WHERE email = 'elena@demo.com';
UPDATE profiles SET name = 'Joy Reyes', category = 'MASSAGE' WHERE email = 'joy@demo.com';
UPDATE profiles SET name = 'Glamour Team', category = 'BEAUTY' WHERE email = 'glam@demo.com';
UPDATE profiles SET name = 'Siargao Cleaners', category = 'CLEANING' WHERE email = 'clean@demo.com';
UPDATE profiles SET name = 'Nanny Rose', category = 'NANNY' WHERE email = 'rose@demo.com';
UPDATE profiles SET name = 'Chef Marco', category = 'CHEF' WHERE email = 'marco@demo.com';
UPDATE profiles SET name = 'Cool Aircon', category = 'AIRCON' WHERE email = 'cool@demo.com';
