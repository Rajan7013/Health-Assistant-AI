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
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/icons';
import { ThemeToggle } from '@/components/theme-toggle';
import { useUser } from '@/firebase/auth/use-user';
import { signOut } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

const navItems = [
  {
    href: '/dashboard',
    icon: LayoutDashboard,
    label: 'Dashboard',
  },
  {
    href: '/symptom-checker',
    icon: Stethoscope,
    label: 'Symptom Checker',
  },
  {
    href: '/chat',
    icon: Bot,
    label: 'AI Chat',
  },
  {
    href: '/schedule',
    icon: CalendarClock,
    label: 'Schedule',
  },
  {
    href: '/diseases',
    icon: BookHeart,
    label: 'Diseases',
  },
];

const AppNav = () => (
  <nav className="flex-1 space-y-2">
    {navItems.map((item) => (
      <Button
        key={item.label}
        variant="ghost"
        className="w-full justify-start gap-2"
        asChild
      >
        <Link href={item.href}>
          <item.icon className="h-4 w-4" />
          {item.label}
        </Link>
      </Button>
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

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('');
  }

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-card lg:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-16 items-center border-b px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Logo className="h-6 w-6 text-primary" />
              <span className="font-headline text-xl">HealthMind AI</span>
            </Link>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <div className="px-4">
              <AppNav />
            </div>
          </div>
          <div className="mt-auto p-4 border-t">
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
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-16 items-center gap-4 border-b bg-card px-6">
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
                    <span className="font-headline text-xl">HealthMind AI</span>
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
          <div className="w-full flex-1">
            {/* Can add breadcrumbs or page title here */}
          </div>
          <ThemeToggle />
          {loading ? (
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
                <DropdownMenuItem>Profile</DropdownMenuItem>
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
          ) : (
             <Button asChild>
                <Link href="/login">Login</Link>
             </Button>
          )}
        </header>
        <main className="flex-1 bg-background p-4 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
