import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { createClient } from "@supabase/supabase-js";

// These should be in env vars
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/auth/callback/google";
const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Using Service Role to write sensitive tokens bypass RLS if needed

export async function GET(request: NextRequest) {
    if (!CLIENT_ID || !CLIENT_SECRET) {
        return NextResponse.json({ error: "Configuration Error" }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const providerId = searchParams.get('state'); // We passed providerId as state
    const error = searchParams.get('error');

    if (error) {
        return NextResponse.json({ error: `Google Auth Error: ${error}` }, { status: 400 });
    }

    if (!code || !providerId) {
        return NextResponse.json({ error: "Missing code or state" }, { status: 400 });
    }

    try {
        const oauth2Client = new google.auth.OAuth2(
            CLIENT_ID,
            CLIENT_SECRET,
            REDIRECT_URI
        );

        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // Get User Email for UI
        const oauth2 = google.oauth2({
            auth: oauth2Client,
            version: 'v2'
        });
        const { data: userInfo } = await oauth2.userinfo.get();
        const email = userInfo.email;

        // Initialize Supabase Admin
        // NOTE: We use SERVICE ROLE key here because normal user might not have permission 
        // to update these specific columns depending on strict RLS, though "update own profile" usually works.
        // Using service role is safer for backend operations.
        const supabaseAdmin = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        const { error: dbError } = await supabaseAdmin
            .from('profiles')
            .update({
                google_refresh_token: tokens.refresh_token, // Only available on first consent or prompt='consent'
                google_email: email,
                is_google_calendar_connected: true
            })
            .eq('id', providerId);

        if (dbError) {
            console.error("DB Error saving token:", dbError);
            throw dbError;
        }

        // Redirect back to dashboard
        return NextResponse.redirect(new URL("/provider-dashboard?google_connected=true", request.url));

    } catch (err) {
        console.error("OAuth Error:", err);
        return NextResponse.json({ error: "Failed to authenticate with Google" }, { status: 500 });
    }
}
