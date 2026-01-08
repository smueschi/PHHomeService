-- STEP 3: POPULATE DEMO DATA (FIXED V2)
-- Run this script to fill in the detailed profile data for the demo accounts.
-- NOTE: 'specialties' and 'tags' are arrays (text[]), others are JSONB.

-- 1. Maria Santos (Massage)
UPDATE profiles SET
    image = 'https://i.pravatar.cc/150?u=maria',
    bio = 'Certified Hilot therapist with over 5 years of experience. Specializes in traditional Filipino healing techniques.',
    contact_number = '09171234567',
    contact_preference = 'whatsapp',
    is_verified = true,
    rating = 4.9,
    bookings_count = 154,
    price = 600,
    duration = 60,
    wallet_credits = 1500,
    location = '{"name": "General Luna Central", "lat": 9.7892, "lng": 126.1554}'::jsonb,
    schedule = '{
        "workingDays": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        "workingHours": {"start": "09:00", "end": "20:00"},
        "blockedDates": [],
        "onHoliday": false
    }'::jsonb,
    rates = '{"hourly": 600, "weekly_pass": 2040, "monthly_pass": 5400, "weekly_sessions": 4, "monthly_sessions": 12}'::jsonb,
    specialties = ARRAY['Hilot', 'Swedish'],
    tags = ARRAY['MASSAGE', 'Hilot', 'Swedish', 'Oil provided'],
    service_rates = '{"massage-swedish": 700, "massage-deeptissue": 800, "massage-ventosa": 900}'::jsonb
WHERE email = 'maria@demo.com';

-- 2. Glam Squad (Beauty)
UPDATE profiles SET
    image = 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=150&h=150&fit=crop',
    bio = 'The island''s premier mobile beauty team. We bring the spa party to your villa. Specialists in bridal and group bookings.',
    contact_number = '09185550001',
    contact_preference = 'whatsapp',
    is_verified = true,
    rating = 4.9,
    bookings_count = 412,
    price = 600,
    duration = 60,
    wallet_credits = 2000,
    location = '{"name": "Tourism Road", "lat": 9.7900, "lng": 126.1560}'::jsonb,
    schedule = '{
        "workingDays": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        "workingHours": {"start": "09:00", "end": "18:00"},
        "blockedDates": [],
        "onHoliday": false
    }'::jsonb,
    rates = '{"hourly": 600, "weekly_pass": 2040, "monthly_pass": 5400}'::jsonb,
    specialties = ARRAY['Nails', 'Eyelash Extensions', 'Events & Glamping'],
    tags = ARRAY['BEAUTY', 'Nails', 'Lashes', 'Events']
WHERE email = 'glam@demo.com';

-- 3. Siargao Housekeeping (Cleaning)
UPDATE profiles SET
    image = 'https://images.unsplash.com/photo-1581579186913-45ac3e6e3dd2?w=150&h=150&fit=crop',
    bio = 'Professional cleaning service for villas and Airbnbs. We handle everything from sand removal to linen changes.',
    contact_number = '09205551234',
    contact_preference = 'sms',
    is_verified = true,
    rating = 4.8,
    bookings_count = 1024,
    price = 500,
    duration = 120,
    wallet_credits = 3000,
    location = '{"name": "General Luna Market", "lat": 9.7870, "lng": 126.1530}'::jsonb,
    schedule = '{
        "workingDays": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        "workingHours": {"start": "08:00", "end": "17:00"},
        "blockedDates": [],
        "onHoliday": false
    }'::jsonb,
    rates = '{"hourly": 500, "weekly_pass": 1700, "monthly_pass": 4500, "weekly_sessions": 4, "monthly_sessions": 12}'::jsonb,
    specialties = ARRAY['Deep Clean', 'Standard Clean', 'Airbnb Turnover'],
    tags = ARRAY['CLEANING', 'Deep Clean', 'Airbnb']
WHERE email = 'clean@demo.com';

-- 4. Nanny Rose (Nanny)
UPDATE profiles SET
    image = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop',
    bio = 'Experienced nanny and mother of two. First Aid certified and loves organizing beach activities for kids.',
    contact_number = '09179998877',
    contact_preference = 'whatsapp',
    is_verified = true,
    rating = 4.9,
    bookings_count = 67,
    price = 250,
    duration = 240,
    wallet_credits = 1000,
    location = '{"name": "Poblacion 1", "lat": 9.7885, "lng": 126.1545}'::jsonb,
    schedule = '{
        "workingDays": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        "workingHours": {"start": "08:00", "end": "22:00"},
        "blockedDates": [],
        "onHoliday": false
    }'::jsonb,
    rates = '{"hourly": 250, "weekly_pass": 850, "monthly_pass": 0, "weekly_sessions": 4, "monthly_sessions": 12}'::jsonb,
    custom_rates = '{"perExtraChild": 150, "perInfant": 100}'::jsonb,
    specialties = ARRAY['Standard Babysitting'],
    tags = ARRAY['NANNY', 'Childcare', 'First Aid']
WHERE email = 'rose@demo.com';

-- 5. Chef Marco (Chef)
UPDATE profiles SET
    image = 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=150&h=150&fit=crop',
    bio = 'Local culinary expert specializing in boodle fights and fresh seafood grills right at your villa.',
    contact_number = '09177771111',
    contact_preference = 'whatsapp',
    is_verified = true,
    rating = 5.0,
    bookings_count = 42,
    price = 2500,
    duration = 180,
    wallet_credits = 5000,
    location = '{"name": "Santa Ines", "lat": 9.7750, "lng": 126.1450}'::jsonb,
    schedule = '{
        "workingDays": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        "workingHours": {"start": "11:00", "end": "20:00"},
        "blockedDates": [],
        "onHoliday": false
    }'::jsonb,
    rates = '{"hourly": 2500, "weekly_pass": 8500, "monthly_pass": 0, "weekly_sessions": 4, "monthly_sessions": 12}'::jsonb,
    custom_rates = '{"chef_labor_only": 500, "chef_with_groceries": 1200}'::jsonb,
    specialties = ARRAY['Boodle Fight', 'Seafood Grill'],
    tags = ARRAY['CHEF', 'Filipino', 'Seafood']
WHERE email = 'marco@demo.com';

-- 6. Cool Aircon (Aircon)
UPDATE profiles SET
    image = 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=150&h=150&fit=crop',
    bio = 'Certified aircon technicians. Cleaning, gas top-up, and repairs for split and window type units.',
    contact_number = '09191112222',
    contact_preference = 'sms',
    is_verified = true,
    rating = 4.7,
    bookings_count = 85,
    price = 1000,
    duration = 60,
    wallet_credits = 1500,
    location = '{"name": "Tuason Point", "lat": 9.7980, "lng": 126.1630}'::jsonb,
    schedule = '{
        "workingDays": ["Mon", "Tue", "Wed", "Thu", "Fri"],
        "workingHours": {"start": "09:00", "end": "17:00"},
        "blockedDates": [],
        "onHoliday": false
    }'::jsonb,
    rates = '{"hourly": 1000, "weekly_pass": 3400, "monthly_pass": 9000, "weekly_sessions": 4, "monthly_sessions": 12}'::jsonb,
    custom_rates = '{"ac_split_cleaning": 1000, "ac_window_cleaning": 750, "ac_split_repair": 1500, "ac_window_repair": 1000}'::jsonb,
    specialties = ARRAY['General Cleaning', 'Gas Top-up'],
    tags = ARRAY['AIRCON', 'Maintenance', 'Repair']
WHERE email = 'cool@demo.com';
