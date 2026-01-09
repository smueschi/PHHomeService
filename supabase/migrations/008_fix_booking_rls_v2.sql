-- Drop the problematic policy
DROP POLICY IF EXISTS "Enable read for own bookings" ON bookings;

-- Create a safer policy using auth.jwt() to avoid querying auth.users table directly
-- This fixes the "permission denied for table users" error
CREATE POLICY "Enable read for own bookings" ON bookings FOR SELECT USING (
    -- Provider viewing their bookings
    (meta->>'therapist_id')::uuid = auth.uid()
    OR
    -- Customer viewing their bookings (via email match from JWT)
    (customer->>'email') = (auth.jwt() ->> 'email')
);
