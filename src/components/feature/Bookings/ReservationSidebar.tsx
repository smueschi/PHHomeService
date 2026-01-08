"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Clock, MessageCircle, MessageSquare, Info, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingProps {
    therapist: any; // Using any for mock simplicity, ideally defined interface
    onBook: (bookingType?: "standard" | "subscription_purchase", tier?: string) => void;
}

export function ReservationSidebar({ therapist, onBook }: PricingProps) {
    const [selectedTier, setSelectedTier] = useState<"hourly" | "weekly_pass" | "monthly_pass">("hourly");

    const weeklySavings = Math.round((1 - (therapist.rates.weekly_pass / (therapist.price * (therapist.rates.weekly_sessions || 4)))) * 100);
    const monthlySavings = Math.round((1 - (therapist.rates.monthly_pass / (therapist.price * (therapist.rates.monthly_sessions || 12)))) * 100);

    const getButtonText = () => {
        if (selectedTier === "weekly_pass") return `Purchase Weekly Pass (₱${therapist.rates.weekly_pass})`;
        if (selectedTier === "monthly_pass") return `Purchase Monthly Pass (₱${therapist.rates.monthly_pass})`;
        return "Book Appointment";
    };

    const handleBookClick = () => {
        const bookingType = selectedTier === "hourly" ? "standard" : "subscription_purchase";
        const serviceCode = selectedTier === "hourly" ? undefined : selectedTier;
        onBook(bookingType, serviceCode);
    };

    // LOGIC: Only show memberships if the provider offers them (rate > 0) AND has enabled them.
    const showMemberships = (therapist.rates.weekly_pass > 0 || therapist.rates.monthly_pass > 0) && therapist.rates.enablePasses !== false;

    return (
        <Card className="p-6 rounded-3xl border-none shadow-lg overflow-hidden bg-white">
            <div className="space-y-6">
                {/* PRICING HEADER */}
                <div>
                    <p className="text-sm text-muted-foreground mb-1">Session Rate</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-eucalyptus">₱{therapist.price}</span>
                        <span className="text-muted-foreground">/ session</span>
                    </div>
                </div>

                {/* MEMBERSHIP TIERS */}
                {showMemberships ? (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-semibold text-foreground">Best Value Memberships</span>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Info className="h-4 w-4 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[250px]">
                                        <p>You get credits to use with {therapist.name} anytime this month. Unused credits roll over for 30 days.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>

                        {/* WEEKLY PASS */}
                        {therapist.rates.weekly_pass > 0 && (
                            <div
                                onClick={() => setSelectedTier("weekly_pass")}
                                className={cn(
                                    "cursor-pointer rounded-xl p-3 border-2 transition-all relative",
                                    selectedTier === "weekly_pass" ? "border-amber-400 bg-amber-50/50" : "border-border hover:border-amber-200"
                                )}
                            >
                                <div className="absolute -top-3 right-4 bg-amber-500 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm animate-pulse">
                                    Save {weeklySavings}%
                                </div>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-sm text-foreground">Weekly Pass</p>
                                        <p className="text-xs text-muted-foreground">{therapist.rates.weekly_sessions || 4} sessions (₱{Math.round(therapist.rates.weekly_pass / (therapist.rates.weekly_sessions || 4))}/session)</p>
                                    </div>
                                    <p className="font-bold text-lg text-amber-600">₱{therapist.rates.weekly_pass}</p>
                                </div>
                            </div>
                        )}

                        {/* MONTHLY PASS */}
                        {therapist.rates.monthly_pass > 0 && (
                            <div
                                onClick={() => setSelectedTier("monthly_pass")}
                                className={cn(
                                    "cursor-pointer rounded-xl p-3 border-2 transition-all",
                                    selectedTier === "monthly_pass" ? "border-amber-400 bg-amber-50/50" : "border-border hover:border-amber-200"
                                )}
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-sm text-foreground">Monthly Pass</p>
                                        <p className="text-xs text-muted-foreground">{therapist.rates.monthly_sessions || 12} Sessions (Valid for 30 Days)</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-md mr-2 font-medium">Save {monthlySavings}%</span>
                                        <span className="font-bold text-lg text-amber-600">₱{therapist.rates.monthly_pass}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* HOURLY OPTION (Reset) */}
                        {selectedTier !== "hourly" && (
                            <button onClick={() => setSelectedTier("hourly")} className="text-xs text-muted-foreground underline w-full text-center hover:text-foreground">
                                Switch back to single session
                            </button>
                        )}
                    </div>
                ) : (
                    // Fallback for providers without memberships (e.g. Beauty/Cleaning/Other)
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 mb-4">
                        <p className="text-xs text-muted-foreground text-center">
                            Simple, transparent pricing. No hidden fees.
                        </p>
                    </div>
                )}

                {/* ACTIONS */}
                <div className="space-y-3 pt-2">
                    <Button size="lg" className="w-full bg-eucalyptus hover:bg-eucalyptus/90 font-semibold h-12 rounded-xl" onClick={handleBookClick}>
                        {getButtonText()}
                    </Button>
                    <Button variant="outline" size="lg" className="w-full border-eucalyptus/20 text-eucalyptus hover:bg-eucalyptus/5 h-12 rounded-xl">
                        {therapist.contactPreference === 'sms' ? (
                            <>
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Send SMS
                            </>
                        ) : (
                            <>
                                <MessageCircle className="mr-2 h-4 w-4" />
                                WhatsApp
                            </>
                        )}
                    </Button>
                </div>

                {/* AVAILABILITY */}
                <div className="pt-4 border-t">
                    <h4 className="text-sm font-semibold mb-2 text-foreground">Availability</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{therapist.availability}</span>
                    </div>
                </div>

                {/* VERIFIED BADGE FOOTER */}
                {therapist.isVerified && (
                    <div className="flex gap-3 items-start p-3 bg-slate-50 rounded-xl">
                        <ShieldCheck className="h-5 w-5 text-eucalyptus shrink-0" />
                        <div className="space-y-0.5">
                            <p className="text-xs font-semibold text-foreground">
                                Verified {therapist.category === "MASSAGE" ? "Therapist" :
                                    therapist.category === "CLEANING" ? "Cleaner" :
                                        therapist.category === "BEAUTY" ? "Beautician" : "Pro"}
                            </p>
                            <p className="text-xs text-muted-foreground leading-tight">Credentials verified by PH Home Service</p>
                        </div>
                    </div>
                )}

            </div>
        </Card>
    );
}
