import { supabase } from './supabase';
import { Therapist, CategoryRequest } from './data';

// Helper to format schedule object into readable string
const formatScheduleToAvailability = (schedule: any): string => {
    if (!schedule) return "Not Available";
    if (schedule.onHoliday) return "Currently on Holiday 🏖️";
    if (!schedule.workingDays || schedule.workingDays.length === 0) return "Not Available";

    // Simplification: Check if Weekdays (Mon-Fri) match
    const days = schedule.workingDays;
    const isDaily = days.length === 7;
    const isMonFri = days.length === 5 && days.includes("Mon") && days.includes("Fri");
    const isWeekends = days.length === 2 && days.includes("Sat") && days.includes("Sun");

    let dayStr = days.join(", ");
    if (isDaily) dayStr = "Daily";
    else if (isMonFri) dayStr = "Mon-Fri";
    else if (isWeekends) dayStr = "Weekends";

    const timeStr = `${formatTime(schedule.workingHours?.start || "09:00")} - ${formatTime(schedule.workingHours?.end || "17:00")}`;

    return `${dayStr} ${timeStr}`;
};

const formatTime = (time: string) => {
    if (!time) return "";
    const [h, m] = time.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
};

// Helper to map DB Row -> Therapist object (camelCase)
const mapProfileToTherapist = (row: any): Therapist => {
    // Handle location safely: might be string or JSON
    let locationObj: { name: string, lat: number, lng: number } = { name: "Philippines", lat: 14.5995, lng: 120.9842 }; // Default Manila

    if (row.location) {
        if (typeof row.location === 'string') {
            locationObj = { name: row.location, lat: 14.5995, lng: 120.9842 };
        } else if (typeof row.location === 'object') {
            locationObj = {
                name: row.location.name || "Unknown",
                lat: row.location.lat || 14.5995,
                lng: row.location.lng || 120.9842
            };
        }
    }

    return {
        id: row.id,
        name: row.name || "Provider",
        image: row.image || "",
        isVerified: row.is_verified || false,
        bookings: row.bookings_count || 0,
        rating: Number(row.rating || 0),
        tags: row.tags || [],
        category: row.category || "Uncategorized",
        price: Number(row.price || 0),
        duration: row.duration || "60 min",
        bio: row.bio || "",
        availability: formatScheduleToAvailability(row.schedule),
        schedule: row.schedule || { workingDays: [], workingHours: { start: "09:00", end: "17:00" }, blockedDates: [], onHoliday: false },
        specialties: row.specialties || [],
        walletCredits: Number(row.wallet_credits || 0),
        location: locationObj,
        rates: row.rates || {},
        customRates: row.custom_rates || {},
        addons: row.addons || [],
        serviceRates: row.service_rates || {},
        contactNumber: row.contact_number || "",
        contactPreference: row.contact_preference || "any",
        reviews: row.reviews || [],
        role: row.role || "provider"
    };
};

// Helper to map DB Row -> CategoryRequest
const mapRowToRequest = (row: any): CategoryRequest => ({
    id: row.id,
    providerId: row.provider_id,
    providerName: row.provider_name || "Unknown Provider",
    requestedCategory: row.requested_category,
    requestedSubServices: row.requested_sub_services || [],
    experienceYears: row.experience_years,
    status: row.status as any,
    date: new Date(row.created_at).toLocaleDateString()
});

export const getProviders = async (): Promise<Therapist[]> => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*');

    if (error) {
        console.error("Error fetching providers:", error);
        return [];
    }

    return (data || []).map(mapProfileToTherapist);
};

export const getProviderById = async (id: string): Promise<Therapist | undefined> => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        // console.error("Error fetching provider:", error);
        return undefined;
    }

    return mapProfileToTherapist(data);
};

// --- Category Requests ---

export const getCategoryRequests = async (): Promise<CategoryRequest[]> => {
    const { data, error } = await supabase
        .from('category_requests')
        .select('*')
        .order('created_at', { ascending: false }); // Newest first

    if (error) {
        console.error("Error fetching requests:", error);
        return [];
    }

    return (data || []).map(mapRowToRequest);
};

export const updateRequestStatus = async (id: string, status: 'approved' | 'rejected') => {
    const { error } = await supabase
        .from('category_requests')
        .update({ status })
        .eq('id', id);

    if (error) throw error;
};

// Start a "Transaction" to approve: Update Request -> Update Profile Tags
export const approveRequest = async (request: CategoryRequest) => {
    // 1. Fetch current profile to get current tags
    const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('tags')
        .eq('id', request.providerId)
        .single();

    if (fetchError || !profile) throw new Error("Provider not found");

    // 2. Prepare new tags
    const currentTags = profile.tags || [];
    const newTags = new Set([...currentTags, request.requestedCategory]);
    // Optionally add title tag if simple mapping needed, but category code is most important

    // 3. Update Profile
    const { error: updateProfileError } = await supabase
        .from('profiles')
        .update({ tags: Array.from(newTags) })
        .eq('id', request.providerId);

    if (updateProfileError) throw updateProfileError;

    // 4. Update Request Status
    await updateRequestStatus(request.id, 'approved');
};

