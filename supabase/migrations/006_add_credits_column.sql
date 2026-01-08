-- Ensure credits column exists on profiles
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'credits') THEN 
        ALTER TABLE profiles ADD COLUMN credits INTEGER DEFAULT 10; 
    END IF;
END $$;
