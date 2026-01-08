-- STEP 11: ADD MISSING MOCK PROVIDERS
-- You noticed some providers were missing. This script adds ALL of them from the original design.
-- (Elena, Joy, Rico, Island Glow, EcoClean, Arctic Air, Green Table, Ate Grace)

-- Ensure the helper function exists and is correct (TEXT ids)
CREATE OR REPLACE FUNCTION upsert_demo_profile(
    target_email TEXT, 
    fallback_id TEXT, 
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
    final_id TEXT;
BEGIN
    SELECT id INTO auth_id FROM auth.users WHERE email = target_email;
    final_id := COALESCE(auth_id::text, fallback_id);

    -- Delete duplicates if any
    DELETE FROM public.profiles WHERE email = target_email AND id != final_id;

    INSERT INTO public.profiles (
        id, email, name, role, is_verified, 
        image, bio, tags, category, price, duration, bookings_count, wallet_credits, rating,
        schedule, rates, specialties, service_rates, custom_rates,
        location, contact_number, contact_preference
    ) VALUES (
        final_id, target_email, p_name, 'provider', true,
        p_image, p_bio, p_tags, p_category, p_price, 60, 50 + floor(random() * 300), 1000, 4.8,
        p_sched, p_rates, p_specs, p_service_rates, p_custom_rates,
        '{"name": "Start of Cloud 9", "lat": 9.80, "lng": 126.16}'::jsonb, '09123456789', 'whatsapp'
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

-- 1. Elena Cruz (Massage - Reflexology)
SELECT upsert_demo_profile(
    'elena@demo.com', 'd0000000-0000-0000-0000-000000000007', 'Elena Cruz',
    'https://i.pravatar.cc/150?u=elena',
    'Experienced therapist focusing on pressure points and energy flow.',
    ARRAY['MASSAGE', 'Reflexology', 'Swedish'], 'MASSAGE', 700,
    '{"workingDays": ["Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], "workingHours": {"start": "10:00", "end": "21:00"}, "blockedDates": [], "onHoliday": false}'::jsonb,
    '{"hourly": 700, "weekly_pass": 2380, "monthly_pass": 6300}'::jsonb,
    ARRAY['Swedish', 'Reflexology']
);

-- 2. Joy Reyes (Massage - Deep Tissue, Unverified/Cheaper)
SELECT upsert_demo_profile(
    'joy@demo.com', 'd0000000-0000-0000-0000-000000000008', 'Joy Reyes',
    'https://i.pravatar.cc/150?u=joy',
    'Friendly and strong hands. I bring my own massage table and oils.',
    ARRAY['MASSAGE', 'Hilot', 'Deep Tissue'], 'MASSAGE', 400,
    '{"workingDays": ["Sat", "Sun"], "workingHours": {"start": "08:00", "end": "22:00"}, "blockedDates": [], "onHoliday": false}'::jsonb,
    '{"hourly": 400, "weekly_pass": 1360, "monthly_pass": 3600}'::jsonb,
    ARRAY['Hilot', 'Deep Tissue']
);

-- 3. Rico Dalisay (Massage - Sports)
SELECT upsert_demo_profile(
    'rico@demo.com', 'd0000000-0000-0000-0000-000000000009', 'Rico Dalisay',
    'https://i.pravatar.cc/150?u=rico',
    'Former physical therapy assistant specializing in sports recovery.',
    ARRAY['MASSAGE', 'Sports Massage', 'Deep Tissue'], 'MASSAGE', 600,
    '{"workingDays": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], "workingHours": {"start": "06:00", "end": "22:00"}, "blockedDates": [], "onHoliday": false}'::jsonb,
    '{"hourly": 600, "weekly_pass": 2040, "monthly_pass": 5400}'::jsonb,
    ARRAY['Sports Massage', 'Deep Tissue']
);

-- 4. Island Glow (Beauty - Brows)
SELECT upsert_demo_profile(
    'glow@demo.com', 'd0000000-0000-0000-0000-000000000010', 'Island Glow Aesthetics',
    'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=150&h=150&fit=crop',
    'Specializing in natural-looking lash extensions and brow shaping.',
    ARRAY['BEAUTY', 'Lashes', 'Brows'], 'BEAUTY', 550,
    '{"workingDays": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], "workingHours": {"start": "10:00", "end": "19:00"}, "blockedDates": [], "onHoliday": false}'::jsonb,
    '{"hourly": 550, "weekly_pass": 1870, "monthly_pass": 4950}'::jsonb,
    ARRAY['Eyelash Extensions', 'Brow Shaping', 'Lash Lift & Tint']
);

-- 5. EcoClean Island (Cleaning - Eco)
SELECT upsert_demo_profile(
    'eco@demo.com', 'd0000000-0000-0000-0000-000000000011', 'EcoClean Island',
    'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=150&h=150&fit=crop',
    'We use only organic, non-toxic cleaning products safe for pets and children.',
    ARRAY['CLEANING', 'Eco-Friendly', 'Standard Clean'], 'CLEANING', 600,
    '{"workingDays": ["Mon", "Tue", "Wed", "Thu", "Fri"], "workingHours": {"start": "08:00", "end": "16:00"}, "blockedDates": [], "onHoliday": false}'::jsonb,
    '{"hourly": 600, "weekly_pass": 1920, "monthly_pass": 5400}'::jsonb,
    ARRAY['Standard Clean']
);

-- 6. Arctic Air (Aircon - Install)
SELECT upsert_demo_profile(
    'arctic@demo.com', 'd0000000-0000-0000-0000-000000000012', 'Arctic Air Solutions',
    'https://plus.unsplash.com/premium_photo-1663013210452-f4728f32ac9f?w=150&h=150&fit=crop',
    'Specializing in commercial and large residential air conditioning systems.',
    ARRAY['AIRCON', 'Installation', 'Heavy Duty'], 'AIRCON', 1200,
    '{"workingDays": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], "workingHours": {"start": "08:00", "end": "18:00"}, "blockedDates": [], "onHoliday": false}'::jsonb,
    '{"hourly": 1200, "weekly_pass": 4080, "monthly_pass": 10800}'::jsonb,
    ARRAY['General Cleaning']
);

-- 7. Green Table (Chef - Vegan)
SELECT upsert_demo_profile(
    'green@demo.com', 'd0000000-0000-0000-0000-000000000013', 'Green Table Siargao',
    'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=150&h=150&fit=crop',
    'Plant-based private dining experiences.',
    ARRAY['CHEF', 'Vegan', 'Healthy'], 'CHEF', 2800,
    '{"workingDays": ["Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], "workingHours": {"start": "10:00", "end": "21:00"}, "blockedDates": [], "onHoliday": false}'::jsonb,
    '{"hourly": 2800, "weekly_pass": 9520, "monthly_pass": 0}'::jsonb,
    ARRAY['Plated Dinner']
);

-- 8. Ate Grace (Nanny - Newborn)
SELECT upsert_demo_profile(
    'grace@demo.com', 'd0000000-0000-0000-0000-000000000014', 'Ate Grace',
    'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop',
    'Specializing in newborn care and night shifts.',
    ARRAY['NANNY', 'Newborn', 'Night Shift'], 'NANNY', 350,
    '{"workingDays": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], "workingHours": {"start": "18:00", "end": "02:00"}, "blockedDates": [], "onHoliday": false}'::jsonb,
    '{"hourly": 350, "weekly_pass": 1190, "monthly_pass": 0}'::jsonb,
    ARRAY['Standard Babysitting'],
    '{}'::jsonb,
    '{"perExtraChild": 200, "perInfant": 150}'::jsonb
);

-- 9. (Optional) Re-run the main 6 just in case Step 10 was skipped
-- ... (omitted to save space, assuming user ran step 10 or 9 for them)
-- Actually, let's just make sure Maria is there properly too for the Massage check
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
