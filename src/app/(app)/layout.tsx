
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Bot,
  CalendarClock,
  LayoutDashboard,
  Menu,
  LogOut,
  User,
  BookHeart,
  Stethoscope,
} from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/icons';
import { ThemeToggle } from '@/components/theme-toggle';
import { useUser } from '@/firebase/auth/use-user';
import { signOut } from 'firebase/auth';
import { useAuth, useFirestore } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { getSchedules, type ScheduleWithId } from '@/firebase/firestore/schedules';
import { format, getDay } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const navItems = [
  {
    href: '/dashboard',
    icon: LayoutDashboard,
    label: 'Dashboard',
  },
  {
    href: '/chat',
    icon: Bot,
    label: 'AI Chat',
  },
  {
    href: '/symptom-checker',
    icon: Stethoscope,
    label: 'Symptom Analyzer',
  },
  {
    href: '/schedule',
    icon: CalendarClock,
    label: 'Schedule',
  },
  {
    href: '/notes',
    icon: BookHeart,
    label: 'Health Notes',
  },
];

const DesktopNav = ({ pathname }: { pathname: string | null }) => (
  <nav className="hidden lg:flex items-center gap-2">
    {navItems.map((item) => (
      <Link
        key={item.label}
        href={item.href}
        className={cn(
          "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
          pathname === item.href
            ? "bg-white text-blue-700 shadow-md"
            : "bg-white/10 text-white hover:bg-white/20"
        )}
      >
        <item.icon className="h-4 w-4" />
        <span>{item.label}</span>
      </Link>
    ))}
  </nav>
);


const MobileNav = ({ pathname }: { pathname: string | null }) => (
  <nav className="flex flex-col gap-2 px-4">
    {navItems.map((item) => (
      <Link href={item.href} key={item.label}>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 rounded-lg text-base font-semibold px-3 py-6",
            pathname === item.href
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          )}
        >
          <item.icon className="h-5 w-5" />
          {item.label}
        </Button>
      </Link>
    ))}
  </nav>
);


function NotificationListener() {
  const { useFcm } = require('@/hooks/use-fcm');
  useFcm();
  return null;
}

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, loading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const [clientLoaded, setClientLoaded] = useState(false);
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setClientLoaded(true);
  }, []);

  const pathname = usePathname();

  // Global reminder logic
  useEffect(() => {
    if (!user || !firestore) return;

    const unsubscribe = getSchedules(firestore, user.uid, (schedules) => {
      const interval = setInterval(() => {
        const now = new Date();
        const currentTime = format(now, "HH:mm:ss");
        const currentDayOfWeek = getDay(now);

        schedules.forEach(schedule => {
          const scheduleStartDate = new Date(schedule.startDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const scheduleDateOnly = new Date(schedule.startDate);
          scheduleDateOnly.setHours(0, 0, 0, 0);

          if (schedule.time + ":00" === currentTime && today >= scheduleDateOnly) {
            if (schedule.frequency === "daily") {
              triggerAlert(schedule);
            } else if (schedule.frequency === "weekly") {
              const scheduleStartDayOfWeek = getDay(scheduleStartDate);
              if (scheduleStartDayOfWeek === currentDayOfWeek) {
                triggerAlert(schedule);
              }
            }
          }
        });
      }, 1000); // Check every second

      return () => clearInterval(interval);
    });

    return () => unsubscribe();
  }, [user, firestore]);

  const triggerAlert = (schedule: ScheduleWithId) => {
    toast({
      title: "Medication Reminder! 💊",
      description: `It's time to take your ${schedule.medicineName}.`,
    });

    if (schedule.soundData && audioRef.current) {
      audioRef.current.src = schedule.soundData;
      audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
    }
  };


  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <NotificationListener />
      <audio ref={audioRef} />
      <header className="sticky top-0 z-50 flex h-14 items-center gap-4 px-4 md:px-6 bg-header-gradient text-white shadow-lg">
        <div className="flex h-full items-center">
          <Link href="/" className="flex items-center gap-3 font-semibold text-lg">
            <Logo className="h-8 w-8" />
            <span className="font-bold">HealthMind AI</span>
          </Link>
        </div>

        <div className="flex-1 flex justify-center">
          <DesktopNav pathname={clientLoaded ? pathname : null} />
        </div>

        <div className="flex items-center gap-2">
          {clientLoaded ? (
            <ThemeToggle />
          ) : (
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white rounded-full">
              <div className="h-[1.2rem] w-[1.2rem]" />
            </Button>
          )}

          {(!clientLoaded || loading) ? (
            <Skeleton className="h-10 w-10 rounded-full" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User'} />
                    <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>
                  <p className="font-semibold">{user.displayName || 'User'}</p>
                  <p className="text-xs text-muted-foreground font-normal">{user.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild className="bg-profile-button-gradient text-white font-bold rounded-full">
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>

        <div className="lg:hidden">
          {clientLoaded ? (
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-white hover:bg-white/20 hover:text-white"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col p-0">
                <SheetHeader className="h-14 flex-row items-center border-b px-6">
                  <Link href="/" className="flex items-center gap-3 font-semibold text-lg">
                    <Logo className="h-8 w-8 text-primary" />
                    <span className="font-bold">HealthMind AI</span>
                  </Link>                        <SheetTitle className="sr-only">Menu</SheetTitle>
                  <SheetDescription className="sr-only">App navigation</SheetDescription>
                </SheetHeader>
                <div className="flex-1 overflow-auto py-2">
                  <MobileNav pathname={clientLoaded ? pathname : null} />
                </div>
                <div className="mt-auto p-4 border-t">
                  {user && (
                    <Button onClick={handleLogout} variant="ghost" className="w-full justify-start gap-2">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 text-white hover:bg-white/20 hover:text-white"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          )}
        </div>
      </header>
      <main className={cn(
        "flex-1 bg-[#F0F5FF] dark:bg-[#0D1117]",
        pathname === '/chat' ? 'p-0' : 'p-4 lg:p-8'
      )}>
        {children}
      </main>
    </div>
  );
}
