"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ThemeToggle } from "@/components/theme-toggle";
import { useUser } from "@/firebase/auth/use-user";

export default function SettingsPage() {
  const { user } = useUser();

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-headline text-4xl font-bold mb-8">Settings</h1>
      
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize the look and feel of the app.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="theme" className="font-medium">Theme</Label>
                <p className="text-sm text-muted-foreground">Select your preferred color scheme.</p>
              </div>
              <ThemeToggle />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Manage how you receive notifications from the app.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <Label htmlFor="medicine-reminders" className="font-medium">Medicine Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Receive alerts when it's time to take your medicine.
                </p>
              </div>
              <Switch id="medicine-reminders" defaultChecked />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                    <Label htmlFor="app-updates" className="font-medium">App Updates</Label>
                    <p className="text-sm text-muted-foreground">
                        Get notified about new features and updates.
                    </p>
                </div>
              <Switch id="app-updates" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Manage your account settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{user?.email || "No email found"}</p>
              </div>
              <p className="text-sm text-primary hover:underline cursor-pointer">Change</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
