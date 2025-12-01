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
import { Bot, BookHeart, CalendarClock, History, Pill, Stethoscope, Bell, Clock, Sparkles, ChevronRight, Activity, Zap, Plus, PlayCircle, LayoutDashboard, MessageSquare, Search, Calendar, BookOpen, Sun, Moon, Bell as BellIcon, FileText } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useUser } from '@/firebase/auth/use-user';
import { useFirestore } from '@/firebase';
import { getSchedules, type ScheduleWithId } from '@/firebase/firestore/schedules';
import { format, parse, differenceInMinutes } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

const quickAccessItems = [
  {
    title: 'Schedule',
    href: '/schedule',
    icon: CalendarClock,
    bg: 'bg-teal-50',
    border: 'border-teal-500',
    text: 'text-teal-800',
    hoverBg: 'hover:bg-teal-100',
    iconBg: 'bg-gradient-to-br from-teal-500 to-cyan-500',
    darkBg: 'dark:bg-teal-900/40',
    darkHover: 'dark:hover:bg-teal-900/60',
    darkText: 'dark:text-teal-200'
  },
  {
    title: 'Profile',
    href: '/profile',
    icon: Bot,
    bg: 'bg-indigo-50',
    border: 'border-indigo-500',
    text: 'text-indigo-800',
    hoverBg: 'hover:bg-indigo-100',
    iconBg: 'bg-gradient-to-br from-indigo-500 to-purple-500',
    darkBg: 'dark:bg-indigo-900/40',
    darkHover: 'dark:hover:bg-indigo-900/60',
    darkText: 'dark:text-indigo-200'
  }
];

const coreFeatures = [
  {
    title: 'AI Health Assistant',
    description: 'Ask our AI about symptoms, medicines, and health advice.',
    href: '/chat',
    icon: Bot,
    bg: 'bg-blue-50',
    border: 'border-blue-500',
    titleColor: 'text-blue-900',
    descColor: 'text-blue-800',
    buttonBg: 'bg-blue-200',
    buttonText: 'text-blue-800',
    buttonHover: 'hover:bg-blue-300',
    iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-400',
    darkBg: 'dark:bg-blue-900/30',
    darkTitle: 'dark:text-blue-200',
    darkDesc: 'dark:text-blue-400',
    darkButtonBg: 'dark:bg-blue-500/30',
    darkButtonText: 'dark:text-blue-300',
    darkButtonHover: 'dark:hover:bg-blue-500/40'
  },
  {
    title: 'Symptom Analyzer',
    description: 'Describe your symptoms to get an AI-powered report.',
    href: '/symptom-checker',
    icon: Stethoscope,
    bg: 'bg-purple-50',
    border: 'border-purple-500',
    titleColor: 'text-purple-900',
    descColor: 'text-purple-800',
    buttonBg: 'bg-purple-200',
    buttonText: 'text-purple-800',
    buttonHover: 'hover:bg-purple-300',
    iconBg: 'bg-gradient-to-br from-purple-500 to-pink-400',
    darkBg: 'dark:bg-purple-900/30',
    darkTitle: 'dark:text-purple-200',
    darkDesc: 'dark:text-purple-400',
    darkButtonBg: 'dark:bg-purple-500/30',
    darkButtonText: 'dark:text-purple-300',
    darkButtonHover: 'dark:hover:bg-purple-500/40'
  },
  {
    title: 'Health Notes',
    description: 'Keep track of your symptoms, questions, and medical history.',
    href: '/notes',
    icon: BookHeart,
    bg: 'bg-green-50',
    border: 'border-green-500',
    titleColor: 'text-green-900',
    descColor: 'text-green-800',
    buttonBg: 'bg-green-200',
    buttonText: 'text-green-800',
    buttonHover: 'hover:bg-green-300',
    iconBg: 'bg-gradient-to-br from-green-500 to-emerald-400',
    darkBg: 'dark:bg-green-900/30',
    darkTitle: 'dark:text-green-200',
    darkDesc: 'dark:text-green-400',
    darkButtonBg: 'dark:bg-green-500/30',
    darkButtonText: 'dark:text-green-300',
    darkButtonHover: 'dark:hover:bg-green-500/40'
  },
  {
    title: 'Medical Reports',
    description: 'Upload lab results and get AI-powered analysis.',
    href: '/reports',
    icon: FileText,
    bg: 'bg-orange-50',
    border: 'border-orange-500',
    titleColor: 'text-orange-900',
    descColor: 'text-orange-800',
    buttonBg: 'bg-orange-200',
    buttonText: 'text-orange-800',
    buttonHover: 'hover:bg-orange-300',
    iconBg: 'bg-gradient-to-br from-orange-500 to-red-400',
    darkBg: 'dark:bg-orange-900/30',
    darkTitle: 'dark:text-orange-200',
    darkDesc: 'dark:text-orange-400',
    darkButtonBg: 'dark:bg-orange-500/30',
    darkButtonText: 'dark:text-orange-300',
    darkButtonHover: 'dark:hover:bg-orange-500/40'
  },
];

