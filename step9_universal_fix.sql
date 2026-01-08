-- STEP 9: UNIVERSAL DEMO FIX (Silver Bullet)
-- Run this to fix "No Providers", "Ghost Profiles", and Login issues.
-- It intelligently links profiles to Auth Users if they exist, or creates them if they don't.

-- Function to safely upsert a demo user
CREATE OR REPLACE FUNCTION upsert_demo_profile(
    target_email TEXT, 
    fallback_id TEXT, -- Changed to TEXT
    p_name TEXT, 
    p_image TEXT, 
    p_bio TEXT, 
    p_tags TEXT[], 
    p_category TEXT, 
    p_price NUMERIC, 
    p_sched JSONB, 
    p_rates JSONB, 
    p_specs TEXT[], 
    p_service_rates JSONB DEFAULT '{}'::jsonb, 
    p_custom_rates JSONB DEFAULT '{}'::jsonb
) RETURNS VOID AS $$
DECLARE
    auth_id UUID;
    final_id TEXT; -- Changed to TEXT
BEGIN
    -- 1. Try to find existing Auth User ID
    SELECT id INTO auth_id FROM auth.users WHERE email = target_email;

    -- 2. Determine which ID to use (Auth ID prefers, else Fallback)
    final_id := COALESCE(auth_id::text, fallback_id);

    -- 3. Delete any "Duplicate/Ghost" profiles that might block us (e.g. same email, different ID)
    -- Compare TEXT vs TEXT
    DELETE FROM public.profiles WHERE email = target_email AND id != final_id;

    -- 4. Upsert (Insert or Update)
    INSERT INTO public.profiles (
        id, email, name, role, is_verified, 
        image, bio, tags, category, price, duration, bookings_count, wallet_credits, rating,
        schedule, rates, specialties, service_rates, custom_rates,
        location, contact_number, contact_preference
    ) VALUES (
        final_id, target_email, p_name, 'provider', true,
        p_image, p_bio, p_tags, p_category, p_price, 60, 100 + floor(random() * 500), 2000, 4.9,
        p_sched, p_rates, p_specs, p_service_rates, p_custom_rates,
        '{"name": "General Luna", "lat": 9.78, "lng": 126.15}'::jsonb, '09999999999', 'whatsapp'
    )
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        role = 'provider',
        is_verified = true,
        image = EXCLUDED.image,
        bio = EXCLUDED.bio,
        tags = EXCLUDED.tags,
        category = EXCLUDED.category,
        price = EXCLUDED.price,
        schedule = EXCLUDED.schedule,
        rates = EXCLUDED.rates,
        specialties = EXCLUDED.specialties,
        service_rates = EXCLUDED.service_rates,
        custom_rates = EXCLUDED.custom_rates;
        
END;
$$ LANGUAGE plpgsql;

-- EXECUTE THE UPSERTS
SELECT upsert_demo_profile(
    'maria@demo.com', 'd0000001-0000-0000-0000-000000000001', 'Maria Santos', 
    'https://i.pravatar.cc/150?u=maria',
    'Certified Hilot therapist with over 5 years of experience.',
    ARRAY['MASSAGE', 'Hilot', 'Swedish', 'Oil provided'], 'MASSAGE', 600,
    '{ "workingDays": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], "workingHours": {"start": "09:00", "end": "20:00"}, "blockedDates": [], "onHoliday": false }'::jsonb,
    '{"hourly": 600, "weekly_pass": 2040, "monthly_pass": 5400}'::jsonb,
    ARRAY['Hilot', 'Swedish'],
    '{"massage-swedish": 700, "massage-deeptissue": 800}'::jsonb
);

SELECT upsert_demo_profile(
    'glam@demo.com', 'd0000002-0000-0000-0000-000000000002', 'Glam Squad', 
    'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=150&h=150&fit=crop',
    'The island''s premier mobile beauty team.',
    ARRAY['BEAUTY', 'Nails', 'Lashes', 'Events'], 'BEAUTY', 600,
    '{ "workingDays": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], "workingHours": {"start": "09:00", "end": "18:00"}, "blockedDates": [], "onHoliday": false }'::jsonb,
    '{"hourly": 600, "weekly_pass": 2040, "monthly_pass": 5400}'::jsonb,
    ARRAY['Nails', 'Eyelash Extensions', 'Events & Glamping']
);

SELECT upsert_demo_profile(
    'clean@demo.com', 'd0000003-0000-0000-0000-000000000003', 'Siargao Housekeeping', 
    'https://images.unsplash.com/photo-1581579186913-45ac3e6e3dd2?w=150&h=150&fit=crop',
    'Professional cleaning service for villas and Airbnbs.',
    ARRAY['CLEANING', 'Deep Clean', 'Airbnb'], 'CLEANING', 500,
    '{ "workingDays": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], "workingHours": {"start": "08:00", "end": "17:00"}, "blockedDates": [], "onHoliday": false }'::jsonb,
    '{"hourly": 500, "weekly_pass": 1700, "monthly_pass": 4500}'::jsonb,
    ARRAY['Deep Clean', 'Standard Clean', 'Airbnb Turnover']
);

SELECT upsert_demo_profile(
    'rose@demo.com', 'd0000004-0000-0000-0000-000000000004', 'Nanny Rose', 
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop',
    'Experienced nanny and mother of two.',
    ARRAY['NANNY', 'Childcare', 'First Aid'], 'NANNY', 250,
    '{ "workingDays": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], "workingHours": {"start": "08:00", "end": "22:00"}, "blockedDates": [], "onHoliday": false }'::jsonb,
    '{"hourly": 250, "weekly_pass": 850, "monthly_pass": 0}'::jsonb,
    ARRAY['Standard Babysitting']
);

SELECT upsert_demo_profile(
    'marco@demo.com', 'd0000005-0000-0000-0000-000000000005', 'Chef Marco', 
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=150&h=150&fit=crop',
    'Local culinary expert specializing in boodle fights.',
    ARRAY['CHEF', 'Filipino', 'Seafood'], 'CHEF', 2500,
    '{ "workingDays": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], "workingHours": {"start": "11:00", "end": "20:00"}, "blockedDates": [], "onHoliday": false }'::jsonb,
    '{"hourly": 2500, "weekly_pass": 8500, "monthly_pass": 0}'::jsonb,
    ARRAY['Boodle Fight', 'Seafood Grill']
);

SELECT upsert_demo_profile(
    'cool@demo.com', 'd0000006-0000-0000-0000-000000000006', 'Cool Aircon', 
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=150&h=150&fit=crop',
    'Certified aircon technicians.',
    ARRAY['AIRCON', 'Maintenance', 'Repair'], 'AIRCON', 1000,
    '{ "workingDays": ["Mon", "Tue", "Wed", "Thu", "Fri"], "workingHours": {"start": "09:00", "end": "17:00"}, "blockedDates": [], "onHoliday": false }'::jsonb,
    '{"hourly": 1000, "weekly_pass": 3400, "monthly_pass": 9000}'::jsonb,
    ARRAY['General Cleaning', 'Gas Top-up']
);

-- Ensure permissions are robust
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT SELECT ON public.bookings TO anon, authenticated;
