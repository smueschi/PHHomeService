-- Add status column to bookings table if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'status') THEN 
        ALTER TABLE bookings ADD COLUMN status TEXT DEFAULT 'pending'; 
    END IF; 
END $$;
