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
} from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/icons';
import { ThemeToggle } from '@/components/theme-toggle';

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
  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-card lg:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-16 items-center border-b px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Logo className="h-6 w-6 text-primary" />
              <span className="font-headline text-xl">MediAssistant AI</span>
            </Link>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <div className="px-4">
              <AppNav />
            </div>
          </div>
           <div className="mt-auto p-4 border-t">
              <Button variant="ghost" className="w-full justify-start gap-2" asChild>
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
              <Button variant="outline" size="icon" className="shrink-0 lg:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
               <SheetHeader className="mb-4">
                 <Link href="/" className="flex items-center gap-2 font-semibold">
                    <Logo className="h-6 w-6 text-primary" />
                    <span className="font-headline text-xl">MediAssistant AI</span>
                </Link>
               </SheetHeader>
              <AppNav />
               <div className="mt-auto border-t pt-4">
                <Button variant="ghost" className="w-full justify-start gap-2" asChild>
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://picsum.photos/seed/user/100/100" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex-1 bg-background p-4 lg:p-8 overflow-auto">
            {children}
        </main>
      </div>
    </div>
  );
}
