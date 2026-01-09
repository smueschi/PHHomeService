"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAllPendingRequests, adminApproveRequest, adminRejectRequest, getAllProfiles, updateUserRole, getProviderProfile, adminAddCredits } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserCog, User, Lock, Loader2, ShieldAlert, CheckCircle2, XCircle, Coins } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

export default function AdminDashboard() {
    const router = useRouter();
    const { user: authUser, isLoading: authLoading } = useAuth();
    const [requests, setRequests] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [checkingRole, setCheckingRole] = useState(true);

    useEffect(() => {
        const checkRole = async () => {
            if (!authLoading) {
                if (!authUser) {
                    router.push("/login?redirect=/admin");
                    return;
                }

                try {
                    const profile = await getProviderProfile(authUser.id);
                    if (profile?.role === 'admin') {
                        setIsAdmin(true);
                        setIsLoading(true);
                        // Fetch all data
                        const [reqData, userData] = await Promise.all([
                            getAllPendingRequests(),
                            getAllProfiles()
                        ]);
                        setRequests(reqData);
                        setUsers(userData);
                        setIsLoading(false);
                    } else {
                        setIsAdmin(false);
                    }
                } catch (e) {
                    console.error("Role check failed", e);
                    setIsAdmin(false);
                } finally {
                    setCheckingRole(false);
                }
            }
        };
        checkRole();
    }, [authUser, authLoading, router]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [reqData, userData] = await Promise.all([
                getAllPendingRequests(),
                getAllProfiles()
            ]);
            setRequests(reqData);
            setUsers(userData);
            setUsers(userData);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddCredits = async (providerId: string) => {
        const amountStr = prompt("Enter credits to add (e.g., 5, 10, 50):", "10");
        if (!amountStr) return;
        const amount = parseInt(amountStr);
        if (isNaN(amount) || amount <= 0) {
            alert("Invalid amount");
            return;
        }

        try {
            await adminAddCredits(providerId, amount);
            alert(`Successfully added ${amount} credits.`);
            fetchData();
        } catch (e) {
            console.error(e);
            alert("Failed to add credits.");
        }
    };

    const handleApprove = async (req: any) => {
        if (!confirm(`Approve ${req.providerName}?`)) return;
        try {
            await adminApproveRequest(req.id, req.providerId, req.requestedCategory, req.requestedSubServices);
            alert("Approved!");
            fetchData();
        } catch (e) {
            alert("Failed.");
        }
    };

    const handleReject = async (reqId: string) => {
        if (!confirm("Reject?")) return;
        try {
            await adminRejectRequest(reqId);
            alert("Rejected.");
            fetchData();
        } catch (e) {
            alert("Failed.");
        }
    };

    const handleRoleChange = async (userId: string, newRole: 'admin' | 'provider' | 'user') => {
        if (!confirm(`Change role to ${newRole}?`)) return;
        try {
            await updateUserRole(userId, newRole);
            alert("Role Updated!");
            fetchData();
        } catch (e) {
            console.error(e);
            alert("Failed to update role.");
        }
    };

    if (checkingRole || authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>;

    if (!isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <Card className="w-full max-w-sm text-center">
                    <CardHeader className="flex flex-col items-center">
                        <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-2">
                            <Lock className="h-6 w-6 text-red-600" />
                        </div>
                        <CardTitle>Access Denied</CardTitle>
                        <CardDescription>You do not have permission to view this page.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full" onClick={() => router.push("/login")}>Back to Login</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Admin Dashboard</h1>
                        <p className="text-slate-500">Manage provider applications and platform users.</p>
                    </div>
                    <Button variant="outline" onClick={() => router.push("/")}>Exit Admin</Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                            <ShieldAlert className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{requests.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <UserIcon className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{users.length}</div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="requests" className="w-full">
                    <TabsList>
                        <TabsTrigger value="requests">Requests</TabsTrigger>
                        <TabsTrigger value="users">User Management</TabsTrigger>
                    </TabsList>

                    <TabsContent value="requests">
                        <Card>
                            <CardHeader>
                                <CardTitle>Service Expansion Requests</CardTitle>
                                <CardDescription>Providers applying to add new service categories.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>
                                ) : requests.length === 0 ? (
                                    <div className="text-center p-8 text-slate-500">No pending requests found.</div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Provider</TableHead>
                                                <TableHead>Category</TableHead>
                                                <TableHead>Experience</TableHead>
                                                <TableHead>Sub-Services</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {requests.map((req) => (
                                                <TableRow key={req.id}>
                                                    <TableCell className="font-medium">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-8 w-8">
                                                                <AvatarImage src={req.providerImage} />
                                                                <AvatarFallback>{req.providerName[0]}</AvatarFallback>
                                                            </Avatar>
                                                            {req.providerName}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell><Badge variant="outline">{req.requestedCategory}</Badge></TableCell>
                                                    <TableCell>{req.experienceYears}</TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-wrap gap-1">
                                                            {req.requestedSubServices.map((s: string) => (
                                                                <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                                                            ))}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground text-sm">{req.date}</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50" onClick={() => handleReject(req.id)}><XCircle className="h-5 w-5" /></Button>
                                                            <Button size="sm" variant="ghost" className="text-green-600 hover:bg-green-50" onClick={() => handleApprove(req)}><CheckCircle2 className="h-5 w-5" /></Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="users">
                        <Card>
                            <CardHeader>
                                <CardTitle>User Management</CardTitle>
                                <CardDescription>Manage user roles and permissions.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>User</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.map((u) => (
                                            <TableRow key={u.id}>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarImage src={u.image} />
                                                            <AvatarFallback>{u.name[0]}</AvatarFallback>
                                                        </Avatar>
                                                        {u.name}
                                                    </div>
                                                </TableCell>
                                                {/* Email might not be in public profile, display handled carefully */}
                                                <TableCell>{u.email || "Hidden"}</TableCell>
                                                <TableCell>
                                                    <Badge variant={u.role === 'admin' ? 'destructive' : u.role === 'provider' ? 'default' : 'secondary'}>
                                                        {u.role}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{u.category}</TableCell>
                                                <TableCell className="text-right flex items-center justify-end gap-2">
                                                    {u.role === 'provider' && (
                                                        <Button size="sm" variant="outline" className="text-xs h-8 text-eucalyptus border-eucalyptus/30 hover:bg-eucalyptus/5" onClick={() => handleAddCredits(u.id)}>
                                                            <Coins className="h-3 w-3 mr-1" /> Grant C.
                                                        </Button>
                                                    )}
                                                    {u.role !== 'admin' ? (
                                                        <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => handleRoleChange(u.id, 'admin')}>
                                                            <UserCog className="h-3 w-3 mr-1" /> Make Admin
                                                        </Button>
                                                    ) : (
                                                        <Button size="sm" variant="ghost" className="text-xs h-8 text-red-500 hover:text-red-700" onClick={() => handleRoleChange(u.id, 'provider')}>
                                                            <User className="h-3 w-3 mr-1" /> Revoke
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

function UserIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    )
}
