"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { SERVICE_CATEGORIES } from "@/lib/services";
import { isValidMobileNumber, cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/AuthProvider";
import { createProviderRequest, uploadProviderDocument } from "@/lib/api";

export default function JoinPage() {
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState<{
        fullName: string;
        baseCity: string;
        contactNumber: string;
        serviceOfferings: string[];
        serviceDetails: Record<string, { years: string }>; // Per-service details
    }>({
        fullName: "",
        baseCity: "",
        contactNumber: "",
        serviceOfferings: [],
        serviceDetails: {},
    });
    const [file, setFile] = useState<{ id: File | null; clearance: File | null }>({ id: null, clearance: null });
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Auto-fill effect if user exists
    useEffect(() => {
        if (user && !formData.fullName) {
            setFormData(prev => ({
                ...prev,
                fullName: user.user_metadata?.name || "",
                contactNumber: user.phone || ""
            }));
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            router.push(`/login?redirect=/join`);
            return;
        }

        setIsSubmitting(true);

        try {
            // Simplified Mapping: Take the first service as "Primary Category"
            const primaryCategory = formData.serviceOfferings[0];
            const primaryDetails = formData.serviceDetails[primaryCategory];

            const payload = {
                provider_id: user.id,
                requested_category: primaryCategory,
                requested_sub_services: formData.serviceOfferings, // Send all as sub-services for now
                experience_years: primaryDetails?.years || "1_to_3"
            };

            console.log("ONBOARDING SUBMISSION (JSON):", JSON.stringify(payload, null, 2));

            await createProviderRequest(payload);
            setIsSubmitted(true);
        } catch (error) {
            console.error(error);
            alert("Failed to submit application. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-eucalyptus" /></div>;

    if (isSubmitted) {
        return (
            <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
                <div className="bg-eucalyptus/10 p-6 rounded-full">
                    <CheckCircle className="h-16 w-16 text-eucalyptus" />
                </div>
                <h1 className="text-3xl font-bold text-foreground">Application Received!</h1>
                <p className="text-muted-foreground max-w-md">
                    Thank you for interest in joining PH Home Service. Our team will review your details and contact you via WhatsApp at {formData.contactNumber}.
                </p>
                <Button onClick={() => {
                    setIsSubmitted(false);
                    setFile({ id: null, clearance: null });
                    setFormData({
                        fullName: user?.user_metadata?.name || "",
                        baseCity: "",
                        contactNumber: user?.phone || "",
                        serviceOfferings: [],
                        serviceDetails: {},
                    });
                }} variant="outline" className="mt-4">
                    Submit Another
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-2xl">
            <div className="text-center mb-10 space-y-4">
                <h1 className="text-4xl font-extrabold tracking-tight text-eucalyptus">Join PH Home Service</h1>
                <p className="text-muted-foreground text-lg">
                    Earn more on your own schedule. Join our network of therapists, cleaners, chefs, and beauty experts in Siargao.
                </p>
            </div>

            <Card className="border-0 shadow-lg bg-white/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>Professional Application</CardTitle>
                    <CardDescription>Fill out the form below to get started.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input
                                id="fullName"
                                placeholder="Juan Dela Cruz"
                                required
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="baseCity">Base City</Label>
                            <Input
                                id="baseCity"
                                placeholder="e.g. Quezon City"
                                required
                                value={formData.baseCity}
                                onChange={(e) => setFormData({ ...formData, baseCity: e.target.value })}
                            />
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-4">
                                <Label>What services do you offer? (Select all that apply)</Label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {SERVICE_CATEGORIES.map((category) => {
                                        const isSelected = formData.serviceOfferings.includes(category.id);
                                        const Icon = category.icon;
                                        return (
                                            <div
                                                key={category.id}
                                                onClick={() => {
                                                    const current = formData.serviceOfferings;
                                                    let updatedOfferings = [];
                                                    const currentDetails = { ...formData.serviceDetails };

                                                    if (isSelected) {
                                                        // Remove
                                                        updatedOfferings = current.filter(id => id !== category.id);
                                                        delete currentDetails[category.id];
                                                    } else {
                                                        // Add
                                                        updatedOfferings = [...current, category.id];
                                                        currentDetails[category.id] = { years: "" };
                                                    }

                                                    setFormData({
                                                        ...formData,
                                                        serviceOfferings: updatedOfferings,
                                                        serviceDetails: currentDetails
                                                    });
                                                }}
                                                className={`
                                                    cursor-pointer rounded-xl border p-4 flex flex-col items-center justify-center gap-2 text-center transition-all
                                                    ${isSelected
                                                        ? 'border-eucalyptus bg-eucalyptus/10 text-eucalyptus ring-2 ring-eucalyptus/20'
                                                        : 'border-border hover:border-eucalyptus/50 hover:bg-slate-50'
                                                    }
                                                `}
                                            >
                                                <Icon className={`h-6 w-6 ${isSelected ? 'text-eucalyptus' : 'text-muted-foreground'}`} />
                                                <span className="text-sm font-medium">{category.title}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                {formData.serviceOfferings.length === 0 && (
                                    <p className="text-xs text-amber-600 font-medium">Please select at least one service.</p>
                                )}
                            </div>

                            {/* DYNAMIC EXPERIENCE FIELDS */}
                            {formData.serviceOfferings.length > 0 && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                                    <Label>Experience Details</Label>
                                    <div className="grid gap-4 p-4 border rounded-xl bg-slate-50/50">
                                        {formData.serviceOfferings.map((serviceId) => {
                                            const service = SERVICE_CATEGORIES.find(s => s.id === serviceId);
                                            if (!service) return null;
                                            const Icon = service.icon;

                                            return (
                                                <div key={serviceId} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-white p-3 rounded-lg border shadow-sm">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-eucalyptus/10 rounded-full text-eucalyptus">
                                                            <Icon className="h-4 w-4" />
                                                        </div>
                                                        <span className="font-medium text-sm">{service.title}</span>
                                                    </div>

                                                    <Select
                                                        value={formData.serviceDetails[serviceId]?.years || ""}
                                                        onValueChange={(val) => {
                                                            const updatedDetails = { ...formData.serviceDetails };
                                                            if (!updatedDetails[serviceId]) updatedDetails[serviceId] = { years: "" };
                                                            updatedDetails[serviceId].years = val;
                                                            setFormData({ ...formData, serviceDetails: updatedDetails });
                                                        }}
                                                    >
                                                        <SelectTrigger className="h-9">
                                                            <SelectValue placeholder="Years of Experience" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="less_than_1">Less than 1 year</SelectItem>
                                                            <SelectItem value="1_to_3">1 - 3 years</SelectItem>
                                                            <SelectItem value="3_to_5">3 - 5 years</SelectItem>
                                                            <SelectItem value="5_plus">5+ years</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="contact">Mobile Number (WhatsApp)</Label>
                            <Input
                                id="contact"
                                placeholder="0917 123 4567"
                                required
                                type="tel"
                                value={formData.contactNumber}
                                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                                className={cn(formData.contactNumber && !isValidMobileNumber(formData.contactNumber) && "border-red-500 focus-visible:ring-red-500")}
                            />
                            {formData.contactNumber && !isValidMobileNumber(formData.contactNumber) && (
                                <p className="text-[10px] text-red-500">
                                    Please enter a valid mobile number (e.g. 0917... or +1...)
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* VALID ID (REQUIRED) */}
                                <div className="space-y-2">
                                    <Label>Valid ID <span className="text-red-500">*</span></Label>
                                    <div className={cn(
                                        "border-2 border-dashed transition-colors rounded-xl p-6 text-center cursor-pointer bg-slate-50",
                                        file?.id ? "border-eucalyptus bg-eucalyptus/5" : "border-input hover:border-eucalyptus/50"
                                    )}>
                                        <Input
                                            type="file"
                                            className="hidden"
                                            id="file-upload-id"
                                            accept="image/*,.pdf"
                                            onChange={(e) => setFile(prev => ({ ...prev, id: e.target.files?.[0] || null }))}
                                        />
                                        <label htmlFor="file-upload-id" className="cursor-pointer flex flex-col items-center gap-2">
                                            {file?.id ? (
                                                <>
                                                    <CheckCircle className="h-8 w-8 text-eucalyptus" />
                                                    <span className="text-sm font-medium text-eucalyptus truncate max-w-[150px]">{file.id.name}</span>
                                                    <span className="text-[10px] text-muted-foreground">Click to replace</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="h-8 w-8 text-muted-foreground" />
                                                    <span className="text-sm font-medium text-muted-foreground">Upload ID</span>
                                                    <span className="text-[10px] text-muted-foreground">(Passport, Driver's License)</span>
                                                </>
                                            )}
                                        </label>
                                    </div>
                                </div>

                                {/* NBI CLEARANCE (OPTIONAL) */}
                                <div className="space-y-2">
                                    <Label>NBI Clearance (Optional)</Label>
                                    <div className={cn(
                                        "border-2 border-dashed transition-colors rounded-xl p-6 text-center cursor-pointer bg-slate-50",
                                        file?.clearance ? "border-eucalyptus bg-eucalyptus/5" : "border-input hover:border-eucalyptus/50"
                                    )}>
                                        <Input
                                            type="file"
                                            className="hidden"
                                            id="file-upload-nbi"
                                            accept="image/*,.pdf"
                                            onChange={(e) => setFile(prev => ({ ...prev, clearance: e.target.files?.[0] || null }))}
                                        />
                                        <label htmlFor="file-upload-nbi" className="cursor-pointer flex flex-col items-center gap-2">
                                            {file?.clearance ? (
                                                <>
                                                    <CheckCircle className="h-8 w-8 text-eucalyptus" />
                                                    <span className="text-sm font-medium text-eucalyptus truncate max-w-[150px]">{file.clearance.name}</span>
                                                    <span className="text-[10px] text-muted-foreground">Click to replace</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="h-8 w-8 text-muted-foreground" />
                                                    <span className="text-sm font-medium text-muted-foreground">Upload Clearance</span>
                                                    <span className="text-[10px] text-muted-foreground">(NBI / Police Clearance)</span>
                                                </>
                                            )}
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            size="lg"
                            className="w-full bg-eucalyptus hover:bg-eucalyptus/90 text-white font-bold rounded-xl h-12"
                            disabled={
                                isSubmitting ||
                                (!!user && (
                                    !formData.fullName ||
                                    !formData.contactNumber ||
                                    !isValidMobileNumber(formData.contactNumber) ||
                                    formData.serviceOfferings.length === 0
                                ))
                            }
                        >
                            {isSubmitting ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
                            ) : !user ? (
                                "Login to Apply"
                            ) : (
                                "Submit Application"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
