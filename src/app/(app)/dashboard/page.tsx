
'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight, Bot, BookHeart, CalendarClock, History, Pill, Stethoscope, BellRing, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useUser } from '@/firebase/auth/use-user';
import { useFirestore } from '@/firebase';
import { useState, useEffect, useMemo } from 'react';
import { getSchedules, type ScheduleWithId } from '@/firebase/firestore/schedules';
import { format, formatDistanceToNow, isToday, isFuture, getDay } from 'date-fns';

const heroImage = PlaceHolderImages.find(img => img.id === 'hero');

const quickAccessItems = [
    {
        title: 'Schedule',
        href: '/schedule',
        icon: CalendarClock,
        color: 'bg-blue-100 dark:bg-blue-900/30',
        iconColor: 'text-blue-600 dark:text-blue-400',
        shadowColor: 'hover:shadow-blue-500/30'
    },
    {
        title: 'Medications',
        href: '/schedule',
        icon: Pill,
        color: 'bg-red-100 dark:bg-red-900/30',
        iconColor: 'text-red-600 dark:text-red-400',
        shadowColor: 'hover:shadow-red-500/30'
    },
    {
        title: 'History',
        href: '#',
        icon: History,
        color: 'bg-yellow-100 dark:bg-yellow-900/30',
        iconColor: 'text-yellow-600 dark:text-yellow-400',
        shadowColor: 'hover:shadow-yellow-500/30'
    },
];

const coreFeatures = [
    {
        title: 'AI Health Assistant',
        description: 'Ask our AI about symptoms, medicines, and health advice.',
        href: '/chat',
        icon: Bot,
        color: 'bg-purple-100 dark:bg-purple-900/30',
        iconColor: 'text-purple-600 dark:text-purple-400',
        shadowColor: 'hover:shadow-purple-500/30',
    },
]

const getNextReminder = (schedules: ScheduleWithId[]): ScheduleWithId | null => {
    if (!schedules.length) return null;

    const now = new Date();
    let upcomingReminders: { reminder: ScheduleWithId, date: Date }[] = [];

    schedules.forEach(schedule => {
        const [hours, minutes] = schedule.time.split(':').map(Number);
        
        // Check for today
        let reminderDateTime = new Date();
        reminderDateTime.setHours(hours, minutes, 0, 0);
        if (schedule.frequency === 'daily' && reminderDateTime > now) {
            upcomingReminders.push({ reminder: schedule, date: reminderDateTime });
        } else if (schedule.frequency === 'weekly' && getDay(reminderDateTime) === getDay(new Date(schedule.startDate)) && reminderDateTime > now) {
             upcomingReminders.push({ reminder: schedule, date: reminderDateTime });
        }

        // Check for future days (up to 7 days ahead)
        for (let i = 1; i <= 7; i++) {
            let futureDate = new Date(now);
            futureDate.setDate(now.getDate() + i);
            futureDate.setHours(hours, minutes, 0, 0);

            if (schedule.frequency === 'daily') {
                upcomingReminders.push({ reminder: schedule, date: futureDate });
                break; 
            } else if (schedule.frequency === 'weekly' && getDay(futureDate) === getDay(new Date(schedule.startDate))) {
                upcomingReminders.push({ reminder: schedule, date: futureDate });
                break;
            }
        }
    });
    
    if (upcomingReminders.length === 0) return null;
    
    upcomingReminders.sort((a, b) => a.date.getTime() - b.date.getTime());
    
    return upcomingReminders[0].reminder;
};

