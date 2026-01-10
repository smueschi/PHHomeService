"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getProviders } from "@/lib/api";
import { Therapist } from "@/lib/data";
import { ServiceGrid } from "@/components/feature/Home/ServiceGrid";
import { SearchFilters } from "@/components/feature/Search/SearchFilters";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Filter } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

function SearchPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // URL Params
    const queryService = searchParams.get("q") || "";
    const queryLocation = searchParams.get("loc") || "";

    // Data State
    const [providers, setProviders] = useState<Therapist[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter State
    const [filters, setFilters] = useState({
        minPrice: 0,
        maxPrice: 5000,
        minRating: 0,
        categories: [] as string[]
    });

    // Inputs (local state for typing before pushing)
    const [searchTerm, setSearchTerm] = useState(queryService);
    const [locationTerm, setLocationTerm] = useState(queryLocation);

    // Initial Fetch
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // In a real app, pass params to API. Here we fetch all and filter client-side.
                const allProviders = await getProviders();
                setProviders(allProviders);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();

        // Sync inputs if URL changes
        setSearchTerm(queryService);
        setLocationTerm(queryLocation);
    }, [queryService, queryLocation]);

    // Handle Search Submit
    const handleSearch = () => {
        const params = new URLSearchParams();
        if (searchTerm) params.set("q", searchTerm);
        if (locationTerm) params.set("loc", locationTerm);
        router.push(`/search?${params.toString()}`);
    };

    // Filter Logic
    const filteredProviders = providers.filter(p => {
        // 1. Text Search (Service/Name)
        const matchesText = !queryService ||
            p.name.toLowerCase().includes(queryService.toLowerCase()) ||
            p.category.toLowerCase().includes(queryService.toLowerCase()) ||
            p.tags.some(t => t.toLowerCase().includes(queryService.toLowerCase()));

        // 2. Location (Simple includes for now)
        const matchesLocation = !queryLocation ||
            (p.location?.name || "").toLowerCase().includes(queryLocation.toLowerCase());

        // 3. Price
        const matchesPrice = p.price <= filters.maxPrice;

        // 4. Rating
        const matchesRating = p.rating >= filters.minRating;

        // 5. Categories
        const matchesCategory = filters.categories.length === 0 ||
            filters.categories.includes(p.category) ||
            (p.category === "Therapy" && filters.categories.includes("Massage")); // Example mapping

        return matchesText && matchesLocation && matchesPrice && matchesRating && matchesCategory;
    });

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Header />

            {/* Search Header */}
            <div className="bg-white border-b sticky top-0 z-30 shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex flex-col md:flex-row gap-3 max-w-4xl mx-auto">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Service (e.g. Massage)"
                                className="pl-9 bg-slate-50 border-slate-200"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <div className="relative flex-1">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Location (e.g. Makati)"
                                className="pl-9 bg-slate-50 border-slate-200"
                                value={locationTerm}
                                onChange={e => setLocationTerm(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <Button onClick={handleSearch} className="bg-eucalyptus hover:bg-eucalyptus/90 text-white">
                            Search
                        </Button>

                        {/* Mobile Filter Trigger */}
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline" className="md:hidden">
                                    <Filter className="h-4 w-4" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[300px]">
                                <div className="py-4">
                                    <h2 className="font-bold text-lg mb-4">Filters</h2>
                                    <SearchFilters filters={filters} onFilterChange={setFilters} />
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>

            <div className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
                <div className="flex gap-8">
                    {/* Desktop Sidebar */}
                    <aside className="hidden md:block w-64 flex-shrink-0 h-fit sticky top-24">
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                            <h2 className="font-bold text-lg mb-6 flex items-center gap-2">
                                <Filter className="h-4 w-4" /> Filters
                            </h2>
                            <SearchFilters filters={filters} onFilterChange={setFilters} />
                        </div>
                    </aside>

                    {/* Results Grid */}
                    <main className="flex-1">
                        <div className="mb-6 flex items-center justify-between">
                            <h1 className="text-xl font-bold text-slate-800">
                                {loading ? "Finding providers..." : `Found ${filteredProviders.length} results`}
                            </h1>
                            {/* Sort Dropdown could go here */}
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-80 bg-slate-200 rounded-2xl animate-pulse" />
                                ))}
                            </div>
                        ) : filteredProviders.length > 0 ? (
                            <ServiceGrid providers={filteredProviders} />
                        ) : (
                            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                                <div className="text-4xl mb-4">🔍</div>
                                <h3 className="text-lg font-bold text-slate-800">No providers found</h3>
                                <p className="text-slate-500 max-w-xs mx-auto mt-2">
                                    Try adjusting your filters or search for a different service.
                                </p>
                                <Button
                                    variant="link"
                                    className="mt-4 text-eucalyptus"
                                    onClick={() => setFilters({ minPrice: 0, maxPrice: 5000, minRating: 0, categories: [] })}
                                >
                                    Clear all filters
                                </Button>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            <Footer />
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <SearchPageContent />
        </Suspense>
    );
}
