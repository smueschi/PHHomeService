
export interface Review {
    author: string;
    rating: number;
    comment: string;
    date: string;
}

export interface Schedule {
    workingDays: string[];
    workingHours: {
        start: string;
        end: string;
    };
    blockedDates: string[];
    onHoliday: boolean;
}

export interface CategoryRequest {
    id: string;
    providerId: string;
    providerName: string;
    requestedCategory: string;
    requestedSubServices: string[]; // Specific services they want to do
    experienceYears: string;
    status: 'pending' | 'approved' | 'rejected';
    date: string;
}

export const MOCK_REQUESTS: CategoryRequest[] = [
    {
        id: "req_1",
        providerId: "1",
        providerName: "Maria Santos",
        requestedCategory: "NANNY",
        requestedSubServices: ["NANNY_STD"],
        experienceYears: "3-5 years",
        status: "pending",
        date: "2024-01-04"
    }
];

export interface Therapist {
    id: string;
    name: string;
    image: string;
    isVerified: boolean;
    bookings: number;
    rating: number;
    tags: string[]; // Used for Category Filtering
    category: "MASSAGE" | "CLEANING" | "BEAUTY" | "AIRCON" | "CHEF" | "NANNY" | "REPAIR" | "OTHER";
    price: number;
    duration: number;
    bio: string;
    availability: string;
    schedule: Schedule;
    specialties: string[];
    walletCredits: number; // For Commission/Deposit Logic
    location: {
        name: string;
        lat: number;
        lng: number;
    };
    rates: {
        hourly: number;
        weekly_pass: number;
        monthly_pass: number;
        weekly_sessions?: number; // Default 4
        monthly_sessions?: number; // Default 12
        enablePasses?: boolean;
    };
    addons?: {
        id: string;
        name: string;
        price: number;
    }[];
    serviceRates?: Record<string, number>; // Custom override prices per service ID
    customRates?: {
        // Cleaning
        perBedroom?: number;
        perBathroom?: number;
        // Nanny
        perExtraChild?: number;
        perInfant?: number; // Surcharge per hour for infants
        // Chef
        chef_labor_only?: number; // Per person
        chef_with_groceries?: number; // Per person
        // Aircon
        ac_split_cleaning?: number;
        ac_window_cleaning?: number;
        ac_split_repair?: number;
        ac_window_repair?: number;
        // Beauty
        gel_removal?: number;
    };

    contactNumber?: string;
    contactPreference?: 'sms' | 'whatsapp' | 'any';
    reviews: Review[];
    role?: 'admin' | 'provider' | 'user';
}