// --- Bookings ---

export const createBooking = async (payload: any) => {
    // We expect the payload to already be formatted in snake_case corresponding to the DB columns
    // by the calling component (BookingModal / ServiceBookingModal).
    const { data, error } = await supabase
        .from('bookings')
        .insert([payload])
        .select()
        .single();

    if (error) {
        console.error("Booking creation failed:", error);
        throw error;
    }

    return data;
};

// --- Provider Management ---

export const getProviderProfile = async (userId: string) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        console.error("Error fetching provider profile:", error);
        return null;
    }
    return mapProfileToTherapist(data);
};

export const getProviderProfileWithReviews = async (userId: string) => {
    // 1. Get Profile
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (profileError) return null;

    // 2. Get Reviews
    // 2. Get Reviews
    // Verified Schema: id, therapist_id, date, author, rating, comment
    const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .eq('therapist_id', userId)
        .order('date', { ascending: false }); // Using date instead of created_at

    // 3. Combine
    const fullProfile = {
        ...profile,
        reviews: reviews?.map((r: any) => ({
            author: r.author,
            rating: r.rating,
            comment: r.comment,
            date: r.date ? new Date(r.date).toLocaleDateString() : 'Recent'
        })) || []
    };

    return mapProfileToTherapist(fullProfile);
};

export const updateProviderSchedule = async (userId: string, schedule: any) => {
    const { error } = await supabase
        .from('profiles')
        .update({ schedule })
        .eq('id', userId);

    if (error) throw error;
};

export const updateProviderBio = async (userId: string, bio: string) => {
    const { error } = await supabase
        .from('profiles')
        .update({ bio })
        .eq('id', userId);

    if (error) throw error;
};

export const updateProviderServiceRates = async (userId: string, serviceRates: any) => {
    const { error } = await supabase
        .from('profiles')
        .update({ service_rates: serviceRates })
        .eq('id', userId);

    if (error) throw error;
};

export const getBookings = async () => {
    const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching bookings:", error);
        return [];
    }

    return data;
};

export const updateBookingStatus = async (id: string, status: string) => {
    const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', id);

    if (error) {
        console.error("Error updating booking:", error);
        throw error;
    }
};

export const updateBookingFinancials = async (id: string, financials: any) => {
    const { error } = await supabase
        .from('bookings')
        .update({ financials })
        .eq('id', id);

    if (error) {
        console.error("Error updating booking financials:", error);
        throw error;
    }
};

export const getUserBookings = async (userId: string) => {
    // We assume the booking has a 'user_id' column or we filter by customer phone/email if not authenticated.
    // However, best practice is to RLS by user_id. 
    // Checking schema via logic: The payload in ServiceBookingModal doesn't strictly send user_id in the root, 
    // but often Supabase adds it automatically if using RLS. 
    // Let's assume we can filter by the 'customer->phone' or similar if no user_id column, 
    // BUT typically we should add user_id to the booking table.
    // For now, let's try to select where user_id matches if column exists, or rely on RLS.
    // If we rely on RLS, simple .select('*') is enough for "my bookings".

    const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching user bookings:", error);
        return [];
    }
    return data;
};

export const getProviderBookings = async (providerId: string) => {
    // Fetch bookings where metadata->therapist_id matches the providerId
    // We need to use the JSON contained operator or arrow operator.
    // 'meta' column is JSONB.

    // Note: 'meta->therapist_id' extraction might require string casting depending on how it was saved.
    // Since we saved it as string ID, we look for matches.

    const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('meta->>therapist_id', providerId)
        .order('date', { ascending: true }) // Upcoming first
        .order('time', { ascending: true }); // By time

    if (error) {
        console.error("Error fetching provider bookings:", error);
        return [];
    }

    // Filter out past bookings if needed, but for now let's return all and let frontend filter
    return data || [];
};

export const updateProviderContactDetails = async (userId: string, contactDetails: { contactNumber: string, contactPreference: string }) => {
    const { error } = await supabase
        .from('profiles')
        .update({
            contact_number: contactDetails.contactNumber,
            contact_preference: contactDetails.contactPreference
        })
        .eq('id', userId);

    if (error) throw error;
};

