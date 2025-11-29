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
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Bot,
  BookHeart,
  CalendarClock,
  LayoutDashboard,
  Menu,
  Settings,
  Stethoscope,
  LogOut,
  Bell,
} from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/icons';
import { ThemeToggle } from '@/components/theme-toggle';
import { useUser } from '@/firebase/auth/use-user';
import { signOut } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const navItems = [
  {
    href: '/dashboard',
    icon: LayoutDashboard,
    label: 'Dashboard',
    color: 'text-sky-500',
    hoverColor: 'hover:bg-sky-500/10',
  },
  {
    href: '/symptom-checker',
    icon: Stethoscope,
    label: 'Symptom Checker',
    color: 'text-indigo-500',
    hoverColor: 'hover:bg-indigo-500/10',
  },
  {
    href: '/chat',
    icon: Bot,
    label: 'AI Chat',
    color: 'text-purple-500',
    hoverColor: 'hover:bg-purple-500/10',
  },
  {
    href: '/schedule',
    icon: CalendarClock,
    label: 'Schedule',
    color: 'text-blue-500',
    hoverColor: 'hover:bg-blue-500/10',
  },
  {
    href: '/diseases',
    icon: BookHeart,
    label: 'Diseases',
    color: 'text-green-500',
    hoverColor: 'hover:bg-green-500/10',
  },
];

const AppNav = () => (
  <nav className="flex flex-col gap-2">
    {navItems.map((item) => (
      <Button
        key={item.label}
        variant="ghost"
        className="w-full justify-start gap-2"
        asChild
      >
        <Link href={item.href}>
          <item.icon className={cn("h-4 w-4", item.color)} />
          {item.label}
        </Link>
      </Button>
    ))}
  </nav>
);

const DesktopNav = ({ pathname }: { pathname: string }) => {
    return (
        <nav className="hidden lg:flex items-center gap-2">
            {navItems.map((item) => (
                <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                        "relative rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-all duration-300 hover:text-foreground hover:shadow-[0_0_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)]",
                        item.hoverColor,
                        pathname === item.href && "bg-background text-foreground shadow-md"
                    )}
                >
                    <span className="relative z-10 flex items-center gap-2">
                        <item.icon className={cn("h-4 w-4", item.color)} />
                        {item.label}
                    </span>
                </Link>
            ))}
        </nav>
    )
}

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, loading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [clientLoaded, setClientLoaded] = useState(false);

  useEffect(() => {
    setClientLoaded(true);
  }, []);

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/login');
  };
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('');
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
        <header className="sticky top-0 flex h-20 items-center gap-4 border-b bg-card/95 backdrop-blur-sm px-4 md:px-6 z-50">
           <div className="flex items-center gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0 lg:hidden"
                  >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex flex-col">
                  <SheetHeader>
                    <SheetTitle>
                       <Link href="/" className="flex items-center gap-2 font-semibold">
                        <Logo className="h-6 w-6 text-primary" />
                        <span className="font-bold text-lg">HealthMind AI</span>
                    </Link>
                    </SheetTitle>
                  </SheetHeader>
                  <AppNav />
                  <div className="mt-auto border-t pt-4">
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2"
                      asChild
                    >
                      <Link href="/settings">
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
              <Link href="/" className="hidden lg:flex items-center gap-2 font-semibold">
                  <Logo className="h-6 w-6 text-primary" />
                  <span className="font-bold text-lg">HealthMind AI</span>
              </Link>
           </div>
          
          <div className="flex-1 flex justify-center">
             <DesktopNav pathname={pathname} />
          </div>
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
            </Button>

            {(!clientLoaded || loading) ? (
                <Skeleton className="h-8 w-8 rounded-full" />
            ) : user ? (
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                    variant="secondary"
                    size="icon"
                    className="rounded-full"
                    >
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User'} />
                        <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                    </Avatar>
                    <span className="sr-only">Toggle user menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>{user.displayName || 'My Account'}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link href="/settings">Profile & Settings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                    </DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
            ) : (
                <Button asChild>
                    <Link href="/login">Login</Link>
                </Button>
            )}
           </div>
        </header>
        <main className="flex-1 bg-background p-4 lg:p-8 overflow-auto">
          {children}
        </main>
    </div>
  );
}