export const MOCK_THERAPISTS: Therapist[] = [
    // --- MASSAGE THERAPISTS ---
    {
        id: "1",
        name: "Maria Santos",
        image: "https://i.pravatar.cc/150?u=maria",
        isVerified: true,
        bookings: 154,
        rating: 4.9,
        tags: ["MASSAGE", "Hilot", "Swedish", "Oil provided"],
        category: "MASSAGE",
        price: 600,
        duration: 60,
        bio: "Certified Hilot therapist with over 5 years of experience. Specializes in traditional Filipino healing techniques.",
        availability: "Mon-Sat 9:00 AM - 8:00 PM",
        schedule: {
            workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            workingHours: { start: "09:00", end: "20:00" },
            blockedDates: [],
            onHoliday: false
        },
        specialties: ["Hilot", "Swedish"],
        walletCredits: 1500, // Has credits
        location: { name: "General Luna Central", lat: 9.7892, lng: 126.1554 },
        rates: { hourly: 600, weekly_pass: 2040, monthly_pass: 5400, weekly_sessions: 4, monthly_sessions: 12 },
        addons: [{ id: "foot_scrub", name: "Foot Scrub", price: 300 }],
        serviceRates: {
            "massage-swedish": 700,
            "massage-deeptissue": 800, // Premium service
            "massage-ventosa": 900
        },
        contactNumber: "09171234567",
        contactPreference: "whatsapp",
        reviews: [
            { author: "Anonymous", rating: 5, comment: "Dr. Santos has been incredibly helpful.", date: "2 weeks ago" },
            { author: "M.T.", rating: 5, comment: "Professional, empathetic, and exactly what I needed.", date: "1 month ago" }
        ]
    },
    {
        id: "2",
        name: "Elena Cruz",
        image: "https://i.pravatar.cc/150?u=elena",
        isVerified: true,
        bookings: 89,
        rating: 4.8,
        tags: ["MASSAGE", "Reflexology", "Swedish"], // Added Swedish
        category: "MASSAGE",
        price: 700,
        duration: 60,
        bio: "Experienced therapist focusing on pressure points and energy flow.",
        availability: "Tue-Sun 10:00 AM - 9:00 PM",
        schedule: {
            workingDays: ["Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            workingHours: { start: "10:00", end: "21:00" },
            blockedDates: [],
            onHoliday: false
        },
        specialties: ["Swedish", "Reflexology"], // Changed Shiatsu to Swedish (supported service)
        walletCredits: 500,
        location: { name: "Cloud 9 Area", lat: 9.8050, lng: 126.1600 },
        rates: { hourly: 700, weekly_pass: 2380, monthly_pass: 6300, weekly_sessions: 4, monthly_sessions: 12 },
        reviews: [{ author: "Sarah L.", rating: 5, comment: "Amazing reflexology session!", date: "3 weeks ago" }]
    },
    {
        id: "3",
        name: "Joy Reyes",
        image: "https://i.pravatar.cc/150?u=joy",
        isVerified: false,
        bookings: 32,
        rating: 4.7,
        tags: ["MASSAGE", "Hilot", "Deep Tissue"],
        category: "MASSAGE",
        price: 400,
        duration: 60,
        bio: "Friendly and strong hands. I bring my own massage table and oils.",
        availability: "Weekends Only",
        schedule: {
            workingDays: ["Sat", "Sun"],
            workingHours: { start: "08:00", end: "22:00" },
            blockedDates: [],
            onHoliday: false
        },
        specialties: ["Hilot", "Deep Tissue"],
        walletCredits: 0, // NO CREDITS - Should trigger disabled state
        location: { name: "Malinao", lat: 9.7800, lng: 126.1400 },
        rates: { hourly: 400, weekly_pass: 1360, monthly_pass: 3600, weekly_sessions: 4, monthly_sessions: 12 },
        reviews: []
    },
    {
        id: "4",
        name: "Rico Dalisay",
        image: "https://i.pravatar.cc/150?u=rico",
        isVerified: true,
        bookings: 210,
        rating: 5.0,
        tags: ["MASSAGE", "Sports Massage", "Deep Tissue"],
        category: "MASSAGE",
        price: 600,
        duration: 60,
        bio: "Former physical therapy assistant specializing in sports recovery.",
        availability: "Daily 6:00 AM - 10:00 PM",
        schedule: {
            workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            workingHours: { start: "06:00", end: "22:00" },
            blockedDates: [],
            onHoliday: false
        },
        specialties: ["Sports Massage", "Deep Tissue"],
        walletCredits: 2000,
        location: { name: "Catangnan", lat: 9.7950, lng: 126.1650 },
        rates: { hourly: 600, weekly_pass: 2040, monthly_pass: 5400, weekly_sessions: 4, monthly_sessions: 12 },
        reviews: []
    },
    // --- BEAUTY PROVIDERS ---
    {
        id: "B1",
        name: "Glam Squad Siargao",
        image: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=150&h=150&fit=crop",
        isVerified: true,
        bookings: 412,
        rating: 4.9,
        tags: ["BEAUTY", "Nails", "Lashes", "Events"],
        category: "BEAUTY",
        price: 600,
        duration: 60,
        bio: "The island's premier mobile beauty team. We bring the spa party to your villa. Specialists in bridal and group bookings.",
        availability: "Daily 9:00 AM - 6:00 PM",
        schedule: {
            workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            workingHours: { start: "09:00", end: "18:00" },
            blockedDates: [],
            onHoliday: false
        },
        specialties: ["Nails", "Eyelash Extensions", "Events & Glamping"],
        walletCredits: 2000,
        location: { name: "Tourism Road", lat: 9.7900, lng: 126.1560 },
        rates: { hourly: 600, weekly_pass: 2040, monthly_pass: 5400 },
        reviews: []
    },
    {
        id: "B2",
        name: "Island Glow Aesthetics",
        image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=150&h=150&fit=crop",
        isVerified: false,
        bookings: 56,
        rating: 4.6,
        tags: ["BEAUTY", "Lashes", "Brows"],
        category: "BEAUTY",
        price: 550,
        duration: 60,
        bio: "Specializing in natural-looking lash extensions and brow shaping. Expert in identifying face shapes.",
        availability: "Mon-Sat 10:00 AM - 7:00 PM",
        schedule: {
            workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            workingHours: { start: "10:00", end: "19:00" },
            blockedDates: [],
            onHoliday: false
        },
        specialties: ["Eyelash Extensions", "Brow Shaping", "Lash Lift & Tint"], // Exact match with Service Titles
        walletCredits: 500,
        location: { name: "Back Road", lat: 9.7880, lng: 126.1540 },
        rates: { hourly: 550, weekly_pass: 1870, monthly_pass: 4950, weekly_sessions: 4, monthly_sessions: 12 },
        reviews: []
    },
    // --- CLEANING ---
    {
        id: "C1",
        name: "Siargao Housekeeping",
        image: "https://images.unsplash.com/photo-1581579186913-45ac3e6e3dd2?w=150&h=150&fit=crop",
        isVerified: true,
        bookings: 1024,
        rating: 4.8,
        tags: ["CLEANING", "Deep Clean", "Airbnb"],
        category: "CLEANING",
        price: 500,
        duration: 120,
        bio: "Professional cleaning service for villas and Airbnbs. We handle everything from sand removal to linen changes.",
        availability: "Mon-Sat 8:00 AM - 5:00 PM",
        schedule: {
            workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            workingHours: { start: "08:00", end: "17:00" },
            blockedDates: [],
            onHoliday: false
        },
        specialties: ["Deep Clean", "Standard Clean", "Airbnb Turnover"],
        walletCredits: 3000,
        location: { name: "General Luna Market", lat: 9.7870, lng: 126.1530 },
        rates: { hourly: 500, weekly_pass: 1700, monthly_pass: 4500, weekly_sessions: 4, monthly_sessions: 12 },
        reviews: []
    },
    {
        id: "C2",
        name: "EcoClean Island",
        image: "https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=150&h=150&fit=crop",
        isVerified: true,
        bookings: 215,
        rating: 4.9,
        tags: ["CLEANING", "Eco-Friendly", "Standard Clean"],
        category: "CLEANING",
        price: 600,
        duration: 120,
        bio: "We use only organic, non-toxic cleaning products safe for pets and children. Sustainable cleaning for your island home.",
        availability: "Mon-Fri 8:00 AM - 4:00 PM",
        schedule: {
            workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
            workingHours: { start: "08:00", end: "16:00" },
            blockedDates: [],
            onHoliday: false
        },
        specialties: ["Standard Clean"],
        walletCredits: 1000,
        location: { name: "Cloud 9 Boardwalk", lat: 9.8020, lng: 126.1620 },
        rates: { hourly: 600, weekly_pass: 1920, monthly_pass: 5400, weekly_sessions: 4, monthly_sessions: 12 },
        reviews: []
    },
    // --- AIRCON ---
    {
        id: "AC1",
        name: "Cool Breeze Tech",
        image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=150&h=150&fit=crop",
        isVerified: true,
        bookings: 85,
        rating: 4.7,
        tags: ["AIRCON", "Maintenance", "Repair"],
        category: "AIRCON",
        price: 1000,
        duration: 60,
        bio: "Certified aircon technicians. Cleaning, gas top-up, and repairs for split and window type units.",
        availability: "Mon-Fri 9:00 AM - 5:00 PM",
        schedule: {
            workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
            workingHours: { start: "09:00", end: "17:00" },
            blockedDates: [],
            onHoliday: false
        },
        specialties: ["General Cleaning", "Gas Top-up"], // Updated
        walletCredits: 1500,
        location: { name: "Tuason Point", lat: 9.7980, lng: 126.1630 },
        rates: { hourly: 1000, weekly_pass: 3400, monthly_pass: 9000, weekly_sessions: 4, monthly_sessions: 12 },
        customRates: {
            ac_split_cleaning: 1000,
            ac_window_cleaning: 750,
            ac_split_repair: 1500,
            ac_window_repair: 1000
        },
        reviews: []
    },
    {
        id: "AC2",
        name: "Arctic Air Solutions",
        image: "https://plus.unsplash.com/premium_photo-1663013210452-f4728f32ac9f?w=150&h=150&fit=crop",
        isVerified: true,
        bookings: 120,
        rating: 4.8,
        tags: ["AIRCON", "Installation", "Heavy Duty"],
        category: "AIRCON",
        price: 1200,
        duration: 90,
        bio: "Specializing in commercial and large residential air conditioning systems. Installation and deep chemical cleaning.",
        availability: "Mon-Sat 8:00 AM - 6:00 PM",
        schedule: {
            workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            workingHours: { start: "08:00", end: "18:00" },
            blockedDates: [],
            onHoliday: false
        },
        specialties: ["General Cleaning"], // Revert to General Cleaning for now as Install isn't a service
        walletCredits: 2000,
        location: { name: "Cashew Grove", lat: 9.7850, lng: 126.1500 },
        rates: { hourly: 1200, weekly_pass: 4080, monthly_pass: 10800, weekly_sessions: 4, monthly_sessions: 12 },
        customRates: {
            ac_split_cleaning: 1200,
            ac_window_cleaning: 900,
            ac_split_repair: 1800,
            ac_window_repair: 1300
        },
        reviews: []
    },
    // --- CHEF ---
    {
        id: "K1",
        name: "Chef Marco",
        image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=150&h=150&fit=crop",
        isVerified: true,
        bookings: 42,
        rating: 5.0,
        tags: ["CHEF", "Filipino", "Seafood"],
        category: "CHEF",
        price: 2500,
        duration: 180,
        bio: "Local culinary expert specializing in boodle fights and fresh seafood grills right at your villa.",
        availability: "Daily 11:00 AM - 8:00 PM",
        schedule: {
            workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            workingHours: { start: "11:00", end: "20:00" },
            blockedDates: [],
            onHoliday: false
        },
        specialties: ["Boodle Fight", "Seafood Grill"],
        walletCredits: 5000,
        location: { name: "Santa Ines", lat: 9.7750, lng: 126.1450 },
        rates: { hourly: 2500, weekly_pass: 8500, monthly_pass: 0, weekly_sessions: 4, monthly_sessions: 12 },
        customRates: {
            chef_labor_only: 500,
            chef_with_groceries: 1200
        },
        reviews: []
    },
    {
        id: "K2",
        name: "Green Table Siargao",
        image: "https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=150&h=150&fit=crop",
        isVerified: true,
        bookings: 28,
        rating: 4.9,
        tags: ["CHEF", "Vegan", "Healthy"],
        category: "CHEF",
        price: 2800,
        duration: 180,
        bio: "Plant-based private dining experiences. Using locally sourced, organic ingredients to create vibrant, healthy meals.",
        availability: "Tue-Sun 10:00 AM - 9:00 PM",
        schedule: {
            workingDays: ["Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            workingHours: { start: "10:00", end: "21:00" },
            blockedDates: [],
            onHoliday: false
        },
        specialties: ["Plated Dinner"], // Map to Plated Dinner (Vegan Option)
        walletCredits: 4000,
        location: { name: "GL Boulevard", lat: 9.7895, lng: 126.1550 },
        rates: { hourly: 2800, weekly_pass: 9520, monthly_pass: 0, weekly_sessions: 4, monthly_sessions: 12 },
        customRates: {
            chef_labor_only: 600,
            chef_with_groceries: 1400
        },
        reviews: []
    },
    // --- NANNY ---
    {
        id: "N1",
        name: "Nanny Rose",
        image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop",
        isVerified: true,
        bookings: 67,
        rating: 4.9,
        tags: ["NANNY", "Childcare", "First Aid"],
        category: "NANNY",
        price: 250,
        duration: 240,
        bio: "Experienced nanny and mother of two. First Aid certified and loves organizing beach activities for kids.",
        availability: "Daily 8:00 AM - 10:00 PM",
        schedule: {
            workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            workingHours: { start: "08:00", end: "22:00" },
            blockedDates: [],
            onHoliday: false
        },
        specialties: ["Standard Babysitting"],
        walletCredits: 1000,
        location: { name: "Poblacion 1", lat: 9.7885, lng: 126.1545 },
        rates: { hourly: 250, weekly_pass: 850, monthly_pass: 0, weekly_sessions: 4, monthly_sessions: 12 },
        customRates: {
            perExtraChild: 150,
            perInfant: 100
        },
        reviews: []
    },
    {
        id: "N2",
        name: "Ate Grace",
        image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop",
        isVerified: true,
        bookings: 112,
        rating: 5.0,
        tags: ["NANNY", "Newborn", "Night Shift"],
        category: "NANNY",
        price: 350,
        duration: 300,
        bio: "Specializing in newborn care and night shifts. Trustworthy and patient, ensuring parents get their rest.",
        availability: "Daily 6:00 PM - 2:00 AM",
        schedule: {
            workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            workingHours: { start: "18:00", end: "02:00" },
            blockedDates: [],
            onHoliday: false
        },
        specialties: ["Standard Babysitting"], // Map to standard for now
        walletCredits: 1500,
        location: { name: "Poblacion 3", lat: 9.7890, lng: 126.1565 },
        rates: { hourly: 350, weekly_pass: 1190, monthly_pass: 0, weekly_sessions: 4, monthly_sessions: 12 },
        customRates: {
            perExtraChild: 200,
            perInfant: 150
        },
        reviews: []
    }
];

export const SERVICE_DESCRIPTIONS: Record<string, string> = {
    "hilot": "Traditional Filipino healing art involving herbs, oils, and massage techniques to clear energy blockages.",
    "swedish": "Gentle, relaxing massage to improve circulation and relieve muscle tension.",
    "deep_tissue": "Intense pressure targets deep muscle layers to release chronic tension and knots.",
    "shiatsu": "Japanese pressure-point therapy to balance energy flow and reduce stress.",
    "reflexology": "Focused pressure on feet/hands corresponding to body organs for holistic healing.",
    "sports": "Targeted therapy for athletes to prevent injury, improve performance, and aid recovery.",
    "maternal": "Gentle, safe massage tailored for expectant mothers to reduce swelling and back pain."
};
