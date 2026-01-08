"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { getUserBookings } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { LayoutDashboard, User, Settings, Calendar, Star } from "lucide-react";
// Import dashboard content
import DashboardContent from "@/app/provider-dashboard/DashboardContent";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReviewModal } from "@/components/feature/Reviews/ReviewModal";

export default function ProfilePage() {
    const { user, isLoading, signOut } = useAuth();
    const router = useRouter();
    const [bookings, setBookings] = useState<any[]>([]);
    const [loadingBookings, setLoadingBookings] = useState(true);
    const [detectedRole, setDetectedRole] = useState<string | null>(null);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login?redirect=/profile");
        }
    }, [user, isLoading, router]);

    useEffect(() => {
        const fetchHistory = async () => {
            if (user) {
                // Determine Role: metadata or DB fetch
                let currentRole = user.user_metadata?.role || (user as any).role;

                // If not in metadata, fetch from DB to be sure
                if (!currentRole) {
                    try {
                        // Dynamically import to avoid cyclic deps if any, or just use api
                        const { getProviderProfile } = await import("@/lib/api");
                        const profile = await getProviderProfile(user.id);
                        if (profile && profile.role) {
                            currentRole = profile.role;
                            // Optional: Update local user object for this session if possible, or just local state
                            // (user as any).role = profile.role; 
                        }
                    } catch (e) {
                        console.error("Failed to fetch role", e);
                    }
                }

                // Force state update if needed, but for now we rely on the render check
                // We'll expose this role to the render via a state if it wasn't there before
                if (currentRole === 'provider') {
                    // We need to ensure the render sees this. 
                    // Since 'user' object reference isn't changing, let's add a local state for role
                    setDetectedRole('provider');
                }

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

    // Rough check for role, ideally should come from context or db
    const role = user.user_metadata?.role || (user as any).role;

    // Review Modal State
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedBookingForReview, setSelectedBookingForReview] = useState<any>(null);

    const handleReviewClick = (booking: any) => {
        setSelectedBookingForReview(booking);
        setReviewModalOpen(true);
    };

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

            {/* Role-Based Content */}
            <div className="grid gap-6">
                {/* PROVIDER MENU */}
                {/* PROVIDER MENU - UNIFIED DASHBOARD */}
                {(user.user_metadata?.role === 'provider' || (user as any).role === 'provider' || detectedRole === 'provider') ? (
                    <div className="w-full">
                        <Tabs defaultValue="dashboard" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-8">
                                <TabsTrigger value="dashboard" className="flex items-center gap-2"><LayoutDashboard className="w-4 h-4" /> Dashboard</TabsTrigger>
                                <TabsTrigger value="settings" className="flex items-center gap-2"><Settings className="w-4 h-4" /> Profile Settings</TabsTrigger>
                            </TabsList>

                            <TabsContent value="dashboard" className="mt-0">
                                <Card className="border-none shadow-none bg-transparent">
                                    <CardContent className="p-0">
                                        {/* Embed the Main Dashboard Content Here */}
                                        <DashboardContent />
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="settings">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Profile Settings</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <p className="text-muted-foreground">To update your profile information, services, or bio, please use the sidebar actions in the dashboard view or contact support for checking.</p>
                                        <Button variant="outline">Edit Bio & Services</Button>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                ) : (
                    /* USER MENU - Show Bookings */
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
                                                <CardTitle className="text-base font-semibold text-slate-900">
                                                    {booking.service_category || booking.service_code || "Service"}
                                                    <span className="block text-xs font-normal text-slate-500 mt-1">{booking.variant}</span>
                                                </CardTitle>
                                                <div className="flex items-center gap-2">
                                                    <Badge className={
                                                        booking.status === 'confirmed' ? "bg-green-100 text-green-700 hover:bg-green-100 border-none" :
                                                            booking.status === 'rejected' ? "bg-red-100 text-red-700 hover:bg-red-100 border-none" :
                                                                "bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-none"
                                                    }>
                                                        {booking.status === 'confirmed' ? 'Confirmed' :
                                                            booking.status === 'rejected' ? 'Cancelled' : 'Pending'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-4 grid sm:grid-cols-2 gap-4 text-sm relative">
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

                                            {/* Action Button for Confirmed Bookings */}
                                            {booking.status === 'confirmed' && (
                                                <div className="absolute top-4 right-4 hidden sm:block">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="gap-2"
                                                        onClick={() => handleReviewClick(booking)}
                                                    >
                                                        <Star className="w-3 h-3" /> Leave Review
                                                    </Button>
                                                </div>
                                            )}
                                            {booking.status === 'confirmed' && (
                                                <div className="col-span-2 pt-2 sm:hidden">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="w-full gap-2"
                                                        onClick={() => handleReviewClick(booking)}
                                                    >
                                                        <Star className="w-3 h-3" /> Leave Review
                                                    </Button>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Review Modal */}
            {selectedBookingForReview && (
                <ReviewModal
                    isOpen={reviewModalOpen}
                    onClose={() => setReviewModalOpen(false)}
                    onSuccess={() => {
                        // Optional: Refresh bookings to hide/disable button or show "Reviewed" badge
                        // For now we just close
                    }}
                    bookingId={selectedBookingForReview.id}
                    providerId={selectedBookingForReview.meta?.therapist_id}
                    providerName={selectedBookingForReview.meta?.therapist_name || "Provider"}
                />
            )}
        </div>
    );
}
