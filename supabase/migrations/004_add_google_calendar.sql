-- Add Google Calendar columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS google_refresh_token TEXT,
ADD COLUMN IF NOT EXISTS google_email TEXT,
ADD COLUMN IF NOT EXISTS is_google_calendar_connected BOOLEAN DEFAULT FALSE;

-- Security note: In production, google_refresh_token should be encrypted.
-- RLS Policy updates likely not needed if "Users can update own profile" already exists.
