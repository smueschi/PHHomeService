"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface WriteReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    therapistName: string;
    onSubmit: (review: { author: string; rating: number; comment: string }) => void;
}

export function WriteReviewModal({ isOpen, onClose, therapistName, onSubmit }: WriteReviewModalProps) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [author, setAuthor] = useState("");
    const [comment, setComment] = useState("");
    const [bookingRef, setBookingRef] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Mock API validation of booking reference
        // In a real app, we'd check bookingRef against the database
        await new Promise(resolve => setTimeout(resolve, 1000));

        onSubmit({
            author: author || "Anonymous User",
            rating: rating || 5, // Default to 5 if somehow 0
            comment
        });

        // Reset
        setRating(0);
        setAuthor("");
        setComment("");
        setBookingRef("");
        setIsSubmitting(false);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Review {therapistName}</DialogTitle>
                    <DialogDescription>
                        Share your experience to help others. Verification required.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    {/* STAR RATING */}
                    <div className="flex justify-center gap-2 mb-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className="focus:outline-none transition-transform hover:scale-110"
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setRating(star)}
                            >
                                <Star
                                    className={cn(
                                        "h-8 w-8 transition-colors",
                                        (hoverRating || rating) >= star ? "fill-amber-400 text-amber-400" : "text-gray-300"
                                    )}
                                />
                            </button>
                        ))}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="author">Display Name</Label>
                        <Input
                            id="author"
                            placeholder="e.g. Maria S."
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="bookingRef">Booking Reference / Email</Label>
                        <Input
                            id="bookingRef"
                            placeholder="To verify your stay/service"
                            value={bookingRef}
                            onChange={(e) => setBookingRef(e.target.value)}
                            required
                        />
                        <p className="text-[10px] text-muted-foreground">We verify this to ensure authentic reviews.</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="comment">Your Review</Label>
                        <Textarea
                            id="comment"
                            placeholder="How was your session? What did you like?"
                            className="min-h-[100px]"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            required
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-eucalyptus hover:bg-eucalyptus/90" disabled={isSubmitting || rating === 0}>
                            {isSubmitting ? "Submitting..." : "Post Review"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
