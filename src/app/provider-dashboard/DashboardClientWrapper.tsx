"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// This component handles the client-side only rendering
const DashboardContent = dynamic(() => import("./DashboardContent"), {
    ssr: false,
    loading: () => (
        <div className="flex flex-col items-center justify-center min-h-screen bg-sand/10">
            <Loader2 className="h-8 w-8 animate-spin text-eucalyptus mb-4" />
            <p className="text-muted-foreground font-medium">Loading Dashboard...</p>
        </div>
    )
});

export default function DashboardClientWrapper() {
    return <DashboardContent />;
}
