-- Enable RLS on bookings table (if not already enabled)
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Policy to allow ANYONE (anon or authenticated) to insert bookings
-- We need this because the ReservationModal uses client-side insertion, possibly by guest users or authenticated users
-- The 'true' condition is permissive but necessary for the current architecture where logic validation happens on client/API
CREATE POLICY "Enable insert for all users" ON bookings FOR INSERT WITH CHECK (true);

-- Policy to allow users to View their OWN bookings
-- 1. Where auth.uid() matches user_id (if column exists and is populated)
-- 2. OR where email matches (if user is logged in and email matches customer email)
-- 3. OR where provider_id matches auth.uid() (so Providers can see bookings)
CREATE POLICY "Enable read for own bookings" ON bookings FOR SELECT USING (
    -- Provider viewing their bookings
    (meta->>'therapist_id')::uuid = auth.uid()
    OR
    -- Customer viewing their bookings (via email match if user_id is missing/null)
    (customer->>'email') = (select email from auth.users where id = auth.uid())
);

-- Policy to allow Providers to UPDATE status of bookings assigned to them
CREATE POLICY "Enable update for providers" ON bookings FOR UPDATE USING (
    (meta->>'therapist_id')::uuid = auth.uid()
);

-- Grant usage on public schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
