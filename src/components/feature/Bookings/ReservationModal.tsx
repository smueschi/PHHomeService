"use client";

// Vercel Rebuild Trigger: Fix Import Path Force
import { useState, useMemo } from "react";
import { format, isBefore, startOfDay, addDays } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, Clock, CheckCircle2, AlertCircle, Phone, MapPin, ChevronLeft, ChevronRight, Gem } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider"; // Fixed import path
import { createBooking } from "@/lib/api";
import { Therapist } from "@/lib/data";
import { sendProviderNotification } from "@/lib/email";

interface BookingModalProps {
    therapist: Therapist | null;
    initialServiceId?: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ReservationModal({ therapist, initialServiceId, open, onOpenChange }: BookingModalProps) {
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [bookingRef, setBookingRef] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form Data
    const [selectedService, setSelectedService] = useState<string | null>(initialServiceId || null);
    const [selectedPass, setSelectedPass] = useState<"NONE" | "WEEKLY" | "MONTHLY">("NONE");
    const [formData, setFormData] = useState({
        date: undefined as Date | undefined,
        time: "",
        name: user?.user_metadata?.full_name || "",
        client_phone: "",
        address: "",
        notes: "",
        addons: [] as string[]
    });

    // Validations & Logic
    const isValidMobileNumber = (num: string) => /^\+?\d{10,15}$/.test(num.replace(/[\s-]/g, ""));
    const isStep1Valid = !!selectedService;
    // Step 2 is Pass (always valid, can skip)
    const isStep3Valid = !!formData.date && !!formData.time;
    const isStep4Valid = !!formData.name && isValidMobileNumber(formData.client_phone) && !!formData.address;

    // Derived Data
    const selectedServicePrice = selectedService && therapist?.serviceRates ? therapist.serviceRates[selectedService] : null;
    const basePrice = selectedServicePrice || therapist?.price || 500;

    // Pass Calculations (Hardcoded Logic for Demo based on PassCalculator)
    const weeklySessions = 4;
    const weeklyDiscount = 15;
    const weeklyTotal = Math.round(basePrice * weeklySessions * (1 - weeklyDiscount / 100));

    const monthlySessions = 12;
    const monthlyDiscount = 25;
    const monthlyTotal = Math.round(basePrice * monthlySessions * (1 - monthlyDiscount / 100));

    const totalCost = useMemo(() => {
        if (selectedPass === "WEEKLY") return weeklyTotal;
        if (selectedPass === "MONTHLY") return monthlyTotal;

        let total = basePrice;
        // Add add-ons logic here if needed
        return total;
    }, [selectedPass, basePrice, weeklyTotal, monthlyTotal]);

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);

    const checkAvailability = (date: Date) => {
        // Mock availability logic
        const slots = [];
        const start = parseInt(therapist?.schedule?.workingHours?.start?.split(":")[0] || "9");
        const end = parseInt(therapist?.schedule?.workingHours?.end?.split(":")[0] || "17");
        for (let i = start; i < end; i++) {
            slots.push(`${i}:00 ${i < 12 ? 'AM' : 'PM'}`);
        }
        return slots;
    };

    const availableTimeSlots = formData.date ? checkAvailability(formData.date) : [];

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            if (!therapist || !selectedService || !formData.date) return;

            const payload = {
                date: format(formData.date, "yyyy-MM-dd"),
                time: formData.time,
                service_code: selectedService,
                variant: selectedService, // Using same code for now
                payment_method: "CASH", // Default for now
                financials: {
                    total: totalCost,
                    pass_applied: selectedPass,
                    base_price: basePrice
                },
                customer: {
                    name: formData.name,
                    phone: formData.client_phone,
                    address: formData.address,
                    notes: formData.notes,
                    email: user?.email
                },
                meta: {
                    therapist_id: therapist.id,
                    therapist_name: therapist.name,
                    source: "platform_booking_modal"
                },
                // Add default status
                status: "pending"
                // inputs, options, upsell left empty for now
            };

            const result = await createBooking(payload);

            // Send Email Notification to Provider
            await sendProviderNotification({
                serviceName: payload.service_code,
                customerName: payload.customer.name,
                date: payload.date,
                time: payload.time,
                // In a real app, we'd fetch provider email. For now, we rely on the API content or mock.
                // We'll pass the provider's ID or Name for logging.
                providerName: therapist.name
            });

