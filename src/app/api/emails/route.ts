import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend with env variable, or mock if missing
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { type, data } = body;

        if (!resend) {
            console.log(`[MOCK EMAIL] Type: ${type}`, data);
            return NextResponse.json({ success: true, mock: true });
        }

        let subject = "";
        let html = "";
        let to = "";

        if (type === 'booking_confirmation') {
            to = data.customerEmail;
            subject = `Booking Confirmation - ${data.serviceName}`;
            html = `
                <h1>Booking Confirmed!</h1>
                <p>Hi ${data.customerName},</p>
                <p>Your booking for <strong>${data.serviceName}</strong> has been received.</p>
                <p><strong>Date:</strong> ${data.date} at ${data.time}</p>
                <p><strong>Address:</strong> ${data.address}</p>
                <p>We will notify you once the provider accepts the request.</p>
            `;
        } else if (type === 'provider_notification') {
            to = data.providerEmail || 'provider@example.com'; // Fallback for safety
            subject = `New Booking Request - ${data.serviceName}`;
            html = `
                <h1>New Booking Request</h1>
                <p>You have a new booking request!</p>
                <p><strong>Service:</strong> ${data.serviceName}</p>
                <p><strong>Customer:</strong> ${data.customerName}</p>
                <p><strong>Date:</strong> ${data.date} at ${data.time}</p>
                <p>Please log in to your dashboard to accept or reject this booking.</p>
            `;
        } else {
            return NextResponse.json({ success: false, error: "Invalid email type" }, { status: 400 });
        }

        const { data: emailData, error } = await resend.emails.send({
            from: 'PH Home Service <onboarding@resend.dev>', // Update with verified domain later
            to: [to],
            subject: subject,
            html: html,
        });

        if (error) {
            console.error("Resend Error:", error);
            return NextResponse.json({ success: false, error });
        }

        return NextResponse.json({ success: true, data: emailData });

    } catch (error) {
        console.error("Email API Error:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
