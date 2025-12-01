"use client";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ThemeToggle } from "@/components/theme-toggle";
import { Palette, Bell, ShieldAlert, FileText, Settings as SettingsIcon, ArrowLeft, Loader2, Download } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useUser } from "@/firebase/auth/use-user";
import { exportUserData } from "@/lib/export-utils";
import { useToast } from "@/hooks/use-toast";
import { useFcm } from "@/hooks/use-fcm";

export default function SettingsPage() {
    const { user } = useUser();
    const { toast } = useToast();
    const [isExporting, setIsExporting] = useState(false);
    const { requestPermission, permission, token } = useFcm();

    const handleExportData = async () => {
        if (!user) return;

        setIsExporting(true);
        try {
            await exportUserData(user);
            toast({
                title: "Export Complete",
                description: "Your health data has been downloaded.",
            });
        } catch (error) {
            console.error("Export error:", error);
            toast({
                title: "Export Failed",
                description: "Could not generate the PDF. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsExporting(false);
        }
    };

    const handleEnableNotifications = async () => {
        await requestPermission();
        if (Notification.permission === 'granted') {
            toast({
                title: "Notifications Enabled",
                description: "You will now receive alerts.",
            });
        } else {
            toast({
                title: "Permission Denied",
                description: "Please enable notifications in your browser settings.",
                variant: "destructive"
            });
        }
    };

    return (
        <div className="min-h-screen bg-[#F0F5FF] dark:bg-[#0D1117] pt-2 px-6 pb-6 font-[Poppins] text-[#0A1D42] dark:text-[#F0F6FC]">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white dark:bg-[#161B22] rounded-xl shadow-sm">
                            <SettingsIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-[#0A1D42] dark:text-[#F0F6FC] leading-tight">
                                App <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text">Settings</span>
                            </h1>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Manage preferences and legal info</p>
                        </div>
                    </div>
                    <Link href="/profile" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-purple-600 transition-colors">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Profile
                    </Link>
                </div>

                <div className="space-y-8">
                    {/* Appearance Section */}
                    <Card className="bg-white dark:bg-[#161B22] border-0 shadow-lg rounded-3xl overflow-hidden">
                        <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-cyan-500" />
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-[#0A1D42] dark:text-[#F0F6FC] font-black">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <Palette className="text-blue-600 dark:text-blue-400 h-5 w-5" />
                                </div>
                                Appearance
                            </CardTitle>
                            <CardDescription className="text-[#475569] dark:text-[#8B949E] font-medium">
                                Customize the look and feel of the app.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-[#0D1117] border border-gray-100 dark:border-gray-800">
                                <div>
                                    <Label htmlFor="theme" className="font-bold text-[#0A1D42] dark:text-[#F0F6FC]">Theme</Label>
                                    <p className="text-sm text-[#475569] dark:text-[#8B949E] font-medium">Select your preferred color scheme.</p>
                                </div>
                                <ThemeToggle />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notifications Section */}
                    <Card className="bg-white dark:bg-[#161B22] border-0 shadow-lg rounded-3xl overflow-hidden">
                        <div className="h-1 w-full bg-gradient-to-r from-green-500 to-emerald-500" />
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-[#0A1D42] dark:text-[#F0F6FC] font-black">
                                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                    <Bell className="text-green-600 dark:text-green-400 h-5 w-5" />
                                </div>
                                Notifications
                            </CardTitle>
                            <CardDescription className="text-[#475569] dark:text-[#8B949E] font-medium">
                                Manage how you receive notifications from the app.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-[#0D1117] border border-gray-100 dark:border-gray-800">
                                <div>
                                    <Label htmlFor="medicine-reminders" className="font-bold text-[#0A1D42] dark:text-[#F0F6FC]">Medicine Reminders</Label>
                                    <p className="text-sm text-[#475569] dark:text-[#8B949E] font-medium">
                                        Receive alerts when it's time to take your medicine.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {permission !== 'granted' && (
                                        <Button size="sm" variant="outline" onClick={handleEnableNotifications}>
                                            Enable
                                        </Button>
                                    )}
                                    <Switch id="medicine-reminders" checked={permission === 'granted'} onCheckedChange={handleEnableNotifications} />
                                </div>
                            </div>

                            {/* Test Notification Button */}
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-[#0D1117] border border-gray-100 dark:border-gray-800">
                                <div>
                                    <Label className="font-bold text-[#0A1D42] dark:text-[#F0F6FC]">Test Notification</Label>
                                    <p className="text-sm text-[#475569] dark:text-[#8B949E] font-medium">
                                        Send a test alert from the server.
                                    </p>
                                </div>
                                <Button size="sm" variant="secondary" onClick={async () => {
                                    if (permission === 'granted' && token) {
                                        try {
                                            toast({ title: "Sending...", description: "Requesting server to send notification." });
                                            const res = await fetch('/api/send-notification', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({
                                                    token,
                                                    title: "Test Notification",
                                                    body: "This is a verified message from the HealthMind backend! 🚀"
                                                })
                                            });

                                            const data = await res.json();
                                            if (res.ok) {
                                                toast({ title: "Sent!", description: "Check your notifications." });
                                            } else {
                                                console.error("Server error:", data);
                                                toast({
                                                    title: "Failed to send",
                                                    description: data.error || "Server error",
                                                    variant: "destructive"
                                                });
                                            }
                                        } catch (e) {
                                            console.error("Network error:", e);
                                            toast({ title: "Error", description: "Could not reach server.", variant: "destructive" });
                                        }
                                    } else {
                                        if (permission !== 'granted') {
                                            toast({ title: "Permission Required", description: "Please enable notifications first.", variant: "destructive" });
                                        } else if (!token) {
                                            toast({ title: "Waiting for Token", description: "Still connecting to push service. Try reloading.", variant: "destructive" });
                                        }
                                    }
                                }}>
                                    Send Test
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Legal Section */}
                    <Card className="bg-white dark:bg-[#161B22] border-0 shadow-lg rounded-3xl overflow-hidden">
                        <div className="h-1 w-full bg-gradient-to-r from-purple-500 to-pink-500" />
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-[#0A1D42] dark:text-[#F0F6FC] font-black">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                    <FileText className="text-purple-600 dark:text-purple-400 h-5 w-5" />
                                </div>
                                Legal & Support
                            </CardTitle>
                            <CardDescription className="text-[#475569] dark:text-[#8B949E] font-medium">
                                Review our terms, policies, and get help.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="privacy" className="border-gray-100 dark:border-gray-800">
                                    <AccordionTrigger className="hover:text-purple-600 dark:hover:text-purple-400 hover:no-underline text-[#0A1D42] dark:text-[#F0F6FC] font-bold">Privacy Policy</AccordionTrigger>
                                    <AccordionContent className="text-[#475569] dark:text-[#8B949E] font-medium">
                                        Your privacy is important to us. Our Privacy Policy explains how we collect, use, and share your personal information. We are committed to protecting your data and ensuring that you have control over your information. For more details, please read the full policy.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="terms" className="border-gray-100 dark:border-gray-800">
                                    <AccordionTrigger className="hover:text-purple-600 dark:hover:text-purple-400 hover:no-underline text-[#0A1D42] dark:text-[#F0F6FC] font-bold">Terms of Service</AccordionTrigger>
                                    <AccordionContent className="text-[#475569] dark:text-[#8B949E] font-medium">
                                        By using HealthMind AI, you agree to our Terms of Service. These terms govern your use of our app and its services. Please read them carefully. The services are for informational purposes only and are not a substitute for professional medical advice.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="support" className="border-gray-100 dark:border-gray-800">
                                    <AccordionTrigger className="hover:text-purple-600 dark:hover:text-purple-400 hover:no-underline text-[#0A1D42] dark:text-[#F0F6FC] font-bold">Contact Support</AccordionTrigger>
                                    <AccordionContent className="text-[#475569] dark:text-[#8B949E] font-medium">
                                        If you need help or have any questions, please contact our support team at support@healthmind.ai. We are here to assist you with any issues or feedback you may have.
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </CardContent>
                    </Card>

                    {/* Data & Privacy Section */}
                    <Card className="bg-white dark:bg-[#161B22] border-0 shadow-lg rounded-3xl overflow-hidden">
                        <div className="h-1 w-full bg-gradient-to-r from-orange-500 to-amber-500" />
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-[#0A1D42] dark:text-[#F0F6FC] font-black">
                                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                    <FileText className="text-orange-600 dark:text-orange-400 h-5 w-5" />
                                </div>
                                Data & Privacy
                            </CardTitle>
                            <CardDescription className="text-[#475569] dark:text-[#8B949E] font-medium">
                                Manage your personal data and export your history.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-[#0D1117] border border-gray-100 dark:border-gray-800">
                                <div>
                                    <Label className="font-bold text-[#0A1D42] dark:text-[#F0F6FC]">Export Health Data</Label>
                                    <p className="text-sm text-[#475569] dark:text-[#8B949E] font-medium">
                                        Download a PDF summary of your schedule, reports, and chats.
                                    </p>
                                </div>
                                <Button
                                    onClick={handleExportData}
                                    disabled={isExporting}
                                    className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-purple-600 font-bold shadow-sm"
                                >
                                    {isExporting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Exporting...
                                        </>
                                    ) : (
                                        <>
                                            <Download className="mr-2 h-4 w-4" />
                                            Export PDF
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <Card className="border-2 border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10 rounded-3xl shadow-none">
                        <CardHeader>
                            <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-3 font-black">
                                <ShieldAlert className="h-5 w-5" />
                                Danger Zone
                            </CardTitle>
                            <CardDescription className="text-red-600/80 dark:text-red-400/80 font-medium">
                                Actions in this area are permanent and cannot be undone.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" className="rounded-xl font-bold bg-red-600 hover:bg-red-700">Delete Account</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="rounded-3xl">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="text-[#0A1D42] dark:text-[#F0F6FC] font-black">Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription className="text-[#475569] dark:text-[#8B949E] font-medium">
                                            This action cannot be undone. This will permanently delete your
                                            account and remove your data from our servers.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel className="rounded-xl font-bold text-[#0A1D42] dark:text-[#F0F6FC]">Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            className="rounded-xl font-bold bg-red-600 hover:bg-red-700"
                                            onClick={() =>
                                                console.log("Account deletion not implemented yet.")
                                            }
                                        >
                                            Continue
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
