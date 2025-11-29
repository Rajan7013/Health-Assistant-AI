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
  LogOut,
  User,
  Stethoscope
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

const AppNav = ({ pathname }: { pathname: string | null }) => (
  <nav className="flex flex-col gap-2 px-4">
    {navItems.map((item) => (
       <Link href={item.href} key={item.label}>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 rounded-lg px-3 py-6 text-base font-semibold",
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
  
  return (
    <div className="flex min-h-screen w-full">
        <aside className="hidden lg:block w-72 flex-col border-r bg-background/30 backdrop-blur-lg">
            <div className="flex h-full max-h-screen flex-col gap-4">
                <div className="flex h-20 items-center border-b px-6">
                    <Link href="/" className="flex items-center gap-3 font-semibold text-lg">
                        <Logo className="h-8 w-8 text-primary" />
                        <span className="font-bold">HealthMind AI</span>
                    </Link>
                </div>
                <div className="flex-1 overflow-auto py-2">
                    <AppNav pathname={clientLoaded ? pathname : null} />
                </div>
                <div className="mt-auto p-4 border-t">
                     {(!clientLoaded || loading) ? (
                        <div className="flex items-center gap-3">
                           <Skeleton className="h-10 w-10 rounded-full" />
                           <div className="flex-1 space-y-1">
                             <Skeleton className="h-4 w-24" />
                             <Skeleton className="h-3 w-32" />
                           </div>
                        </div>
                    ) : user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="w-full justify-start gap-3 h-auto p-2">
                                     <Avatar className="h-10 w-10 border-2 border-primary/50">
                                        <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User'} />
                                        <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
                                    </Avatar>
                                    <div className="text-left">
                                        <p className="font-semibold text-base">{user.displayName || 'User'}</p>
                                        <p className="text-xs text-muted-foreground">{user.email}</p>
                                    </div>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-64">
                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/settings">Profile</Link>
                                </DropdownMenuItem>
                                 <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                         <Button asChild className="w-full" variant="outline">
                            <Link href="/login">Login</Link>
                        </Button>
                    )}
                </div>
            </div>
        </aside>
        <div className="flex flex-col flex-1">
            <header className="sticky top-0 z-10 flex h-20 items-center gap-4 border-b bg-background/30 backdrop-blur-lg px-4 md:px-6 lg:hidden">
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
                    <SheetContent side="left" className="flex flex-col p-0">
                         <div className="flex h-20 items-center border-b px-6">
                            <Link href="/" className="flex items-center gap-3 font-semibold text-lg">
                                <Logo className="h-8 w-8 text-primary" />
                                <span className="font-bold">HealthMind AI</span>
                            </Link>
                        </div>
                        <div className="flex-1 overflow-auto py-2">
                          <AppNav pathname={clientLoaded ? pathname : null} />
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

                <div className="flex-1 text-center">
                    <Link href="/" className="flex items-center gap-3 font-semibold text-lg justify-center">
                        <Logo className="h-8 w-8 text-primary" />
                    </Link>
                </div>
                
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                     {user && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User'} />
                                        <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>{user.displayName || 'My Account'}</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/settings">Settings</Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout}>
                                <LogOut className="mr-2 h-4 w-4" />
                                Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </header>
            <main className="flex-1 overflow-auto p-4 lg:p-8">
            {children}
            </main>
        </div>
    </div>
  );
}
