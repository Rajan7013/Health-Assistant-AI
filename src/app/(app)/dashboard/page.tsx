
'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight, Bot, BookHeart, CalendarClock, History, Pill, Stethoscope } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const heroImage = PlaceHolderImages.find(img => img.id === 'hero');

const quickAccessItems = [
    {
        title: 'Schedule',
        href: '/schedule',
        icon: CalendarClock,
        color: 'bg-blue-100 dark:bg-blue-900/30',
        iconColor: 'text-blue-600 dark:text-blue-400',
        shadowColor: 'hover:shadow-blue-500/30'
    },
    {
        title: 'Medications',
        href: '/schedule',
        icon: Pill,
        color: 'bg-red-100 dark:bg-red-900/30',
        iconColor: 'text-red-600 dark:text-red-400',
        shadowColor: 'hover:shadow-red-500/30'
    },
    {
        title: 'History',
        href: '#',
        icon: History,
        color: 'bg-yellow-100 dark:bg-yellow-900/30',
        iconColor: 'text-yellow-600 dark:text-yellow-400',
        shadowColor: 'hover:shadow-yellow-500/30'
    },
];

const coreFeatures = [
    {
        title: 'AI Health Assistant',
        description: 'Ask our AI about symptoms, medicines, and health advice.',
        href: '/chat',
        icon: Bot,
        color: 'bg-purple-100 dark:bg-purple-900/30',
        iconColor: 'text-purple-600 dark:text-purple-400',
        shadowColor: 'hover:shadow-purple-500/30',
    },
    {
        title: 'Symptom Analyzer',
        description: 'Describe your symptoms to get an AI-powered report.',
        href: '/symptom-checker',
        icon: Stethoscope,
        color: 'bg-green-100 dark:bg-green-900/30',
        iconColor: 'text-green-600 dark:text-green-400',
        shadowColor: 'hover:shadow-green-500/30',
    },
    {
        title: 'Disease Library',
        description: 'Learn about various health conditions and treatments.',
        href: '/diseases',
        icon: BookHeart,
        color: 'bg-sky-100 dark:bg-sky-900/30',
        iconColor: 'text-sky-600 dark:text-sky-400',
        shadowColor: 'hover:shadow-sky-500/30',
    },
]

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <Card className="overflow-hidden relative rounded-2xl shadow-lg h-80 lg:h-auto">
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
                            <Link href="/chat">
                                <Bot className="mr-2 h-5 w-5" />
                                Ask Our AI
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
                            <Link href="/schedule">
                                View Schedule <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                    </div>
                  </div>
                </div>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {coreFeatures.map(feature => (
                     <Link href={feature.href} key={feature.title}>
                        <div className={`p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-4 ${feature.color} ${feature.shadowColor}`}>
                            <div className="p-4 bg-white rounded-full shadow-md">
                                <feature.icon className={`h-8 w-8 ${feature.iconColor}`} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-foreground">{feature.title}</h3>
                                <p className="text-muted-foreground mt-1">{feature.description}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>


        <div className="lg:col-span-1">
            <Card className="rounded-2xl shadow-lg bg-secondary border-2 border-blue-500/30">
                <CardHeader>
                    <CardTitle>Quick Access</CardTitle>
                    <CardDescription>Your most used features, right at your fingertips.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        {quickAccessItems.map(item => (
                            <Link href={item.href} key={item.title}>
                                <div className={`flex flex-col items-center justify-center p-4 ${item.color} rounded-xl aspect-square transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl ${item.shadowColor}`}>
                                    <div className={`p-3 bg-white rounded-full shadow-sm mb-2`}>
                                        <item.icon className={`h-6 w-6 ${item.iconColor}`} />
                                    </div>
                                    <p className="text-sm font-semibold text-center text-foreground/80">{item.title}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>

    </div>
  );
}
