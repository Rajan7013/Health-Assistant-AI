"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { useUser } from "@/firebase/auth/use-user";
import { Loader2, User as UserIcon, Settings as SettingsIcon, ArrowRight, AlertTriangle, HeartPulse, Phone, Edit2, X, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { updateUserProfile } from "@/firebase/auth/user";
import { useFirestore } from "@/firebase";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getUserProfile, saveUserProfile, UserProfile } from "@/firebase/firestore/users";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

const profileFormSchema = z.object({
  displayName: z.string().min(3, "Name must be at least 3 characters."),
  allergies: z.string().optional(),
  chronicConditions: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelationship: z.string().optional(),
});

export default function ProfilePage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: "",
      allergies: "",
      chronicConditions: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      emergencyContactRelationship: "",
    },
  });

  useEffect(() => {
    if (user && firestore) {
      form.setValue("displayName", user.displayName || "");

      getUserProfile(user.uid).then((profile) => {
        setProfileData(profile);
        if (profile) {
          form.setValue("allergies", profile.allergies?.join(", ") || "");
          form.setValue("chronicConditions", profile.chronicConditions?.join(", ") || "");
          form.setValue("emergencyContactName", profile.emergencyContact?.name || "");
          form.setValue("emergencyContactPhone", profile.emergencyContact?.phone || "");
          form.setValue("emergencyContactRelationship", profile.emergencyContact?.relationship || "");
        }
        setIsLoadingProfile(false);
      });
    }
  }, [user, firestore, form]);

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: z.infer<typeof profileFormSchema>) => {
    if (!user || !firestore) return;
    try {
      // Update Auth Profile
      if (values.displayName !== user.displayName) {
        await updateUserProfile(firestore, user, { displayName: values.displayName });
      }

      // Update Firestore Profile
      // NOTE: We do NOT send email here to avoid triggering 'protectedFieldsUnchanged' security rule failure
      // if the email in DB doesn't match or is missing. Email is managed by Auth.
      const updatedProfile: Partial<UserProfile> = {
        displayName: values.displayName,
        allergies: values.allergies ? values.allergies.split(",").map(s => s.trim()).filter(Boolean) : [],
        chronicConditions: values.chronicConditions ? values.chronicConditions.split(",").map(s => s.trim()).filter(Boolean) : [],
        emergencyContact: {
          name: values.emergencyContactName || "",
          phone: values.emergencyContactPhone || "",
          relationship: values.emergencyContactRelationship || "",
        }
      };

      await saveUserProfile(user.uid, updatedProfile);

      // Update local state
      setProfileData({ ...profileData, ...updatedProfile } as UserProfile);
      setIsEditing(false);

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

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F5FF] dark:bg-[#0D1117]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F5FF] dark:bg-[#0D1117] pt-2 px-6 pb-20 font-[Poppins] text-[#0A1D42] dark:text-[#F0F6FC]">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white dark:bg-[#161B22] rounded-xl shadow-sm">
              <UserIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-[#0A1D42] dark:text-[#F0F6FC] leading-tight">
                My <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text">Profile</span>
              </h1>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Manage your personal information</p>
            </div>
          </div>
          <Link href="/settings">
            <Button variant="outline" className="rounded-xl border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 font-bold">
              <SettingsIcon className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </Link>
        </div>

        <Card className="bg-white dark:bg-[#161B22] border-0 shadow-lg rounded-3xl overflow-hidden mb-8">
          <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-blue-600" />
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-[#0A1D42] dark:text-[#F0F6FC] font-black">Profile Information</CardTitle>
              <CardDescription className="text-[#475569] dark:text-[#8B949E] font-medium">View and edit your personal details.</CardDescription>
            </div>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} variant="outline" className="rounded-xl border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 font-bold">
                <Edit2 className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex items-center gap-6 p-6 rounded-3xl bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 border border-purple-100 dark:border-purple-800/30">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-white dark:border-gray-800 shadow-lg">
                  <AvatarImage src={user?.photoURL || ''} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                    <UserIcon className="h-10 w-10" />
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0 p-1.5 bg-green-500 border-4 border-white dark:border-gray-800 rounded-full"></div>
              </div>
              <div>
                <h3 className="text-2xl font-black text-[#0A1D42] dark:text-[#F0F6FC]">{user?.displayName || 'User'}</h3>
                <p className="text-[#475569] dark:text-[#8B949E] font-medium">{user?.email}</p>
                <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-bold">
                  Free Plan
                </div>
              </div>
            </div>

            {isEditing ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">

                  {/* Basic Info Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-[#0A1D42] dark:text-[#F0F6FC] flex items-center gap-2">
                      <UserIcon className="h-5 w-5 text-blue-500" /> Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="displayName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#0A1D42] dark:text-[#F0F6FC] font-bold">Full Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Your full name"
                                {...field}
                                disabled={isSubmitting}
                                className="rounded-xl border-gray-200 dark:border-gray-800 focus:border-purple-500 focus:ring-purple-100 bg-gray-50/50 dark:bg-[#0D1117] text-[#0A1D42] dark:text-[#F0F6FC] font-medium h-12"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="space-y-2">
                        <FormLabel className="text-[#0A1D42] dark:text-[#F0F6FC] font-bold">Email</FormLabel>
                        <Input
                          value={user?.email || ''}
                          disabled
                          className="rounded-xl border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400 font-medium h-12 cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Health Info Section */}
                  <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <h3 className="text-lg font-bold text-[#0A1D42] dark:text-[#F0F6FC] flex items-center gap-2">
                      <HeartPulse className="h-5 w-5 text-red-500" /> Health Information
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 -mt-3 mb-4">
                      This information helps AI provide safer and more personalized advice.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="allergies"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#0A1D42] dark:text-[#F0F6FC] font-bold">Allergies</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="e.g., Peanuts, Penicillin, Pollen (comma separated)"
                                {...field}
                                disabled={isSubmitting}
                                className="rounded-xl border-gray-200 dark:border-gray-800 focus:border-red-500 focus:ring-red-100 bg-gray-50/50 dark:bg-[#0D1117] text-[#0A1D42] dark:text-[#F0F6FC] font-medium min-h-[80px] resize-none"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="chronicConditions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#0A1D42] dark:text-[#F0F6FC] font-bold">Chronic Conditions</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="e.g., Asthma, Diabetes, Hypertension (comma separated)"
                                {...field}
                                disabled={isSubmitting}
                                className="rounded-xl border-gray-200 dark:border-gray-800 focus:border-red-500 focus:ring-red-100 bg-gray-50/50 dark:bg-[#0D1117] text-[#0A1D42] dark:text-[#F0F6FC] font-medium min-h-[80px] resize-none"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Emergency Contact Section */}
                  <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <h3 className="text-lg font-bold text-[#0A1D42] dark:text-[#F0F6FC] flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-500" /> Emergency Contact
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormField
                        control={form.control}
                        name="emergencyContactName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#0A1D42] dark:text-[#F0F6FC] font-bold">Contact Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., John Doe"
                                {...field}
                                disabled={isSubmitting}
                                className="rounded-xl border-gray-200 dark:border-gray-800 focus:border-amber-500 focus:ring-amber-100 bg-gray-50/50 dark:bg-[#0D1117] text-[#0A1D42] dark:text-[#F0F6FC] font-medium h-12"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="emergencyContactRelationship"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#0A1D42] dark:text-[#F0F6FC] font-bold">Relationship</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., Spouse, Parent"
                                {...field}
                                disabled={isSubmitting}
                                className="rounded-xl border-gray-200 dark:border-gray-800 focus:border-amber-500 focus:ring-amber-100 bg-gray-50/50 dark:bg-[#0D1117] text-[#0A1D42] dark:text-[#F0F6FC] font-medium h-12"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="emergencyContactPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#0A1D42] dark:text-[#F0F6FC] font-bold">Phone Number</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., +1 234 567 8900"
                                {...field}
                                disabled={isSubmitting}
                                className="rounded-xl border-gray-200 dark:border-gray-800 focus:border-amber-500 focus:ring-amber-100 bg-gray-50/50 dark:bg-[#0D1117] text-[#0A1D42] dark:text-[#F0F6FC] font-medium h-12"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      disabled={isSubmitting}
                      className="rounded-xl border-gray-200 dark:border-gray-800 font-bold h-12 px-8"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold h-12 px-8 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                    >
                      {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Save Changes
                    </Button>
                  </div>
                </form>
              </Form>
            ) : (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                {/* View Mode: Health Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-[#0A1D42] dark:text-[#F0F6FC] flex items-center gap-2">
                    <HeartPulse className="h-5 w-5 text-red-500" /> Health Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#0D1117] border border-gray-100 dark:border-gray-800">
                      <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">Allergies</h4>
                      <div className="flex flex-wrap gap-2">
                        {profileData?.allergies && profileData.allergies.length > 0 ? (
                          profileData.allergies.map((allergy, i) => (
                            <Badge key={i} variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 hover:bg-red-200">
                              {allergy}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-gray-400 italic">No allergies listed</span>
                        )}
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#0D1117] border border-gray-100 dark:border-gray-800">
                      <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">Chronic Conditions</h4>
                      <div className="flex flex-wrap gap-2">
                        {profileData?.chronicConditions && profileData.chronicConditions.length > 0 ? (
                          profileData.chronicConditions.map((condition, i) => (
                            <Badge key={i} variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-200">
                              {condition}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-gray-400 italic">No conditions listed</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* View Mode: Emergency Contact */}
                <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <h3 className="text-lg font-bold text-[#0A1D42] dark:text-[#F0F6FC] flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500" /> Emergency Contact
                  </h3>
                  <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4">
                    {profileData?.emergencyContact?.name ? (
                      <>
                        <div>
                          <h4 className="text-xl font-bold text-[#0A1D42] dark:text-[#F0F6FC]">{profileData.emergencyContact.name}</h4>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{profileData.emergencyContact.relationship}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-sm font-bold text-[#0A1D42] dark:text-[#F0F6FC]">{profileData.emergencyContact.phone}</p>
                            <p className="text-xs text-green-600 dark:text-green-400 font-medium">Available</p>
                          </div>
                          <Button size="icon" className="rounded-full bg-green-500 hover:bg-green-600 text-white shadow-md">
                            <Phone className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-gray-400 italic flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        No emergency contact set
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
