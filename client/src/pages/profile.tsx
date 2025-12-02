import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Lock, LogOut, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function ProfilePage() {
    const { user, logoutMutation } = useAuth();
    const { toast } = useToast();
    const [changePasswordOpen, setChangePasswordOpen] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const changePasswordMutation = useMutation({
        mutationFn: async (data: typeof passwordData) => {
            return apiRequest("/api/change-password", {
                method: "POST",
                body: JSON.stringify({
                    currentPassword: data.currentPassword,
                    newPassword: data.newPassword,
                }),
            });
        },
        onSuccess: () => {
            toast({
                title: "Password Changed",
                description: "Your password has been updated successfully",
            });
            setChangePasswordOpen(false);
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message || "Failed to change password",
                variant: "destructive",
            });
        },
    });

    const handleChangePassword = () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast({
                title: "Error",
                description: "New passwords do not match",
                variant: "destructive",
            });
            return;
        }
        if (passwordData.newPassword.length < 6) {
            toast({
                title: "Error",
                description: "Password must be at least 6 characters",
                variant: "destructive",
            });
            return;
        }
        changePasswordMutation.mutate(passwordData);
    };

    const handleLogout = () => {
        logoutMutation.mutate();
    };

    if (!user) {
        return (
            <div className="p-4 md:p-6 lg:p-8">
                <p>Loading...</p>
            </div>
        );
    }

    const initials = user.username
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-2xl font-semibold">Profile</h1>
                <p className="text-muted-foreground">Manage your account settings and preferences</p>
            </div>

            {/* Profile Overview */}
            <Card>
                <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                    <CardDescription>Your personal account details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                            <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <h2 className="text-xl font-semibold">{user.username}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline">
                                    <Shield className="h-3 w-3 mr-1" />
                                    Admin
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div className="grid gap-4">
                        <div className="grid grid-cols-3 gap-4">
                            <Label className="text-muted-foreground">Username</Label>
                            <div className="col-span-2 font-medium">{user.username}</div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <Label className="text-muted-foreground">User ID</Label>
                            <div className="col-span-2 font-mono text-sm text-muted-foreground">{user.id}</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
                <CardHeader>
                    <CardTitle>Security</CardTitle>
                    <CardDescription>Manage your password and security settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-full">
                                <Lock className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="font-medium">Password</p>
                                <p className="text-sm text-muted-foreground">Change your account password</p>
                            </div>
                        </div>
                        <Button variant="outline" onClick={() => setChangePasswordOpen(true)}>
                            Change Password
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Account Actions</CardTitle>
                    <CardDescription>Manage your session and account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-destructive/10 p-2 rounded-full">
                                <LogOut className="h-5 w-5 text-destructive" />
                            </div>
                            <div>
                                <p className="font-medium">Sign Out</p>
                                <p className="text-sm text-muted-foreground">Sign out of your account</p>
                            </div>
                        </div>
                        <Button variant="destructive" onClick={handleLogout}>
                            Sign Out
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Change Password Dialog */}
            <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                        <DialogDescription>
                            Enter your current password and choose a new password
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="currentPassword">Current Password</Label>
                            <Input
                                id="currentPassword"
                                type="password"
                                value={passwordData.currentPassword}
                                onChange={(e) =>
                                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                value={passwordData.newPassword}
                                onChange={(e) =>
                                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                                }
                            />
                            <p className="text-xs text-muted-foreground">
                                Password must be at least 6 characters
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={(e) =>
                                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                                }
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setChangePasswordOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleChangePassword}
                            disabled={
                                !passwordData.currentPassword ||
                                !passwordData.newPassword ||
                                !passwordData.confirmPassword ||
                                changePasswordMutation.isPending
                            }
                        >
                            {changePasswordMutation.isPending ? "Changing..." : "Change Password"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
