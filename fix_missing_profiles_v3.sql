-- 1. Ensure the 'email' column exists in public.profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email text;

-- 2. Create Trigger for future signups (Updated with casting)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (new.id::text, split_part(new.email, '@', 1), new.email); -- Cast ID to text to be safe
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Safely recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Fix existing missing profiles (Updated to handle UUID vs Text mismatch)
INSERT INTO public.profiles (id, name, email)
SELECT 
    id::text, -- Cast UUID to text for insertion
    split_part(email, '@', 1), 
    email
FROM auth.users
WHERE id::text NOT IN (SELECT id::text FROM public.profiles) -- Compare strict text to text
ON CONFLICT (id) DO NOTHING;

-- 5. Restore Demo Account Names
UPDATE profiles SET name = 'Maria Santos', category = 'MASSAGE' WHERE email = 'maria@demo.com';
UPDATE profiles SET name = 'Elena Cruz', category = 'MASSAGE' WHERE email = 'elena@demo.com';
UPDATE profiles SET name = 'Joy Reyes', category = 'MASSAGE' WHERE email = 'joy@demo.com';
UPDATE profiles SET name = 'Glamour Team', category = 'BEAUTY' WHERE email = 'glam@demo.com';
UPDATE profiles SET name = 'Siargao Cleaners', category = 'CLEANING' WHERE email = 'clean@demo.com';
UPDATE profiles SET name = 'Nanny Rose', category = 'NANNY' WHERE email = 'rose@demo.com';
UPDATE profiles SET name = 'Chef Marco', category = 'CHEF' WHERE email = 'marco@demo.com';
UPDATE profiles SET name = 'Cool Aircon', category = 'AIRCON' WHERE email = 'cool@demo.com';
