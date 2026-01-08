"use client";

import { ShieldCheck, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { getTherapistAvailability, getAvailabilityLabel } from "@/lib/availability";
import { Schedule } from "@/lib/data";

interface TherapistCardProps {
    id: string;
    name: string;
    image: string;
    isVerified: boolean;
    bookings: number;
    rating: number;
    tags: string[];
    price: number;
    duration: number;
    schedule: Schedule;
    distance?: string; // e.g. "1.2 km"
    onBook: () => void;
}

export function TherapistCard({
    id,
    name,
    image,
    isVerified,
    bookings,
    rating,
    tags,
    price,
    duration,
    schedule,
    distance,
    onBook,
}: TherapistCardProps) {
    const status = getTherapistAvailability(schedule);
    const { label, color } = getAvailabilityLabel(status);

    return (
        <Card className="overflow-hidden rounded-2xl border-0 shadow-md hover:shadow-lg transition-shadow bg-white relative">
            {/* AVAILABILITY BADGE */}
            <div className="absolute top-4 right-4 z-10">
                <Badge variant="outline" className={`border ${color} font-medium`}>
                    {status === "AVAILABLE" && <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse" />}
                    {label}
                </Badge>
            </div>

            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                        <Link href={`/provider/${id}`} className="flex gap-4 hover:opacity-80 transition-opacity">
                            <Avatar className="h-16 w-16 border-2 border-white shadow-xs">
                                <AvatarImage src={image} alt={name} />
                                <AvatarFallback>{name.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="flex items-center gap-1">
                                    <h3 className="font-bold text-lg text-foreground">{name}</h3>
                                    {isVerified && (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <ShieldCheck className="h-5 w-5 text-eucalyptus cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>ID Verified</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                    <span className="flex items-center gap-1">
                                        <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                                        <span className="font-medium text-foreground">{rating}</span>
                                    </span>
                                    <span>•</span>
                                    <span>{bookings}+ Bookings</span>
                                    {distance && (
                                        <>
                                            <span>•</span>
                                            <span className="text-eucalyptus font-medium">{distance} away</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                    {tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="rounded-md font-normal text-xs bg-sand/30 hover:bg-sand/40 text-foreground">
                            {tag}
                        </Badge>
                    ))}
                </div>
            </CardContent>
            <CardFooter className="p-6 pt-0 flex items-center justify-between border-t bg-sand/5 px-6 py-4">
                <div>
                    <p className="text-xl font-bold text-eucalyptus">₱{price}</p>
                    <p className="text-xs text-muted-foreground">
                        {tags.includes("NANNY") ? "/ hr (min 4 hours)" : `per ${duration} mins`}
                    </p>
                </div>
                <Button onClick={onBook} className="bg-eucalyptus hover:bg-eucalyptus/90 text-white rounded-full px-6">
                    Book Now
                </Button>
            </CardFooter>
        </Card>
    );
}
