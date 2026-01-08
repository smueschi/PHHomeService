-- 1. Create a Trigger to handle future signups automatically
-- This ensures every new user in auth.users gets a corresponding row in public.profiles

CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (new.id, split_part(new.email, '@', 1), new.email, 'provider');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Safely recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. Backfill profiles for existing users who are missing them
-- We default the Name to the part of the email before '@'
INSERT INTO public.profiles (id, name, email)
SELECT id, split_part(email, '@', 1), email
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);

-- 3. (Optional) Enhance the demo accounts with better data if they exist
-- This recovers the "demo" feel by giving them real names matching the quick login buttons

UPDATE profiles SET name = 'Maria Santos', category = 'MASSAGE' WHERE email = 'maria@demo.com';
UPDATE profiles SET name = 'Elena Cruz', category = 'MASSAGE' WHERE email = 'elena@demo.com';
UPDATE profiles SET name = 'Joy Reyes', category = 'MASSAGE' WHERE email = 'joy@demo.com';
UPDATE profiles SET name = 'Glamour Team', category = 'BEAUTY' WHERE email = 'glam@demo.com';
UPDATE profiles SET name = 'Siargao Cleaners', category = 'CLEANING' WHERE email = 'clean@demo.com';
UPDATE profiles SET name = 'Nanny Rose', category = 'NANNY' WHERE email = 'rose@demo.com';
UPDATE profiles SET name = 'Chef Marco', category = 'CHEF' WHERE email = 'marco@demo.com';
UPDATE profiles SET name = 'Cool Aircon', category = 'AIRCON' WHERE email = 'cool@demo.com';
