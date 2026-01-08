"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { getUserBookings } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default function ProfilePage() {
    const { user, isLoading, signOut } = useAuth();
    const router = useRouter();
    const [bookings, setBookings] = useState<any[]>([]);
    const [loadingBookings, setLoadingBookings] = useState(true);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login?redirect=/profile");
        }
    }, [user, isLoading, router]);

    useEffect(() => {
        const fetchHistory = async () => {
            if (user) {
                setLoadingBookings(true);
                const data = await getUserBookings(user.id);
                setBookings(data || []);
                setLoadingBookings(false);
            }
        };
        fetchHistory();
    }, [user]);

    if (isLoading || !user) {
        return <div className="p-8 flex justify-center">Loading Profile...</div>;
    }

    return (
        <div className="container mx-auto py-8 space-y-8 max-w-4xl">
            {/* Profile Header */}
            <div className="flex flex-col md:flex-row items-center gap-6 bg-white p-6 rounded-xl shadow-sm border">
                <Avatar className="h-24 w-24">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback className="text-xl bg-eucalyptus text-white">
                        {user.email?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-center md:text-left space-y-1">
                    <h1 className="text-2xl font-bold">{user.user_metadata?.full_name || "Valued Customer"}</h1>
                    <p className="text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Member since {new Date(user.created_at).getFullYear()}</p>
                </div>
                <Button variant="outline" onClick={signOut}>Sign Out</Button>
            </div>

            {/* Booking History */}
            <div>
                <h2 className="text-xl font-bold mb-4">Your Bookings</h2>
                <div className="space-y-4">
                    {loadingBookings ? (
                        <p>Loading your history...</p>
                    ) : bookings.length === 0 ? (
                        <Card>
                            <CardContent className="p-8 text-center text-muted-foreground">
                                No bookings found. Book your first service today!
                                <div className="mt-4">
                                    <Button onClick={() => router.push('/')}>Browse Services</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        bookings.map((booking) => (
                            <Card key={booking.id} className="overflow-hidden">
                                <CardHeader className="bg-slate-50 py-3">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-base font-semibold">
                                            {booking.service_category} - {booking.variant}
                                        </CardTitle>
                                        <span className={`text-xs px-2 py-1 rounded font-bold uppercase ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                booking.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {booking.status || 'pending'}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4 grid sm:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Date & Time</p>
                                        <p className="font-medium">{format(new Date(booking.date), 'PPP')} @ {booking.time}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Total</p>
                                        <p className="font-medium">₱{booking.financials?.total}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Location</p>
                                        <p className="font-medium truncate">{booking.customer?.address}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
