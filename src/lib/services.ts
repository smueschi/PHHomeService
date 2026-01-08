
import { Divide, Home, Palmtree, Sparkles, Utensils, Baby, Wind, Stethoscope } from "lucide-react";

export type ServiceCategory = "MASSAGE" | "BEAUTY" | "CLEANING" | "AIRCON" | "CHEF" | "NANNY";

export interface ServiceOption {
    id: string;
    label: string;
    description?: string;
    price?: number;
    requiresInput?: boolean;
    inputType?: "number" | "select" | "toggle";
    inputLabel?: string;
    inputOptions?: string[]; // For select
}

export interface ServiceDefinition {
    id: string;
    title: string;
    description: string;
    icon: any;
    color: string;
    subServices: {
        id: string;
        title: string;
        description: string;
        options?: ServiceOption[];
        inputs?: {
            id: string;
            label: string;
            type: "number" | "select" | "toggle";
            placeholder?: string;
            options?: string[]; // for select
        }[];
        upsell?: {
            triggerServiceId: string; // If this matches
            label: string;
            price: number;
        };
    }[];
}

export const SERVICE_CATEGORIES: ServiceDefinition[] = [
    {
        id: "MASSAGE",
        title: "Massage & Spa",
        description: "Hilot, Deep Tissue, Recovery",
        icon: Palmtree,
        color: "bg-emerald-100/50 text-emerald-700",
        subServices: [
            {
                id: "HILOT",
                title: "Traditional Hilot",
                description: "Filipino healing with herbs & oils.",
                inputs: [
                    { id: "duration", label: "Duration", type: "select", options: ["30 Minutes", "60 Minutes", "90 Minutes", "120 Minutes"] }
                ]
            },
            {
                id: "SWEDISH",
                title: "Swedish Massage",
                description: "Relaxation and circulation.",
                inputs: [
                    { id: "duration", label: "Duration", type: "select", options: ["30 Minutes", "60 Minutes", "90 Minutes", "120 Minutes"] }
                ]
            },
            {
                id: "DEEP",
                title: "Deep Tissue",
                description: "Muscle recovery & heavy pressure.",
                inputs: [
                    { id: "duration", label: "Duration", type: "select", options: ["30 Minutes", "60 Minutes", "90 Minutes", "120 Minutes"] }
                ]
            },
            {
                id: "SPORTS",
                title: "Sports Massage",
                description: "Targeted recovery for surfers & athletes.",
                inputs: [
                    { id: "duration", label: "Duration", type: "select", options: ["60 Minutes", "90 Minutes"] }
                ]
            }
        ]
    },
    {
        id: "BEAUTY",
        title: "Beauty Bar",
        description: "Nails, Lashes, Glamping Prep",
        icon: Sparkles,
        color: "bg-pink-100/50 text-pink-700",
        subServices: [
            {
                id: "NAILS_CLASSIC",
                title: "Classic Clean",
                description: "Standard trim, shape & cuticle care.",
            },
            {
                id: "NAILS_GEL",
                title: "Gel Polish",
                description: "Long-lasting UV gel (Therapist brings lamp).",
                options: [
                    { id: "GEL_REMOVAL", label: "Need Gel Removal? (+30 mins)", inputType: "toggle" }
                ]
            },
            {
                id: "NAILS_SPA_SCRUB",
                title: "Spa Foot Scrub",
                description: "Exfoliation for tired surfer feet."
            },
            {
                id: "LASH_EXT",
                title: "Eyelash Extensions",
                description: "Full set extensions.",
                inputs: [
                    { id: "style", label: "Style", type: "select", options: ["Classic", "Hybrid", "Volume"] }
                ]
            },
            {
                id: "LASH_LIFT",
                title: "Lash Lift & Tint",
                description: "Beach-ready natural curl."
            },
            {
                id: "BROW_SHAPING",
                title: "Brow Shaping",
                description: "Threading/Shaping add-on."
            },
            {
                id: "EVENTS_GLAMPING", // Updated ID to match "Events" tag
                title: "Events & Glamping",
                description: "Spa Party (2-3 Therapists).",
                inputs: [
                    { id: "guest_count", label: "Number of Guests", type: "number" }
                ]
            }
        ]
    },
    {
        id: "CLEANING",
        title: "Home Cleaning",
        description: "Deep Clean, Airbnb Turnover",
        icon: Home,
        color: "bg-blue-100/50 text-blue-700",
        subServices: [
            {
                id: "CLEAN_STD",
                title: "Standard Clean",
                description: "Floors, surfaces, bathroom.",
                inputs: [
                    { id: "bedrooms", label: "Bedrooms", type: "number" },
                    { id: "bathrooms", label: "Bathrooms", type: "number" }
                ]
            },
            {
                id: "CLEAN_AIRBNB",
                title: "Airbnb Turnover",
                description: "Sand removal, linen change, toiletry restock.",
                inputs: [
                    { id: "bedrooms", label: "Bedrooms", type: "number" },
                    { id: "bathrooms", label: "Bathrooms", type: "number" }
                ],
                upsell: { triggerServiceId: "AIRCON", label: "Add Aircon Cleaning? (Save 10%)", price: 0 }
            },
            {
                id: "CLEAN_DEEP",
                title: "Deep Clean",
                description: "Move-in/Move-out heavy duty.",
                inputs: [
                    { id: "bedrooms", label: "Bedrooms", type: "number" },
                    { id: "bathrooms", label: "Bathrooms", type: "number" }
                ]
            }

        ]
    },
    {
        id: "AIRCON",
        title: "Aircon Care",
        description: "Split/Window Cleaning & Gas",
        icon: Wind,
        color: "bg-cyan-100/50 text-cyan-700",
        subServices: [
            {
                id: "AC_CLEAN",
                title: "General Cleaning",
                description: "Pressure wash & Maintenance.",
                inputs: [
                    { id: "split_count", label: "Wall/Split Type Qty", type: "number", placeholder: "0" },
                    { id: "window_count", label: "Window Type Qty", type: "number", placeholder: "0" }
                ]
            },
            {
                id: "AC_GAS",
                title: "Gas Top-up",
                description: "Freon check & fill.",
                inputs: [
                    { id: "split_count", label: "Wall/Split Type Qty", type: "number", placeholder: "0" },
                    { id: "window_count", label: "Window Type Qty", type: "number", placeholder: "0" }
                ]
            }
        ]
    },
    {
        id: "CHEF",
        title: "Private Chef",
        description: "Villa Dinners & Boodle Fights",
        icon: Utensils,
        color: "bg-orange-100/50 text-orange-700",
        subServices: [
            {
                id: "CHEF_BOODLE",
                title: "Boodle Fight",
                description: "Traditional Filipino feast on banana leaves.",
                inputs: [
                    { id: "pax", label: "Number of Pax", type: "number" },
                    { id: "kitchen", label: "Kitchen Type", type: "select", options: ["Full Kitchen", "Kitchenette", "Grill Only"] },
                    { id: "provisioning", label: "Provisioning", type: "select", options: ["Labor Only (Client Buys Ingredients)", "All-Inclusive (Chef Buys Ingredients)"] }
                ]
            },
            {
                id: "CHEF_SEAFOOD",
                title: "Seafood Grill",
                description: "Fresh local catch BBQ.",
                inputs: [
                    { id: "pax", label: "Number of Pax", type: "number" },
                    { id: "dietary", label: "Dietary Restrictions", type: "select", options: ["None", "No Pork", "Pescatarian"] },
                    { id: "provisioning", label: "Provisioning", type: "select", options: ["Labor Only (Client Buys Ingredients)", "All-Inclusive (Chef Buys Ingredients)"] }
                ]
            },
            {
                id: "CHEF_PLATED",
                title: "Plated Dinner",
                description: "3-Course Fine Dining (Vegan avail).",
                inputs: [
                    { id: "pax", label: "Number of Pax", type: "number" },
                    { id: "dietary", label: "Dietary Restrictions", type: "select", options: ["None", "Vegetarian/Vegan", "Allergies (Specify in Notes)"] },
                    { id: "provisioning", label: "Provisioning", type: "select", options: ["Labor Only (Client Buys Ingredients)", "All-Inclusive (Chef Buys Ingredients)"] }
                ]
            }
        ]
    },
    {
        id: "NANNY",
        title: "Nanny Service",
        description: "Verified Childcare",
        icon: Baby,
        color: "bg-rose-100/50 text-rose-700",
        subServices: [
            {
                id: "NANNY_STD",
                title: "Standard Babysitting",
                description: "4-hour minimum. Rate is per hour.",
                inputs: [
                    { id: "children_count", label: "Number of Children", type: "number" },
                    { id: "duration_hours", label: "Duration (Hours)", type: "number" },
                    { id: "ages", label: "Ages", type: "select", options: ["Infant (0-1)", "Toddler (1-3)", "Preschooler (4-5)", "School Age (6-9)", "Pre-teen (10+)"] } // Simplified for UI
                ]
            }
        ]
    },
];

export const CROSS_SELL_RULES: Record<string, { label: string; addonServiceCode: string; price: number }> = {
    "MASSAGE": { label: "Add a Foot Scrub for +₱300?", addonServiceCode: "NAILS_SPA_SCRUB", price: 300 },
    "BEAUTY": { label: "Add a 30-min Head & Shoulder Massage?", addonServiceCode: "MASSAGE", price: 350 }, // Generic massage
    "CLEANING": { label: "Add Aircon Cleaning? (Save 10%)", addonServiceCode: "AC_CLEAN", price: 1000 } // Mock price
};
