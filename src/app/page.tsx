'use client';

import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import Link from 'next/link';
import { Logo } from '@/components/icons';
import { ArrowRight, Bot, CalendarClock, ShieldCheck, Sparkles, Activity, HeartPulse } from 'lucide-react';
import { useUser } from '@/firebase/auth/use-user';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const heroImage = PlaceHolderImages.find(img => img.id === 'hero');

const features = [
  {
    icon: Bot,
    title: 'AI Health Assistant',
    description: 'Get instant, reliable answers to your health questions, from symptom analysis to medicine details.',
    gradient: 'from-blue-500 to-cyan-400',
  },
  {
    icon: ShieldCheck,
    title: 'Symptom Analysis',
    description: 'Describe your symptoms and our AI will provide you with potential insights and recommendations.',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: CalendarClock,
    title: 'Medication Scheduling',
    description: 'Never miss a dose with our easy-to-use medication scheduler and reminder system.',
    gradient: 'from-amber-400 to-orange-500',
  },
];

export default function Home() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) return null; // Or a loading spinner

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="container mx-auto flex h-20 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-gradient-to-br from-purple-600 to-blue-500 p-2 rounded-xl group-hover:scale-105 transition-transform">
              <Logo className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-black" style={{ color: '#000000' }}>HealthMind AI</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild className="text-black font-medium hover:bg-gray-50 hover:text-purple-600">
              <Link href="/login">Log In</Link>
            </Button>
            <Button asChild className="rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold shadow-lg hover:shadow-xl transition-all">
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-100/50 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-100/50 via-transparent to-transparent" />

          <div className="container mx-auto px-4 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-100 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-bold text-purple-900">Your Personal Health Companion</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-tight text-black" style={{ color: '#000000' }}>
              Health care reimagined <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400">
                with Intelligence
              </span>
            </h1>

            <p className="mt-6 max-w-2xl mx-auto text-xl text-black font-medium leading-relaxed" style={{ color: '#000000' }}>
              Navigate your health journey with confidence. Get intelligent insights on symptoms, medications, and more—instantly.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-14 px-8 rounded-full bg-black text-white hover:bg-gray-900 font-bold text-lg shadow-xl hover:scale-105 transition-all" asChild>
                <Link href="/signup">
                  Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 rounded-full border-2 border-gray-200 text-black hover:bg-gray-50 font-bold text-lg" asChild>
                <Link href="/login">
                  Existing Member
                </Link>
              </Button>
            </div>

            {/* Hero Image / Graphic */}
            <div className="mt-20 relative max-w-5xl mx-auto">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 rounded-[2.5rem] blur opacity-30 animate-pulse" />
              <div className="relative rounded-[2rem] overflow-hidden border border-gray-200 shadow-2xl bg-white aspect-[16/9] flex items-center justify-center">
                {heroImage ? (
                  <Image
                    src={heroImage.imageUrl}
                    alt={heroImage.description}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="text-center p-10">
                    <Activity className="w-20 h-20 text-purple-200 mx-auto mb-4" />
                    <p className="text-gray-400 font-medium">Interactive Dashboard Preview</p>
                  </div>
                )}

                {/* Floating Cards for Effect */}
                <div className="absolute top-10 left-10 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 animate-bounce" style={{ animationDuration: '3s' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <HeartPulse className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-bold">Heart Rate</p>
                      <p className="text-lg font-black text-black">72 BPM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-gray-50/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black mb-6 text-black" style={{ color: '#000000' }}>All-in-One Health Companion</h2>
              <p className="max-w-xl mx-auto text-lg font-medium text-black" style={{ color: '#000000' }}>
                From understanding your symptoms to managing your schedule, we've got you covered with state-of-the-art AI.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="group relative p-1 rounded-3xl bg-gradient-to-br from-white to-gray-50 hover:from-purple-500 hover:via-blue-500 hover:to-cyan-500 transition-all duration-500 shadow-lg hover:shadow-2xl">
                  <div className="relative h-full bg-white rounded-[22px] p-8 flex flex-col items-center text-center transition-transform group-hover:scale-[0.99]">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-black mb-4 text-black" style={{ color: '#000000' }}>{feature.title}</h3>
                    <p className="text-black font-medium leading-relaxed" style={{ color: '#000000' }}>{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Logo className="h-6 w-6 text-purple-600" />
            <span className="text-lg font-black text-black">HealthMind AI</span>
          </div>
          <div className="flex justify-center gap-6 mb-6">
            <Link href="/privacy" className="text-gray-600 hover:text-purple-600 font-medium transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-600 hover:text-purple-600 font-medium transition-colors">
              Terms of Service
            </Link>
          </div>
          <p className="text-black font-medium text-sm" style={{ color: '#000000' }}>&copy; {new Date().getFullYear()} HealthMind AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
