import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Mock Data Definitions (Copied from local data.ts updates)
const UPDATES = [
    {
        name: "Elena Cruz",
        serviceRates: {
            "massage-reflexology": 700,
            "massage-swedish": 700
        }
    },
    {
        name: "Joy Reyes",
        serviceRates: {
            "massage-hilot": 400,
            "massage-deeptissue": 450
        }
    },
    {
        name: "Rico Dalisay",
        serviceRates: {
            "massage-sports": 600,
            "massage-deeptissue": 600
        }
    },
    {
        name: "Glam Squad", // Matches "Glam Squad Siargao" loosely via ilike
        serviceRates: {
            "beauty-nails": 600,
            "beauty-lashes": 800,
            "beauty-events": 1500
        }
    },
    {
        name: "Island Glow", // "Island Glow Aesthetics"
        serviceRates: {
            "beauty-lashes": 550,
            "beauty-brows": 400,
            "beauty-lift": 600
        }
    },
    {
        name: "Siargao Housekeeping",
        serviceRates: {
            "clean-deep": 500,
            "clean-standard": 400,
            "clean-airbnb": 500
        }
    },
    {
        name: "EcoClean", // "EcoClean Island"
        serviceRates: {
            "clean-standard": 600
        }
    },
    {
        name: "Cool Breeze", // "Cool Breeze Tech"
        serviceRates: {
            "ac-cleaning-split": 1000,
            "ac-cleaning-window": 750,
            "ac-repair-split": 1500
        }
    },
    {
        name: "Arctic Air", // "Arctic Air Solutions"
        serviceRates: {
            "ac-cleaning-heavy": 1200,
            "ac-repair-heavy": 1800
        }
    },
    {
        name: "Chef Marco",
        serviceRates: {
            "chef-boodle": 2500,
            "chef-seafood": 3000
        }
    },
    {
        name: "Green Table", // "Green Table Siargao"
        serviceRates: {
            "chef-plated-vegan": 2800
        }
    },
    {
        name: "Nanny Rose",
        serviceRates: {
            "nanny-standard": 250
        }
    },
    {
        name: "Ate Grace",
        serviceRates: {
            "nanny-night": 350,
            "nanny-newborn": 400
        }
    }
];

export async function GET() {
    const results = [];

    for (const update of UPDATES) {
        // 1. Find Provider ID by Name
        const { data: profiles, error: searchError } = await supabase
            .from('profiles')
            .select('id, name')
            .ilike('name', `%${update.name}%`)
            .limit(1);

        if (searchError || !profiles || profiles.length === 0) {
            results.push({ name: update.name, status: "Not Found", error: searchError });
            continue;
        }

        const profile = profiles[0];

        // 2. Update Service Rates
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ service_rates: update.serviceRates })
            .eq('id', profile.id);

        if (updateError) {
            results.push({ name: update.name, id: profile.id, status: "Failed", error: updateError });
        } else {
            results.push({ name: update.name, id: profile.id, status: "Updated", rates: update.serviceRates });
        }
    }

    return NextResponse.json({
        message: "Database Update Complete",
        results
    });
}
