
"use client";

import { SERVICE_CATEGORIES, ServiceCategory } from "@/lib/services";
import { cn } from "@/lib/utils";

interface ServiceGridProps {
    onSelectCategory: (category: ServiceCategory) => void;
}

export function ServiceGrid({ onSelectCategory }: ServiceGridProps) {
    return (
        <section className="container mx-auto px-4 py-8">
            <h2 className="text-4xl font-black text-center mb-10 text-eucalyptus tracking-tight">Our Services</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {SERVICE_CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => onSelectCategory(cat.id as ServiceCategory)}
                            className={cn(
                                "flex flex-col items-center justify-center p-8 rounded-3xl transition-all hover:scale-105 active:scale-95 text-center shadow-sm border border-transparent hover:border-eucalyptus/20 hover:shadow-lg bg-white",
                                cat.color
                            )}
                        >
                            <div className="mb-5 p-4 bg-white/80 rounded-full backdrop-blur-md shadow-sm">
                                <Icon className="w-10 h-10" />
                            </div>
                            <h3 className="font-bold text-xl md:text-2xl mb-2 text-slate-800">{cat.title}</h3>
                            <p className="text-sm md:text-base opacity-90 leading-relaxed font-medium">{cat.description}</p>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}
