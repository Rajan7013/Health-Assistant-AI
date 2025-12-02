"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon, Bell, Pill, PlusCircle, Trash2, CalendarClock, PlayCircle, Sparkles, Clock, CheckCircle2 } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useEffect, useRef } from "react"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/firebase/auth/use-user"
import { useFirestore } from "@/firebase"
import { addSchedule, deleteSchedule as deleteScheduleFromDB, getSchedules, type ScheduleWithId } from "@/firebase/firestore/schedules"

const MAX_FILE_SIZE = 800000; // 800KB (Firestore Limit is 1MB)
const ACCEPTED_AUDIO_TYPES = ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp3"];

const formSchema = z.object({
    medicineName: z.string().min(2, {
        message: "Medicine name must be at least 2 characters.",
    }),
    startDate: z.date({
        required_error: "A start date is required.",
    }),
    time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
    frequency: z.enum(["daily", "weekly"], {
        required_error: "You need to select a frequency.",
    }),
    sound: z
        .any()
        .optional(),
})

const cardColors = [
    "bg-sky-50 dark:bg-sky-900/20 border-sky-100 dark:border-sky-800",
    "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800",
    "bg-violet-50 dark:bg-violet-900/20 border-violet-100 dark:border-violet-800",
    "bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800",
    "bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800",
]

const iconColors = [
    "text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-900/40",
    "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40",
    "text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/40",
    "text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/40",
    "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40",
]