const UpcomingReminderCard = () => {
    const { user, loading: userLoading } = useUser();
    const firestore = useFirestore();
    const [schedules, setSchedules] = useState<ScheduleWithId[]>([]);
    const [loadingSchedules, setLoadingSchedules] = useState(true);

    useEffect(() => {
        if (!user || !firestore) return;
        setLoadingSchedules(true);
        const unsubscribe = getSchedules(firestore, user.uid, (newSchedules) => {
            setSchedules(newSchedules);
            setLoadingSchedules(false);
        });
        return () => unsubscribe();
    }, [user, firestore]);

    const nextReminder = useMemo(() => getNextReminder(schedules), [schedules]);

    if (userLoading || loadingSchedules) {
        return (
            <Card className="rounded-2xl shadow-lg">
                <CardContent className="p-6 flex items-center justify-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </CardContent>
            </Card>
        );
    }
    
    if (!nextReminder) {
         return (
            <Card className="rounded-2xl shadow-lg bg-secondary">
                <CardHeader>
                    <CardTitle>No Upcoming Reminders</CardTitle>
                    <CardDescription>Your medication schedule is clear for now.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <Link href="/schedule">
                           <CalendarClock className="mr-2 h-4 w-4" />
                            Set a New Reminder
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    const reminderDate = new Date();
    const [hours, minutes] = nextReminder.time.split(':').map(Number);
    reminderDate.setHours(hours, minutes, 0, 0);

    const timeText = isToday(reminderDate) ? `Today at ${format(reminderDate, 'p')}` : format(reminderDate, 'p');

    return (
        <Card className="rounded-2xl shadow-xl border-2 border-primary/50 bg-gradient-to-br from-primary/10 to-background">
            <CardHeader>
                <div className="flex items-center gap-3">
                     <BellRing className="h-6 w-6 text-primary" />
                    <CardTitle className="text-primary text-2xl font-bold">Upcoming Reminder</CardTitle>
                </div>
                <CardDescription>
                    {`Next up: ${formatDistanceToNow(reminderDate, { addSuffix: true })}`}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="bg-background/70 p-4 rounded-lg">
                    <p className="text-lg font-bold text-foreground">{nextReminder.medicineName}</p>
                    <p className="text-lg font-semibold text-primary">{timeText}</p>
                    <p className="text-sm text-muted-foreground capitalize">{nextReminder.frequency} medication</p>
                </div>
                <Button asChild variant="outline">
                    <Link href="/schedule">
                        View Full Schedule <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
};


export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <UpcomingReminderCard />
            <Card className="overflow-hidden relative rounded-2xl shadow-lg h-80 lg:h-auto">
                <div className="h-full w-full">
                    {heroImage && (
                        <Image
                            src={heroImage.imageUrl}
                            alt={heroImage.description}
                            data-ai-hint={heroImage.imageHint}
                            fill
                            className="object-cover"
                        />
                    )}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 via-blue-800/50 to-transparent" />
                  <div className="relative h-full flex flex-col justify-center p-8 md:p-12 text-white">
                    <h1 className="text-4xl md:text-5xl font-bold font-serif">
                      Welcome back,
                    </h1>
                    <p className="mt-2 text-lg md:text-xl max-w-lg text-blue-100">
                      How can HealthMind AI assist you today?
                    </p>
                    <div className="mt-8 flex flex-wrap gap-4">
                        <Button size="lg" variant="secondary" className="bg-white/90 hover:bg-white text-primary font-bold shadow-md" asChild>
                            <Link href="/chat">
                                <Bot className="mr-2 h-5 w-5" />
                                Ask Our AI
                            </Link>
                        </Button>
                    </div>
                  </div>
                </div>
            </Card>
        </div>


        <div className="lg:col-span-1 space-y-8">
            <Card className="rounded-2xl shadow-lg bg-secondary border-2 border-blue-500/30">
                <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-4">Quick Access</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {quickAccessItems.map(item => (
                            <Link href={item.href} key={item.title}>
                                <div className={`flex flex-col items-center justify-center p-4 ${item.color} rounded-xl aspect-square transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl ${item.shadowColor}`}>
                                    <div className={`p-3 bg-white rounded-full shadow-sm mb-2`}>
                                        <item.icon className={`h-6 w-6 ${item.iconColor}`} />
                                    </div>
                                    <p className="text-sm font-semibold text-center text-foreground/80">{item.title}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </CardContent>
            </Card>
             <h2 className="text-2xl font-bold">Explore Our Core Feature</h2>
                {coreFeatures.map(feature => (
                     <Link href={feature.href} key={feature.title}>
                        <div className={`p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col text-center items-center gap-4 ${feature.color} ${feature.shadowColor}`}>
                            <div className="p-4 bg-white rounded-full shadow-md">
                                <feature.icon className={`h-8 w-8 ${feature.iconColor}`} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-foreground">{feature.title}</h3>
                                <p className="text-muted-foreground mt-1">{feature.description}</p>
                            </div>
                        </div>
                    </Link>
                ))}
        </div>
      </div>

    </div>
  );
}

    