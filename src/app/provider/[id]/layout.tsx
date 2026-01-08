import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export default function ProviderLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-sand/10 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-eucalyptus" />
            </div>
        }>
            {children}
        </Suspense>
    );
}
