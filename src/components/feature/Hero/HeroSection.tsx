interface HeroSectionProps {
    onSearch: (filters: { service: string; location: string }) => void;
}

export default function HeroSection({ onSearch }: HeroSectionProps) {
    return (
        <section className="relative w-full py-12 md:py-24 lg:py-32 bg-background flex flex-col items-center justify-center text-center overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 inset-x-0 h-64 bg-linear-to-b from-eucalyptus/5 to-transparent pointer-events-none" />
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-sand/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-eucalyptus/10 rounded-full blur-3xl pointer-events-none" />

            <div className="container px-4 md:px-6 relative z-10 space-y-8">
                <div className="space-y-4 max-w-3xl mx-auto">
                    <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl text-foreground">
                        Relaxation Delivered <br className="hidden sm:inline" />
                        <span className="text-eucalyptus">to Your Doorstep.</span>
                    </h1>
                    <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                        Experience professional massage therapy in the comfort of your home. Trusted, verified, and safe.
                    </p>
                </div>

                {/* SMART SEARCH COMPONENT */}
                <div className="w-full max-w-2xl mx-auto">
                    <SmartSearch onSearch={onSearch} />
                </div>
            </div>
        </section>
    );
}

import { SmartSearch } from "./SmartSearch";
