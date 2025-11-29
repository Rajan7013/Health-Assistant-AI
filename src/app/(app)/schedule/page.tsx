
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
import { format, getDay } from "date-fns"
import { CalendarIcon, Bell, Pill, PlusCircle, Trash2, CalendarClock } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

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
  sound: z.string({
    required_error: "Please select a sound.",
  }),
})

type Schedule = z.infer<typeof formSchema> & { id: number };

const initialSchedules: Schedule[] = [
    { id: 1, medicineName: "Lisinopril", startDate: new Date(), time: "08:00", frequency: "daily", sound: "chime" },
    { id: 2, medicineName: "Metformin", startDate: new Date(), time: "20:00", frequency: "daily", sound: "radar" },
]

const cardColors = [
    "bg-sky-100 dark:bg-sky-900/30",
    "bg-green-100 dark:bg-green-900/30",
    "bg-amber-100 dark:bg-amber-900/30",
    "bg-rose-100 dark:bg-rose-900/30",
    "bg-indigo-100 dark:bg-indigo-900/30",
]

const iconColors = [
    "text-sky-600 dark:text-sky-400",
    "text-green-600 dark:text-green-400",
    "text-amber-600 dark:text-amber-400",
    "text-rose-600 dark:text-rose-400",
    "text-indigo-600 dark:text-indigo-400",
]

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>(initialSchedules);
  const { toast } = useToast();
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
        const now = new Date();
        const currentTime = format(now, "HH:mm");
        const currentDay = getDay(now);

        schedules.forEach(schedule => {
            const scheduleDate = new Date(schedule.startDate);
            // Check if schedule is active
            if (now >= scheduleDate) {
                if (schedule.frequency === "daily" && schedule.time === currentTime) {
                    triggerAlert(schedule);
                } else if (schedule.frequency === "weekly" && getDay(scheduleDate) === currentDay && schedule.time === currentTime) {
                    triggerAlert(schedule);
                }
            }
        });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [schedules]);

  const triggerAlert = (schedule: Schedule) => {
    toast({
        title: "Medication Reminder! 💊",
        description: `It's time to take your ${schedule.medicineName}.`,
    });
    
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }

    const soundFile = schedule.sound === 'default' ? 'chime' : schedule.sound;
    const newAudio = new Audio(`/sounds/${soundFile}.mp3`);
    newAudio.play().catch(e => console.error("Audio play failed:", e));
    setAudio(newAudio);
  };


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      medicineName: "",
      time: "09:00",
      frequency: "daily",
      sound: "chime",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    const newSchedule: Schedule = { ...values, id: Date.now() };
    setSchedules(prev => [...prev, newSchedule]);
    toast({
        title: "Schedule Set!",
        description: `${values.medicineName} has been added to your schedule.`,
    });
    form.reset();
    form.setValue("time", "09:00");
    form.setValue("frequency", "daily");
    form.setValue("sound", "chime");
    form.setValue("startDate", undefined);
  }

  function deleteSchedule(id: number) {
    setSchedules(prev => prev.filter(s => s.id !== id));
    toast({
        title: "Schedule Removed",
        variant: "destructive",
        description: `A medicine has been removed from your schedule.`,
    });
  }

  return (
    <div className="grid md:grid-cols-5 gap-8">
        <div className="md:col-span-2">
            <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-primary to-blue-500 text-primary-foreground rounded-t-lg">
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <PlusCircle /> Add New Reminder
                    </CardTitle>
                    <CardDescription className="text-primary-foreground/80">Fill out the form to add a new medication reminder.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                     <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                            control={form.control}
                            name="medicineName"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel className="font-semibold">Medicine Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Paracetamol" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="startDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                        <FormLabel className="font-semibold">Start Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "pl-3 text-left font-normal",
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
                                            <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) =>
                                                date < new Date(new Date().setHours(0,0,0,0)) 
                                                }
                                                initialFocus
                                            />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="time"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel className="font-semibold">Time</FormLabel>
                                        <FormControl>
                                            <Input type="time" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                             <FormField
                                control={form.control}
                                name="frequency"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                    <FormLabel className="font-semibold">Frequency</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="flex space-x-4 pt-1"
                                        >
                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                            <FormControl>
                                            <RadioGroupItem value="daily" />
                                            </FormControl>
                                            <FormLabel className="font-normal">Daily</FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                            <FormControl>
                                            <RadioGroupItem value="weekly" />
                                            </FormControl>
                                            <FormLabel className="font-normal">Weekly</FormLabel>
                                        </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />

                             <FormField
                                control={form.control}
                                name="sound"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel className="font-semibold">Alarm Sound</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select an alarm tone" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                        <SelectItem value="chime">Chime</SelectItem>
                                        <SelectItem value="radar">Radar</SelectItem>
                                        <SelectItem value="signal">Signal</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            
                            <Button type="submit" size="lg" className="w-full bg-gradient-to-r from-primary to-blue-500 text-white hover:opacity-90 font-bold">Set Reminder</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>

        <div className="md:col-span-3">
            <h1 className="font-headline text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">Current Medication Schedule</h1>
            <div className="space-y-4">
                {schedules.length > 0 ? schedules.map((schedule, index) => (
                    <Card key={schedule.id} className={cn("flex items-center p-4 transition-shadow hover:shadow-lg", cardColors[index % cardColors.length])}>
                        <div className="p-3 bg-white rounded-full mr-4 shadow">
                            <Pill className={cn("h-6 w-6", iconColors[index % iconColors.length])} />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-lg">{schedule.medicineName}</p>
                            <p className="text-sm text-muted-foreground">
                                {schedule.frequency === 'daily' ? 'Every day' : `Every ${format(schedule.startDate, 'EEEE')}`} at {schedule.time}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground bg-background/50 rounded-full px-3 py-1">
                                <Bell className="h-4 w-4" />
                                <span className="capitalize">{schedule.sound}</span>
                            </div>
                            <Button variant="ghost" size="icon" className="hover:bg-destructive/10" onClick={() => deleteSchedule(schedule.id)}>
                                <Trash2 className="h-5 w-5 text-destructive" />
                                <span className="sr-only">Delete</span>
                            </Button>
                        </div>
                    </Card>
                )) : (
                    <div className="text-center py-16 px-6 border-2 border-dashed rounded-lg bg-muted/50">
                        <CalendarClock className="mx-auto h-16 w-16 text-primary/40" />
                        <h3 className="mt-4 text-xl font-semibold">No Schedules Yet</h3>
                        <p className="mt-1 text-muted-foreground">Use the form on the left to add a new medicine reminder.</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}
