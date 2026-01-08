"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";

export function Header() {
    const { user } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [userRole, setUserRole] = useState<"provider" | "user" | null>(null);

    useEffect(() => {
        const fetchRole = async () => {
            if (!user) {
                setUserRole(null);
                return;
            }
            try {
                const { data, error } = await supabase
                    .from("profiles")
                    .select("role")
                    .eq("id", user.id)
                    .single();

                if (data) {
                    setUserRole(data.role as "provider" | "user");
                }
            } catch (err) {
                console.error("Error fetching user role:", err);
            }
        };

        fetchRole();
    }, [user]);

    const handleNavClick = () => {
        setIsMobileMenuOpen(false);
        // Instant scroll to top to ensure we start fresh
        window.scrollTo({ top: 0, behavior: "auto" });
    };

    return (

        <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
            <div className="container mx-auto flex h-24 items-center px-4 relative">
                {/* Logo - Absolute Left or Flex */}
                <Link
                    href="/"
                    className="flex-shrink-0 flex items-center gap-3 z-20"
                    onClick={handleNavClick}
                >
                    {/* Logo - mix-blend-multiply ensures white background disappears on the white header */}
                    <img src="/logo_ph_home.png" alt="PH Home Service" className="h-20 w-auto object-contain" />
                </Link>

                {/* DESKTOP NAV - CENTERED */}
                <div className="hidden md:flex absolute inset-x-0 top-0 h-full items-center justify-center pointer-events-none">
                    <nav className="flex items-center gap-8 text-lg font-medium text-slate-600 pointer-events-auto">
                        <Link href="/" className="hover:text-eucalyptus transition-colors" onClick={handleNavClick}>
                            Our Services
                        </Link>
                        <Link href="/join" className="hover:text-eucalyptus transition-colors" onClick={handleNavClick}>
                            Join as Pro
                        </Link>
                        {user ? (
                            <Link href="/profile" className="hover:text-eucalyptus transition-colors flex items-center gap-2" onClick={handleNavClick}>
                                <User className="w-5 h-5" />
                                Profile
                            </Link>
                        ) : (
                            <Link href="/login" className="hover:text-eucalyptus transition-colors" onClick={handleNavClick}>
                                Login
                            </Link>
                        )}

                    </nav>
                </div>

                {/* ACTIONS - RIGHT ALIGNED (Spacer for now if needed, or just mobile trigger) */}
                <div className="ml-auto flex items-center gap-2 z-20">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        <span className="sr-only">Menu</span>
                    </Button>
                </div>
            </div>

            {/* MOBILE MENU OVERLAY */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 top-24 bg-white z-50 p-6 animate-in slide-in-from-right-10 flex flex-col items-end text-right shadow-2xl">
                    <nav className="flex flex-col gap-6 text-xl font-bold text-slate-800 w-full">
                        <Link href="/" className="hover:text-eucalyptus py-2 border-b border-gray-100" onClick={handleNavClick}>
                            Our Services
                        </Link>
                        <Link href="/join" className="hover:text-eucalyptus py-2 border-b border-gray-100" onClick={handleNavClick}>
                            Join as Pro
                        </Link>
                        {user ? (
                            <Link href="/profile" className="hover:text-eucalyptus py-2 border-b border-gray-100 flex items-center gap-2" onClick={handleNavClick}>
                                <User className="w-5 h-5" />
                                Profile
                            </Link>
                        ) : (
                            <Link href="/login" className="hover:text-eucalyptus py-2 border-b border-gray-100" onClick={handleNavClick}>
                                Login
                            </Link>
                        )}

                        <div className="pt-4 flex flex-col gap-4 text-base font-normal text-muted-foreground">
                            <Link href="/privacy" onClick={handleNavClick}>Privacy Policy</Link>
                            <Link href="/terms" onClick={handleNavClick}>Terms of Service</Link>
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}
