"use client";

import { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ConversationListProps {
    bookings: any[]; // Using bookings as source of truth for now
    activeChatId: string | null;
    onSelectUser: (user: { id: string; name: string; image?: string; email?: string }) => void;
}

export function ConversationList({ bookings, activeChatId, onSelectUser }: ConversationListProps) {

    // Derive unique clients from bookings
    const clients = useMemo(() => {
        const unique = new Map();
        bookings.forEach(b => {
            const client = b.customer;
            // Use a stable ID if available, else email
            const id = (b as any).user_id || client.email;
            if (id && !unique.has(id)) {
                unique.set(id, {
                    id,
                    name: client.name || "Unknown Client",
                    image: client.image, // unlikely to have this yet, but good for future
                    email: client.email,
                    lastBookingDate: b.date
                });
            }
        });
        return Array.from(unique.values());
    }, [bookings]);

    return (
        <Card className="h-[600px] flex flex-col border-none shadow-sm bg-white rounded-2xl overflow-hidden">
            <div className="p-4 border-b">
                <h3 className="font-bold text-lg mb-2">Messages</h3>
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search clients..." className="pl-9 bg-slate-50 border-none" />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {clients.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                        <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-20" />
                        <p className="text-sm">No recent clients found.</p>
                    </div>
                ) : (
                    clients.map(client => (
                        <button
                            key={client.id}
                            onClick={() => onSelectUser(client)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group
                                ${activeChatId === client.id
                                    ? "bg-eucalyptus/10 ring-1 ring-eucalyptus/20"
                                    : "hover:bg-slate-50"
                                }
                            `}
                        >
                            <Avatar className="h-10 w-10 border border-slate-100 group-hover:border-eucalyptus/30 transition-colors">
                                <AvatarImage src={client.image} />
                                <AvatarFallback className="bg-slate-100 text-slate-600 font-medium">
                                    {client.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 overflow-hidden">
                                <div className="flex justify-between items-center mb-0.5">
                                    <span className="font-semibold text-sm truncate text-slate-900">
                                        {client.name}
                                    </span>
                                    {/* <span className="text-[10px] text-muted-foreground">2m ago</span> */}
                                </div>
                                <p className="text-xs text-muted-foreground truncate">
                                    Tap to start chatting
                                </p>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </Card>
    );
}
