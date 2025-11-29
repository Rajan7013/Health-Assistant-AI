import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
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
        iconColor: 'text-blue-600 dark:text-blue-400'
    },
    {
        title: 'Library',
        href: '/diseases',
        icon: BookHeart,
        color: 'bg-green-100 dark:bg-green-900/30',
        iconColor: 'text-green-600 dark:text-green-400'
    },
    {
        title: 'Medications',
        href: '/schedule',
        icon: Pill,
        color: 'bg-red-100 dark:bg-red-900/30',
        iconColor: 'text-red-600 dark:text-red-400'
    },
    {
        title: 'History',
        href: '#',
        icon: History,
        color: 'bg-yellow-100 dark:bg-yellow-900/30',
        iconColor: 'text-yellow-600 dark:text-yellow-400'
    },
];

const coreFeatures = [
    {
        title: 'Symptom Checker',
        description: 'Analyze your symptoms with our AI-powered tool for insights.',
        href: '/symptom-checker',
        image: PlaceHolderImages.find(img => img.id === 'symptom-checker'),
        icon: Stethoscope,
        color: 'bg-indigo-100 dark:bg-indigo-900/30',
        iconColor: 'text-indigo-600 dark:text-indigo-400',
    },
    {
        title: 'AI Health Assistant',
        description: 'Ask our AI about medicines, diseases, and get health advice.',
        href: '/chat',
        image: PlaceHolderImages.find(img => img.id === 'ai-chat'),
        icon: Bot,
        color: 'bg-purple-100 dark:bg-purple-900/30',
        iconColor: 'text-purple-600 dark:text-purple-400',
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
                            <div className={`flex flex-col items-center justify-center p-4 ${item.color} hover:opacity-90 rounded-xl aspect-square transition-all`}>
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

      <div>
        <h2 className="text-2xl font-bold mb-4">Explore Our Core Features</h2>
        <div className="grid gap-8 md:grid-cols-2">
            {coreFeatures.map(feature => (
                <Link href={feature.href} key={feature.title} className="group">
                    <Card className="h-full flex flex-col overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
                        <CardHeader className={`p-6 ${feature.color} flex flex-row items-center gap-4`}>
                           <div className={`p-3 bg-white rounded-full shadow-sm`}>
                                <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold">{feature.title}</CardTitle>
                                <p className="text-muted-foreground">{feature.description}</p>
                            </div>
                        </CardHeader>
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
                    </Card>
                </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
