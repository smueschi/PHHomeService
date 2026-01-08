import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

// These should be in env vars
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/auth/callback/google";

export async function GET(request: NextRequest) {
    if (!CLIENT_ID || !CLIENT_SECRET) {
        return NextResponse.json({ error: "Missing Google Credentials in Environment" }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('providerId');

    if (!providerId) {
        return NextResponse.json({ error: "Missing providerId param" }, { status: 400 });
    }

    const oauth2Client = new google.auth.OAuth2(
        CLIENT_ID,
        CLIENT_SECRET,
        REDIRECT_URI
    );

    // Generate specific auth url
    // Include state as providerId to know who to link on callback
    const scopes = [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/userinfo.email'
    ];

    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline', // crucial for refresh token
        scope: scopes,
        state: providerId,
        prompt: 'consent' // Force consent to ensure we get refresh token
    });

    return NextResponse.redirect(url);
}