            // If result has an ID (it should), show it
            const refId = result?.id ? `BK-${result.id.slice(0, 8).toUpperCase()}` : `BK-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
            setBookingRef(refId);
            setStep(5); // Success Step
        } catch (error) {
            console.error("Booking failed:", error);
            alert("Failed to create booking. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!therapist) return null;

    const isTherapistOnHoliday = therapist.schedule?.onHoliday;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-4 border-b flex items-center gap-3 bg-slate-50/50">
                    <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                        <AvatarImage src={therapist.image} />
                        <AvatarFallback>{therapist.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                        <DialogTitle className="text-base font-semibold text-slate-900">Book with {therapist.name}</DialogTitle>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                            {step < 5 ? `Step ${step} of 4` : "Booking Confirmed"}
                        </p>
                    </div>
                </div>

                {isTherapistOnHoliday && (
                    <div className="bg-red-50 p-3 text-center border-b border-red-100">
                        <p className="text-xs font-bold text-red-600 flex items-center justify-center gap-2">
                            <AlertCircle className="w-3 h-3" />
                            Provider is currently on holiday.
                        </p>
                    </div>
                )}

                <div className="p-4 overflow-y-auto flex-1">
                    {/* STEP 1: SERVICE SELECTION */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <h3 className="font-semibold text-slate-800">Select a Service</h3>
                            <div className="grid gap-3">
                                {Object.entries(therapist.serviceRates || {}).map(([id, price]) => (
                                    <div
                                        key={id}
                                        onClick={() => setSelectedService(id)}
                                        className={cn(
                                            "flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all",
                                            selectedService === id ? "border-eucalyptus bg-eucalyptus/5" : "border-slate-100 hover:border-slate-200"
                                        )}
                                    >
                                        <div>
                                            <p className="font-medium text-slate-900 capitalize">{id.replace("massage-", "").replace(/-/g, " ")}</p>
                                            <p className="text-xs text-slate-500">{therapist.duration} mins • Service Variant</p>
                                        </div>
                                        <Badge variant="secondary" className="bg-white">₱{price}</Badge>
                                    </div>
                                ))}
                                {/* Fallback if no services defined */}
                                {Object.keys(therapist.serviceRates || {}).length === 0 && (
                                    <div
                                        onClick={() => setSelectedService("massage")}
                                        className={cn(
                                            "flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all",
                                            selectedService === "massage" ? "border-eucalyptus bg-eucalyptus/5" : "border-slate-100 hover:border-slate-200"
                                        )}
                                    >
                                        <div>
                                            <p className="font-medium text-slate-900">Whole Body Massage</p>
                                            <p className="text-xs text-slate-500">60 mins</p>
                                        </div>
                                        <Badge variant="secondary" className="bg-white">₱{therapist.price}</Badge>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* STEP 2: PASS SELECTION (NEW) */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-slate-800">Save with a Pass?</h3>
                                <Badge variant="outline" className="text-eucalyptus border-eucalyptus/30 font-normal">Optional</Badge>
                            </div>

                            <div className="grid gap-4">
                                {/* Single Session Option */}
                                <div
                                    onClick={() => setSelectedPass("NONE")}
                                    className={cn(
                                        "relative p-4 rounded-xl border-2 cursor-pointer transition-all",
                                        selectedPass === "NONE" ? "border-slate-900 bg-slate-50" : "border-slate-100 hover:border-slate-200"
                                    )}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold text-slate-700">Single Session</span>
                                        <span className="font-bold">₱{basePrice}</span>
                                    </div>
                                    <p className="text-xs text-slate-500">Pay for just this booking. No commitment.</p>
                                    {selectedPass === "NONE" && <CheckCircle2 className="absolute top-4 right-4 text-slate-900 h-5 w-5 opacity-0" />}
                                </div>

                                {/* Weekly Pass */}
                                <div
                                    onClick={() => setSelectedPass("WEEKLY")}
                                    className={cn(
                                        "relative p-4 rounded-xl border-2 cursor-pointer transition-all overflow-hidden",
                                        selectedPass === "WEEKLY" ? "border-eucalyptus bg-eucalyptus/5" : "border-slate-100 hover:border-slate-200"
                                    )}
                                >
                                    {selectedPass === "WEEKLY" && <div className="absolute top-0 right-0 bg-eucalyptus text-white text-[10px] px-2 py-0.5 rounded-bl-md font-bold">SELECTED</div>}
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <span className="font-bold text-eucalyptus flex items-center gap-1.5"><Gem className="w-3 h-3" /> Weekly Pass</span>
                                            <p className="text-xs text-slate-500 mt-0.5">{weeklySessions} Sessions (Valid 7 Days)</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="block font-bold text-lg text-slate-900">₱{weeklyTotal}</span>
                                            <span className="text-[10px] text-green-600 font-bold bg-green-100 px-1.5 py-0.5 rounded-full">SAVE {weeklyDiscount}%</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-dashed border-slate-200">
                                        <p className="text-xs text-slate-400">Lowers price to <b className="text-slate-600">₱{Math.round(weeklyTotal / weeklySessions)}</b> / session</p>
                                    </div>
                                </div>

                                {/* Monthly Pass */}
                                <div
                                    onClick={() => setSelectedPass("MONTHLY")}
                                    className={cn(
                                        "relative p-4 rounded-xl border-2 cursor-pointer transition-all overflow-hidden",
                                        selectedPass === "MONTHLY" ? "border-eucalyptus bg-eucalyptus/5" : "border-slate-100 hover:border-slate-200"
                                    )}
                                >
                                    {selectedPass === "MONTHLY" && <div className="absolute top-0 right-0 bg-eucalyptus text-white text-[10px] px-2 py-0.5 rounded-bl-md font-bold">SELECTED</div>}
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <span className="font-bold text-eucalyptus flex items-center gap-1.5"><Gem className="w-3 h-3" /> Monthly Pass</span>
                                            <p className="text-xs text-slate-500 mt-0.5">{monthlySessions} Sessions (Valid 30 Days)</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="block font-bold text-lg text-slate-900">₱{monthlyTotal}</span>
                                            <span className="text-[10px] text-green-600 font-bold bg-green-100 px-1.5 py-0.5 rounded-full">SAVE {monthlyDiscount}%</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-dashed border-slate-200">
                                        <p className="text-xs text-slate-400">Lowers price to <b className="text-slate-600">₱{Math.round(monthlyTotal / monthlySessions)}</b> / session</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: DATE & TIME */}
                    {step === 3 && (
                        <div className="space-y-4">
                            <h3 className="font-semibold text-slate-800">Select Date & Time</h3>
                            <div className="flex justify-center border rounded-lg p-2 overflow-hidden">
                                <Calendar
                                    mode="single"
                                    selected={formData.date}
                                    onSelect={(date) => date && setFormData({ ...formData, date, time: "" })}
                                    initialFocus
                                    disabled={(date) => {
                                        const dateString = format(date, "yyyy-MM-dd");
                                        const isPast = isBefore(date, startOfDay(new Date()));
                                        const workingDays = therapist?.schedule?.workingDays || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
                                        const blockedDates = therapist?.schedule?.blockedDates || [];
                                        const isHoliday = therapist?.schedule?.onHoliday || false;

                                        const isBlocked = blockedDates.includes(dateString);
                                        const isWorkingDay = workingDays.includes(format(date, "EEE"));

                                        return isPast || isBlocked || isHoliday || !isWorkingDay;
                                    }}
                                    modifiers={{
                                        available: (date) => {
                                            const dateString = format(date, "yyyy-MM-dd");
                                            const isPast = isBefore(date, startOfDay(new Date()));
                                            const workingDays = therapist?.schedule?.workingDays || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
                                            const blockedDates = therapist?.schedule?.blockedDates || [];
                                            const isHoliday = therapist?.schedule?.onHoliday || false;

                                            const isBlocked = blockedDates.includes(dateString);
                                            const isWorkingDay = workingDays.includes(format(date, "EEE"));
                                            return !isPast && !isBlocked && !isHoliday && !!isWorkingDay;
                                        },
                                        blocked: (date) => {
                                            const dateString = format(date, "yyyy-MM-dd");
                                            const blockedDates = therapist?.schedule?.blockedDates || [];
                                            const isHoliday = therapist?.schedule?.onHoliday || false;
                                            return blockedDates.includes(dateString) || !!isHoliday;
                                        }
                                    }}
                                    modifiersClassNames={{
                                        available: "bg-green-100 text-green-900 font-bold rounded-md border border-green-200 hover:bg-green-200",
                                        blocked: "bg-red-50 text-red-300 cursor-not-allowed decoration-red-500 line-through opacity-60"
                                    }}
                                    classNames={{
                                        disabled: "bg-gray-100 text-gray-400 text-opacity-70 cursor-not-allowed",
                                        day: "w-full h-full p-0 flex items-center justify-center font-medium hover:bg-slate-100 rounded-md transition-colors"
                                    }}
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                                {availableTimeSlots.map(slot => (
                                    <Button
                                        key={slot}
                                        variant={formData.time === slot ? "default" : "outline"}
                                        className={cn("text-xs", formData.time === slot && "bg-eucalyptus hover:bg-eucalyptus/90")}
                                        onClick={() => setFormData({ ...formData, time: slot })}
                                    >
                                        {slot}
                                    </Button>
                                ))}
                                {availableTimeSlots.length === 0 && formData.date && (
                                    <p className="col-span-3 text-center text-xs text-slate-500 py-2">No slots available for this date.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* STEP 4: CONTACT & DETAILS */}
                    {step === 4 && (
                        <div className="space-y-4">
                            <h3 className="font-semibold text-slate-800">Your Details</h3>
                            <div className="space-y-3">
                                <div>
                                    <Label>Full Name</Label>
                                    <Input
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="bg-slate-50"
                                        placeholder="Jane Doe"
                                    />
                                </div>
                                <div>
                                    <Label>Mobile Number</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <Input
                                            className="pl-9"
                                            value={formData.client_phone}
                                            onChange={e => setFormData({ ...formData, client_phone: e.target.value })}
                                            placeholder="0917 123 4567"
                                        />
                                    </div>
                                    {formData.client_phone && !isValidMobileNumber(formData.client_phone) && (
                                        <p className="text-[10px] text-red-500 mt-1">Invalid format. Minimum 10 digits.</p>
                                    )}
                                </div>
                                <div>
                                    <Label>Home Address / Landmark</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <Input
                                            className="pl-9"
                                            value={formData.address}
                                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                                            placeholder="Unit 101, Building Name, Street..."
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label>Notes (Optional)</Label>
                                    <Textarea
                                        value={formData.notes}
                                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                        placeholder="Gate code, specific instructions..."
                                        className="resize-none h-20"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 5: SUCCESS */}
                    {step === 5 && (
                        <div className="text-center py-8 space-y-4">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in duration-300">
                                <CheckCircle2 className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">Booking Confirmed!</h2>
                            <p className="text-slate-500 max-w-xs mx-auto">
                                Your booking with {therapist.name} has been sent. You can track its status in your profile.
                            </p>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 max-w-xs mx-auto text-left text-sm space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Ref:</span>
                                    <span className="font-mono font-bold text-slate-900">{bookingRef}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Date:</span>
                                    <span className="font-medium text-slate-900">{formData.date ? format(formData.date, "PPP") : ""}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Time:</span>
                                    <span className="font-medium text-slate-900">{formData.time}</span>
                                </div>
                                <div className="flex justify-between border-t border-dashed pt-2 mt-2">
                                    <span className="font-bold text-slate-700">Total:</span>
                                    <span className="font-bold text-eucalyptus">₱{totalCost}</span>
                                </div>
                            </div>

                            <div className="pt-4 flex flex-col gap-2 max-w-xs mx-auto">
                                <Button
                                    className="w-full bg-eucalyptus hover:bg-eucalyptus/90"
                                    onClick={() => window.location.href = "/profile"}
                                >
                                    View in My Bookings
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => onOpenChange(false)}
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Buttons */}
                {step < 5 && (
                    <div className="p-4 border-t bg-white flex justify-between items-center">
                        {step > 1 ? (
                            <Button variant="ghost" onClick={handleBack} disabled={isSubmitting}>
                                <ChevronLeft className="w-4 h-4 mr-1" /> Back
                            </Button>
                        ) : (
                            <div /> // Spacer
                        )}

                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Total</p>
                                <p className="font-bold text-lg text-eucalyptus leading-none">₱{totalCost}</p>
                            </div>
                            <Button
                                onClick={step === 4 ? handleSubmit : handleNext}
                                disabled={
                                    isSubmitting ||
                                    isTherapistOnHoliday ||
                                    (step === 1 && !isStep1Valid) ||
                                    (step === 3 && !isStep3Valid) ||
                                    (step === 4 && !isStep4Valid)
                                }
                                className="bg-eucalyptus hover:bg-eucalyptus/90 text-white px-8"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                        Processing...
                                    </>
                                ) : step === 4 ? "Confirm Booking" : "Next"}
                                {!isSubmitting && step < 4 && <ChevronRight className="w-4 h-4 ml-1" />}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