export default function SchedulePage() {
    const [schedules, setSchedules] = useState<ScheduleWithId[]>([]);
    const [selectedSoundUrl, setSelectedSoundUrl] = useState<string | null>(null);
    const { toast } = useToast();
    const { user } = useUser();
    const firestore = useFirestore();
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!user || !firestore) return;

        const unsubscribe = getSchedules(firestore, user.uid, (newSchedules) => {
            setSchedules(newSchedules);
        });

        return () => unsubscribe();
    }, [user, firestore]);


    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            medicineName: "",
            time: "09:00",
            frequency: "daily",
        },
    })

    const soundRef = form.register("sound");

    const handleSoundSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > MAX_FILE_SIZE) {
                form.setError("sound", { type: "manual", message: `Max file size is 800KB for database storage.` });
                setSelectedSoundUrl(null);
                return;
            }
            if (!ACCEPTED_AUDIO_TYPES.includes(file.type)) {
                form.setError("sound", { type: "manual", message: ".mp3, .wav and .ogg files are accepted." });
                setSelectedSoundUrl(null);
                return;
            }
            form.clearErrors("sound");

            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    setSelectedSoundUrl(e.target.result as string);
                }
            };
            reader.readAsDataURL(file);

        } else {
            setSelectedSoundUrl(null);
        }
    }

    const handlePreviewSound = (soundUrl?: string) => {
        const urlToPlay = soundUrl || selectedSoundUrl;
        if (urlToPlay && audioRef.current) {
            audioRef.current.src = urlToPlay;
            audioRef.current.play();
        }
    }


    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!user || !firestore) {
            toast({ title: "Error", description: "You must be logged in to set a schedule.", variant: "destructive" });
            return;
        }

        const scheduleDataForDb = {
            medicineName: values.medicineName,
            startDate: values.startDate,
            time: values.time,
            frequency: values.frequency,
            soundData: selectedSoundUrl || undefined, // Store Base64 directly in Firestore
        };

        try {
            await addSchedule(firestore, user.uid, scheduleDataForDb);

            toast({
                title: "Schedule Set!",
                description: `${values.medicineName} has been added to your schedule.`,
            });

            form.reset();
            form.setValue("time", "09:00");
            form.setValue("frequency", "daily");
            form.setValue("startDate", undefined as any);
            setSelectedSoundUrl(null);
            const soundInput = document.querySelector('input[type="file"]') as HTMLInputElement;
            if (soundInput) soundInput.value = "";

        } catch (error) {
            console.error("Error adding schedule:", error);
            toast({
                title: "Error",
                description: "Could not save schedule. Sound file might be too large.",
                variant: "destructive"
            });
        }
    }

    async function handleDeleteSchedule(id: string) {
        if (!user || !firestore) {
            toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
            return;
        }
        deleteScheduleFromDB(firestore, user.uid, id);
        toast({
            title: "Schedule Removed",
            variant: "destructive",
            description: `A medicine has been removed from your schedule.`,
        });
    }

    if (!mounted) {
        return null;
    }

    return (
        <div className="min-h-screen bg-[#F0F5FF] dark:bg-[#0D1117] pt-2 px-6 pb-6 font-[Poppins] text-[#0A1D42] dark:text-[#F0F6FC]">
            <audio ref={audioRef} />

            <div className="max-w-6xl mx-auto flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-center justify-center gap-3 mb-1">
                    <div className="p-2 bg-white dark:bg-[#161B22] rounded-xl shadow-sm">
                        <CalendarClock className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-[#0A1D42] dark:text-[#F0F6FC] leading-tight">
                            Health <span className="bg-gradient-to-r from-blue-600 to-cyan-500 text-transparent bg-clip-text">Schedule</span>
                        </h1>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Manage your medications and reminders</p>
                    </div>
                </div>

                {/* Add Reminder Form - Horizontal Layout */}
                <Card className="shadow-lg border-0 bg-white dark:bg-[#161B22] rounded-3xl overflow-visible z-10">
                    <div className="h-2 w-full bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-400 rounded-t-3xl" />
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-xl font-black text-[#0A1D42] dark:text-[#F0F6FC]">
                            <PlusCircle className="h-5 w-5 text-blue-500" />
                            Add Reminder
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
                                    {/* 1. Medicine Name */}
                                    <FormField
                                        control={form.control}
                                        name="medicineName"
                                        render={({ field }) => (
                                            <FormItem className="w-full">
                                                <FormLabel className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Medicine Name</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="e.g., Paracetamol"
                                                        {...field}
                                                        className="rounded-xl bg-[#F8FAFC] dark:bg-[#0D1117] border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-sm h-11"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* 2. Start Date */}
                                    <FormField
                                        control={form.control}
                                        name="startDate"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col w-full">
                                                <FormLabel className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Start Date</FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant={"outline"}
                                                                className={cn(
                                                                    "pl-3 text-left font-medium rounded-xl h-11 bg-[#F8FAFC] dark:bg-[#0D1117] border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 w-full",
                                                                    !field.value && "text-muted-foreground"
                                                                )}
                                                            >
                                                                {field.value ? (
                                                                    format(field.value, "PPP")
                                                                ) : (
                                                                    <span>Pick a date</span>
                                                                )}
                                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0 rounded-xl shadow-xl border-0 z-[9999] bg-white dark:bg-[#161B22]" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={field.value}
                                                            onSelect={field.onChange}
                                                            disabled={(date) =>
                                                                date < new Date(new Date().setHours(0, 0, 0, 0))
                                                            }
                                                            initialFocus
                                                            className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#161B22]"
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* 3. Time */}
                                    <FormField
                                        control={form.control}
                                        name="time"
                                        render={({ field }) => (
                                            <FormItem className="w-full">
                                                <FormLabel className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Time</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input
                                                            type="time"
                                                            {...field}
                                                            className="rounded-xl bg-[#F8FAFC] dark:bg-[#0D1117] border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-sm h-11 pl-3"
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* 4. Frequency */}
                                    <FormField
                                        control={form.control}
                                        name="frequency"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3 w-full">
                                                <FormLabel className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Frequency</FormLabel>
                                                <FormControl>
                                                    <RadioGroup
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value}
                                                        className="flex gap-3 pt-1"
                                                    >
                                                        <FormItem className="flex items-center space-x-0 space-y-0 flex-1">
                                                            <FormControl>
                                                                <RadioGroupItem value="daily" className="peer sr-only" />
                                                            </FormControl>
                                                            <FormLabel className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 border-gray-100 dark:border-gray-800 bg-[#F8FAFC] dark:bg-[#0D1117] p-3 hover:bg-gray-50 dark:hover:bg-gray-900 peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-50 dark:peer-data-[state=checked]:bg-blue-900/20 peer-data-[state=checked]:text-blue-700 dark:peer-data-[state=checked]:text-blue-300 cursor-pointer transition-all font-bold text-sm h-11">
                                                                <Sparkles className="h-4 w-4" /> Daily
                                                            </FormLabel>
                                                        </FormItem>
                                                        <FormItem className="flex items-center space-x-0 space-y-0 flex-1">
                                                            <FormControl>
                                                                <RadioGroupItem value="weekly" className="peer sr-only" />
                                                            </FormControl>
                                                            <FormLabel className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 border-gray-100 dark:border-gray-800 bg-[#F8FAFC] dark:bg-[#0D1117] p-3 hover:bg-gray-50 dark:hover:bg-gray-900 peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-50 dark:peer-data-[state=checked]:bg-blue-900/20 peer-data-[state=checked]:text-blue-700 dark:peer-data-[state=checked]:text-blue-300 cursor-pointer transition-all font-bold text-sm h-11">
                                                                <CalendarIcon className="h-4 w-4" /> Weekly
                                                            </FormLabel>
                                                        </FormItem>
                                                    </RadioGroup>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                                    {/* 5. Sound */}
                                    <FormField
                                        control={form.control}
                                        name="sound"
                                        render={({ field }) => (
                                            <FormItem className="w-full">
                                                <FormLabel className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Custom Sound (Optional)</FormLabel>
                                                <div className="flex items-center gap-2">
                                                    <FormControl>
                                                        <div className="relative w-full">
                                                            <Input
                                                                type="file"
                                                                accept="audio/*"
                                                                {...soundRef}
                                                                onChange={handleSoundSelect}
                                                                className="rounded-xl bg-[#F8FAFC] dark:bg-[#0D1117] border-gray-200 dark:border-gray-800 file:bg-blue-100 file:text-blue-700 file:border-0 file:rounded-lg file:px-2 file:py-1 file:mr-3 file:text-xs file:font-bold hover:file:bg-blue-200 transition-all text-xs h-11 pt-2"
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    {selectedSoundUrl && (
                                                        <Button type="button" size="icon" variant="ghost" onClick={() => handlePreviewSound()} className="h-11 w-11 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 shrink-0">
                                                            <PlayCircle className="h-5 w-5" />
                                                        </Button>
                                                    )}
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Submit Button */}
                                    <Button type="submit" size="lg" className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]">
                                        Set Reminder
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                {/* Schedule List - Below Form */}
                <div className="w-full">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-black text-[#0A1D42] dark:text-[#F0F6FC]">Your Reminders</h2>
                        <span className="text-xs font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full">
                            {schedules.length} Active
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {schedules.length > 0 ? schedules.map((schedule, index) => (
                            <Card key={schedule.id} className={cn(
                                "group flex items-center p-4 transition-all hover:scale-[1.01] hover:shadow-md border-2 rounded-3xl",
                                cardColors[index % cardColors.length]
                            )}>
                                <div className={cn(
                                    "h-14 w-14 rounded-2xl flex items-center justify-center mr-5 shadow-sm transition-transform group-hover:rotate-6 shrink-0",
                                    iconColors[index % iconColors.length]
                                )}>
                                    <Pill className="h-7 w-7" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-black text-lg text-[#0A1D42] dark:text-[#F0F6FC] truncate">{schedule.medicineName}</h3>
                                        {schedule.frequency === 'daily' && (
                                            <span className="text-[10px] font-bold bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded-full uppercase tracking-wide shrink-0">Daily</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <Clock className="h-4 w-4 opacity-70" />
                                            {schedule.time}
                                        </div>
                                        {schedule.frequency === 'weekly' && (
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <CalendarIcon className="h-4 w-4 opacity-70" />
                                                {format(new Date(schedule.startDate), 'EEEE')}s
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 ml-2">
                                    {schedule.soundData && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 rounded-full bg-white/60 dark:bg-black/20 flex items-center justify-center shrink-0 hover:bg-blue-100 hover:text-blue-600"
                                            onClick={() => handlePreviewSound(schedule.soundData)}
                                        >
                                            <Bell className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-10 w-10 rounded-full hover:bg-red-100 hover:text-red-600 text-gray-400 transition-colors shrink-0"
                                        onClick={() => handleDeleteSchedule(schedule.id)}
                                    >
                                        <Trash2 className="h-5 w-5" />
                                        <span className="sr-only">Delete</span>
                                    </Button>
                                </div>
                            </Card>
                        )) : (
                            <div className="col-span-full flex flex-col items-center justify-center py-20 px-6 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl bg-white/50 dark:bg-[#161B22]/50 text-center">
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-full mb-4">
                                    <CheckCircle2 className="h-10 w-10 text-blue-400" />
                                </div>
                                <h3 className="text-xl font-bold text-[#0A1D42] dark:text-[#F0F6FC] mb-2">All Caught Up!</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                                    You don't have any reminders set. Use the form above to add your first medication.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
