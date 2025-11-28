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
import { CalendarIcon, Bell, Pill, PlusCircle, Trash2 } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
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
    { id: 1, medicineName: "Lisinopril", startDate: new Date(), time: "08:00", frequency: "daily", sound: "default" },
    { id: 2, medicineName: "Metformin", startDate: new Date(), time: "20:00", frequency: "daily", sound: "chime" },
]

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>(initialSchedules);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      medicineName: "",
      time: "09:00",
      frequency: "daily",
      sound: "default",
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
    <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <PlusCircle /> Add New Medicine
                    </CardTitle>
                    <CardDescription>Fill out the form to add a new medication reminder.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                            control={form.control}
                            name="medicineName"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Medicine Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Paracetamol" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="startDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                        <FormLabel>Start Date</FormLabel>
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
                                        <FormLabel>Time</FormLabel>
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
                                    <FormLabel>Frequency</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="flex space-x-4"
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
                                    <FormLabel>Alarm Sound</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select an alarm tone" />
                                        </Trigger>
                                        </FormControl>
                                        <SelectContent>
                                        <SelectItem value="default">Default</SelectItem>
                                        <SelectItem value="chime">Chime</SelectItem>
                                        <SelectItem value="radar">Radar</SelectItem>
                                        <SelectItem value="signal">Signal</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            
                            <Button type="submit" className="w-full">Set Reminder</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>

        <div className="md:col-span-2">
            <h2 className="font-headline text-3xl font-bold mb-4">Current Schedule</h2>
            <div className="space-y-4">
                {schedules.length > 0 ? schedules.map(schedule => (
                    <Card key={schedule.id} className="flex items-center p-4">
                        <div className="p-3 bg-primary/10 rounded-full mr-4">
                            <Pill className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-lg">{schedule.medicineName}</p>
                            <p className="text-sm text-muted-foreground">
                                {schedule.frequency === 'daily' ? 'Every day' : `Every ${format(schedule.startDate, 'EEEE')}`} at {schedule.time}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Bell className="h-4 w-4" />
                                <span>{schedule.sound}</span>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => deleteSchedule(schedule.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                                <span className="sr-only">Delete</span>
                            </Button>
                        </div>
                    </Card>
                )) : (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                        <CalendarClock className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-2 text-xl font-semibold">No Schedules Yet</h3>
                        <p className="mt-1 text-sm text-muted-foreground">Add a medicine reminder using the form.</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  )
}