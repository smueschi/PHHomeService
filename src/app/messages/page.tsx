"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { ConversationList } from "@/components/feature/Chat/ConversationList";
import { ChatWindow } from "@/components/feature/Chat/ChatWindow";
import { getProviderBookings } from "@/lib/api";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

function MessagesContent() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Remote Data
    const [bookings, setBookings] = useState<any[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    // Chat State
    const [activeChatUser, setActiveChatUser] = useState<{ id: string, name: string, image?: string, email?: string } | null>(null);

    // Initial Fetch
    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                // Fetch relevant bookings to populate conversation list
                const bookingData = await getProviderBookings(user.id);
                setBookings(bookingData || []);

                // Check URL params for auto-select (e.g., from Profile button)
                const targetUserId = searchParams.get('userId');
                if (targetUserId && bookingData) {
                    const targetBooking = bookingData.find(b => (b as any).user_id === targetUserId || b.customer.email === targetUserId || b.customer.phone === targetUserId);
                    if (targetBooking) {
                        const client = targetBooking.customer;
                        // Construct user object safely
                        setActiveChatUser({
                            id: targetUserId,
                            name: client.name || "Client",
                            image: client.image,
                            email: client.email
                        });
                    } else if (targetUserId) {
                        // Fallback: If we have an ID but no booking, we can at least try to chat.
                        setActiveChatUser({
                            id: targetUserId,
                            name: "Client", // Placeholder
                            image: undefined
                        });
                    }
                }

            } catch (err) {
                console.error("Failed to fetch messages data", err);
            } finally {
                setLoadingData(false);
            }
        };

        if (!isLoading && user) {
            fetchData();
        } else if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router, searchParams]);


    if (isLoading || loadingData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-eucalyptus mb-4" />
                <p className="text-muted-foreground font-medium">Loading Messages...</p>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-50">
            {/* LEFT SIDEBAR: CONVERSATION LIST */}
            <div className={`w-full md:w-80 lg:w-96 border-r bg-white flex flex-col h-full z-10 ${activeChatUser ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/provider-dashboard')}>
                        <ArrowLeft className="h-5 w-5 text-slate-500" />
                    </Button>
                    <h1 className="font-bold text-xl text-slate-800">Messages</h1>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <ConversationList
                        bookings={bookings}
                        activeChatId={activeChatUser?.id || null}
                        onSelectUser={(u) => setActiveChatUser({ id: u.id, name: u.name, image: u.image, email: u.email })}
                    />
                </div>
            </div>

            {/* RIGHT MAIN: CHAT WINDOW */}
            <div className={`flex-1 bg-slate-100 flex flex-col h-full relative ${!activeChatUser ? 'hidden md:flex' : 'flex'}`}>
                {activeChatUser ? (
                    <div className="flex-1 flex flex-col h-full relative">
                        {/* Mobile Header to go back */}
                        <div className="md:hidden h-14 bg-white border-b flex items-center px-4">
                            <Button variant="ghost" size="sm" onClick={() => setActiveChatUser(null)} className="mr-2">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <span className="font-semibold truncate">{activeChatUser.name}</span>
                        </div>

                        {/* We reuse ChatWindow but we might need to adjust it if it has fixed positioning. 
                            Let's assume ChatWindow is designed as a fixed widget and try to override its styles or wrap it.
                            Wait, ChatWindow has `fixed bottom-4 right-4` classes. 
                            We need to override this for the full-page view.
                            Since we can't easily pass class overrides without modifying ChatWindow,
                            we may need to modify ChatWindow to accept `className` or style modes.
                            
                            However, checking the props, we can't easily change it without editing the component.
                            Checking ChatWindow.tsx content previously viewed: it has hardcoded tailwind classes.
                            
                            Strategy: Wrap it in a div that might constrain it? modify ChatWindow to support `variant="fullscreen"`?
                            Modifying ChatWindow is cleaner.
                        */}
                        <ChatWindow
                            otherUserId={activeChatUser.id}
                            otherUserName={activeChatUser.name}
                            otherUserImage={activeChatUser.image}
                            otherUserEmail={activeChatUser.email}
                            onClose={() => setActiveChatUser(null)}
                            // We will need to update ChatWindow to handle non-fixed mode or we pass a prop
                            // For now, let's pass a `className` prop if it accepts it, or we edit ChatWindow.
                            // I will edit ChatWindow in the next step to support full screen mode.
                            variant="fullscreen"
                        />
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
                        <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-6">
                            <span className="text-4xl">💬</span>
                        </div>
                        <h2 className="text-xl font-semibold text-slate-700 mb-2">Your Messages</h2>
                        <p className="text-center max-w-sm">Select a conversation from the list to start chatting with your clients.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function MessagesPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-screen"><Loader2 className="w-8 h-8 animate-spin text-eucalyptus" /></div>}>
            <MessagesContent />
        </Suspense>
    );
}
