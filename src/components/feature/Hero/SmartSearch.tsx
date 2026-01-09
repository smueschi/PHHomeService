"use client";

import { useState } from "react";
import { Search, MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";

// Simplified Props - no longer needs a callback, handles its own navigation
interface SmartSearchProps {
    className?: string;
    onSearch?: (filters: any) => void; // Optional legacy support if used elsewhere, but mainly we redirect
}

export function SmartSearch({ className, onSearch }: SmartSearchProps) {
    const router = useRouter();
    const [service, setService] = useState("");
    const [locationInput, setLocationInput] = useState("");
    const [isLocating, setIsLocating] = useState(false);

    const handleSearch = () => {
        // Build URL params
        const params = new URLSearchParams();
        if (service) params.set("q", service);
        if (locationInput) params.set("loc", locationInput);

        // Redirect to /search
        router.push(`/search?${params.toString()}`);
    };

    const handleNearMe = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                // For MVP, we can just set the text to "Near Me" or current city if we had reverse geocoding
                // Or pass lat/lng params: `&lat=...&lng=...`
                // Let's just set the text for now to indicate intent
                setLocationInput("Current Location");
                setIsLocating(false);
            },
            () => {
                alert("Unable to retrieve your location");
                setIsLocating(false);
            }
        );
    };

    return (
        <div className={`w-full max-w-xl mx-auto space-y-4 ${className}`}>
            <Card className="p-2 shadow-lg rounded-2xl border-0 bg-white/95 backdrop-blur">
                <div className="flex flex-col md:flex-row gap-2">
                    {/* SERVICE TYPE */}
                    <div className="flex-1 min-w-[140px] relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Service (e.g. Massage)"
                            className="h-12 pl-10 border-0 bg-transparent focus-visible:ring-0 shadow-none text-base"
                            value={service}
                            onChange={(e) => setService(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>

                    <div className="hidden md:block w-px bg-border my-2" />

                    {/* LOCATION */}
                    <div className="flex-1 relative group">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-eucalyptus transition-colors" />
                        <Input
                            type="text"
                            placeholder="City or 'Near Me'"
                            className="h-12 pl-10 pr-10 border-0 bg-transparent focus-visible:ring-0 shadow-none text-base truncate"
                            value={locationInput}
                            onChange={(e) => setLocationInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <Button
                            size="icon"
                            variant="ghost"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-eucalyptus"
                            onClick={handleNearMe}
                            disabled={isLocating}
                            title="Use my location"
                        >
                            <Navigation className={`h-4 w-4 ${isLocating ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>

                    {/* SEARCH BUTTON */}
                    <Button
                        size="lg"
                        onClick={handleSearch}
                        className="h-12 rounded-xl bg-eucalyptus hover:bg-eucalyptus/90 text-white px-8 transition-all hover:scale-105 active:scale-95"
                    >
                        {isLocating ? "Locating..." : "Search"}
                    </Button>
                </div>
            </Card>

            {/* TRUST SIGNALS */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-muted-foreground">
                <span className="flex items-center gap-1.5">
                    <svg className="h-4 w-4 text-eucalyptus" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Verified Providers
                </span>
                <span className="hidden sm:inline text-border">|</span>
                <span className="flex items-center gap-1.5">
                    <svg className="h-4 w-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    4.8+ Star Average
                </span>
            </div>
        </div>
    );
}
