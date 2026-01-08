"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface PassCalculatorProps {
    label: string;
    baseHourlyRate: number;
    initialTotal: number;
    initialSessions: number;
    onUpdate: (total: number, sessions: number) => void;
    recommendedSessions?: number;
}

export function PassCalculator({
    label,
    baseHourlyRate,
    initialTotal,
    initialSessions,
    onUpdate,
    recommendedSessions = 4
}: PassCalculatorProps) {
    // We keep local state for instant feedback and 4-way binding
    // Total and Sessions are the "Source of Truth" passed up.
    // Discount and PerSession are derived or drivers.

    const [sessions, setSessions] = useState(initialSessions || recommendedSessions);
    const [totalPrice, setTotalPrice] = useState(initialTotal);

    // Derived states (calculated on render or updated directly)
    // We use state for inputs to allow typing freely without jumping
    const [discountDisplay, setDiscountDisplay] = useState(0);
    const [perSessionDisplay, setPerSessionDisplay] = useState(0);

    // Initialize/Sync derived values when props change (or on mount)
    useEffect(() => {
        const derivedPerSession = sessions > 0 ? totalPrice / sessions : 0;
        const derivedDiscount = baseHourlyRate > 0
            ? Math.round((1 - (derivedPerSession / baseHourlyRate)) * 100)
            : 0;

        setPerSessionDisplay(Math.round(derivedPerSession));
        setDiscountDisplay(derivedDiscount);
    }, [totalPrice, sessions, baseHourlyRate]);


    // HANDLERS

    const handleSessionsChange = (val: string) => {
        const newSessions = parseInt(val) || 0;
        setSessions(newSessions);
        // Constraint: Keep DISCOUNT constant, update TOTAL
        // Formula: NewTotal = Hourly * NewSessions * (1 - Discount/100)
        // Calculating precisely from current discount display
        const multiplier = 1 - (discountDisplay / 100);
        const newTotal = Math.round(baseHourlyRate * newSessions * multiplier);

        setTotalPrice(newTotal);
        onUpdate(newTotal, newSessions);
    };

    const handleDiscountChange = (val: string) => {
        const newDiscount = parseFloat(val) || 0;
        setDiscountDisplay(newDiscount);
        // Constraint: Keep SESSIONS constant, update TOTAL
        // Formula: NewTotal = Hourly * Sessions * (1 - NewDiscount/100)
        const multiplier = 1 - (newDiscount / 100);
        const newTotal = Math.round(baseHourlyRate * sessions * multiplier);

        setTotalPrice(newTotal);
        // Also update per-session for display consistency immediately? (Effect will handle it but might lag slightly visually if we don't)
        onUpdate(newTotal, sessions);
    };

    const handleTotalChange = (val: string) => {
        const newTotal = parseInt(val) || 0;
        setTotalPrice(newTotal);
        // Constraint: Keep SESSIONS constant, update DISCOUNT
        // Effect handles the Calc
        onUpdate(newTotal, sessions);
    };

    const handlePerSessionChange = (val: string) => {
        const newPerSession = parseInt(val) || 0;
        setPerSessionDisplay(newPerSession);
        // Constraint: Keep SESSIONS constant, update TOTAL (which updates Discount)
        const newTotal = newPerSession * sessions;
        setTotalPrice(newTotal);
        onUpdate(newTotal, sessions);
    };

    return (
        <div className="space-y-3 p-4 bg-white/50 rounded-xl border border-slate-100">
            <div className="flex justify-between items-center">
                <Label className="text-base font-semibold text-slate-700">{label}</Label>
                <div className="text-xs text-muted-foreground">
                    Base: <span className="font-medium">₱{baseHourlyRate}/hr</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* ROW 1: Sessions & Discount */}
                <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Sessions</Label>
                    <Input
                        type="number"
                        min="1"
                        value={sessions}
                        onChange={(e) => handleSessionsChange(e.target.value)}
                        className="bg-white font-medium h-10 text-center"
                    />
                </div>

                <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Discount</Label>
                    <div className="relative">
                        <Input
                            type="number"
                            min="0"
                            max="100"
                            value={discountDisplay}
                            onChange={(e) => handleDiscountChange(e.target.value)}
                            className={`bg-white font-medium h-10 pr-8 text-right ${discountDisplay > 0 ? 'text-green-600' : ''}`}
                        />
                        <span className="absolute right-3 top-2.5 text-slate-400 text-xs font-bold">%</span>
                    </div>
                </div>

                {/* ROW 2: Price/Session & Total */}
                <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase text-slate-500 font-bold tracking-wider whitespace-nowrap">Price / Session</Label>
                    <div className="relative flex items-center">
                        <span className="absolute left-3 text-slate-400 text-sm font-medium">₱</span>
                        <Input
                            type="number"
                            value={perSessionDisplay}
                            onChange={(e) => handlePerSessionChange(e.target.value)}
                            className="bg-white pl-7 h-10 font-medium"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Total Price</Label>
                    <div className="relative flex items-center">
                        <span className="absolute left-3 text-eucalyptus text-sm font-medium">₱</span>
                        <Input
                            type="number"
                            value={totalPrice}
                            onChange={(e) => handleTotalChange(e.target.value)}
                            className="bg-slate-50 border-eucalyptus/30 font-bold text-eucalyptus pl-7 h-10"
                        />
                    </div>
                </div>
            </div>

            <div className="pt-1 text-center">
                <Badge variant="outline" className="bg-slate-50 font-normal text-slate-500 border-none px-2 py-0.5 h-auto text-[10px]">
                    {sessions} sessions @ ₱{perSessionDisplay} = ₱{totalPrice}
                </Badge>
            </div>
        </div>
    );
}
