"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CategoryRequest } from "@/lib/data";
import { getCategoryRequests, approveRequest, updateRequestStatus } from "@/lib/api"; // Supabase API
import { SERVICE_CATEGORIES } from "@/lib/services";
import { Check, X, ShieldAlert, User, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function AdminDashboard() {
    // Local state for requests
    const [requests, setRequests] = useState<CategoryRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch Requests
    const fetchRequests = async () => {
        setIsLoading(true);
        const data = await getCategoryRequests();
        setRequests(data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleApprove = async (reqId: string) => {
        const request = requests.find(r => r.id === reqId);
        if (!request) return;

        try {
            await approveRequest(request);
            alert(`Request approved for ${request.providerName}!`);
            fetchRequests(); // Re-fetch to update UI
        } catch (err) {
            console.error("Approval failed", err);
            alert("Failed to approve request. See console.");
        }
    };

    const handleReject = async (reqId: string) => {
        try {
            await updateRequestStatus(reqId, 'rejected');
            fetchRequests();
        } catch (err) {
            console.error("Rejection failed", err);
        }
    };

    const pendingRequests = requests.filter(r => r.status === "pending");

    if (isLoading) {
        return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ShieldAlert className="h-6 w-6 text-emerald-400" />
                        <h1 className="text-xl font-bold">PH Home Service <span className="text-slate-400 font-normal">| Admin Panel</span></h1>
                    </div>
                    <Button variant="ghost" size="icon" asChild className="text-slate-400 hover:text-white hover:bg-slate-800">
                        <Link href="/">
                            <LogOut className="h-5 w-5" />
                        </Link>
                    </Button>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8 max-w-5xl">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-900">Service Category Requests</h2>
                    <p className="text-slate-500">Manage provider requests to offer new service categories.</p>
                </div>

                {pendingRequests.length === 0 ? (
                    <Card className="p-12 flex flex-col items-center justify-center text-center bg-white border-dashed">
                        <div className="bg-slate-100 p-4 rounded-full mb-4">
                            <Check className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">No Pending Requests</h3>
                        <p className="text-slate-500 max-w-sm mt-2">All caught up! New requests from providers will appear here.</p>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {pendingRequests.map((req) => {
                            const cat = SERVICE_CATEGORIES.find(c => c.id === req.requestedCategory);
                            return (
                                <Card key={req.id} className="p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center border">
                                                <User className="h-6 w-6 text-slate-500" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-lg text-slate-900">{req.providerName}</h3>
                                                    <Badge variant="outline" className="text-slate-500">ID: {req.providerId}</Badge>
                                                </div>
                                                <p className="text-sm text-slate-500 mt-1">
                                                    Wants to add: <strong className="text-slate-900 bg-slate-100 px-2 py-0.5 rounded ml-1">{cat?.title || req.requestedCategory}</strong>
                                                </p>

                                                {/* Detailed Request Info */}
                                                {(req.experienceYears || (req.requestedSubServices && req.requestedSubServices.length > 0)) && (
                                                    <div className="mt-3 text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                        {req.experienceYears && (
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-slate-400 text-xs uppercase font-bold tracking-wider">Experience:</span>
                                                                <span className="font-medium text-slate-700">{req.experienceYears}</span>
                                                            </div>
                                                        )}
                                                        {req.requestedSubServices && req.requestedSubServices.length > 0 && (
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-slate-400 text-xs uppercase font-bold tracking-wider">Services:</span>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {req.requestedSubServices.map(subId => {
                                                                        const subTitle = cat?.subServices.find(s => s.id === subId)?.title || subId;
                                                                        return (
                                                                            <span key={subId} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-xs text-slate-600">
                                                                                {subTitle}
                                                                            </span>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                                                    <span>Requested on: {req.date}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <Button size="sm" onClick={() => handleApprove(req.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white w-32">
                                                <Check className="w-4 h-4 mr-2" /> Approve
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={() => handleReject(req.id)} className="w-32 text-red-600 border-red-200 hover:bg-red-50">
                                                <X className="w-4 h-4 mr-2" /> Reject
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
