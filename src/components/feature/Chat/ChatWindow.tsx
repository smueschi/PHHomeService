"use client";

import { useEffect, useState, useRef } from "react";
import { Message } from "@/lib/data";
import { getConversation, sendMessage, markMessagesAsRead } from "@/lib/api";
import { sendNewMessageNotification } from "@/lib/email";
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
    otherUserEmail?: string; // New prop
    onClose?: () => void;
    variant?: "popup" | "fullscreen";
    className?: string;
}

export function ChatWindow({ otherUserId, otherUserName, otherUserImage, otherUserEmail, onClose, variant = "popup", className }: ChatWindowProps) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Initial Fetch
    useEffect(() => {
        if (!user || !otherUserId) {
            setIsLoading(false);
            return;
        }

        const loadMessages = async () => {
            setIsLoading(true);
            try {
                const data = await getConversation(user.id, otherUserId);
                // Cast to Message[] if types don't align perfectly from API (due to 'any' in filter)
                setMessages(Array.isArray(data) ? data as Message[] : []);

                // Mark as read
                if (data && data.length > 0) {
                    markMessagesAsRead(otherUserId, user.id);
                }
            } catch (err) {
                console.error("Failed to load conversation", err);
                setMessages([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadMessages();
    }, [user, otherUserId]);

    // ... (rest of useEffects)

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

            // Replace temp message with real one
            setMessages(prev => prev.map(m => m.id === tempMsg.id ? (sentMsg as Message) : m));

            // Send Email Notification (Fire and Forget)
            if (otherUserEmail) {
                // Determine 'From' name (Use user's name from auth metadata or context if available, fallback to "User")
                const fromName = user.user_metadata?.full_name || "A User";

                // We import this function dynamically or assumes it's imported at top.
                // It was not imported yet. I need to make sure I import it.
                // Assuming I will add the import in a separate edit or use full path if possible? 
                // No, I must import it.
                // For now, let's assume I will add `import { sendNewMessageNotification } from "@/lib/email";`

                // NOTE: I cannot add import in this block easily without hitting top of file. 
                // I will add the import in a subsequent step.
                sendNewMessageNotification(otherUserEmail, fromName, tempMsg.content).catch(err => console.error("Email trigger failed", err));
            }

        } catch (error) {
            console.error("Failed to send", error);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <Card className={cn(
            "flex flex-col shadow-2xl border-slate-200 z-50 bg-white overflow-hidden",
            variant === "popup"
                ? "fixed bottom-4 right-4 w-80 md:w-96 h-[500px]"
                : "flex-1 w-full border-none shadow-none rounded-none", // Changed relative to flex-1 to fill parent, removed h-full to avoid overflow
            className
        )}>
            {/* Header */}
            <div className={cn(
                "p-3 border-b flex items-center justify-between bg-eucalyptus text-white shrink-0",
                variant === "popup" ? "rounded-t-xl" : ""
            )}>
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
            <div className="p-3 border-t bg-white shrink-0">
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
