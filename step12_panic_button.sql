-- STEP 12: PANIC BUTTON (THE "IT JUST WORKS" SCRIPT)
-- Run this if NOTHING else is working.
-- It brutally forces the door open and shoves data in.

-- 1. DISABLE ROW LEVEL SECURITY (Temporarily)
-- This confirms if "Permissions" were the problem.
-- If you see data after this, we know RLS was blocking you.
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 2. WIPE EVERYTHING
TRUNCATE TABLE public.profiles CASCADE;

-- 3. INSERT RAW DATA (No fancy functions, just raw SQL)
INSERT INTO public.profiles (
    id, email, name, role, is_verified, 
    image, bio, category, price, 
    tags, schedule, location
) VALUES 
(
    'd0000001-0000-0000-0000-000000000001', 
    'maria@demo.com', 
    'Maria Santos (PANIC INSERT)', 
    'provider', 
    true,
    'https://i.pravatar.cc/150?u=maria', 
    'I should definitely be visible now.', 
    'MASSAGE', 
    600,
    ARRAY['MASSAGE', 'Hilot', 'Swedish'], 
    '{"workingDays": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], "workingHours": {"start": "06:00", "end": "22:00"}, "blockedDates": [], "onHoliday": false}'::jsonb,
    '{"name": "General Luna", "lat": 9.78, "lng": 126.15}'::jsonb
),
(
    'd0000000-0000-0000-0000-000000000010', 
    'island@demo.com', 
    'Island Glow (PANIC INSERT)', 
    'provider', 
    true,
    'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=150&h=150&fit=crop', 
    'I am a beauty provider.', 
    'BEAUTY', 
    550,
    ARRAY['BEAUTY', 'Lashes'], 
    '{"workingDays": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], "workingHours": {"start": "06:00", "end": "22:00"}, "blockedDates": [], "onHoliday": false}'::jsonb,
    '{"name": "General Luna", "lat": 9.78, "lng": 126.15}'::jsonb
);

-- 4. VERIFY IT WORKED
SELECT id, name, category FROM public.profiles;
