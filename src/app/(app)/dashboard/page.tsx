import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight, Bot, Book, Calendar, History, Pill, Stethoscope } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const heroImage = PlaceHolderImages.find(img => img.id === 'hero');

const quickAccessItems = [
    {
        title: 'Schedule',
        href: '/schedule',
        icon: Calendar,
    },
    {
        title: 'Library',
        href: '/diseases',
        icon: Book,
    },
    {
        title: 'Medications',
        href: '/schedule', // Assuming this links to schedule for now
        icon: Pill,
    },
    {
        title: 'History',
        href: '#', // TBD
        icon: History,
    },
];

const coreFeatures = [
    {
        title: 'Symptom Checker',
        description: 'Analyze your symptoms with our AI-powered tool for insights.',
        href: '/symptom-checker',
        image: PlaceHolderImages.find(img => img.id === 'symptom-checker')
    },
    {
        title: 'AI Health Assistant',
        description: 'Ask our AI about medicines, diseases, and get health advice.',
        href: '/chat',
        image: PlaceHolderImages.find(img => img.id === 'ai-chat')
    },
]

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 overflow-hidden relative rounded-2xl shadow-lg">
            <div className="h-full w-full">
                {heroImage && (
                    <Image
                        src={heroImage.imageUrl}
                        alt={heroImage.description}
                        data-ai-hint={heroImage.imageHint}
                        fill
                        className="object-cover"
                    />
                )}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 via-blue-800/50 to-transparent" />
              <div className="relative h-full flex flex-col justify-center p-8 md:p-12 text-white">
                <h1 className="text-4xl md:text-5xl font-bold font-serif">
                  Welcome back,
                </h1>
                <p className="mt-2 text-lg md:text-xl max-w-lg text-blue-100">
                  How can HealthMind AI assist you today?
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                    <Button size="lg" variant="secondary" className="bg-white/90 hover:bg-white text-primary font-bold shadow-md" asChild>
                        <Link href="/symptom-checker">
                            <Stethoscope className="mr-2 h-5 w-5" />
                            Check Symptoms
                        </Link>
                    </Button>
                    <Button size="lg" variant="secondary" className="bg-white/90 hover:bg-white text-primary font-bold shadow-md" asChild>
                        <Link href="/chat">
                            <Bot className="mr-2 h-5 w-5" />
                            Ask Our AI
                        </Link>
                    </Button>
                </div>
              </div>
            </div>
        </Card>

        <Card className="rounded-2xl shadow-lg">
            <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Quick Access</h2>
                <div className="grid grid-cols-2 gap-4">
                    {quickAccessItems.map(item => (
                        <Link href={item.href} key={item.title}>
                            <div className="flex flex-col items-center justify-center p-4 bg-secondary/50 hover:bg-secondary rounded-xl aspect-square transition-colors">
                                <div className="p-3 bg-white rounded-full shadow-sm mb-2">
                                    <item.icon className="h-6 w-6 text-primary" />
                                </div>
                                <p className="text-sm font-semibold text-center">{item.title}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Explore Our Core Features</h2>
        <div className="grid gap-8 md:grid-cols-2">
            {coreFeatures.map(feature => (
                <Link href={feature.href} key={feature.title} className="group">
                    <Card className="h-full flex flex-col overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
                        {feature.image && (
                            <div className="relative h-60 w-full">
                                <Image
                                    src={feature.image.imageUrl}
                                    alt={feature.image.description}
                                    data-ai-hint={feature.image.imageHint}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                        )}
                        <div className="p-6">
                            <h3 className="text-xl font-bold mb-1">{feature.title}</h3>
                            <p className="text-muted-foreground">{feature.description}</p>
                        </div>
                    </Card>
                </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
