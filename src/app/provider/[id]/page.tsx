"use client";

import { useParams } from "next/navigation";
import { Therapist } from "@/lib/data";
import { getProviderById, getProviderProfileWithReviews, createReview } from "@/lib/api"; // Supabase API
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star, ShieldCheck, MapPin, Clock, MessageCircle, MessageSquare, Info } from "lucide-react";
import { ReservationModal } from "@/components/feature/Bookings/ReservationModal";
import { ReservationSidebar } from "@/components/feature/Bookings/ReservationSidebar";
import { WriteReviewModal } from "@/components/feature/Reviews/WriteReviewModal";
import { useState, useEffect } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export default function TherapistProfile() {
    const params = useParams();
    const id = params.id as string;

    // State
    const [therapist, setTherapist] = useState<Therapist | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [selectedTier, setSelectedTier] = useState<"hourly" | "weekly_pass" | "monthly_pass">("hourly");

    // Fetch Provider
    useEffect(() => {
        const fetchProvider = async () => {
            setIsLoading(true);
            try {
                const data = await getProviderProfileWithReviews(id); // Use new function
                setTherapist(data || null);
            } catch (err) {
                console.error("Failed to fetch provider", err);
            } finally {
                setIsLoading(false);
            }
        };
        if (id) fetchProvider();
    }, [id]);

    // Mock Review Submission (In-Memory)
    // Real Review Submission
    const handleReviewSubmit = async (review: any) => {
        if (!therapist) return;
        try {
            await createReview({
                provider_id: therapist.id,
                author: review.author,
                rating: review.rating,
                comment: review.comment
            });

            // Reload to see new review
            const updated = await getProviderProfileWithReviews(therapist.id);
            if (updated) setTherapist(updated);
            alert("Review submitted successfully!");
        } catch (e) {
            console.error(e);
            alert("Failed to submit review.");
        }
    };



    if (isLoading) {
        return (
            <div className="min-h-screen bg-sand/10 pb-20 pt-32 text-center">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-32 w-32 bg-gray-200 rounded-full mb-4"></div>
                    <div className="h-8 w-48 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (!therapist) {
        return (
            <div className="container mx-auto px-4 py-32 text-center text-muted-foreground">
                <h2 className="text-xl font-bold mb-2">Provider Not Found</h2>
                <p>The provider you are looking for does not exist or has been removed.</p>
            </div>
        );
    }

    const handleBook = () => {
        setIsModalOpen(true);
    };

    const getButtonText = () => {
        if (selectedTier === "weekly_pass") return `Purchase Weekly Pass (₱${therapist.rates.weekly_pass})`;
        if (selectedTier === "monthly_pass") return `Purchase Monthly Pass (₱${therapist.rates.monthly_pass})`;
        return "Book Appointment";
    };

    const weeklySavings = Math.round((1 - (therapist.rates.weekly_pass / (therapist.price * 4))) * 100);
    const monthlySavings = Math.round((1 - (therapist.rates.monthly_pass / therapist.price)) * 100);

    return (
        <div className="min-h-screen bg-sand/10 pb-20">
            {/* ... header ... */}
            <div className="h-48 md:h-64 bg-eucalyptus/10 w-full relative overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-b from-transparent to-sand/20" />
            </div>

            <div className="container mx-auto px-4 -mt-20 md:-mt-32 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFT COLUMN: Main Info */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* PROFILE HEADER CARD */}
                        <Card className="p-6 md:p-8 rounded-3xl border-none shadow-lg bg-white/80 backdrop-blur-sm">
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                                <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-white shadow-md">
                                    <AvatarImage src={therapist.image} alt={therapist.name} />
                                    <AvatarFallback className="text-2xl">{therapist.name[0]}</AvatarFallback>
                                </Avatar>
                                <div className="space-y-2 flex-1">
                                    <div className="flex items-center gap-2">
                                        <h1 className="text-3xl font-bold text-foreground">{therapist.name}</h1>
                                        {therapist.isVerified && (
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <ShieldCheck className="h-6 w-6 text-eucalyptus fill-eucalyptus/10" />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Verified {therapist.category === "MASSAGE" ? "Therapist" :
                                                            therapist.category === "CLEANING" ? "Cleaner" :
                                                                therapist.category === "BEAUTY" ? "Beautician" : "Pro"}
                                                        </p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        )}
                                    </div>
                                    <p className="text-lg text-muted-foreground">{therapist.specialties[0]} Specialist</p>

                                    <div className="flex flex-wrap items-center gap-4 text-sm">
                                        <div className="flex items-center gap-1 text-amber-500 font-medium">
                                            <Star className="h-4 w-4 fill-current" />
                                            <span>{therapist.rating}</span>
                                            <span className="text-muted-foreground">({therapist.reviews.length} reviews)</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-muted-foreground">
                                            <MapPin className="h-4 w-4" />
                                            <span>Manila</span> {/* Mock Location */}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* CONTACT BUTTON (Based on Preference) */}
                        <div className="flex gap-4">
                            {therapist.contactNumber && (therapist.contactPreference === 'whatsapp' || therapist.contactPreference === 'any') && (
                                <Button
                                    className="flex-1 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl h-12 text-lg font-medium shadow-md transition-all hover:-translate-y-1"
                                    onClick={() => window.open(`https://wa.me/63${therapist.contactNumber!.replace(/^0/, '')}`, '_blank')}
                                >
                                    <MessageCircle className="mr-2 h-5 w-5" />
                                    Chat on WhatsApp
                                </Button>
                            )}
                            {therapist.contactNumber && (therapist.contactPreference === 'sms' || therapist.contactPreference === 'any') && (
                                <Button
                                    variant="outline"
                                    className="flex-1 border-foreground/20 hover:border-foreground/40 hover:bg-foreground/5 rounded-xl h-12 text-lg font-medium shadow-sm transition-all text-foreground"
                                    onClick={() => window.location.href = `sms:${therapist.contactNumber}`}
                                >
                                    <MessageSquare className="mr-2 h-5 w-5" />
                                    Send SMS
                                </Button>
                            )}
                        </div>

                        {/* BIO */}
                        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xs">
                            <h2 className="text-xl font-bold mb-4 text-foreground">About & Approach</h2>
                            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                {therapist.bio}
                            </p>
                        </div>

                        {/* EXPERTISE */}
                        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xs">
                            <h2 className="text-xl font-bold mb-4 text-foreground">Areas of Expertise</h2>
                            <div className="flex flex-wrap gap-2">
                                {therapist.specialties.map((tag) => (
                                    <Badge key={tag} variant="secondary" className="bg-eucalyptus/10 text-eucalyptus hover:bg-eucalyptus/20 px-3 py-1 text-sm rounded-full">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* REVIEWS */}
                        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xs">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-foreground">Recent Reviews</h2>
                                <Button variant="outline" size="sm" onClick={() => setIsReviewModalOpen(true)}>
                                    Write a Review
                                </Button>
                            </div>
                            <div className="space-y-6">
                                {therapist.reviews.length > 0 ? therapist.reviews.map((review, i) => (
                                    <div key={i} className="border-b last:border-0 pb-6 last:pb-0">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-semibold text-foreground">{review.author}</span>
                                            <span className="text-xs text-muted-foreground">{review.date}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-amber-500 mb-2">
                                            {[...Array(5)].map((_, idx) => (
                                                <Star key={idx} className={cn("h-3 w-3", idx < review.rating ? "fill-current" : "text-gray-200")} />
                                            ))}
                                        </div>
                                        <p className="text-muted-foreground text-sm">{review.comment}</p>
                                    </div>
                                )) : (
                                    <p className="text-muted-foreground italic">No reviews yet.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Sticky Booking Card (Desktop Only) */}
                    <div className="hidden lg:block lg:col-span-1">
                        <div className="sticky top-28 space-y-4">
                            <ReservationSidebar
                                therapist={therapist}
                                onBook={(type, code) => {
                                    setSelectedTier(code as any || "hourly");
                                    setIsModalOpen(true);
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <ReservationModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                therapist={therapist}
            />

            <WriteReviewModal
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                therapistName={therapist.name}
                onSubmit={handleReviewSubmit}
            />
        </div>
    );
}
