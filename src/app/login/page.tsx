"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Leaf, Lock, Mail } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            alert(error.message);
            setIsLoading(false);
            return;
        }

        if (data.user) {
            // Success!
            // Fetch role to determine redirection
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', data.user.id)
                .single();

            if (profile?.role === 'provider') {
                router.push("/provider-dashboard");
            } else {
                router.push("/profile");
            }
        }
    };

    return (
        <div className="min-h-screen bg-sand/20 flex flex-col items-center justify-center p-4">
            <div className="mb-8 flex flex-col items-center">
                <div className="h-12 w-12 bg-eucalyptus rounded-xl flex items-center justify-center mb-4 text-white shadow-lg">
                    <Leaf className="h-7 w-7" />
                </div>
                <h1 className="text-3xl font-bold text-eucalyptus tracking-tight">PH Home Service</h1>
                <p className="text-muted-foreground mt-2">Service Provider Portal</p>
            </div>

            <Card className="w-full max-w-md p-8 rounded-3xl border-none shadow-xl bg-white/80 backdrop-blur-sm">
                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground ml-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                            <Input
                                type="email"
                                placeholder="name@example.com"
                                className="pl-10 h-12 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-eucalyptus"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                            <Input
                                type="password"
                                placeholder="••••••••"
                                className="pl-10 h-12 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-eucalyptus"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-12 rounded-xl bg-eucalyptus hover:bg-eucalyptus/90 text-lg font-semibold shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
                        disabled={isLoading}
                    >
                        {isLoading ? "Logging in..." : "Access Dashboard"}
                    </Button>

                    <div className="text-center text-sm text-muted-foreground pt-2 space-y-2">
                        <a href="#" className="hover:text-eucalyptus transition-colors block">Forgot your password?</a>
                        <div className="border-t pt-4 mt-4">
                            <p className="text-xs text-muted-foreground mb-2">Quick Login (Testing):</p>
                            <div className="pt-2 grid grid-cols-2 gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full text-xs h-8"
                                    onClick={() => { setEmail("maria@demo.com"); setPassword("password123"); }}
                                >
                                    Massage (Maria)
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full text-xs h-8"
                                    onClick={() => { setEmail("glam@demo.com"); setPassword("password123"); }}
                                >
                                    Beauty (Glam)
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full text-xs h-8"
                                    onClick={() => { setEmail("cleaning@demo.com"); setPassword("password123"); }}
                                >
                                    Cleaning (Siargao)
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full text-xs h-8"
                                    onClick={() => { setEmail("rose@demo.com"); setPassword("password123"); }}
                                >
                                    Nanny (Rose)
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full text-xs h-8"
                                    onClick={() => { setEmail("marco@demo.com"); setPassword("password123"); }}
                                >
                                    Chef (Marco)
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full text-xs h-8"
                                    onClick={() => { setEmail("coolbreeze@demo.com"); setPassword("password123"); }}
                                >
                                    Aircon (Cool)
                                </Button>
                            </div>
                            <p className="text-[10px] text-center text-slate-400 mt-2">
                                Click to auto-fill credentials. Password is 'password123'.
                            </p>
                            <div className="mt-4 pt-2 border-t">
                                <button
                                    type="button"
                                    className="text-[10px] text-eucalyptus hover:underline w-full text-center"
                                    onClick={async () => {
                                        const users = [
                                            { e: "maria@demo.com", p: "password123" },
                                            { e: "elena@demo.com", p: "password123" },
                                            { e: "joy@demo.com", p: "password123" },
                                            { e: "rico@demo.com", p: "password123" },
                                            { e: "glam@demo.com", p: "password123" },
                                            { e: "glow@demo.com", p: "password123" },
                                            { e: "cleaning@demo.com", p: "password123" },
                                            { e: "eco@demo.com", p: "password123" },
                                            { e: "coolbreeze@demo.com", p: "password123" },
                                            { e: "arctic@demo.com", p: "password123" },
                                            { e: "marco@demo.com", p: "password123" },
                                            { e: "green@demo.com", p: "password123" },
                                            { e: "rose@demo.com", p: "password123" },
                                            { e: "grace@demo.com", p: "password123" },
                                        ];
                                        if (!confirm("Create 14 mock accounts in Supabase?")) return;

                                        for (const u of users) {
                                            const { error } = await supabase.auth.signUp({ email: u.e, password: u.p });
                                            if (error) console.error(`Failed to create ${u.e}:`, error.message);
                                            else console.log(`Created/Found ${u.e}`);
                                        }
                                        alert("Demo accounts initialization attempted. Try logging in now.");
                                    }}
                                >
                                    Initialize Demo Accounts (Run Once)
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </Card>

            <p className="mt-8 text-center text-sm text-muted-foreground">
                Not a partner yet? <a href="/join" className="font-semibold text-eucalyptus hover:underline">Apply to Join</a>
            </p>
        </div>
    );
}
