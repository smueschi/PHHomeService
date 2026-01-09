export async function sendBookingConfirmation(bookingDetails: any) {
    try {
        const response = await fetch('/api/emails', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'booking_confirmation',
                data: bookingDetails
            })
        });
        return await response.json();
    } catch (error) {
        console.error("Failed to send booking confirmation email:", error);
        return { success: false, error };
    }
}

export async function sendProviderNotification(bookingDetails: any) {
    try {
        const response = await fetch('/api/emails', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'provider_notification',
                data: bookingDetails
            })
        });
        return await response.json();
    } catch (error) {
        console.error("Failed to send provider notification email:", error);
        return { success: false, error };
    }
}

export async function sendNewMessageNotification(toEmail: string, fromName: string, messagePreview: string) {
    try {
        const response = await fetch('/api/emails', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'new_message',
                data: {
                    to: toEmail,
                    from: fromName,
                    preview: messagePreview
                }
            })
        });
        return await response.json();
    } catch (error) {
        console.error("Failed to send message notification email:", error);
        return { success: false, error };
    }
}
