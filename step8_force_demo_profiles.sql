-- STEP 8: FORCE DEMO PROFILES
-- Run this script if the homepage is empty. 
-- It strictly inserts the demo providers if they don't exist.

-- 1. MARIA (Massage)
INSERT INTO public.profiles (
    id, email, name, role, 
    image, bio, contact_number, contact_preference,
    is_verified, rating, bookings_count, price, duration, wallet_credits,
    location, schedule, rates, specialties, tags, service_rates
)
SELECT 
    'd0000001-0000-0000-0000-000000000001', 'maria@demo.com', 'Maria Santos', 'provider',
    'https://i.pravatar.cc/150?u=maria',
    'Certified Hilot therapist with over 5 years of experience. Specializes in traditional Filipino healing techniques.',
    '09171234567', 'whatsapp', true, 4.9, 154, 600, 60, 1500,
    '{"name": "General Luna Central", "lat": 9.7892, "lng": 126.1554}'::jsonb,
    '{
        "workingDays": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        "workingHours": {"start": "09:00", "end": "20:00"},
        "blockedDates": [],
        "onHoliday": false
    }'::jsonb,
    '{"hourly": 600, "weekly_pass": 2040, "monthly_pass": 5400, "weekly_sessions": 4, "monthly_sessions": 12}'::jsonb,
    ARRAY['Hilot', 'Swedish'],
    ARRAY['MASSAGE', 'Hilot', 'Swedish', 'Oil provided'],
    '{"massage-swedish": 700, "massage-deeptissue": 800, "massage-ventosa": 900}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'maria@demo.com');

-- 2. GLAM SQUAD (Beauty)
INSERT INTO public.profiles (
    id, email, name, role,
    image, bio, contact_number, contact_preference,
    is_verified, rating, bookings_count, price, duration, wallet_credits,
    location, schedule, rates, specialties, tags
)
SELECT 
    'd0000002-0000-0000-0000-000000000002', 'glam@demo.com', 'Glam Squad', 'provider',
    'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=150&h=150&fit=crop',
    'The island''s premier mobile beauty team. We bring the spa party to your villa. Specialists in bridal and group bookings.',
    '09185550001', 'whatsapp', true, 4.9, 412, 600, 60, 2000,
    '{"name": "Tourism Road", "lat": 9.7900, "lng": 126.1560}'::jsonb,
    '{
        "workingDays": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        "workingHours": {"start": "09:00", "end": "18:00"},
        "blockedDates": [],
        "onHoliday": false
    }'::jsonb,
    '{"hourly": 600, "weekly_pass": 2040, "monthly_pass": 5400}'::jsonb,
    ARRAY['Nails', 'Eyelash Extensions', 'Events & Glamping'],
    ARRAY['BEAUTY', 'Nails', 'Lashes', 'Events']
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'glam@demo.com');

-- 3. SIARGAO HOUSEKEEPING (Cleaning)
INSERT INTO public.profiles (
    id, email, name, role,
    image, bio, contact_number, contact_preference,
    is_verified, rating, bookings_count, price, duration, wallet_credits,
    location, schedule, rates, specialties, tags
)
SELECT 
    'd0000003-0000-0000-0000-000000000003', 'clean@demo.com', 'Siargao Housekeeping', 'provider',
    'https://images.unsplash.com/photo-1581579186913-45ac3e6e3dd2?w=150&h=150&fit=crop',
    'Professional cleaning service for villas and Airbnbs. We handle everything from sand removal to linen changes.',
    '09205551234', 'sms', true, 4.8, 1024, 500, 120, 3000,
    '{"name": "General Luna Market", "lat": 9.7870, "lng": 126.1530}'::jsonb,
    '{
        "workingDays": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        "workingHours": {"start": "08:00", "end": "17:00"},
        "blockedDates": [],
        "onHoliday": false
    }'::jsonb,
    '{"hourly": 500, "weekly_pass": 1700, "monthly_pass": 4500, "weekly_sessions": 4, "monthly_sessions": 12}'::jsonb,
    ARRAY['Deep Clean', 'Standard Clean', 'Airbnb Turnover'],
    ARRAY['CLEANING', 'Deep Clean', 'Airbnb']
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'clean@demo.com');

