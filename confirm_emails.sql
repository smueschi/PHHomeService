-- Auto-confirm all existing users
-- This is useful for demo accounts or if you want to skip email verification for now.

UPDATE auth.users
SET email_confirmed_at = now()
WHERE email_confirmed_at IS NULL;
