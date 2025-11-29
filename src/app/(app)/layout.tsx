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
  User,
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
    color: 'text-sky-400',
    hoverColor: 'hover:bg-sky-500/10',
  },
  {
    href: '/symptom-checker',
    icon: Stethoscope,
    label: 'Symptom Checker',
    color: 'text-indigo-400',
    hoverColor: 'hover:bg-indigo-500/10',
  },
  {
    href: '/chat',
    icon: Bot,
    label: 'AI Chat',
    color: 'text-purple-400',
    hoverColor: 'hover:bg-purple-500/10',
  },
  {
    href: '/schedule',
    icon: CalendarClock,
    label: 'Schedule',
    color: 'text-blue-400',
    hoverColor: 'hover:bg-blue-500/10',
  },
  {
    href: '/diseases',
    icon: BookHeart,
    label: 'Diseases',
    color: 'text-green-400',
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

const DesktopNav = ({ pathname }: { pathname: string | null }) => {
    return (
        <nav className="hidden lg:flex items-center gap-2">
            {navItems.map((item) => (
                <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                        "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-300",
                        pathname === item.href
                            ? "bg-white text-primary shadow-md"
                            : "bg-white/10 text-white hover:bg-white/20"
                    )}
                >
                    <item.icon className={cn("h-5 w-5", pathname === item.href ? 'text-primary' : 'text-white')} />
                    {item.label}
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
  const [clientLoaded, setClientLoaded] = useState(false);
  
  useEffect(() => {
    setClientLoaded(true);
  }, []);
  
  const pathname = usePathname();


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
        <header className="sticky top-0 z-50" style={{ background: 'var(--header-gradient)' }}>
            <div className="flex h-20 items-center gap-4 px-4 md:px-6">
                <div className="flex items-center gap-2 lg:gap-4">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 lg:hidden text-white hover:bg-white/20 hover:text-white"
                      >
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle navigation menu</span>
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="flex flex-col">
                      <SheetHeader>
                        <SheetTitle>
                           <Link href="/" className="flex items-center gap-2 font-semibold">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Logo className="h-6 w-6 text-primary" />
                            </div>
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
                  <Link href="/" className="hidden lg:flex items-center gap-3">
                      <div className="p-2 bg-white/10 rounded-lg">
                          <Logo className="h-7 w-7 text-white" />
                      </div>
                      <span className="font-bold text-xl text-white">HealthMind AI</span>
                  </Link>
                </div>
              
                <div className="flex-1 flex justify-center">
                    <DesktopNav pathname={clientLoaded ? pathname : null} />
                </div>
              
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                             <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white rounded-lg">
                                <Settings className="h-5 w-5" />
                                <span className="sr-only">Settings</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Appearance</DropdownMenuLabel>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <ThemeToggle /> <span className="ml-2">Toggle Theme</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {(!clientLoaded || loading) ? (
                        <Skeleton className="h-10 w-24 rounded-lg" />
                    ) : user ? (
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                className="rounded-lg font-bold text-white shadow-md transition-all duration-300 hover:shadow-lg hover:brightness-110"
                                style={{ background: 'var(--profile-gradient)' }}
                            >
                                <Avatar className="h-6 w-6 mr-2 border-2 border-white/50">
                                    <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User'} />
                                    <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                                </Avatar>
                                {user.displayName?.split(' ')[0] || 'Profile'}
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
                        <Button asChild
                            className="rounded-lg font-bold text-white shadow-md transition-all duration-300 hover:shadow-lg hover:brightness-110"
                            style={{ background: 'var(--profile-gradient)' }}
                        >
                            <Link href="/login">Login</Link>
                        </Button>
                    )}
                </div>
            </div>
        </header>
        <main className="flex-1 bg-background p-4 lg:p-8 overflow-auto">
          {children}
        </main>
    </div>
  );
}