-- 4. NANNY ROSE (Nanny)
INSERT INTO public.profiles (
    id, email, name, role,
    image, bio, contact_number, contact_preference,
    is_verified, rating, bookings_count, price, duration, wallet_credits,
    location, schedule, rates, custom_rates, specialties, tags
)
SELECT 
    'd0000004-0000-0000-0000-000000000004', 'rose@demo.com', 'Nanny Rose', 'provider',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop',
    'Experienced nanny and mother of two. First Aid certified and loves organizing beach activities for kids.',
    '09179998877', 'whatsapp', true, 4.9, 67, 250, 240, 1000,
    '{"name": "Poblacion 1", "lat": 9.7885, "lng": 126.1545}'::jsonb,
    '{
        "workingDays": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        "workingHours": {"start": "08:00", "end": "22:00"},
        "blockedDates": [],
        "onHoliday": false
    }'::jsonb,
    '{"hourly": 250, "weekly_pass": 850, "monthly_pass": 0, "weekly_sessions": 4, "monthly_sessions": 12}'::jsonb,
    '{"perExtraChild": 150, "perInfant": 100}'::jsonb,
    ARRAY['Standard Babysitting'],
    ARRAY['NANNY', 'Childcare', 'First Aid']
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'rose@demo.com');

-- 5. CHEF MARCO (Chef)
INSERT INTO public.profiles (
    id, email, name, role,
    image, bio, contact_number, contact_preference,
    is_verified, rating, bookings_count, price, duration, wallet_credits,
    location, schedule, rates, custom_rates, specialties, tags
)
SELECT 
    'd0000005-0000-0000-0000-000000000005', 'marco@demo.com', 'Chef Marco', 'provider',
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=150&h=150&fit=crop',
    'Local culinary expert specializing in boodle fights and fresh seafood grills right at your villa.',
    '09177771111', 'whatsapp', true, 5.0, 42, 2500, 180, 5000,
    '{"name": "Santa Ines", "lat": 9.7750, "lng": 126.1450}'::jsonb,
    '{
        "workingDays": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        "workingHours": {"start": "11:00", "end": "20:00"},
        "blockedDates": [],
        "onHoliday": false
    }'::jsonb,
    '{"hourly": 2500, "weekly_pass": 8500, "monthly_pass": 0, "weekly_sessions": 4, "monthly_sessions": 12}'::jsonb,
    '{"chef_labor_only": 500, "chef_with_groceries": 1200}'::jsonb,
    ARRAY['Boodle Fight', 'Seafood Grill'],
    ARRAY['CHEF', 'Filipino', 'Seafood']
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'marco@demo.com');

-- 6. COOL AIRCON (Aircon)
INSERT INTO public.profiles (
    id, email, name, role,
    image, bio, contact_number, contact_preference,
    is_verified, rating, bookings_count, price, duration, wallet_credits,
    location, schedule, rates, custom_rates, specialties, tags
)
SELECT 
    'd0000006-0000-0000-0000-000000000006', 'cool@demo.com', 'Cool Aircon', 'provider',
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=150&h=150&fit=crop',
    'Certified aircon technicians. Cleaning, gas top-up, and repairs for split and window type units.',
    '09191112222', 'sms', true, 4.7, 85, 1000, 60, 1500,
    '{"name": "Tuason Point", "lat": 9.7980, "lng": 126.1630}'::jsonb,
    '{
        "workingDays": ["Mon", "Tue", "Wed", "Thu", "Fri"],
        "workingHours": {"start": "09:00", "end": "17:00"},
        "blockedDates": [],
        "onHoliday": false
    }'::jsonb,
    '{"hourly": 1000, "weekly_pass": 3400, "monthly_pass": 9000, "weekly_sessions": 4, "monthly_sessions": 12}'::jsonb,
    '{"ac_split_cleaning": 1000, "ac_window_cleaning": 750, "ac_split_repair": 1500, "ac_window_repair": 1000}'::jsonb,
    ARRAY['General Cleaning', 'Gas Top-up'],
    ARRAY['AIRCON', 'Maintenance', 'Repair']
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'cool@demo.com');
