"use client";

import { useState, useRef, useEffect } from "react";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { MOCK_THERAPISTS } from "@/lib/data"; // Replaced by Real API
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock, Save, User as UserIcon, LogOut, CheckCircle2, Sparkles, ClipboardList, ChevronDown, XCircle, Star } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { SERVICE_CATEGORIES } from "@/lib/services";
import { MOCK_REQUESTS } from "@/lib/data"; // Keeping for Requests for now, or TODO replace
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import { useRouter } from "next/navigation";
import { PassCalculator } from "@/components/feature/Dashboard/PassCalculator";
import { useAuth } from "@/components/providers/AuthProvider";

import { getProviderProfile, getProviderProfileWithReviews, updateProviderSchedule, updateProviderBio, updateProviderContactDetails, updateProviderProfile, getProviderRequests, createProviderRequest, createBooking, uploadProviderDocument, getProviderBookings, updateBookingStatus, updateBookingFinancials, getProviderCredits, topUpCredits, updateBookingAndDeductCredit } from "@/lib/api";
import { Therapist } from "@/lib/data";
import { sendBookingConfirmation } from "@/lib/email";
import { ChatWindow } from "@/components/feature/Chat/ChatWindow";
import { ConversationList } from "@/components/feature/Chat/ConversationList";
import { MessageCircle } from "lucide-react";

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const generateTimeSlots = (start: string, end: string) => {
    const slots = [];
    let current = new Date(`2000-01-01T${start}`);
    const endTime = new Date(`2000-01-01T${end}`);

    while (current < endTime) {
        slots.push(current.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
        current.setMinutes(current.getMinutes() + 60); // 1 Hour intervals for blocking
    }
    return slots;
};

// Removed broken block

export default function DashboardClient() {
    const { user: authUser, isLoading, signOut } = useAuth();
    const router = useRouter();

    // Remote Data State
    const [user, setUser] = useState<Therapist | null>(null);
    const [loadingData, setLoadingData] = useState(true);

    // Form State (initialized when user loads)
    const [workingDays, setWorkingDays] = useState<string[]>([]);
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("17:00");
    const [onHoliday, setOnHoliday] = useState(false);
    const [blockedDates, setBlockedDates] = useState<string[]>([]);
    const [blockedSlots, setBlockedSlots] = useState<string[]>([]); // Granular
    const [scheduleManagementDate, setScheduleManagementDate] = useState<Date | undefined>(new Date()); // For the Dialog
    const [specialties, setSpecialties] = useState<string[]>([]);

    const [serviceRates, setServiceRates] = useState<Record<string, number>>({});
    const [contactNumber, setContactNumber] = useState("");
    const [contactPreference, setContactPreference] = useState("any");

    // UI State
    const [credits, setCredits] = useState<number>(0);
    const [isTopUpOpen, setIsTopUpOpen] = useState(false);
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
    const [offlineBooking, setOfflineBooking] = useState({ clientName: "", date: "", service: "", recurrence: "none" });
    const [isSaved, setIsSaved] = useState(false);
    const [isRequestOpen, setIsRequestOpen] = useState(false);
    const [selectedRequestCategory, setSelectedRequestCategory] = useState<string>("");
    const [selectedSubServices, setSelectedSubServices] = useState<string[]>([]);
    const [selectedExperience, setSelectedExperience] = useState<string>("");
    const [requestFile, setRequestFile] = useState<File | null>(null);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [bookings, setBookings] = useState<any[]>([]); // Remote bookings state
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [activeChatUser, setActiveChatUser] = useState<{ id: string, name: string, image?: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 1. Fetch Data
    useEffect(() => {
        if (!isLoading && !authUser) {
            router.push("/login?redirect=/provider-dashboard");
            return;
        }

        const fetchData = async () => {
            if (authUser) {
                const profile = await getProviderProfileWithReviews(authUser.id); // Updated to fetch reviews
                if (profile) {
                    setUser(profile);
                    // Initialize Form State
                    setWorkingDays(profile.schedule?.workingDays || []);
                    setStartTime(profile.schedule?.workingHours?.start || "09:00");
                    setEndTime(profile.schedule?.workingHours?.end || "17:00");
                    setOnHoliday(profile.schedule?.onHoliday || false);
                    setBlockedDates(profile.schedule?.blockedDates || []);
                    setBlockedSlots(profile.schedule?.blockedSlots || []);
                    setSpecialties(profile.specialties || []);
                    setServiceRates(profile.serviceRates || {});

                    setProfileImage(profile.image);
                    setContactNumber(profile.contactNumber || "");
                    setContactPreference(profile.contactPreference || "any");

                    // Fetch Bookings
                    const myBookings = await getProviderBookings(authUser.id);
                    setBookings(myBookings);

                    // Fetch Credits
                    const myCredits = await getProviderCredits(authUser.id);
                    setCredits(myCredits);
                }
                setLoadingData(false);
            }
        };

        fetchData();
    }, [authUser, isLoading, router]);


    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && user) {
            try {
                // Optimistic UI update (base64)
                const reader = new FileReader();
                reader.onloadend = () => {
                    setProfileImage(reader.result as string);
                };
                reader.readAsDataURL(file);

                // Upload to Storage
                // Using 'provider-documents' bucket as it's currently the only one configured with a helper
                const path = `avatars/${user.id}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;

                // Show a loading indicator concept (using alert for now)
                // alert("Uploading image..."); 

                const publicUrl = await uploadProviderDocument(file, path);

                if (publicUrl) {
                    // Update Profile in DB
                    await updateProviderProfile(user.id, { image: publicUrl });

                    // Update Local State with the real URL
                    if (user) user.image = publicUrl;
                    setProfileImage(publicUrl);
                    alert("Profile picture updated successfully!");
                }
            } catch (error) {
                console.error("Upload failed:", error);
                alert("Failed to upload image. Please try again.");
                // Revert to old image if failed?
                setProfileImage(user.image);
            }
        }
    };



    const handleLogout = async () => {
        if (signOut) { // Safe check
            await signOut();
        }
        router.push("/login");
    };

    const handleRequestSubmit = async () => {
        if (!selectedRequestCategory || !user || !selectedExperience || selectedSubServices.length === 0) return;

        try {
            await createProviderRequest({
                provider_id: user.id,
                requested_category: selectedRequestCategory,
                requested_sub_services: selectedSubServices,
                experience_years: selectedExperience
            });

            alert("Request submitted for approval!");
            setIsRequestOpen(false);
            // Reset form
            setSelectedRequestCategory("");
            setSelectedSubServices([]);
            setSelectedExperience("");
            setRequestFile(null);
        } catch (e) {
            console.error("Request failed", e);
            alert("Failed to submit request.");
        }
    };

    const handleStatusUpdate = async (bookingId: string, newStatus: 'confirmed' | 'rejected') => {
        setActionLoading(bookingId);
        try {
            if (newStatus === 'confirmed') {
                if (!authUser) {
                    alert("Authentication error. Please reload.");
                    return;
                }
                // Deduct Credit Logic
                await updateBookingAndDeductCredit(bookingId, authUser.id);
                setCredits(prev => prev - 1);
            } else {
                await updateBookingStatus(bookingId, newStatus);
            }

            // Refresh local state
            setBookings(prev => prev.map(b =>
                b.id === bookingId ? { ...b, status: newStatus } : b
            ));

            // Send Email if Confirmed
            if (newStatus === 'confirmed') {
                const booking = bookings.find(b => b.id === bookingId);
                if (booking) {
                    await sendBookingConfirmation({
                        customerName: booking.customer.name,
                        customerEmail: booking.customer.email, // Ensure this exists in your booking data
                        serviceName: booking.service_code,
                        date: booking.date,
                        time: booking.time,
                        address: booking.customer.address
                    });

                    // Trigger Google Calendar Sync (Fire and forget, or await)
                    // We don't want to block UI for sync, so no await or silent catch
                    fetch('/api/calendar/sync', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ bookingId })
                    }).catch(err => console.error("Sync Trigger Failed", err));

                    alert("Booking confirmed, email sent, and calendar sync triggered!");
                }
            } else {
                alert("Booking rejected.");
            }

        } catch (error) {
            console.error("Failed to update status", error);
            alert("Failed to update booking status.");
        } finally {
            setActionLoading(null);
        }
    };

    const handlePaymentUpdate = async (bookingId: string) => {
        const booking = bookings.find(b => b.id === bookingId);
        if (!booking) return;

        const currentFinancials = booking.financials || {};
        const newStatus = currentFinancials.payment_status === 'paid' ? 'pending' : 'paid';
        const newFinancials = { ...currentFinancials, payment_status: newStatus };

        setActionLoading(bookingId);
        try {
            await updateBookingFinancials(bookingId, newFinancials);
            // Refresh local state
            setBookings(prev => prev.map(b =>
                b.id === bookingId ? { ...b, financials: newFinancials } : b
            ));
        } catch (error) {
            console.error("Failed to update payment", error);
            alert("Failed to update payment status.");
        } finally {
            setActionLoading(null);
        }
    };



    const toggleDay = (day: string) => {
        if (workingDays.includes(day)) {
            setWorkingDays(workingDays.filter(d => d !== day));
        } else {
            setWorkingDays([...workingDays, day]);
        }
        setIsSaved(false);
    };

    const handleToggleSlot = (date: Date, time: string) => {
        // Create ISO string for the slot: YYYY-MM-DDTHH:mm
        // Date is from Calendar (local time), time is HH:mm
        // Construct naive ISO string to avoid timezone shifts for now, or match existing logic
        const dateStr = date.toLocaleDateString("en-CA"); // YYYY-MM-DD
        const slotIso = `${dateStr}T${time}`;

        if (blockedSlots.includes(slotIso)) {
            setBlockedSlots(blockedSlots.filter(s => s !== slotIso));
        } else {
            setBlockedSlots([...blockedSlots, slotIso]);
        }
        setIsSaved(false);
    };

    const handleSave = async () => {
        if (!authUser || !user) return;
        try {
            const updates = {
                bio: user.bio,
                schedule: {
                    workingDays,
                    workingHours: { start: startTime, end: endTime },
                    blockedDates,
                    blockedSlots,
                    onHoliday
                },
                rates: user.rates,
                customRates: user.customRates,
                serviceRates: serviceRates,
                specialties: specialties,
                contactNumber,
                contactPreference,
                location: user.location
            };

            await updateProviderProfile(authUser.id, updates);

            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 3000);
            alert("Changes saved successfully!");
        } catch (error) {
            console.error("Failed to save:", error);
            alert("Failed to save changes.");
        }
    };

    if (isLoading || loadingData) return <div className="p-8 text-center">Loading Dashboard...</div>;
    if (!user) return <div className="p-8 text-center">Provider Profile Not Found. Please contact support.</div>;

    return (
        <div className="min-h-screen bg-sand/10 pb-20">
            {/* Dashboard Header */}
            <header className="bg-white border-b sticky top-0 z-30">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold text-eucalyptus">PH Home Service <span className="text-black font-normal opacity-50">| Dashboard</span></h1>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Credit Display */}
                        <div className="flex items-center gap-2 bg-slate-100 rounded-full px-3 py-1 text-sm font-medium">
                            <span className={credits > 0 ? "text-eucalyptus" : "text-red-500"}>
                                {credits} Credits
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 hover:bg-transparent text-eucalyptus"
                                onClick={() => setIsTopUpOpen(true)}
                            >
                                <span className="text-lg font-bold">+</span>
                            </Button>
                        </div>

                        {/* Top Up Dialog */}
                        <Dialog open={isTopUpOpen} onOpenChange={setIsTopUpOpen}>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Top Up Credits</DialogTitle>
                                    <DialogDescription>
                                        You need 1 credit to accept a booking.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid grid-cols-2 gap-4 py-4">
                                    {[
                                        { qty: 10, price: 200, save: null },
                                        { qty: 25, price: 450, save: "10%" },
                                        { qty: 50, price: 850, save: "15%" },
                                        { qty: 100, price: 1600, save: "20%" },
                                    ].map((pack) => (
                                        <Button
                                            key={pack.qty}
                                            variant="outline"
                                            className="h-28 flex flex-col gap-1 hover:border-eucalyptus hover:bg-eucalyptus/5 relative overflow-hidden"
                                            onClick={async () => {
                                                if (!authUser) {
                                                    alert("Please log in again to top up.");
                                                    return;
                                                }
                                                // MOCK PAYMENT
                                                if (confirm(`Pay PHP ${pack.price} for ${pack.qty} credits?`)) {
                                                    try {
                                                        await topUpCredits(authUser.id, pack.qty);
                                                        setCredits(prev => prev + pack.qty);
                                                        setIsTopUpOpen(false);
                                                        alert("Payment Successful! Credits added.");
                                                    } catch (e) {
                                                        console.error("Top up failed", e);
                                                        alert("Top up failed. Please try again.");
                                                    }
                                                }
                                            }}
                                        >
                                            {pack.save && (
                                                <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-bl-lg font-bold">
                                                    SAVE {pack.save}
                                                </div>
                                            )}
                                            <span className="text-3xl font-bold text-slate-800">{pack.qty}</span>
                                            <span className="text-sm text-muted-foreground -mt-1">Credits</span>
                                            <div className="flex flex-col items-center mt-1">
                                                <Badge variant="secondary" className="bg-eucalyptus/10 text-eucalyptus hover:bg-eucalyptus/20 border-none">
                                                    ₱{pack.price}
                                                </Badge>
                                                <span className="text-[10px] text-slate-400 mt-0.5">
                                                    (₱{(pack.price / pack.qty).toFixed(2)}/ea)
                                                </span>
                                            </div>
                                        </Button>
                                    ))}
                                </div>
                            </DialogContent>
                        </Dialog>
                        <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={user.image} />
                                <AvatarFallback>{user.name[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium hidden md:inline-block">{user.name}</span>
                        </div>
                        <Button variant="ghost" size="icon" onClick={handleLogout}>
                            <LogOut className="h-5 w-5 text-muted-foreground" />
                        </Button>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Sidebar Navigation */}
                    <div className="space-y-4">
                        <Card className="p-4 rounded-2xl border-none shadow-sm bg-white">
                            <nav className="space-y-1">
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start text-muted-foreground hover:text-foreground cursor-pointer"
                                    onClick={() => document.getElementById("profile-header")?.scrollIntoView({ behavior: "smooth" })}
                                >
                                    <UserIcon className="mr-2 h-4 w-4" />
                                    Bio & Profile
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start text-muted-foreground hover:text-foreground cursor-pointer"
                                    onClick={() => document.getElementById("appointments-section")?.scrollIntoView({ behavior: "smooth" })}
                                >
                                    <Clock className="mr-2 h-4 w-4" />
                                    Upcoming Appointments
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start text-muted-foreground hover:text-foreground cursor-pointer"
                                    onClick={() => document.getElementById("schedule-section")?.scrollIntoView({ behavior: "smooth" })}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    Schedule & Hours
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start text-muted-foreground hover:text-foreground cursor-pointer"
                                    onClick={() => document.getElementById("booking-section")?.scrollIntoView({ behavior: "smooth" })}
                                >
                                    <ClipboardList className="mr-2 h-4 w-4" />
                                    Add Offline Appointment
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start text-muted-foreground hover:text-foreground cursor-pointer"
                                    onClick={() => document.getElementById("services-section")?.scrollIntoView({ behavior: "smooth" })}
                                >
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Service Menu
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start text-muted-foreground hover:text-foreground cursor-pointer"
                                    onClick={() => document.getElementById("holiday-section")?.scrollIntoView({ behavior: "smooth" })}
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Time Off
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start text-muted-foreground hover:text-foreground cursor-pointer"
                                    onClick={() => router.push('/messages')}
                                >
                                    <MessageCircle className="mr-2 h-4 w-4" />
                                    Messages
                                </Button>
                            </nav>
                        </Card>


                        <div className="p-4 bg-eucalyptus/5 rounded-2xl border border-eucalyptus/10">
                            <h3 className="font-semibold text-eucalyptus mb-2">My Public Profile</h3>
                            <p className="text-xs text-muted-foreground mb-4">See how clients view your profile page.</p>
                            <Button asChild size="sm" className="w-full bg-white text-eucalyptus border border-eucalyptus hover:bg-eucalyptus/5 shadow-sm">
                                <Link href={`/provider/${user.id}`} target="_blank">
                                    View Profile
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="md:col-span-2 space-y-6">


                        {/* KEY METRICS & CREDITS */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Card className="p-6 rounded-3xl border-none shadow-sm bg-white relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Sparkles className="w-24 h-24 text-eucalyptus" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-1">Credit Balance</p>
                                    <div className="flex items-baseline gap-2">
                                        <h3 className="text-4xl font-black text-eucalyptus">{credits}</h3>
                                        <span className="text-sm font-medium text-slate-400">credits</span>
                                    </div>
                                    <Button
                                        onClick={() => setIsTopUpOpen(true)}
                                        className="mt-4 bg-eucalyptus text-white hover:bg-eucalyptus/90 shadow-eucalyptus/20 shadow-lg rounded-xl h-10 px-6"
                                    >
                                        + Top Up
                                    </Button>
                                </div>
                            </Card>

                            <Card className="p-6 rounded-3xl border-none shadow-sm bg-white">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-1">Active Bookings</p>
                                    <h3 className="text-4xl font-black text-slate-800">
                                        {bookings.filter(b => b.status === 'confirmed').length}
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-2">
                                        {bookings.filter(b => b.status === 'pending').length} pending requests
                                    </p>
                                </div>
                            </Card>
                        </div>

                        <div id="profile-header" className="flex items-center justify-between pt-4">
                            <h2 className="text-2xl font-bold text-foreground">Profile & Schedule</h2>
                            {isSaved && (
                                <span className="flex items-center gap-1 text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full animate-in fade-in slide-in-from-right-4">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Saved
                                </span>
                            )}
                        </div>

                        {/* PROFILE BIO CARD */}
                        <Card className="p-6 md:p-8 rounded-3xl border-none shadow-lg bg-white">
                            <div className="flex items-center gap-2 mb-4 text-foreground">
                                <UserIcon className="h-5 w-5 text-eucalyptus" />
                                <h3 className="font-semibold text-lg">About Me</h3>
                            </div>
                            <div className="space-y-6">
                                {/* Profile Image Upload */}
                                <div className="flex items-center gap-6">
                                    <div className="relative group">
                                        <Avatar className="h-24 w-24 border-4 border-slate-50 shadow-sm">
                                            <AvatarImage src={profileImage || user.image} className="object-cover" />
                                            <AvatarFallback className="text-2xl bg-slate-100">{user.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute bottom-0 right-0 bg-eucalyptus text-white p-2 rounded-full shadow-lg hover:bg-eucalyptus/90 transition-all"
                                        >
                                            <Camera className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-medium text-slate-900">Profile Picture</h4>
                                        <p className="text-xs text-muted-foreground mb-2">
                                            Upload a clear, professional photo.<br />
                                            JPG, PNG or GIF. Max 5MB.
                                        </p>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
                                                Upload New
                                            </Button>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Your Bio (Visible to Customers)</Label>
                                    <textarea
                                        className="flex min-h-[120px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Share your experience, style, or what makes your service special..."
                                        defaultValue={user.bio}
                                        onChange={(e) => {
                                            user.bio = e.target.value;
                                            setIsSaved(false);
                                        }}
                                    />
                                    <p className="text-xs text-muted-foreground">Type a short introduction that will appear on your profile page.</p>
                                </div>
                                <div className="flex justify-end">
                                    <Button onClick={handleSave} variant="secondary">Update Bio</Button>
                                </div>
                            </div>
                        </Card>



                        <Card className="p-6 md:p-8 rounded-3xl border-none shadow-lg bg-white mb-6">
                            <h3 className="font-semibold text-lg mb-4 text-foreground flex items-center gap-2">
                                <span className="text-xl">📱</span> Contact Details
                            </h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Contact Number</Label>
                                    <Input
                                        placeholder="e.g. 0917 123 4567"
                                        value={contactNumber}
                                        onChange={(e) => { setContactNumber(e.target.value); setIsSaved(false); }}
                                    />
                                    <p className="text-xs text-muted-foreground">This number will be displayed to clients based on your preference below.</p>
                                </div>
                                <div className="space-y-2">
                                    <Label>Preferred Contact Method</Label>
                                    <RadioGroup
                                        className="flex flex-col space-y-1"
                                        value={contactPreference}
                                        onValueChange={(val) => { setContactPreference(val); setIsSaved(false); }}
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="whatsapp" id="pref-whatsapp" />
                                            <Label htmlFor="pref-whatsapp" className="font-normal cursor-pointer">WhatsApp Only (Recommended)</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="sms" id="pref-sms" />
                                            <Label htmlFor="pref-sms" className="font-normal cursor-pointer">SMS Only</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="any" id="pref-any" />
                                            <Label htmlFor="pref-any" className="font-normal cursor-pointer">Both WhatsApp & SMS</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                                <div className="flex justify-end pt-2">
                                    <Button onClick={handleSave} variant="secondary">Update Contact Info</Button>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6 md:p-8 rounded-3xl border-none shadow-lg bg-white">

                            {/* UPCOMING APPOINTMENTS SECTION */}
                            <div id="appointments-section" className="mb-0 border-b pb-8 scroll-mt-24">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-2 text-foreground">
                                        <CalendarIcon className="h-5 w-5 text-eucalyptus" />
                                        <h3 className="font-semibold text-lg">Upcoming Appointments</h3>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            // 1. Define Event Data
                                            const events = [
                                                {
                                                    title: "Massage: Anna B.",
                                                    start: "2024-01-20T14:00:00",
                                                    end: "2024-01-20T15:00:00",
                                                    desc: "Swedish Massage @ General Luna"
                                                },
                                                {
                                                    title: "Nails: Sarah M.",
                                                    start: "2024-01-21T10:00:00",
                                                    end: "2024-01-21T11:30:00",
                                                    desc: "Gel Manicure + Pedicure"
                                                }
                                            ];

                                            // 2. Generate ICS Content
                                            let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//PH Home Service//NONSGML v1.0//EN\n";

                                            events.forEach(event => {
                                                icsContent += "BEGIN:VEVENT\n";
                                                icsContent += `DTSTART:${event.start.replace(/[-:]/g, "")}\n`;
                                                icsContent += `DTEND:${event.end.replace(/[-:]/g, "")}\n`;
                                                icsContent += `SUMMARY:${event.title}\n`;
                                                icsContent += `DESCRIPTION:${event.desc}\n`;
                                                icsContent += "END:VEVENT\n";
                                            });

                                            icsContent += "END:VCALENDAR";

                                            // 3. Trigger Download
                                            const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
                                            const link = document.createElement("a");
                                            link.href = window.URL.createObjectURL(blob);
                                            link.setAttribute("download", "my_schedule.ics");
                                            document.body.appendChild(link);
                                            link.click();
                                            document.body.removeChild(link);
                                        }}
                                        className="gap-2 text-eucalyptus border-eucalyptus/20 hover:bg-eucalyptus/5"
                                    >
                                        <Clock className="w-4 h-4" />
                                        Sync Calendar (.ics)
                                    </Button>
                                </div>

                                <div className="space-y-3">
                                    {/* APPOINTMENT LIST */}
                                    {bookings.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground border rounded-xl border-dashed">
                                            <p>No upcoming appointments found.</p>
                                        </div>
                                    ) : (
                                        bookings.map(booking => {
                                            const dateObj = new Date(booking.date);
                                            const day = dateObj.getDate();
                                            const month = dateObj.toLocaleString('default', { month: 'short' });

                                            // Extract Customer Info from JSONB
                                            const customer = booking.customer || {};
                                            const clientName = customer.name || "Unknown Client";
                                            // Fallback for ID: user_id from root, or email, or a static ID for demo
                                            const clientId = (booking as any).user_id || customer.email || "2f913691-e490-449e-862d-a41757827ff3";
                                            const clientPhone = customer.phone || "";

                                            // Extract Meta/Variant
                                            const title = booking.variant || booking.service_code || "Appointment";
                                            const notes = booking.inputs?.notes || booking.meta?.notes || "No notes provided.";

                                            const expandId = `apt-${booking.id}`;
                                            const isExpanded = expandedCategory === expandId;

                                            return (
                                                <div key={booking.id} className={cn("p-4 bg-slate-50 rounded-xl border border-slate-100 transition-all", isExpanded ? "ring-1 ring-eucalyptus border-eucalyptus/50 bg-eucalyptus/5" : "hover:border-eucalyptus/30")}>
                                                    <div
                                                        className="flex items-center gap-4 cursor-pointer"
                                                        onClick={() => setExpandedCategory(isExpanded ? null : expandId)}
                                                    >
                                                        <div className="flex flex-col items-center justify-center w-16 h-16 bg-white rounded-lg border shadow-sm">
                                                            <span className="text-xs font-bold text-eucalyptus uppercase">{month}</span>
                                                            <span className="text-xl font-bold text-slate-700">{day}</span>
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="font-semibold text-foreground">{title}</h4>
                                                            <p className="text-sm text-muted-foreground">Client: {clientName} • {booking.time}</p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide", booking.status === "confirmed" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700")}>
                                                                    {booking.status}
                                                                </span>
                                                                <span className="text-xs text-slate-400">|</span>
                                                                <span className="text-xs text-slate-500">{customer.address || "Location not set"}</span>
                                                            </div>
                                                        </div>
                                                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-eucalyptus">
                                                            <ChevronDown className={cn("w-4 h-4 transition-transform", isExpanded ? "rotate-180" : "")} />
                                                        </Button>
                                                    </div>

                                                    <div className="mt-4 pt-4 border-t border-slate-200/60 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                                                        <div className="space-y-1">
                                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Contact Info</p>
                                                            <p className="text-sm font-medium flex items-center gap-2">
                                                                <span>📞</span>
                                                                <a href={`tel:${clientPhone}`} className="hover:text-eucalyptus hover:underline">{clientPhone || "N/A"}</a>
                                                            </p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Client Notes</p>
                                                            <p className="text-sm italic text-slate-600">"{notes}"</p>
                                                        </div>
                                                        <div className="sm:col-span-2 flex justify-end gap-2 mt-2">
                                                            {(!booking.status || booking.status === 'pending') && (
                                                                <>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                        onClick={() => handleStatusUpdate(booking.id, 'rejected')}
                                                                        disabled={!!actionLoading}
                                                                    >
                                                                        {actionLoading === booking.id ? "..." : <><XCircle className="w-3 h-3 mr-1" /> Reject</>}
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        className="h-8 text-xs bg-eucalyptus hover:bg-eucalyptus/90"
                                                                        onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                                                                        disabled={!!actionLoading}
                                                                    >
                                                                        {actionLoading === booking.id ? "..." : <><CheckCircle2 className="w-3 h-3 mr-1" /> Accept</>}
                                                                    </Button>
                                                                </>
                                                            )}
                                                            {/* Payment Status Toggle */}
                                                            {booking.status === 'confirmed' && (
                                                                <Button
                                                                    size="sm"
                                                                    variant={booking.financials?.payment_status === 'paid' ? "secondary" : "outline"}
                                                                    className={cn("h-8 text-xs", booking.financials?.payment_status === 'paid' ? "bg-green-100 text-green-700 hover:bg-green-200" : "text-slate-500")}
                                                                    onClick={() => handlePaymentUpdate(booking.id)}
                                                                >
                                                                    {booking.financials?.payment_status === 'paid' ? "Paid ✅" : "Mark Paid"}
                                                                </Button>
                                                            )}
                                                            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => alert("Rescheduling feature coming soon!")}>Reschedule</Button>
                                                            <Button
                                                                size="sm"
                                                                className="h-8 text-xs bg-eucalyptus/10 text-eucalyptus hover:bg-eucalyptus/20 border border-eucalyptus/20"
                                                                onClick={() => setActiveChatUser({ id: clientId, name: clientName })}
                                                            >
                                                                <MessageCircle className="w-3 h-3 mr-1" />
                                                                Chat
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                <p className="text-center text-xs text-muted-foreground pt-2">
                                    Showing next 3 appointments.
                                    <Button variant="link" className="h-auto p-0 ml-1 text-eucalyptus font-medium hover:underline" onClick={() => alert("This would load the full calendar view in a real app.")}>
                                        View All
                                    </Button>
                                </p>
                            </div>

                            {/* RECENT REVIEWS */}
                            <Card className="p-6 md:p-8 rounded-3xl border-none shadow-lg bg-white mb-6">
                                <div className="flex items-center gap-2 mb-4 text-foreground">
                                    <Star className="h-5 w-5 text-eucalyptus" />
                                    <h3 className="font-semibold text-lg">Client Reviews</h3>
                                </div>
                                <div className="space-y-4">
                                    {(!user?.reviews || user.reviews.length === 0) ? (
                                        <p className="text-sm text-muted-foreground italic">No reviews yet. Ask your clients to leave feedback!</p>
                                    ) : (
                                        user.reviews.map((review: any, i: number) => (
                                            <div key={i} className="border-b pb-4 last:border-0 last:pb-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="font-semibold text-sm">{review.author || "Anonymous"}</span>
                                                    <span className="text-xs text-muted-foreground">{review.date}</span>
                                                </div>
                                                <div className="flex text-yellow-400 mb-1">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <Star key={i} className={cn("w-3 h-3 fill-current", i < review.rating ? "text-yellow-400" : "text-gray-200")} />
                                                    ))}
                                                </div>
                                                <p className="text-sm text-slate-600">"{review.comment}"</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </Card>

                            {/* Working Days */}
                            <div id="schedule-section" className="mb-8 scroll-mt-24">
                                <div className="flex items-center gap-2 mb-4 text-foreground">
                                    <CalendarIcon className="h-5 w-5 text-eucalyptus" />
                                    <h3 className="font-semibold text-lg">Working Days</h3>
                                </div>
                                <p className="text-sm text-muted-foreground mb-4">Select the days you are available to accept bookings.</p>

                                <div className="flex flex-wrap gap-3">
                                    {DAYS_OF_WEEK.map((day) => {
                                        const isSelected = workingDays.includes(day);
                                        return (
                                            <button
                                                key={day}
                                                onClick={() => toggleDay(day)}
                                                className={cn(
                                                    "w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold transition-all border-2",
                                                    isSelected
                                                        ? "bg-eucalyptus text-white border-eucalyptus shadow-md scale-105"
                                                        : "bg-slate-50 text-muted-foreground border-slate-200 hover:border-eucalyptus/50"
                                                )}
                                            >
                                                {day}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Working Hours */}
                            <div className="mb-8">
                                <div className="flex items-center gap-2 mb-4 text-foreground">
                                    <Clock className="h-5 w-5 text-eucalyptus" />
                                    <h3 className="font-semibold text-lg">Daily Hours</h3>
                                </div>
                                <p className="text-sm text-muted-foreground mb-4">Set your earliest start time and latest end time.</p>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Start Time</Label>
                                        <Select value={startTime} onValueChange={(val) => { setStartTime(val); setIsSaved(false); }}>
                                            <SelectTrigger className="h-12 text-lg">
                                                <SelectValue placeholder="Select start time" />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-[200px]">
                                                {Array.from({ length: 48 }).map((_, i) => {
                                                    const h = Math.floor(i / 2).toString().padStart(2, '0');
                                                    const m = ((i % 2) * 30).toString().padStart(2, '0');
                                                    const time = `${h}:${m}`;
                                                    const label = new Date(`2000-01-01T${time}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
                                                    return (
                                                        <SelectItem key={time} value={time}>
                                                            {label}
                                                        </SelectItem>
                                                    );
                                                })}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>End Time</Label>
                                        <Select value={endTime} onValueChange={(val) => { setEndTime(val); setIsSaved(false); }}>
                                            <SelectTrigger className="h-12 text-lg">
                                                <SelectValue placeholder="Select end time" />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-[200px]">
                                                {Array.from({ length: 48 }).map((_, i) => {
                                                    const h = Math.floor(i / 2).toString().padStart(2, '0');
                                                    const m = ((i % 2) * 30).toString().padStart(2, '0');
                                                    const time = `${h}:${m}`;
                                                    const label = new Date(`2000-01-01T${time}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
                                                    return (
                                                        <SelectItem key={time} value={time}>
                                                            {label}
                                                        </SelectItem>
                                                    );
                                                })}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            {/* Granular Blocking Dialog */}
                            <div className="mb-8">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" className="w-full md:w-auto border-eucalyptus text-eucalyptus hover:bg-eucalyptus/5">
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            Manage Specific Time Slots (Exceptions)
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                                        <DialogHeader>
                                            <DialogTitle>Manage Schedule Exceptions</DialogTitle>
                                            <DialogDescription>
                                                Block specific time slots for dates where you are partially available.
                                                Red = Blocked, Green = Available.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                                            <div>
                                                <Label className="mb-2 block">Select Date</Label>
                                                <Calendar
                                                    mode="single"
                                                    selected={scheduleManagementDate}
                                                    onSelect={setScheduleManagementDate}
                                                    className="rounded-md border"
                                                />
                                            </div>
                                            <div>
                                                <Label className="mb-2 block">
                                                    {scheduleManagementDate ? scheduleManagementDate.toDateString() : "Select a date"} - Time Slots
                                                </Label>

                                                {scheduleManagementDate && (
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {generateTimeSlots(startTime, endTime).map(time => {
                                                            const dateStr = scheduleManagementDate.toLocaleDateString("en-CA");
                                                            const slotIso = `${dateStr}T${time}`;
                                                            const isBlocked = blockedSlots.includes(slotIso);

                                                            return (
                                                                <Button
                                                                    key={time}
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className={cn(
                                                                        "text-xs transition-colors",
                                                                        isBlocked
                                                                            ? "bg-red-100 text-red-700 border-red-200 hover:bg-red-200"
                                                                            : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                                                    )}
                                                                    onClick={() => handleToggleSlot(scheduleManagementDate, time)}
                                                                >
                                                                    {time}
                                                                    {isBlocked ? " (Blocked)" : ""}
                                                                </Button>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                                {!scheduleManagementDate && <p className="text-sm text-muted-foreground">Please select a date from the calendar.</p>}
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button onClick={handleSave} type="submit">Save Changes</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>

                            {/* PASSES & SUBSCRIPTIONS */}
                            <div id="passes-section" className="mb-8 pt-6 border-t scroll-mt-24">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2 text-foreground">
                                        <Sparkles className="h-5 w-5 text-eucalyptus" />
                                        <h3 className="font-semibold text-lg">Passes & Subscriptions</h3>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="enable-passes"
                                            checked={user.rates.enablePasses !== false} // Default to true if undefined
                                            onCheckedChange={(checked) => {
                                                user.rates.enablePasses = checked;
                                                // trigger re-render
                                                setUser({ ...user });
                                                setIsSaved(false);
                                            }}
                                        />
                                        <Label htmlFor="enable-passes">Enable</Label>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground mb-4">Offer bulk packages to increase client retention.</p>

                                {user.rates.enablePasses !== false && (
                                    <Card className="p-6 rounded-3xl border-none shadow-sm bg-slate-50 border border-slate-100 animate-in fade-in slide-in-from-top-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <PassCalculator
                                                label="Weekly Pass (7 Days)"
                                                baseHourlyRate={user.price}
                                                initialTotal={user.rates.weekly_pass || Math.round(user.price * (user.rates.weekly_sessions || 4) * 0.85)}
                                                initialSessions={user.rates.weekly_sessions || 4}
                                                recommendedSessions={4}
                                                onUpdate={(total, sessions) => {
                                                    user.rates.weekly_pass = total;
                                                    user.rates.weekly_sessions = sessions;
                                                    setIsSaved(false);
                                                }}
                                            />
                                            <PassCalculator
                                                label="Monthly Pass (30 Days)"
                                                baseHourlyRate={user.price}
                                                initialTotal={user.rates.monthly_pass}
                                                initialSessions={user.rates.monthly_sessions || 12}
                                                recommendedSessions={12}
                                                onUpdate={(total, sessions) => {
                                                    user.rates.monthly_pass = total;
                                                    user.rates.monthly_sessions = sessions;
                                                    setIsSaved(false);
                                                }}
                                            />

                                            <div className="col-span-1 md:col-span-2 flex justify-end pt-2">
                                                <Button onClick={handleSave} size="sm">Update Passes</Button>
                                            </div>
                                        </div>
                                    </Card>
                                )}
                            </div>






                            {/* Manual Booking Tool */}
                            <div id="booking-section" className="mb-8 pt-6 border-t scroll-mt-24">
                                <div className="flex items-center gap-2 mb-4 text-foreground">
                                    <Clock className="h-5 w-5 text-eucalyptus" />
                                    <h3 className="font-semibold text-lg">Add Offline Appointment</h3>
                                </div>
                                <p className="text-sm text-muted-foreground mb-4">Log an appointment from outside the app (e.g. WhatsApp, Walk-in) to block your calendar.</p>

                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Client Name</Label>
                                            <Input
                                                placeholder="Client Name"
                                                className="bg-white"
                                                value={offlineBooking.clientName}
                                                onChange={(e) => setOfflineBooking({ ...offlineBooking, clientName: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Date</Label>
                                            <Input
                                                type="date"
                                                className="bg-white"
                                                value={offlineBooking.date}
                                                onChange={(e) => setOfflineBooking({ ...offlineBooking, date: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Service</Label>
                                            <Input
                                                placeholder="e.g. Whole Body Massage"
                                                className="bg-white"
                                                value={offlineBooking.service}
                                                onChange={(e) => setOfflineBooking({ ...offlineBooking, service: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Recurrence</Label>
                                            <Select
                                                value={offlineBooking.recurrence}
                                                onValueChange={(val) => setOfflineBooking({ ...offlineBooking, recurrence: val })}
                                            >
                                                <SelectTrigger className="bg-white">
                                                    <SelectValue placeholder="Select recurrence" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">One-time only</SelectItem>
                                                    <SelectItem value="weekly">Weekly (4 weeks)</SelectItem>
                                                    <SelectItem value="monthly">Monthly (3 months)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <Button
                                            variant="secondary"
                                            className="bg-white border hover:bg-slate-100"
                                            disabled={!offlineBooking.clientName || !offlineBooking.date}
                                            onClick={async () => {
                                                if (!authUser || !user) return;

                                                try {
                                                    // 1. Prepare Booking Payload
                                                    // We'll create separate bookings for recurrence
                                                    const bookingsToCreate = [];
                                                    const startDate = new Date(offlineBooking.date);

                                                    // Initial Booking
                                                    bookingsToCreate.push({
                                                        date: offlineBooking.date,
                                                        time: "12:00", // Default time or add time input
                                                        service_code: "offline_booking",
                                                        variant: offlineBooking.service,
                                                        payment_method: "OFFLINE",
                                                        financials: { total: 0, notes: "Offline Booking" },
                                                        customer: { name: offlineBooking.clientName, phone: "N/A" },
                                                        meta: {
                                                            therapist_id: user.id,
                                                            source: "offline_log",
                                                            recurrence: offlineBooking.recurrence
                                                        },
                                                        status: "confirmed" // Auto-confirm for provider-created
                                                    });

                                                    // Recurrence Logic
                                                    if (offlineBooking.recurrence === "weekly") {
                                                        for (let i = 1; i < 4; i++) {
                                                            const nextDate = new Date(startDate);
                                                            nextDate.setDate(startDate.getDate() + (i * 7));
                                                            bookingsToCreate.push({
                                                                ...bookingsToCreate[0],
                                                                date: nextDate.toISOString().split("T")[0],
                                                                meta: { ...bookingsToCreate[0].meta, recurrence_index: i }
                                                            });
                                                        }
                                                    } else if (offlineBooking.recurrence === "monthly") {
                                                        for (let i = 1; i < 3; i++) {
                                                            const nextDate = new Date(startDate);
                                                            nextDate.setMonth(startDate.getMonth() + i);
                                                            bookingsToCreate.push({
                                                                ...bookingsToCreate[0],
                                                                date: nextDate.toISOString().split("T")[0],
                                                                meta: { ...bookingsToCreate[0].meta, recurrence_index: i }
                                                            });
                                                        }
                                                    }

                                                    // 2. Send to API (Parrallel or Sequential)
                                                    // For now, simple sequential loop or Promise.all
                                                    await Promise.all(bookingsToCreate.map(b => createBooking(b)));

                                                    alert(`Successfully created ${bookingsToCreate.length} appointment(s)!`);

                                                    // Reset
                                                    setOfflineBooking({ clientName: "", date: "", service: "", recurrence: "none" });

                                                } catch (e) {
                                                    console.error("Offline booking failed", e);
                                                    alert("Failed to create offline appointment.");
                                                }
                                            }}
                                        >
                                            Add Appointment
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Service Pricing & Availability Menu */}
                            <div id="services-section" className="mb-8 pt-6 border-t scroll-mt-24">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2 text-foreground">
                                        <Sparkles className="h-5 w-5 text-eucalyptus" />
                                        <h3 className="font-semibold text-lg">My Service Menu</h3>
                                    </div>
                                    <Dialog open={isRequestOpen} onOpenChange={setIsRequestOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm" className="gap-2 text-eucalyptus border-eucalyptus/20 hover:bg-eucalyptus/5">
                                                Request New Service
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Request New Service Category</DialogTitle>
                                                <DialogDescription>
                                                    Expand your offerings by requesting to add services from another category.
                                                    Admin approval is required.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="py-4 space-y-6">
                                                <div className="space-y-2">
                                                    <Label className="font-semibold">Select Category</Label>
                                                    <Select value={selectedRequestCategory} onValueChange={(val) => {
                                                        setSelectedRequestCategory(val);
                                                        setSelectedSubServices([]); // Reset sub-services when category changes
                                                    }}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a category..." />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {SERVICE_CATEGORIES
                                                                .filter(cat => cat.id !== user.category) // Exclude current
                                                                .map(cat => (
                                                                    <SelectItem key={cat.id} value={cat.id}>
                                                                        {cat.title}
                                                                    </SelectItem>
                                                                ))
                                                            }
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                {/* Sub-services Checklist */}
                                                {selectedRequestCategory && (
                                                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                                        <Label className="font-semibold">Which services do you offer?</Label>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[200px] overflow-y-auto p-1">
                                                            {SERVICE_CATEGORIES.find(c => c.id === selectedRequestCategory)?.subServices.map(service => (
                                                                <div key={service.id} className="flex items-center space-x-2 border p-2 rounded-lg hover:bg-slate-50 transition-colors">
                                                                    <Checkbox
                                                                        id={`req-${service.id}`}
                                                                        checked={selectedSubServices.includes(service.id)}
                                                                        onCheckedChange={(checked: boolean | string) => {
                                                                            if (checked === true) {
                                                                                setSelectedSubServices([...selectedSubServices, service.id]);
                                                                            } else {
                                                                                setSelectedSubServices(selectedSubServices.filter(id => id !== service.id));
                                                                            }
                                                                        }}
                                                                    />
                                                                    <label
                                                                        htmlFor={`req-${service.id}`}
                                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer w-full"
                                                                    >
                                                                        {service.title}
                                                                    </label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <p className="text-xs text-muted-foreground pt-1">Select all that apply.</p>
                                                    </div>
                                                )}

                                                {/* Experience Dropdown */}
                                                {selectedRequestCategory && (
                                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-4">
                                                        <Label className="font-semibold">Experience Level</Label>
                                                        <Select value={selectedExperience} onValueChange={setSelectedExperience}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="How long have you been doing this?" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="<1 Year">Less than 1 Year</SelectItem>
                                                                <SelectItem value="1-3 Years">1 - 3 Years</SelectItem>
                                                                <SelectItem value="3-5 Years">3 - 5 Years</SelectItem>
                                                                <SelectItem value="5+ Years">5+ Years</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                )}

                                                {/* Optional Document Upload */}
                                                {selectedRequestCategory && (
                                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-4">
                                                        <Label className="font-semibold">Certifications / Portfolio (Optional)</Label>
                                                        <Input
                                                            type="file"
                                                            accept=".pdf,.jpg,.png"
                                                            onChange={(e) => setRequestFile(e.target.files?.[0] || null)}
                                                            className="cursor-pointer bg-slate-50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-eucalyptus/10 file:text-eucalyptus hover:file:bg-eucalyptus/20"
                                                        />
                                                        <p className="text-[10px] text-muted-foreground">Upload any relevant certificates or photos of your work.</p>
                                                    </div>
                                                )}

                                            </div>
                                            <DialogFooter>
                                                <Button variant="outline" onClick={() => setIsRequestOpen(false)}>Cancel</Button>
                                                <Button
                                                    onClick={handleRequestSubmit}
                                                    disabled={!selectedRequestCategory || !selectedExperience || selectedSubServices.length === 0}
                                                    className="bg-eucalyptus text-white"
                                                >
                                                    Submit Request
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                                <p className="text-sm text-muted-foreground mb-6">
                                    Toggle the services you offer and set custom prices.
                                    <br />
                                    <span className="text-xs italic opacity-70">Leave price blank to use your default hourly rate (₱{user.price}).</span>
                                </p>

                                {/* Filter Chips Removed: Single Category View Enforced */}

                                <div className="space-y-4">
                                    {SERVICE_CATEGORIES
                                        .filter(cat => cat.id === user.category || user.tags.includes(cat.id)) // Show primary OR approved categories
                                        .map(category => {
                                            // Filter Logic: If a specific category is "filtered" (via expandedCategory used as filter), show it. 
                                            // OR if "All" is selected (expandedCategory null), show all but collapsed.
                                            // Wait, the logic for 'expandedCategory' was 'toggle open'. 
                                            // Let's repurpose it: If clicked filter, that one stays Open. If 'All', all closed?
                                            // Let's keep the accordion behavior but use chips to jump-open one.

                                            const isExpanded = expandedCategory === category.id;

                                            return (
                                                <div
                                                    key={category.id}
                                                    className={cn(
                                                        "bg-white border rounded-2xl overflow-hidden shadow-sm transition-all duration-300",
                                                        isExpanded ? "ring-1 ring-eucalyptus/50 shadow-md" : "hover:shadow-md"
                                                    )}
                                                >
                                                    {/* Header / Main Menu Toggle */}
                                                    <div
                                                        className={`px-4 py-4 flex items-center justify-between cursor-pointer active:scale-[0.99] transition-transform ${isExpanded ? "bg-slate-50/50" : "bg-white"}`}
                                                        onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={cn("p-2 rounded-xl bg-white shadow-sm border", isExpanded ? "border-eucalyptus/20" : "border-slate-100")}>
                                                                <category.icon className={`h-5 w-5 ${category.color.split(" ")[1]}`} />
                                                            </div>
                                                            <div>
                                                                <h4 className={`font-bold text-base uppercase tracking-wider text-slate-700`}>
                                                                    {category.title}
                                                                </h4>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xs text-muted-foreground font-medium opacity-80">
                                                                        {category.subServices.length} Services
                                                                    </span>
                                                                    {isExpanded && <span className="text-[10px] text-eucalyptus bg-eucalyptus/10 px-2 py-0.5 rounded-full font-bold">Active</span>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <Button variant="ghost" size="sm" className={`h-8 w-8 p-0 rounded-full bg-slate-100 hover:bg-slate-200`}>
                                                            <ChevronDown className={cn("h-5 w-5 text-slate-500 transition-transform duration-300", isExpanded ? "rotate-180" : "")} />
                                                        </Button>
                                                    </div>

                                                    {/* Expandable Content */}
                                                    <div className={cn(
                                                        "grid transition-all duration-300 ease-in-out",
                                                        isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                                                    )}>
                                                        <div className="overflow-hidden">
                                                            <div className="divide-y border-t border-slate-100 bg-slate-50/30">
                                                                {category.subServices.map(service => {
                                                                    const isActive = specialties.includes(service.title) || specialties.includes(service.id);
                                                                    const customPrice = serviceRates[service.id];

                                                                    return (
                                                                        <div key={service.id} className={cn("p-4 flex flex-col sm:flex-row sm:items-center gap-4 transition-colors hover:bg-white", isActive ? "bg-white" : "bg-slate-50/50 opacity-80 hover:opacity-100")}>
                                                                            {/* Toggle & Name */}
                                                                            <div className="flex items-start gap-4 flex-1">
                                                                                <Switch
                                                                                    checked={isActive}
                                                                                    onCheckedChange={(checked) => {
                                                                                        // Update Specialties Logic
                                                                                        let updated = [...specialties];
                                                                                        if (checked) {
                                                                                            if (!updated.includes(service.title)) updated.push(service.title);
                                                                                        } else {
                                                                                            updated = updated.filter(s => s !== service.title && s !== service.id);
                                                                                        }
                                                                                        setSpecialties(updated);
                                                                                        setIsSaved(false);
                                                                                    }}
                                                                                    className="mt-1 data-[state=checked]:bg-eucalyptus"
                                                                                />
                                                                                <div>
                                                                                    <Label className={cn("text-base cursor-pointer block mb-1", isActive ? "font-bold text-slate-800" : "font-medium text-slate-500")}>
                                                                                        {service.title}
                                                                                    </Label>
                                                                                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed max-w-sm">{service.description}</p>
                                                                                </div>
                                                                            </div>

                                                                            {/* Price Input */}
                                                                            <div className={cn("flex items-center gap-2 w-full sm:w-auto transition-opacity", isActive ? "opacity-100" : "opacity-40 pointer-events-none")}>
                                                                                <Label className="text-xs text-muted-foreground whitespace-nowrap sm:hidden">Custom Rate:</Label>
                                                                                <div className="relative w-full sm:w-32">
                                                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₱</span>
                                                                                    <Input
                                                                                        type="number"
                                                                                        placeholder={user.price.toString()}
                                                                                        className="pl-7 h-10 bg-white border-slate-200 focus-visible:ring-eucalyptus"
                                                                                        defaultValue={customPrice || ""}
                                                                                        onChange={(e) => {
                                                                                            const val = e.target.value ? parseInt(e.target.value) : undefined;
                                                                                            const newRates = { ...serviceRates };
                                                                                            if (val) newRates[service.id] = val;
                                                                                            else delete newRates[service.id];
                                                                                            setServiceRates(newRates);
                                                                                            setIsSaved(false);
                                                                                        }}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                            {/* Custom Category Pricing */}
                                                            {(category.id === "NANNY" || category.id === "CHEF" || category.id === "CLEANING" || category.id === "AIRCON" || category.id === "BEAUTY") && (
                                                                <div className="mt-4 pt-4 border-t border-slate-100 bg-white/50 p-4 rounded-xl">
                                                                    <div className="flex items-center gap-2 mb-3">
                                                                        <Sparkles className="h-4 w-4 text-eucalyptus" />
                                                                        <h4 className="text-sm font-semibold text-slate-700">Service Variables</h4>
                                                                    </div>
                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                        {category.id === "NANNY" && (
                                                                            <>
                                                                                <div className="space-y-1">
                                                                                    <Label className="text-xs">Extra Child (₱/hr)</Label>
                                                                                    <Input type="number" className="h-9 bg-white" placeholder="100" defaultValue={user.customRates?.perExtraChild || 100} onChange={(e) => { if (!user.customRates) user.customRates = {}; user.customRates.perExtraChild = parseInt(e.target.value); setIsSaved(false); }} />
                                                                                </div>
                                                                                <div className="space-y-1">
                                                                                    <Label className="text-xs">Infant Surcharge (₱/hr)</Label>
                                                                                    <Input type="number" className="h-9 bg-white" placeholder="50" defaultValue={user.customRates?.perInfant || 0} onChange={(e) => { if (!user.customRates) user.customRates = {}; user.customRates.perInfant = parseInt(e.target.value); setIsSaved(false); }} />
                                                                                </div>
                                                                            </>
                                                                        )}
                                                                        {category.id === "CHEF" && (
                                                                            <>
                                                                                <div className="space-y-1">
                                                                                    <Label className="text-xs">Labor Only (₱/head)</Label>
                                                                                    <Input type="number" className="h-9 bg-white" placeholder="500" defaultValue={user.customRates?.chef_labor_only || 500} onChange={(e) => { if (!user.customRates) user.customRates = {}; user.customRates.chef_labor_only = parseInt(e.target.value); setIsSaved(false); }} />
                                                                                </div>
                                                                                <div className="space-y-1">
                                                                                    <Label className="text-xs">All-Inclusive (₱/head)</Label>
                                                                                    <Input type="number" className="h-9 bg-white" placeholder="1200" defaultValue={user.customRates?.chef_with_groceries || 1200} onChange={(e) => { if (!user.customRates) user.customRates = {}; user.customRates.chef_with_groceries = parseInt(e.target.value); setIsSaved(false); }} />
                                                                                </div>
                                                                            </>
                                                                        )}
                                                                        {category.id === "CLEANING" && (
                                                                            <>
                                                                                <div className="space-y-1">
                                                                                    <Label className="text-xs">Extra Bedroom (₱)</Label>
                                                                                    <Input type="number" className="h-9 bg-white" placeholder="200" defaultValue={user.customRates?.perBedroom || 200} onChange={(e) => { if (!user.customRates) user.customRates = {}; user.customRates.perBedroom = parseInt(e.target.value); setIsSaved(false); }} />
                                                                                </div>
                                                                                <div className="space-y-1">
                                                                                    <Label className="text-xs">Extra Bathroom (₱)</Label>
                                                                                    <Input type="number" className="h-9 bg-white" placeholder="150" defaultValue={user.customRates?.perBathroom || 150} onChange={(e) => { if (!user.customRates) user.customRates = {}; user.customRates.perBathroom = parseInt(e.target.value); setIsSaved(false); }} />
                                                                                </div>
                                                                            </>
                                                                        )}
                                                                        {category.id === "BEAUTY" && (
                                                                            <div className="space-y-1">
                                                                                <Label className="text-xs">Gel Removal (₱)</Label>
                                                                                <Input type="number" className="h-9 bg-white" placeholder="200" defaultValue={user.customRates?.gel_removal || 200} onChange={(e) => { if (!user.customRates) user.customRates = {}; user.customRates.gel_removal = parseInt(e.target.value); setIsSaved(false); }} />
                                                                            </div>
                                                                        )}
                                                                        {category.id === "AIRCON" && (
                                                                            <>
                                                                                <div className="space-y-1">
                                                                                    <Label className="text-xs">Split Clean (₱)</Label>
                                                                                    <Input type="number" className="h-9 bg-white" defaultValue={user.customRates?.ac_split_cleaning || 1000} onChange={(e) => { if (!user.customRates) user.customRates = {}; user.customRates.ac_split_cleaning = parseInt(e.target.value); setIsSaved(false); }} />
                                                                                </div>
                                                                                <div className="space-y-1">
                                                                                    <Label className="text-xs">Window Clean (₱)</Label>
                                                                                    <Input type="number" className="h-9 bg-white" defaultValue={user.customRates?.ac_window_cleaning || 800} onChange={(e) => { if (!user.customRates) user.customRates = {}; user.customRates.ac_window_cleaning = parseInt(e.target.value); setIsSaved(false); }} />
                                                                                </div>
                                                                                <div className="space-y-1">
                                                                                    <Label className="text-xs">Split Repair (₱)</Label>
                                                                                    <Input type="number" className="h-9 bg-white" defaultValue={user.customRates?.ac_split_repair || 1000} onChange={(e) => { if (!user.customRates) user.customRates = {}; user.customRates.ac_split_repair = parseInt(e.target.value); setIsSaved(false); }} />
                                                                                </div>
                                                                                <div className="space-y-1">
                                                                                    <Label className="text-xs">Window Repair (₱)</Label>
                                                                                    <Input type="number" className="h-9 bg-white" defaultValue={user.customRates?.ac_window_repair || 1000} onChange={(e) => { if (!user.customRates) user.customRates = {}; user.customRates.ac_window_repair = parseInt(e.target.value); setIsSaved(false); }} />
                                                                                </div>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                </div>
                            </div>



                            {/* Holiday Mode */}
                            <div id="holiday-section" className="mb-0 pt-6 border-t scroll-mt-24">
                                <div className="flex items-center gap-2 mb-4 text-foreground">
                                    <LogOut className="h-5 w-5 text-eucalyptus" />
                                    <h3 className="font-semibold text-lg">Holiday & Time Off</h3>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <div>
                                            <p className="font-medium">On Holiday Mode</p>
                                            <p className="text-sm text-muted-foreground">Pause all new bookings indefinitely.</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={onHoliday}
                                                onChange={(e) => { setOnHoliday(e.target.checked); setIsSaved(false); }}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-eucalyptus/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-eucalyptus"></div>
                                        </label>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Block Specific Dates (YYYY-MM-DD)</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="date"
                                                className="h-10 rounded-xl"
                                                onChange={(e) => {
                                                    const date = e.target.value;
                                                    if (date && !blockedDates.includes(date)) {
                                                        setBlockedDates([...blockedDates, date]);
                                                        setIsSaved(false);
                                                    }
                                                }}
                                            />
                                        </div>
                                        {blockedDates.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {blockedDates.map((date) => (
                                                    <span key={date} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-medium border border-red-100">
                                                        {date}
                                                        <button
                                                            onClick={() => {
                                                                setBlockedDates(blockedDates.filter(d => d !== date));
                                                                setIsSaved(false);
                                                            }}
                                                            className="hover:text-red-800 ml-1 font-bold"
                                                        >
                                                            ×
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Save Action */}
                            <div className="pt-6 border-t flex justify-end">
                                <Button
                                    size="lg"
                                    onClick={handleSave}
                                    className="h-12 px-8 rounded-xl bg-eucalyptus hover:bg-eucalyptus/90 text-white font-semibold shadow-md transition-all active:scale-95"
                                >
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Schedule
                                </Button>
                            </div>



                            {/* GOOGLE CALENDAR INTEGRATION */}
                            <div className="pt-6 border-t mt-6">
                                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                    <CalendarIcon className="h-5 w-5 text-blue-500" />
                                    Google Calendar Sync
                                </h3>
                                <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-xl">
                                    <div>
                                        <p className="font-medium text-blue-900">
                                            {user?.isGoogleCalendarConnected ? `Connected as ${user.googleEmail}` : "Sync your bookings"}
                                        </p>
                                        <p className="text-sm text-blue-700/80">
                                            {user?.isGoogleCalendarConnected
                                                ? "Bookings are automatically synced to your calendar."
                                                : "Connect your Google Calendar to automatically export confirmed bookings."}
                                        </p>
                                    </div>
                                    {user?.isGoogleCalendarConnected ? (
                                        <Button variant="outline" className="border-blue-200 text-blue-700 bg-white hover:bg-blue-100" onClick={() => alert("Disconnect logic not implemented in MVP")}>
                                            Disconnect
                                        </Button>
                                    ) : (
                                        <Button
                                            className="bg-white text-blue-600 hover:bg-blue-100 border border-blue-200 shadow-sm"
                                            onClick={() => {
                                                if (!authUser?.id) return;
                                                window.location.href = `/api/auth/google?providerId=${authUser.id}`;
                                            }}
                                        >
                                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4 mr-2" alt="G" />
                                            Connect Google
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div >


        </div >
    );
}
