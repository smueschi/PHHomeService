"use client";

import { useEffect, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SERVICE_CATEGORIES } from "@/lib/services"; // Assume this exists or I'll use common ones
import { X } from "lucide-react";

interface SearchFiltersProps {
    filters: {
        minPrice: number;
        maxPrice: number;
        minRating: number;
        categories: string[];
    };
    onFilterChange: (newFilters: any) => void;
}

export function SearchFilters({ filters, onFilterChange }: SearchFiltersProps) {
    const [localFilters, setLocalFilters] = useState(filters);

    useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

    const handlePriceChange = (value: number[]) => {
        const newFilters = { ...localFilters, maxPrice: value[0] };
        setLocalFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleCategoryToggle = (cat: string) => {
        const currentcats = localFilters.categories || [];
        const newCats = currentcats.includes(cat)
            ? currentcats.filter(c => c !== cat)
            : [...currentcats, cat];

        const newFilters = { ...localFilters, categories: newCats };
        setLocalFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleRatingChange = (rating: number) => {
        const newFilters = { ...localFilters, minRating: rating === localFilters.minRating ? 0 : rating };
        setLocalFilters(newFilters);
        onFilterChange(newFilters);
    };

    return (
        <div className="space-y-8">
            {/* Price Range */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">Max Price</h3>
                    <Badge variant="secondary">₱{localFilters.maxPrice}</Badge>
                </div>
                <Slider
                    defaultValue={[localFilters.maxPrice]}
                    max={5000}
                    step={100}
                    onValueCommit={handlePriceChange}
                    className="py-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>₱0</span>
                    <span>₱5000+</span>
                </div>
            </div>

            {/* Rating */}
            <div className="space-y-3">
                <h3 className="font-semibold text-sm">Minimum Rating</h3>
                <div className="flex flex-wrap gap-2">
                    {[4.5, 4.0, 3.5].map((r) => (
                        <Button
                            key={r}
                            variant={localFilters.minRating === r ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleRatingChange(r)}
                            className={localFilters.minRating === r ? "bg-eucalyptus hover:bg-eucalyptus/90" : ""}
                        >
                            {r}+ ⭐
                        </Button>
                    ))}
                </div>
            </div>

            {/* Categories */}
            <div className="space-y-3">
                <h3 className="font-semibold text-sm">Categories</h3>
                <div className="space-y-2">
                    {["Massage", "Cleaning", "Repairs", "Beauty", "Nanny"].map((cat) => (
                        <div key={cat} className="flex items-center space-x-2">
                            <Checkbox
                                id={`cat-${cat}`}
                                checked={localFilters.categories.includes(cat)}
                                onCheckedChange={() => handleCategoryToggle(cat)}
                            />
                            <Label htmlFor={`cat-${cat}`} className="text-sm font-normal cursor-pointer">
                                {cat}
                            </Label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Clear Filters */}
            <Button
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground hover:text-red-500"
                onClick={() => onFilterChange({ minPrice: 0, maxPrice: 5000, minRating: 0, categories: [] })}
            >
                <X className="w-4 h-4 mr-2" />
                Reset Filters
            </Button>
        </div>
    );
}