export const updateProviderProfile = async (userId: string, updates: Partial<any>) => {
    // Map frontend camelCase to DB snake_case if necessary, or just pass widely used fields.
    // Ideally we strictly type 'updates'. For now, we manually map specific common fields to ensure safety.

    const dbUpdates: any = {};
    if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
    if (updates.schedule) dbUpdates.schedule = updates.schedule;
    if (updates.rates) dbUpdates.rates = updates.rates;
    if (updates.customRates) dbUpdates.custom_rates = updates.customRates;
    if (updates.serviceRates) dbUpdates.service_rates = updates.serviceRates;
    if (updates.contactNumber !== undefined) dbUpdates.contact_number = updates.contactNumber;
    if (updates.contactPreference !== undefined) dbUpdates.contact_preference = updates.contactPreference;
    if (updates.location) dbUpdates.location = updates.location;
    if (updates.tags) dbUpdates.tags = updates.tags;
    if (updates.specialties) dbUpdates.specialties = updates.specialties;
    // Add other fields as needed

    const { error } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', userId);

    if (error) throw error;
};

// --- Reviews ---

export const createReview = async (review: { provider_id: string, author: string, rating: number, comment: string, booking_reference?: string }) => {
    // Map provider_id to therapist_id for DB
    const payload = {
        therapist_id: review.provider_id,
        author: review.author,
        rating: review.rating,
        comment: review.comment,
        date: new Date().toISOString() // Ensure date is present as created_at is missing
        // booking_reference removed as it doesn't exist in DB schema
    };

    const { data, error } = await supabase
        .from('reviews')
        .insert([payload])
        .select()
        .single();

    if (error) throw error;
    return data;
};

// --- Provider Requests ---

export const getProviderRequests = async (providerId: string) => {
    const { data, error } = await supabase
        .from('provider_requests')
        .select('*')
        .eq('provider_id', providerId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching requests:", error);
        return [];
    }

    return data.map((r: any) => ({
        id: r.id,
        providerId: r.provider_id,
        requestedCategory: r.requested_category,
        requestedSubServices: r.requested_sub_services || [],
        experienceYears: r.experience_years,
        status: r.status,
        date: new Date(r.created_at).toLocaleDateString()
    }));
};

// --- Storage ---

export const uploadProviderDocument = async (file: File, path: string) => {
    // Bucket: 'provider-documents' (Must exist in Supabase Storage)
    const { data, error } = await supabase.storage
        .from('provider-documents')
        .upload(path, file, {
            upsert: true
        });

    if (error) throw error;

    // Get Public URL
    const { data: publicData } = supabase.storage
        .from('provider-documents')
        .getPublicUrl(path);

    return publicData.publicUrl;
};

export const createProviderRequest = async (payload: {
    provider_id: string,
    requested_category: string,
    requested_sub_services: string[],
    experience_years: string,
    documents?: Record<string, string> // New Field
}) => {
    const { data, error } = await supabase
        .from('provider_requests')
        .insert([payload])
        .select()
        .single();

    if (error) throw error;
    return data;
};

// --- Admin Functions ---

export const getAllPendingRequests = async () => {
    const { data, error } = await supabase
        .from('provider_requests')
        .select(`
            *,
            profiles:provider_id (name, image)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching all requests:", error);
        return [];
    }

    return data.map((r: any) => ({
        id: r.id,
        providerId: r.provider_id,
        providerName: r.profiles?.name || "Unknown Provider",
        providerImage: r.profiles?.image,
        requestedCategory: r.requested_category,
        requestedSubServices: r.requested_sub_services || [],
        experienceYears: r.experience_years,
        status: r.status,
        date: new Date(r.created_at).toLocaleDateString()
    }));
};

export const adminApproveRequest = async (requestId: string, providerId: string, categoryId: string, subServices: string[]) => {
    // 1. Mark Request as Approved
    const { error: reqError } = await supabase
        .from('provider_requests')
        .update({ status: 'approved' })
        .eq('id', requestId);

    if (reqError) throw reqError;

    // 2. Fetch current profile tags/specialties
    const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('tags, specialties')
        .eq('id', providerId)
        .single();

    if (fetchError) throw fetchError;

    // 3. Update Profile (Add tag and specialties if missing)
    const currentTags = profile.tags || [];
    const currentSpecialties = profile.specialties || [];

    const newTags = currentTags.includes(categoryId) ? currentTags : [...currentTags, categoryId];
    // Merge new sub-services uniquely
    const newSpecialties = Array.from(new Set([...currentSpecialties, ...subServices]));

    const { error: updateError } = await supabase
        .from('profiles')
        .update({
            tags: newTags,
            specialties: newSpecialties
        })
        .eq('id', providerId);

    if (updateError) throw updateError;
};

export const adminRejectRequest = async (requestId: string) => {
    const { error } = await supabase
        .from('provider_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

    if (error) throw error;
};

// --- User Management (Admin) ---

export const getAllProfiles = async () => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching all profiles:", error);
        return [];
    }

    return (data || []).map(mapProfileToTherapist);
};

export const updateUserRole = async (userId: string, role: 'admin' | 'provider' | 'user') => {
    const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);

    if (error) throw error;
};
