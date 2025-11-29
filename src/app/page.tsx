import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import Link from 'next/link';
import { Logo } from '@/components/icons';
import { ArrowRight, Bot, CalendarClock, ShieldCheck } from 'lucide-react';

const heroImage = PlaceHolderImages.find(img => img.id === 'hero');

const features = [
  {
    icon: Bot,
    title: 'AI Health Assistant',
    description: 'Get instant, reliable answers to your health questions, from symptom analysis to medicine details.',
  },
  {
    icon: ShieldCheck,
    title: 'Symptom Analysis',
    description: 'Describe your symptoms and our AI will provide you with potential insights and recommendations.',
  },
  {
    icon: CalendarClock,
    title: 'Medication Scheduling',
    description: 'Never miss a dose with our easy-to-use medication scheduler and reminder system.',
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-40 w-full bg-background/60 backdrop-blur-lg border-b">
        <div className="container mx-auto flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">HealthMind AI</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Log In</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="relative h-[600px] flex items-center justify-center text-center">
            {heroImage && (
                <Image
                    src={heroImage.imageUrl}
                    alt={heroImage.description}
                    data-ai-hint={heroImage.imageHint}
                    fill
                    className="object-cover"
                />
            )}
            <div className="absolute inset-0 bg-black/50" />
            <div className="relative text-white px-4">
                <h1 className="text-4xl md:text-6xl font-headline font-bold">Your Personal AI Health Assistant</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-white/90">
                    Navigate your health journey with confidence. Get intelligent insights on symptoms, medications, and more.
                </p>
                <Button size="lg" className="mt-8" asChild>
                    <Link href="/signup">Get Started for Free <ArrowRight className="ml-2 h-5 w-5" /></Link>
                </Button>
            </div>
        </section>

        <section className="py-16 lg:py-24 bg-secondary">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-headline font-bold">All-in-One Health Companion</h2>
              <p className="mt-2 max-w-xl mx-auto text-muted-foreground">
                From understanding your symptoms to managing your schedule, we've got you covered.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="p-8 bg-background rounded-2xl shadow-lg flex flex-col items-center text-center">
                  <div className="p-4 bg-primary/10 rounded-full mb-4">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="mt-2 text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>
      <footer className="py-8 bg-muted">
        <div className="container mx-auto text-center text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} HealthMind AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
