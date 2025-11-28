import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight, Bot, BookHeart, CalendarClock, Stethoscope } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const heroImage = PlaceHolderImages.find(img => img.id === 'hero');

const features = [
    {
        title: 'Symptom Checker',
        description: 'Get insights into your health symptoms.',
        href: '/symptom-checker',
        icon: Stethoscope,
        image: PlaceHolderImages.find(img => img.id === 'symptom-checker')
    },
    {
        title: 'AI Chat',
        description: 'Ask our AI about medicines, diseases, and more.',
        href: '/chat',
        icon: Bot,
        image: PlaceHolderImages.find(img => img.id === 'ai-chat')
    },
    {
        title: 'Medicine Schedule',
        description: 'Never miss a dose with our scheduler.',
        href: '/schedule',
        icon: CalendarClock,
        image: PlaceHolderImages.find(img => img.id === 'medicine-schedule')
    },
    {
        title: 'Disease Library',
        description: 'Browse our extensive library of diseases.',
        href: '/diseases',
        icon: BookHeart,
        image: PlaceHolderImages.find(img => img.id === 'disease-library')
    },
]

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <Card className="overflow-hidden shadow-lg">
        <div className="relative h-64 w-full">
            {heroImage && (
                <Image
                    src={heroImage.imageUrl}
                    alt={heroImage.description}
                    data-ai-hint={heroImage.imageHint}
                    fill
                    className="object-cover"
                />
            )}
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex flex-col justify-center p-8 text-white">
            <h1 className="font-headline text-4xl md:text-6xl font-bold">
              Welcome to MediAssistant AI
            </h1>
            <p className="mt-2 text-lg md:text-xl max-w-2xl">
              Your intelligent health partner. Get information, track your medicines, and understand your symptoms.
            </p>
            <div className="mt-6">
                <Button size="lg" asChild>
                    <Link href="/chat">
                        Ask our AI Assistant <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {features.map(feature => (
             <Card key={feature.title} className="flex flex-col hover:shadow-xl transition-shadow duration-300">
                {feature.image && (
                     <div className="relative h-40 w-full">
                        <Image 
                            src={feature.image.imageUrl}
                            alt={feature.image.description}
                            data-ai-hint={feature.image.imageHint}
                            width={400}
                            height={300}
                            className="object-cover rounded-t-lg h-full w-full"
                        />
                     </div>
                )}
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <feature.icon className="h-5 w-5 text-primary" />
                        {feature.title}
                    </CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto">
                    <Button variant="secondary" className="w-full" asChild>
                        <Link href={feature.href}>
                            Go to {feature.title}
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        ))}
      </div>
    </div>
  );
}
