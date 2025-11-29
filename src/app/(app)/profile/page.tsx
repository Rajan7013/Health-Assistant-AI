"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/theme-toggle";
import { useUser } from "@/firebase/auth/use-user";
import { Loader2, User as UserIcon, Palette, Bell, ShieldAlert, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { updateUserProfile } from "@/firebase/auth/user";
import { useAuth, useFirestore } from "@/firebase";

const profileFormSchema = z.object({
  displayName: z.string().min(3, "Name must be at least 3 characters."),
  email: z.string().email(),
});


const LegalTabContent = () => (
    <Card className="bg-gradient-to-br from-card to-secondary/30 border-secondary">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <FileText className="text-primary" />
          Legal & Support
        </CardTitle>
        <CardDescription>
          Review our terms, policies, and get help.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="privacy">
            <AccordionTrigger className="hover:text-primary">Privacy Policy</AccordionTrigger>
            <AccordionContent>
              Your privacy is important to us. Our Privacy Policy explains how we collect, use, and share your personal information. We are committed to protecting your data and ensuring that you have control over your information. For more details, please read the full policy.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="terms">
            <AccordionTrigger className="hover:text-primary">Terms of Service</AccordionTrigger>
            <AccordionContent>
              By using HealthMind AI, you agree to our Terms of Service. These terms govern your use of our app and its services. Please read them carefully. The services are for informational purposes only and are not a substitute for professional medical advice.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="support">
            <AccordionTrigger className="hover:text-primary">Contact Support</AccordionTrigger>
            <AccordionContent>
              If you need help or have any questions, please contact our support team at support@healthmind.ai. We are here to assist you with any issues or feedback you may have.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
)

const SettingsTabContent = () => (
    <div className="space-y-8">
        <Card className="bg-gradient-to-br from-card to-blue-500/10 border-blue-500/30">
          <CardHeader>
             <CardTitle className="flex items-center gap-3">
                <Palette className="text-blue-500" />
                Appearance
            </CardTitle>
            <CardDescription>
              Customize the look and feel of the app.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-lg bg-background/50">
              <div>
                <Label htmlFor="theme" className="font-medium">Theme</Label>
                <p className="text-sm text-muted-foreground">Select your preferred color scheme.</p>
              </div>
              <ThemeToggle />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-green-500/10 border-green-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
                <Bell className="text-green-500" />
                Notifications
            </CardTitle>
            <CardDescription>
              Manage how you receive notifications from the app.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-background/50">
              <div>
                <Label htmlFor="medicine-reminders" className="font-medium">Medicine Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Receive alerts when it's time to take your medicine.
                </p>
              </div>
              <Switch id="medicine-reminders" defaultChecked />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-background/50">
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
        
        <Card className="border-destructive bg-destructive/10">
            <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-3">
                    <ShieldAlert />
                    Danger Zone
                </CardTitle>
                <CardDescription className="text-destructive/80">
                Actions in this area are permanent and cannot be undone.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive">Delete Account</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your
                        account and remove your data from our servers.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
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
)

export default function ProfilePage() {
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: user?.displayName || "",
      email: user?.email || "",
    },
    values: {
        displayName: user?.displayName || "",
        email: user?.email || "",
    }
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: z.infer<typeof profileFormSchema>) => {
    if (!user) return;
    try {
        await updateUserProfile(firestore, user, { displayName: values.displayName });
        toast({
            title: "Profile Updated",
            description: "Your profile has been successfully updated.",
        });
    } catch (error) {
        console.error(error);
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: "Could not update your profile. Please try again.",
        });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="font-headline text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">Profile & Settings</h1>
      
      <Tabs defaultValue="profile" className="space-y-8">
        <TabsList className="grid w-full grid-cols-3 h-12 bg-muted/50 rounded-xl">
          <TabsTrigger value="profile" className="rounded-lg h-10">Edit Profile</TabsTrigger>
          <TabsTrigger value="settings" className="rounded-lg h-10">Settings</TabsTrigger>
          <TabsTrigger value="legal" className="rounded-lg h-10">Legal & Support</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
            <Card className="bg-gradient-to-br from-card to-primary/10 border-primary/30">
                <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>View and edit your personal details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-background/50">
                        <Avatar className="h-20 w-20 border-4 border-primary/50">
                            <AvatarImage src={user?.photoURL || ''} />
                            <AvatarFallback>
                                <UserIcon className="h-10 w-10 text-muted-foreground" />
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="text-xl font-bold">{user?.displayName}</h3>
                            <p className="text-muted-foreground">{user?.email}</p>
                        </div>
                    </div>
                    
                     <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                            <FormField
                                control={form.control}
                                name="displayName"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Your full name" {...field} disabled={isSubmitting} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Your email" {...field} disabled />
                                    </FormControl>
                                     <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </TabsContent>
        
        <TabsContent value="settings">
            <SettingsTabContent />
        </TabsContent>

        <TabsContent value="legal">
            <LegalTabContent />
        </TabsContent>
      </Tabs>
    </div>
  );
}
