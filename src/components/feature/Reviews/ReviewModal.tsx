"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createReview } from "@/lib/api";
import { cn } from "@/lib/utils";

interface ReviewModalProps {
    bookingId: string;
    providerId: string;
    providerName: string;
    onSuccess: () => void;
    onClose: () => void;
    isOpen: boolean;
}

export function ReviewModal({ bookingId, providerId, providerName, onSuccess, onClose, isOpen }: ReviewModalProps) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        if (rating === 0) {
            setError("Please select a star rating");
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            await createReview({
                provider_id: providerId,
                author: "Anonymous User", // Ideally from Auth Context but API handles simplistic "author" string for now
                rating,
                comment,
                booking_reference: bookingId
            });
            onSuccess();
            onClose();
        } catch (err) {
            console.error("Failed to submit review:", err);
            setError("Failed to submit review. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Rate your experience with {providerName}</DialogTitle>
                    <DialogDescription>
                        How was your service? Your feedback helps us improve.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setRating(star)}
                            >
                                <Star
                                    className={cn(
                                        "w-8 h-8 transition-colors duration-200",
                                        (hoverRating || rating) >= star
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "text-slate-300"
                                    )}
                                />
                            </button>
                        ))}
                    </div>

                    <div className="space-y-2">
                        <Label>Comments (Optional)</Label>
                        <Textarea
                            placeholder="Tell us more about your experience..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="bg-slate-50 min-h-[100px]"
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-500 text-center">{error}</p>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="bg-eucalyptus hover:bg-eucalyptus/90 text-white"
                    >
                        {isSubmitting ? "Submitting..." : "Submit Review"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
