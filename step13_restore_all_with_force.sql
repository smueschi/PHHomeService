-- STEP 13: THE FINAL SYNC (Restore Full Data + Force Visibility)
-- This script does the same "Panic Button" technique but for ALL 14 providers.
-- It ensures RLS is OFF (for now) so you can see them.

-- 1. Ensure RLS is DISABLED (Panic Mode)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 2. Wipe everything clean again
TRUNCATE TABLE public.profiles CASCADE;

-- 3. Insert ALL 14 Providers (Raw SQL, no functions)
INSERT INTO public.profiles (
    id, email, name, role, is_verified, 
    image, bio, category, price, 
    tags, schedule, rates, specialties, 
    location, wallet_credits, bookings_count, rating,
    service_rates, custom_rates, contact_number, contact_preference
) VALUES 
-- 1. Maria Santos (Massage - Hilot/Swedish)
(
    'd0000001-0000-0000-0000-000000000001', 'maria@demo.com', 'Maria Santos', 'provider', true,
    'https://i.pravatar.cc/150?u=maria', 
    'Certified Hilot therapist with over 5 years of experience. Specializes in traditional Filipino healing techniques.', 
    'MASSAGE', 600,
    ARRAY['MASSAGE', 'Hilot', 'Swedish', 'Oil provided'], 
    '{"workingDays": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], "workingHours": {"start": "09:00", "end": "20:00"}, "blockedDates": [], "onHoliday": false}'::jsonb,
    '{"hourly": 600, "weekly_pass": 2040, "monthly_pass": 5400}'::jsonb,
    ARRAY['Hilot', 'Swedish'],
    '{"name": "General Luna Central", "lat": 9.7892, "lng": 126.1554}'::jsonb,
    1500, 154, 4.9,
    '{"massage-swedish": 700, "massage-deeptissue": 800}'::jsonb,
    '{}'::jsonb,
    '09171234567', 'whatsapp'
),
-- 2. Elena Cruz (Massage - Reflexology)
(
    'd0000000-0000-0000-0000-000000000007', 'elena@demo.com', 'Elena Cruz', 'provider', true,
    'https://i.pravatar.cc/150?u=elena',
    'Experienced therapist focusing on pressure points and energy flow.',
    'MASSAGE', 700,
    ARRAY['MASSAGE', 'Reflexology', 'Swedish'],
    '{"workingDays": ["Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], "workingHours": {"start": "10:00", "end": "21:00"}, "blockedDates": [], "onHoliday": false}'::jsonb,
    '{"hourly": 700, "weekly_pass": 2380, "monthly_pass": 6300}'::jsonb,
    ARRAY['Swedish', 'Reflexology'],
    '{"name": "Cloud 9 Area", "lat": 9.8050, "lng": 126.1600}'::jsonb,
    500, 89, 4.8,
    '{}'::jsonb, '{}'::jsonb, '09123456789', 'whatsapp'
),
-- 3. Joy Reyes (Massage - Deep Tissue)
(
    'd0000000-0000-0000-0000-000000000008', 'joy@demo.com', 'Joy Reyes', 'provider', false,
    'https://i.pravatar.cc/150?u=joy',
    'Friendly and strong hands. I bring my own massage table and oils.',
    'MASSAGE', 400,
    ARRAY['MASSAGE', 'Hilot', 'Deep Tissue'],
    '{"workingDays": ["Sat", "Sun"], "workingHours": {"start": "08:00", "end": "22:00"}, "blockedDates": [], "onHoliday": false}'::jsonb,
    '{"hourly": 400, "weekly_pass": 1360, "monthly_pass": 3600}'::jsonb,
    ARRAY['Hilot', 'Deep Tissue'],
    '{"name": "Malinao", "lat": 9.7800, "lng": 126.1400}'::jsonb,
    0, 32, 4.7,
    '{}'::jsonb, '{}'::jsonb, '09123456789', 'whatsapp'
),
-- 4. Rico Dalisay (Massage - Sports)
(
    'd0000000-0000-0000-0000-000000000009', 'rico@demo.com', 'Rico Dalisay', 'provider', true,
    'https://i.pravatar.cc/150?u=rico',
    'Former physical therapy assistant specializing in sports recovery.',
    'MASSAGE', 600,
    ARRAY['MASSAGE', 'Sports Massage', 'Deep Tissue'],
    '{"workingDays": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], "workingHours": {"start": "06:00", "end": "22:00"}, "blockedDates": [], "onHoliday": false}'::jsonb,
    '{"hourly": 600, "weekly_pass": 2040, "monthly_pass": 5400}'::jsonb,
    ARRAY['Sports Massage', 'Deep Tissue'],
    '{"name": "Catangnan", "lat": 9.7950, "lng": 126.1650}'::jsonb,
    2000, 210, 5.0,
    '{}'::jsonb, '{}'::jsonb, '09123456789', 'whatsapp'
),
-- 5. Glam Squad Siargao (Beauty - Nails/Events)
(
    'd0000000-0000-0000-0000-000000000020', 'glam@demo.com', 'Glam Squad Siargao', 'provider', true,
    'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=150&h=150&fit=crop',
    'The island''s premier mobile beauty team. We bring the spa party to your villa.',
    'BEAUTY', 600,
    ARRAY['BEAUTY', 'Nails', 'Lashes', 'Events'],
    '{"workingDays": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], "workingHours": {"start": "09:00", "end": "18:00"}, "blockedDates": [], "onHoliday": false}'::jsonb,
    '{"hourly": 600, "weekly_pass": 2040, "monthly_pass": 5400}'::jsonb,
    ARRAY['Nails', 'Eyelash Extensions', 'Events & Glamping'],
    '{"name": "Tourism Road", "lat": 9.7900, "lng": 126.1560}'::jsonb,
    2000, 412, 4.9,
    '{}'::jsonb, '{}'::jsonb, '09123456789', 'whatsapp'
),
-- 6. Island Glow (Beauty - Brows)
(
    'd0000000-0000-0000-0000-000000000010', 'glow@demo.com', 'Island Glow Aesthetics', 'provider', false,
    'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=150&h=150&fit=crop',
    'Specializing in natural-looking lash extensions and brow shaping.',
    'BEAUTY', 550,
    ARRAY['BEAUTY', 'Lashes', 'Brows'],
    '{"workingDays": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], "workingHours": {"start": "10:00", "end": "19:00"}, "blockedDates": [], "onHoliday": false}'::jsonb,
    '{"hourly": 550, "weekly_pass": 1870, "monthly_pass": 4950}'::jsonb,
    ARRAY['Eyelash Extensions', 'Brow Shaping', 'Lash Lift & Tint'],
    '{"name": "Back Road", "lat": 9.7880, "lng": 126.1540}'::jsonb,
    500, 56, 4.6,
    '{}'::jsonb, '{"gel_removal": 200}'::jsonb, '09123456789', 'whatsapp'
),
-- 7. Siargao Housekeeping (Cleaning - Airbnb)
(
    'd0000000-0000-0000-0000-000000000021', 'cleaning@demo.com', 'Siargao Housekeeping', 'provider', true,
    'https://images.unsplash.com/photo-1581579186913-45ac3e6e3dd2?w=150&h=150&fit=crop',
    'Professional cleaning service for villas and Airbnbs.',
    'CLEANING', 500,
    ARRAY['CLEANING', 'Deep Clean', 'Airbnb'],
    '{"workingDays": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], "workingHours": {"start": "08:00", "end": "17:00"}, "blockedDates": [], "onHoliday": false}'::jsonb,
    '{"hourly": 500, "weekly_pass": 1700, "monthly_pass": 4500}'::jsonb,
    ARRAY['Deep Clean', 'Standard Clean', 'Airbnb Turnover'],
    '{"name": "General Luna Market", "lat": 9.7870, "lng": 126.1530}'::jsonb,
    3000, 1024, 4.8,
    '{}'::jsonb, '{}'::jsonb, '09123456789', 'whatsapp'
),
-- 8. EcoClean Island (Cleaning - Eco)
(
    'd0000000-0000-0000-0000-000000000011', 'eco@demo.com', 'EcoClean Island', 'provider', true,
    'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=150&h=150&fit=crop',
    'We use only organic, non-toxic cleaning products safe for pets and children.',
    'CLEANING', 600,
    ARRAY['CLEANING', 'Eco-Friendly', 'Standard Clean'],
    '{"workingDays": ["Mon", "Tue", "Wed", "Thu", "Fri"], "workingHours": {"start": "08:00", "end": "16:00"}, "blockedDates": [], "onHoliday": false}'::jsonb,
    '{"hourly": 600, "weekly_pass": 1920, "monthly_pass": 5400}'::jsonb,
    ARRAY['Standard Clean'],
    '{"name": "Cloud 9 Boardwalk", "lat": 9.8020, "lng": 126.1620}'::jsonb,
    1000, 215, 4.9,
    '{}'::jsonb, '{}'::jsonb, '09123456789', 'whatsapp'
),
-- 9. Cool Breeze Tech (Aircon - Tech)
(
    'd0000000-0000-0000-0000-000000000022', 'coolbreeze@demo.com', 'Cool Breeze Tech', 'provider', true,
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=150&h=150&fit=crop',
    'Certified aircon technicians. Cleaning, gas top-up, and repairs.',
    'AIRCON', 1000,
    ARRAY['AIRCON', 'Maintenance', 'Repair'],
    '{"workingDays": ["Mon", "Tue", "Wed", "Thu", "Fri"], "workingHours": {"start": "09:00", "end": "17:00"}, "blockedDates": [], "onHoliday": false}'::jsonb,
    '{"hourly": 1000, "weekly_pass": 3400, "monthly_pass": 9000}'::jsonb,
    ARRAY['General Cleaning', 'Gas Top-up'],
    '{"name": "Tuason Point", "lat": 9.7980, "lng": 126.1630}'::jsonb,
    1500, 85, 4.7,
    '{}'::jsonb, '{"ac_split_cleaning": 1000, "ac_window_cleaning": 750}'::jsonb, '09123456789', 'whatsapp'
),
-- 10. Arctic Air (Aircon - Heavy)
(
    'd0000000-0000-0000-0000-000000000012', 'arctic@demo.com', 'Arctic Air Solutions', 'provider', true,
    'https://plus.unsplash.com/premium_photo-1663013210452-f4728f32ac9f?w=150&h=150&fit=crop',
    'Specializing in commercial and large residential air conditioning systems.',
    'AIRCON', 1200,
    ARRAY['AIRCON', 'Installation', 'Heavy Duty'],
    '{"workingDays": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], "workingHours": {"start": "08:00", "end": "18:00"}, "blockedDates": [], "onHoliday": false}'::jsonb,
    '{"hourly": 1200, "weekly_pass": 4080, "monthly_pass": 10800}'::jsonb,
    ARRAY['General Cleaning'],
    '{"name": "Cashew Grove", "lat": 9.7850, "lng": 126.1500}'::jsonb,
    2000, 120, 4.8,
    '{}'::jsonb, '{"ac_split_cleaning": 1200, "ac_window_cleaning": 900}'::jsonb, '09123456789', 'whatsapp'
),
-- 11. Chef Marco (Chef)
(
    'd0000000-0000-0000-0000-000000000023', 'marco@demo.com', 'Chef Marco', 'provider', true,
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=150&h=150&fit=crop',
    'Local culinary expert specializing in boodle fights and fresh seafood grills.',
    'CHEF', 2500,
    ARRAY['CHEF', 'Filipino', 'Seafood'],
    '{"workingDays": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], "workingHours": {"start": "11:00", "end": "20:00"}, "blockedDates": [], "onHoliday": false}'::jsonb,
    '{"hourly": 2500, "weekly_pass": 8500, "monthly_pass": 0}'::jsonb,
    ARRAY['Boodle Fight', 'Seafood Grill'],
    '{"name": "Santa Ines", "lat": 9.7750, "lng": 126.1450}'::jsonb,
    5000, 42, 5.0,
    '{}'::jsonb, '{"chef_labor_only": 500, "chef_with_groceries": 1200}'::jsonb, '09123456789', 'whatsapp'
),
-- 12. Green Table (Chef - Vegan)
(
    'd0000000-0000-0000-0000-000000000013', 'green@demo.com', 'Green Table Siargao', 'provider', true,
    'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=150&h=150&fit=crop',
    'Plant-based private dining experiences.',
    'CHEF', 2800,
    ARRAY['CHEF', 'Vegan', 'Healthy'],
    '{"workingDays": ["Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], "workingHours": {"start": "10:00", "end": "21:00"}, "blockedDates": [], "onHoliday": false}'::jsonb,
    '{"hourly": 2800, "weekly_pass": 9520, "monthly_pass": 0}'::jsonb,
    ARRAY['Plated Dinner'],
    '{"name": "GL Boulevard", "lat": 9.7895, "lng": 126.1550}'::jsonb,
    4000, 28, 4.9,
    '{}'::jsonb, '{"chef_labor_only": 600, "chef_with_groceries": 1400}'::jsonb, '09123456789', 'whatsapp'
),
-- 13. Nanny Rose (Nanny)
(
    'd0000000-0000-0000-0000-000000000024', 'rose@demo.com', 'Nanny Rose', 'provider', true,
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop',
    'Experienced nanny and mother of two. First Aid certified.',
    'NANNY', 250,
    ARRAY['NANNY', 'Childcare', 'First Aid'],
    '{"workingDays": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], "workingHours": {"start": "08:00", "end": "22:00"}, "blockedDates": [], "onHoliday": false}'::jsonb,
    '{"hourly": 250, "weekly_pass": 850, "monthly_pass": 0}'::jsonb,
    ARRAY['Standard Babysitting'],
    '{"name": "Poblacion 1", "lat": 9.7885, "lng": 126.1545}'::jsonb,
    1000, 67, 4.9,
    '{}'::jsonb, '{"perExtraChild": 150, "perInfant": 100}'::jsonb, '09123456789', 'whatsapp'
),
-- 14. Ate Grace (Nanny - Newborn)
(
    'd0000000-0000-0000-0000-000000000014', 'grace@demo.com', 'Ate Grace', 'provider', true,
    'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop',
    'Specializing in newborn care and night shifts.',
    'NANNY', 350,
    ARRAY['NANNY', 'Newborn', 'Night Shift'],
    '{"workingDays": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], "workingHours": {"start": "18:00", "end": "02:00"}, "blockedDates": [], "onHoliday": false}'::jsonb,
    '{"hourly": 350, "weekly_pass": 1190, "monthly_pass": 0}'::jsonb,
    ARRAY['Standard Babysitting'],
    '{"name": "Poblacion 3", "lat": 9.7890, "lng": 126.1565}'::jsonb,
    1500, 112, 5.0,
    '{}'::jsonb, '{"perExtraChild": 200, "perInfant": 150}'::jsonb, '09123456789', 'whatsapp'
);

-- 4. VERIFY
SELECT id, name, category FROM public.profiles;
