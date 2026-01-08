import { google } from "googleapis";
import { createClient } from "@supabase/supabase-js";

// Init Supabase Admin (for fetching provider tokens securely)
// Init Supabase Admin (for fetching provider tokens securely)
// const supabaseAdmin = createClient(...) - Moved to function to avoid build crashes if env missing

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/auth/callback/google";

export async function syncBookingToGoogleCalendar(bookingId: string) {
    if (!CLIENT_ID || !CLIENT_SECRET) {
        console.warn("Google Credentials missing, skipping sync.");
        return;
    }

    // 1. Fetch Booking and Provider
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.warn("Missing SUPABASE_SERVICE_ROLE_KEY, skipping sync.");
        return;
    }

    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: booking, error: bookingError } = await supabaseAdmin
        .from('bookings')
        .select('*, provider:profiles!provider_id(google_refresh_token, google_email)') // Join provider to get tokens
        .eq('id', bookingId)
        .single();

    if (bookingError || !booking) {
        console.error("Sync Error: Booking not found", bookingError);
        return;
    }

    const provider = booking.provider;
    if (!provider || !provider.google_refresh_token) {
        console.log("Sync Skipped: Provider not connected to Google Calendar.");
        return;
    }

    // 2. Setup Google Client
    const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
    oauth2Client.setCredentials({ refresh_token: provider.google_refresh_token });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // 3. Create Event Payload
    const startTime = new Date(`${booking.date}T${booking.time}`);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // Assume 1 hour default if duration missing

    const event = {
        summary: `Appointment: ${booking.service_code || "Service"}`,
        description: `Client: ${booking.customer?.name || "Unknown"}\nNotes: ${booking.meta?.notes || ""}`,
        start: { dateTime: startTime.toISOString() },
        end: { dateTime: endTime.toISOString() },
    };

    // 4. Insert into Primary Calendar
    try {
        await calendar.events.insert({
            calendarId: 'primary',
            requestBody: event,
        });
        console.log(`Synced booking ${bookingId} to Google Calendar of ${provider.google_email}`);
    } catch (err) {
        console.error("Google Calendar API Error:", err);
    }
}
