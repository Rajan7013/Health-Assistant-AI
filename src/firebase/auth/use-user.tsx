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
  const [clientLoaded, setClientLoaded] = useState(false);

  useEffect(() => {
    setClientLoaded(true);
  }, []);

  useEffect(() => {
    if (!clientLoaded) return;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);

      const onAuthRoute = isAuthRoute(pathname);

      if (user) {
        if (onAuthRoute) {
          router.replace('/dashboard');
        }
      } else {
        if (!onAuthRoute) {
          router.replace('/login');
        }
      }
    });

    return () => unsubscribe();
  }, [auth, router, pathname, clientLoaded]);

  return { user, loading: loading || !clientLoaded, clientLoaded };
}
