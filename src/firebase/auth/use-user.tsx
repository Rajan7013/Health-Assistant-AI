"use client";

import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { useAuth } from '@/firebase/provider';
import { useRouter, usePathname } from 'next/navigation';

const AUTH_ROUTES = ['/login', '/signup', '/forgot-password'];
const isAuthRoute = (pathname: string) => AUTH_ROUTES.includes(pathname);

export function useUser() {
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);

      if (user && isAuthRoute(pathname)) {
        router.replace('/dashboard');
      } else if (!user && !isAuthRoute(pathname)) {
        router.replace('/login');
      }
    });

    return () => unsubscribe();
  }, [auth, router, pathname]);

  return { user, loading };
}
