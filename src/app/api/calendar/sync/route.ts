import { NextRequest, NextResponse } from "next/server";
import { syncBookingToGoogleCalendar } from "@/lib/google";


export async function POST(request: NextRequest) {
    const { bookingId } = await request.json();

    if (!bookingId) {
        return NextResponse.json({ error: "Missing bookingId" }, { status: 400 });
    }

    // Trigger Sync Logic
    // This function handles the checks (if connected, if credentials exist)
    await syncBookingToGoogleCalendar(bookingId);

    return NextResponse.json({ success: true });
}
