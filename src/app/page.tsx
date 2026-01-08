"use client";

import { useState, useEffect } from "react";
import { ServiceGrid } from "@/components/feature/Home/ServiceGrid";
import { TherapistCard } from "@/components/feature/Therapist/TherapistCard";
import { ReservationModal } from "@/components/feature/Bookings/ReservationModal";
import { Therapist } from "@/lib/data";
import { getProviders } from "@/lib/api"; // Supabase API import
import { ServiceCategory, SERVICE_CATEGORIES } from "@/lib/services";
import { Button } from "@/components/ui/button";
import { SmartSearch } from "@/components/feature/Hero/SmartSearch";
import { calculateDistance } from "@/lib/geo";

export default function Home() {
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const [providers, setProviders] = useState<Therapist[]>([]); // Data from Supabase
  const [isLoading, setIsLoading] = useState(true); // Loading state

  // Fetch Providers on Mount
  useEffect(() => {
    const fetchHealthPros = async () => {
      setIsLoading(true);
      try {
        // REAL API FETCH (Database was updated via /api/update-data)
        const data = await getProviders();
        setProviders(data);

        // REMOVED MOCK DATA FALLBACK
        // const { MOCK_THERAPISTS } = await import("@/lib/data");
        // setProviders(MOCK_THERAPISTS);

      } catch (err) {
        console.error("Failed to fetch", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHealthPros();
  }, []);

  // Unified Booking State
  const [bookingState, setBookingState] = useState<{
    isOpen: boolean;
    therapist: any | null;
    initialServiceId?: string | null;
  }>({
    isOpen: false,
    therapist: null,
    initialServiceId: null
  });

  // Handlers
  const handleOpenBooking = (therapist: Therapist | null, serviceId?: string) => {
    setBookingState({
      isOpen: true,
      therapist: therapist,
      initialServiceId: serviceId
    });
  };

  // Search State
  const [searchFilters, setSearchFilters] = useState({
    service: "",
    location: "",
    coordinates: undefined as { lat: number; lng: number } | undefined
  });
  const [searchKey, setSearchKey] = useState(0);

  // New "Super App" State
  const [activeCategory, setActiveCategory] = useState<ServiceCategory | null>(null);
  const [activeSubServiceFilter, setActiveSubServiceFilter] = useState<string | null>(null);

  // 1. Initial Category Selection
  const handleCategorySelect = (category: ServiceCategory) => {
    if (activeCategory === category) {
      // Toggle off if clicking same category
      setActiveCategory(null);
      setActiveSubServiceFilter(null);
    } else {
      setActiveCategory(category);
      setActiveSubServiceFilter(null);

      // Smooth scroll to list
      setTimeout(() => {
        const element = document.getElementById('providers-list');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  // 2. Filter Logic
  const filteredProviders = providers.filter((therapist) => {
    // A. Advanced Search Filter (Service Type)
    if (searchFilters.service) {
      const searchService = searchFilters.service.toLowerCase();

      // 1. Direct Match (Name, Tags, Specialties)
      const directMatch =
        therapist.name.toLowerCase().includes(searchService) ||
        therapist.tags.some(t => t.toLowerCase().includes(searchService)) ||
        therapist.specialties.some(s => s.toLowerCase().includes(searchService));

      // 2. Metadata Match (Check if search term matches a Service Category or SubService)
      let metadataMatch = false;

      // Find categories where the Title, Description, or any Sub-Service matches the query
      const matchedCategories = SERVICE_CATEGORIES.filter(cat => {
        const catMatch =
          cat.title.toLowerCase().includes(searchService) ||
          cat.description.toLowerCase().includes(searchService);

        const subMatch = cat.subServices.some(sub =>
          sub.title.toLowerCase().includes(searchService) ||
          sub.description.toLowerCase().includes(searchService)
        );

        return catMatch || subMatch;
      }).map(c => c.id);

      // If the therapist belongs to one of the matched categories
      if (matchedCategories.includes(therapist.category)) {
        metadataMatch = true;
      }

      if (!directMatch && !metadataMatch) return false;
    }

    // B. Category Filter (Legacy/Super App)
    if (activeCategory && !therapist.tags.includes(activeCategory)) return false;

    // C. Sub-Service/Tag Filter (Granular Search)
    if (activeSubServiceFilter) {
      const hasTag = therapist.tags.some(t => t.toLowerCase().includes(activeSubServiceFilter.toLowerCase()));
      const hasSpecialty = therapist.specialties.some(s => s.toLowerCase().includes(activeSubServiceFilter.toLowerCase()));
      if (!hasTag && !hasSpecialty) return false;
    }

    // D. Location Filter (Distance or Text)
    if (searchFilters.coordinates && therapist.location) {
      // GPS Search: < 5km radius
      const distance = calculateDistance(
        searchFilters.coordinates.lat,
        searchFilters.coordinates.lng,
        therapist.location.lat,
        therapist.location.lng
      );
      if (distance > 5) return false;
    } else if (searchFilters.location) {
      // Text Search
      const locSearch = searchFilters.location.toLowerCase();

      // If provider has no location, exclude them when searching by location
      if (!therapist.location) return false;

      // Check if location name matches
      if (!therapist.location.name.toLowerCase().includes(locSearch)) {
        return false;
      }
    }

    return true;
  });

  // Sort by Distance if GPS is active
  if (searchFilters.coordinates) {
    filteredProviders.sort((a, b) => {
      if (!a.location || !b.location) return 0;
      const distA = calculateDistance(searchFilters.coordinates!.lat, searchFilters.coordinates!.lng, a.location.lat, a.location.lng);
      const distB = calculateDistance(searchFilters.coordinates!.lat, searchFilters.coordinates!.lng, b.location.lat, b.location.lng);
      return distA - distB;
    });
  }

  // 3. Handle Booking Click
  const handleProviderBook = (therapist: Therapist) => {
    // PROACTIVELY OPEN THE UNIFIED MODAL
    handleOpenBooking(therapist, activeCategory || undefined);
  };

  // Get Sub-Services for the active category to show as filter chips
  const activeCategoryDef = SERVICE_CATEGORIES.find(c => c.id === activeCategory);
  const subServices = activeCategoryDef ? activeCategoryDef.subServices : [];

  // Search Handler (Fixes type mismatch)
  const handleSearch = (filters: { service: string; location: string; coordinates?: { lat: number; lng: number } }) => {
    setSearchFilters({
      service: filters.service,
      location: filters.location,
      coordinates: filters.coordinates
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-sand/10">

      {/* 1. New "Super App" Grid */}
      {/* DEBUGGER REMOVED */}

      <div className="bg-white pb-8 pt-4 rounded-b-[2rem] shadow-sm relative z-10">

        <header className="container mx-auto px-4 mb-6 pt-4">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-center gap-4 mb-6">
            <div className="text-center md:text-left">
              <h1 className="text-2xl font-bold text-eucalyptus">PH Home Service</h1>
              <p className="text-muted-foreground">Siargao's Premium Home Services.</p>
            </div>
            {/* Unified Search Integration */}
            <div className="w-full md:w-auto md:min-w-[400px]">
              <SmartSearch key={searchKey} onSearch={handleSearch} />
            </div>
          </div>
        </header>
        <ServiceGrid onSelectCategory={handleCategorySelect} />
      </div>

      {/* 2. Provider List Section */}
      {(activeCategory || searchFilters.service) && (
        <section id="providers-list" className="container mx-auto px-4 py-8 min-h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-700">

          {/* Header & Controls */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {activeCategory ? `${activeCategoryDef?.title} Specialists` : "Search Results"}
              </h2>
              <p className="text-sm text-muted-foreground">
                Found {filteredProviders.length} professionals{activeCategory ? ` for ${activeCategoryDef?.title}` : ""}
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveCategory(null)}
              className="self-start md:self-auto"
            >
              ← All Services
            </Button>
          </div>

          {/* Granular Search Chips */}
          {subServices.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8 animate-in fade-in slide-in-from-top-4">
              {subServices.map((sub) => {
                // We match sub-service titles to tags loosely for this demo
                const isSelected = activeSubServiceFilter === sub.title;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setActiveSubServiceFilter(isSelected ? null : sub.title)}
                    className={`
                      px-4 py-2 rounded-full text-sm font-medium transition-all border
                      ${isSelected
                        ? 'bg-eucalyptus text-white border-eucalyptus shadow-md'
                        : 'bg-white text-muted-foreground border-border hover:border-eucalyptus/50 hover:bg-eucalyptus/5'
                      }
                    `}
                  >
                    {sub.title}
                  </button>
                );
              })}
            </div>
          )}

          {/* The Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-[400px] rounded-2xl bg-gray-100/50 animate-pulse border border-border/50" />
              ))}
            </div>
          ) : filteredProviders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
              {filteredProviders.map((therapist) => {
                // Calculate distance for display
                let distanceDisplay = undefined;
                if (searchFilters.coordinates && therapist.location) {
                  const dist = calculateDistance(
                    searchFilters.coordinates.lat,
                    searchFilters.coordinates.lng,
                    therapist.location.lat,
                    therapist.location.lng
                  );
                  distanceDisplay = `${dist} km`;
                }

                return (
                  <TherapistCard
                    key={therapist.id}
                    {...therapist}
                    distance={distanceDisplay}
                    onBook={() => handleProviderBook(therapist)}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-white/50 rounded-2xl border border-dashed">
              <p className="text-muted-foreground">No providers found for this specific filter.</p>
              <Button variant="link" onClick={() => {
                setActiveSubServiceFilter(null);
                setSearchFilters({ service: "", location: "", coordinates: undefined });
                setSearchKey(prev => prev + 1);
              }} className="mt-2 text-eucalyptus">
                Clear filters
              </Button>
            </div>
          )}
        </section>
      )}

      {/* 3. Universal Booking Modal */}
      <ReservationModal
        open={bookingState.isOpen}
        onOpenChange={(open) => setBookingState(prev => ({ ...prev, isOpen: open }))}
        therapist={bookingState.therapist}
        initialServiceId={bookingState.initialServiceId}
      />
    </div>
  );
}
