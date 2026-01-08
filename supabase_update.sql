-- Add contact fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS contact_number text,
ADD COLUMN IF NOT EXISTS contact_preference text DEFAULT 'any';

-- Add check constraint for contact_preference to ensure valid values
ALTER TABLE profiles 
ADD CONSTRAINT check_contact_preference 
CHECK (contact_preference IN ('sms', 'whatsapp', 'any'));

-- (Optional) If you want to update existing users to have a default preference
UPDATE profiles 
SET contact_preference = 'any' 
WHERE contact_preference IS NULL;
