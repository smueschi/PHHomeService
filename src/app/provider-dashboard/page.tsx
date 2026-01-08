"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { getProviderBookings, updateBookingStatus } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { CheckCircle2, XCircle, Clock, MapPin, Phone } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ProviderDashboard() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [bookings, setBookings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null); // ID of booking being processed

    // Redirect if not provider
    useEffect(() => {
        if (!authLoading && (!user || (user.user_metadata?.role !== 'provider' && (user as any).role !== 'provider'))) {
            // Check fetching profile if needed, but for now strict redirect
            // router.push("/login?redirect=/provider-dashboard");
            // Allow for now for testing if role isn't perfectly set
        }
    }, [user, authLoading, router]);

    const fetchBookings = async () => {
        if (!user) return;
        setIsLoading(true);
        // We need the provider's profile ID. Assuming user.id is tied to it.
        const data = await getProviderBookings(user.id);
        setBookings(data || []);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchBookings();
    }, [user]);

    const handleStatusUpdate = async (bookingId: string, newStatus: 'confirmed' | 'rejected') => {
        setActionLoading(bookingId);
        try {
            await updateBookingStatus(bookingId, newStatus);
            // Refresh local state
            setBookings(prev => prev.map(b =>
                b.id === bookingId ? { ...b, status: newStatus } : b
            ));
        } catch (error) {
            console.error("Failed to update status", error);
            alert("Failed to update booking status.");
        } finally {
            setActionLoading(null);
        }
    };

    if (authLoading || !user) {
        return <div className="p-8 text-center">Loading Dashboard...</div>;
    }

    return (
        <div className="container mx-auto py-8 min-h-screen">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Provider Dashboard</h1>
                <p className="text-slate-500">Manage your appointments and schedule</p>
            </header>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Upcoming Bookings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-lg" />)}
                            </div>
                        ) : bookings.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                                <Clock className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>No bookings yet. Share your profile to get started!</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {bookings.map((booking) => (
                                    <div
                                        key={booking.id}
                                        className="border rounded-xl p-4 md:p-6 hover:shadow-md transition-shadow bg-white flex flex-col md:flex-row gap-4 justify-between"
                                    >
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                        booking.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                            'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {booking.status || 'pending'}
                                                </span>
                                                <span className="text-xs text-slate-400">Ref: {booking.id.slice(0, 8).toUpperCase()}</span>
                                            </div>

                                            <h3 className="font-bold text-lg">{booking.service_code || "Service"}</h3>

                                            <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="w-4 h-4 text-slate-400" />
                                                    {format(new Date(booking.date), 'PPP')} @ {booking.time}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin className="w-4 h-4 text-slate-400" />
                                                    {booking.customer?.address || "No Address"}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Phone className="w-4 h-4 text-slate-400" />
                                                    {booking.customer?.phone || "No Phone"}
                                                </div>
                                            </div>

                                            {booking.customer?.notes && (
                                                <div className="bg-slate-50 p-2 rounded text-sm text-slate-600 mt-2">
                                                    <span className="font-bold text-xs text-slate-400 block uppercase">Notes</span>
                                                    "{booking.customer.notes}"
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-2 min-w-[140px] justify-center border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6 mt-2 md:mt-0">
                                            <div className="text-right mb-2">
                                                <p className="text-xs text-slate-400 uppercase font-bold">Total</p>
                                                <p className="font-bold text-xl text-eucalyptus">₱{booking.financials?.total}</p>
                                            </div>

                                            {(!booking.status || booking.status === 'pending') && (
                                                <>
                                                    <Button
                                                        className="w-full bg-eucalyptus hover:bg-eucalyptus/90"
                                                        size="sm"
                                                        onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                                                        disabled={!!actionLoading}
                                                    >
                                                        {actionLoading === booking.id ? "..." : <><CheckCircle2 className="w-4 h-4 mr-2" /> Accept</>}
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        size="sm"
                                                        onClick={() => handleStatusUpdate(booking.id, 'rejected')}
                                                        disabled={!!actionLoading}
                                                    >
                                                        {actionLoading === booking.id ? "..." : <><XCircle className="w-4 h-4 mr-2" /> Reject</>}
                                                    </Button>
                                                </>
                                            )}
                                            {booking.status === 'confirmed' && (
                                                <Button variant="outline" className="w-full cursor-default" disabled>
                                                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" /> Helpful
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
