"use client";

import { useEffect, useState, useRef } from "react";
import { Message } from "@/lib/data";
import { getConversation, sendMessage, markMessagesAsRead } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Send, X, MessageCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatWindowProps {
    otherUserId: string; // The person we are chatting with
    otherUserName: string;
    otherUserImage?: string;
    onClose?: () => void;
}

export function ChatWindow({ otherUserId, otherUserName, otherUserImage, onClose }: ChatWindowProps) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Initial Fetch
    useEffect(() => {
        if (!user || !otherUserId) return;

        const loadMessages = async () => {
            setIsLoading(true);
            const data = await getConversation(user.id, otherUserId);
            // Cast to Message[] if types don't align perfectly from API (due to 'any' in filter)
            setMessages(data as Message[]);
            setIsLoading(false);

            // Mark as read
            markMessagesAsRead(otherUserId, user.id);
        };

        loadMessages();
    }, [user, otherUserId]);

    // Realtime Subscription
    useEffect(() => {
        if (!user || !otherUserId) return;

        console.log("Setting up subscription for chat...");
        const channel = supabase
            .channel(`chat:${user.id}-${otherUserId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `receiver_id=eq.${user.id}`
                    // Note: Supabase filter might need to be broad if simpler
                    // But ideally we listen for messages sent TO me OR BY me (though local state handles sent)
                    // Let's rely on filter for incoming
                },
                (payload) => {
                    console.log("Realtime message received:", payload);
                    const newMsg = payload.new as Message;
                    if (newMsg.sender_id === otherUserId) {
                        setMessages((prev) => [...prev, newMsg]);
                        markMessagesAsRead(otherUserId, user.id);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, otherUserId]);

    // Construct the channel properly? Actually, a simple 'messages' channel with a filter on INSERT
    // is often easier. If we want to see OUR own messages from another tab, we should listen to all messages
    // involving us.
    // For now, let's optimize for receiving messages.

    // Scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!newMessage.trim() || !user) return;
        setIsSending(true);
        try {
            // Optimistic update
            const tempMsg: Message = {
                id: `temp-${Date.now()}`,
                sender_id: user.id,
                receiver_id: otherUserId,
                content: newMessage,
                created_at: new Date().toISOString(),
                is_read: false
            };
            setMessages(prev => [...prev, tempMsg]);
            setNewMessage("");

            const sentMsg = await sendMessage(tempMsg.content, user.id, otherUserId);

            // Replace temp message with real one (re-fetch not strictly needed if we trust return)
            setMessages(prev => prev.map(m => m.id === tempMsg.id ? (sentMsg as Message) : m));

        } catch (error) {
            console.error("Failed to send", error);
            // Optionally remove the temp message or show error
        } finally {
            setIsSending(false);
        }
    };

    return (
        <Card className="fixed bottom-4 right-4 w-80 md:w-96 h-[500px] flex flex-col shadow-2xl border-slate-200 z-50 bg-white">
            {/* Header */}
            <div className="p-3 border-b flex items-center justify-between bg-eucalyptus text-white rounded-t-xl">
                <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8 border-2 border-white/20">
                        <AvatarImage src={otherUserImage} />
                        <AvatarFallback>{otherUserName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-semibold text-sm">{otherUserName}</h3>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
                            <span className="text-[10px] opacity-80">Online</span>
                        </div>
                    </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={onClose}>
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50" ref={scrollRef}>
                {isLoading ? (
                    <div className="flex justify-center items-center h-full text-slate-400">
                        <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center text-slate-400 text-sm mt-10">
                        <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-20" />
                        <p>No messages yet.</p>
                        <p className="text-xs">Say hi to {otherUserName}!</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.sender_id === user?.id;
                        return (
                            <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                                <div className={cn(
                                    "max-w-[75%] px-4 py-2 rounded-2xl text-sm",
                                    isMe
                                        ? "bg-eucalyptus text-white rounded-br-none"
                                        : "bg-white border text-slate-700 rounded-bl-none shadow-sm"
                                )}>
                                    {msg.content}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Input */}
            <div className="p-3 border-t bg-white">
                <form
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    className="flex gap-2"
                >
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1"
                        disabled={isSending}
                    />
                    <Button type="submit" size="icon" disabled={!newMessage.trim() || isSending} className="bg-eucalyptus hover:bg-eucalyptus/90">
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </Card>
    );
}