const NextReminderCard = ({ schedule, isLoading }: { schedule: ScheduleWithId | null, isLoading: boolean }) => {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#161B22] rounded-lg p-6 flex flex-col h-full shadow-sm">
        <Skeleton className="h-6 w-1/2 mb-4" />
        <Skeleton className="h-4 w-3/4 mb-auto" />
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    )
  }

  if (!schedule) {
    return (
      <div className="bg-white dark:bg-[#161B22] rounded-lg p-6 flex flex-col h-full shadow-sm">
        <h2 className="text-lg font-bold text-[#0A1D42] dark:text-[#F0F6FC] mb-2">No Upcoming Reminders</h2>
        <p className="text-sm text-[#475569] dark:text-[#8B949E] mb-auto">Your schedule is clear for now.</p>
        <Button asChild className="w-full bg-[#2563EB] text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-none mt-4">
          <Link href="/schedule">
            <Plus className="h-5 w-5" />
            Add Reminder
          </Link>
        </Button>
      </div>
    );
  }

  const now = new Date();
  const reminderDateTime = parse(schedule.time, 'HH:mm', new Date());
  let timeText = `Today at ${format(reminderDateTime, 'h:mm a')}`;
  const diffMins = differenceInMinutes(reminderDateTime, now);
  if (diffMins > 0 && diffMins <= 60) {
    timeText = `In ${diffMins} minutes`;
  }

  return (
    <div className="bg-white dark:bg-[#161B22] rounded-lg p-6 flex flex-col h-full shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-bl-full -mr-4 -mt-4 z-0" />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-blue-100 dark:bg-blue-900/40 rounded-md">
            <Bell className="h-4 w-4 text-[#2563EB] dark:text-blue-400 animate-pulse" />
          </div>
          <span className="text-xs font-bold text-[#2563EB] dark:text-blue-400 uppercase tracking-wider">Up Next</span>
        </div>
        <h2 className="text-xl font-bold text-[#0A1D42] dark:text-[#F0F6FC] mb-1">{schedule.medicineName}</h2>
        <p className="text-sm text-[#475569] dark:text-[#8B949E] mb-6">{schedule.dosage || '1 pill'} • {schedule.frequency || 'Daily'}</p>

        <div className="flex items-center gap-2 text-[#0A1D42] dark:text-[#F0F6FC] font-medium bg-[#F0F5FF] dark:bg-[#0D1117] px-4 py-3 rounded-lg border border-gray-100 dark:border-gray-700">
          <Clock className="h-4 w-4 text-gray-400" />
          <p>{timeText}</p>
        </div>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [nextSchedule, setNextSchedule] = useState<ScheduleWithId | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const calculateNextSchedule = (schedules: ScheduleWithId[]) => {
    const now = new Date();

    const upcoming = schedules
      .map(s => {
        const scheduleTimeForToday = parse(s.time, 'HH:mm', new Date());
        return { ...s, dateTime: scheduleTimeForToday };
      })
      .filter(s => {
        if (s.dateTime <= now) return false;

        const startDate = new Date(s.startDate);
        startDate.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (startDate > today) return false;

        if (s.frequency === 'daily') {
          return true;
        }
        if (s.frequency === 'weekly') {
          return s.startDate.getDay() === now.getDay();
        }
        return false;
      })
      .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());

    setNextSchedule(upcoming.length > 0 ? upcoming[0] : null);
    setIsLoading(false);
  }

  useEffect(() => {
    if (!user || !firestore) return;

    setIsLoading(true);

    const unsubscribe = getSchedules(firestore, user.uid, calculateNextSchedule);

    const intervalId = setInterval(() => {
      if (user && firestore) {
        getSchedules(firestore, user.uid, calculateNextSchedule);
      }
    }, 30000);

    return () => {
      unsubscribe();
      clearInterval(intervalId);
    };
  }, [user, firestore]);

  return (
    <div className="flex min-h-screen flex-col font-[Poppins] text-[#0A1D42] dark:text-[#F0F6FC]">

      {/* Hero & Reminder Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 rounded-lg p-8 flex flex-col justify-between bg-cover relative overflow-hidden shadow-sm h-56 lg:h-64 group" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=2070&auto=format&fit=crop')", backgroundPosition: "center 30%" }}>
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-blue-900/30 transition-opacity group-hover:opacity-95" />

          <div className="relative z-10 text-white h-full flex flex-col justify-center">
            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full mb-3 w-fit border border-white/20">
              <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
              AI-POWERED HEALTH ASSISTANT
            </span>
            <h1 className="text-3xl md:text-4xl font-black mb-2 leading-tight tracking-tight">
              Hello, <span className="bg-gradient-to-r from-blue-400 to-cyan-300 text-transparent bg-clip-text">{user?.displayName?.split(' ')[0] || 'Friend'}</span>
            </h1>
            <p className="text-gray-200 max-w-lg text-sm md:text-base font-medium mb-auto opacity-90">Your personal health journey continues here. What would you like to focus on today?</p>

            <div>
              <Button asChild className="bg-white text-blue-900 font-bold py-2 px-6 rounded-lg flex items-center gap-2 hover:bg-blue-50 transition-all w-fit border-0 shadow-lg hover:shadow-xl hover:scale-105 mt-2">
                <Link href="/chat">
                  <PlayCircle className="h-5 w-5 text-blue-600" />
                  Start New Chat
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 h-full">
          <NextReminderCard schedule={nextSchedule} isLoading={isLoading} />
        </div>
      </div>

      {/* Explore Features */}
      <div className="bg-white dark:bg-[#161B22] rounded-lg p-6 shadow-sm mt-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-[#EBF1FF] dark:bg-[#1E293B] p-2 rounded-lg">
            <Activity className="h-6 w-6 text-[#2563EB]" />
          </div>
          <h2 className="text-xl font-bold text-[#0A1D42] dark:text-[#F0F6FC]">Explore Features</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {coreFeatures.map(feature => (
            <div key={feature.title} className={`${feature.bg} ${feature.darkBg} border-2 ${feature.border} rounded-lg p-6 flex flex-col h-full`}>
              <div className={`${feature.iconBg} text-white p-3 rounded-lg w-fit mb-4`}>
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className={`text-lg font-bold ${feature.titleColor} ${feature.darkTitle} mb-2`}>{feature.title}</h3>
              <p className={`text-sm ${feature.descColor} ${feature.darkDesc} mb-6 flex-grow leading-relaxed`}>{feature.description}</p>
              <Link href={feature.href} className={`${feature.buttonBg} ${feature.darkButtonBg} ${feature.buttonText} ${feature.darkButtonText} font-semibold py-2 px-4 rounded-lg flex items-center justify-between ${feature.buttonHover} ${feature.darkButtonHover} transition-colors`}>
                <span>Open Feature</span>
                <ChevronRight className="h-5 w-5" />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Access */}
      <div className="bg-white dark:bg-[#161B22] rounded-lg p-6 shadow-sm mt-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-[#EBF1FF] dark:bg-[#1E293B] p-2 rounded-lg">
            <Zap className="h-6 w-6 text-[#2563EB]" />
          </div>
          <h2 className="text-xl font-bold text-[#0A1D42] dark:text-[#F0F6FC]">Quick Access</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {quickAccessItems.map(item => (
            <Link href={item.href} key={item.title} className={`block text-center p-6 rounded-lg ${item.bg} ${item.darkBg} border-2 ${item.border} ${item.hoverBg} ${item.darkHover} transition-colors`}>
              <div className={`${item.iconBg} text-white rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4`}>
                <item.icon className="h-7 w-7" />
              </div>
              <span className={`font-semibold ${item.text} ${item.darkText}`}>{item.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
