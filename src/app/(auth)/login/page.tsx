'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider, getAdditionalUserInfo } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/icons';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useAuth, useFirestore } from '@/firebase';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const loginImage = PlaceHolderImages.find((img) => img.id === 'login-visual');
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const additionalInfo = getAdditionalUserInfo(result);
      if (additionalInfo?.isNewUser) {
        await setDoc(doc(firestore, 'users', user.uid), {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          createdAt: serverTimestamp(),
        });
      }

      toast({
        title: 'Login Successful',
        description: `Welcome back, ${user.displayName}!`,
      });
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Google Sign-In error:', error);
      toast({
        variant: 'destructive',
        title: 'Google Sign-In Failed',
        description: 'Could not sign you in with Google. Please try again.',
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px] bg-white">
      <div className="flex items-center justify-center py-12 px-4 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-purple-100/40 via-transparent to-transparent pointer-events-none" />

        <Card className="mx-auto max-w-sm w-full border-0 shadow-2xl rounded-3xl overflow-hidden relative z-10 bg-white/80 backdrop-blur-xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500" />

          <CardHeader className="text-center pb-2">
            <div className="mx-auto h-12 w-12 bg-gradient-to-br from-purple-600 to-blue-500 rounded-xl flex items-center justify-center mb-4 shadow-lg">
              <Logo className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-black text-black" style={{ color: '#000000' }}>
              Welcome Back
            </CardTitle>
            <CardDescription className="text-black font-medium" style={{ color: '#000000' }}>
              Sign in securely with your Google account
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">

            <Button
              variant="outline"
              className="w-full rounded-xl border-gray-200 hover:bg-gray-50 text-black font-bold h-12 text-base shadow-sm hover:shadow-md transition-all"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              style={{ color: '#000000' }}
            >
              {isGoogleLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <svg
                  className="mr-3 h-5 w-5"
                  viewBox="0 0 48 48"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill="#FFC107"
                    d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.485 13.85C34.843 10.62 30.007 8.5 24 8.5c-8.837 0-16 7.163-16 16s7.163 16 16 16c9.284 0 15.4-6.533 15.4-15.5c0-1.022-.087-2.023-.25-3.001z"
                  />
                  <path
                    fill="#FF3D00"
                    d="M6.306 14.691c-1.336 2.53-2.106 5.43-2.106 8.5c0 3.07.77 5.97 2.106 8.5L2.389 35.85C.944 32.79 0 29.28 0 25.5C0 21.72.944 18.21 2.389 15.15L6.306 14.691z"
                  />
                  <path
                    fill="#4CAF50"
                    d="M24 44c5.166 0 9.86-1.977 13.4-5.4l-4.045-4.045c-2.37 1.575-5.266 2.445-8.355 2.445c-5.223 0-9.66-3.343-11.303-8l-4.12 3.14C9.4 38.023 15.913 44 24 44z"
                  />
                  <path
                    fill="#1976D2"
                    d="M43.611 20.083H24v8h11.303c-.792 2.237-2.231 4.16-4.087 5.571l4.045 4.045C41.46 34.52 44 29.62 44 24c0-1.933-.284-3.815-.79-5.624l-4.599 1.707z"
                  />
                </svg>
              )}
              Continue with Google
            </Button>

            <div className="mt-8 text-center text-sm font-medium text-gray-500">
              By continuing, you agree to our{' '}
              <Link href="/terms" className="underline hover:text-purple-600">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="underline hover:text-purple-600">
                Privacy Policy
              </Link>.
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="hidden bg-gray-50 lg:block relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 z-10" />
        {loginImage && (
          <Image
            src={loginImage.imageUrl}
            alt={loginImage.description}
            data-ai-hint={loginImage.imageHint}
            width="1920"
            height="1080"
            className="h-full w-full object-cover"
          />
        )}
      </div>
    </div>
  );
}
