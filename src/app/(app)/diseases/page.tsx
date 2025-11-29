
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { diseases } from '@/lib/data';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const cardColors = [
    "border-t-blue-500",
    "border-t-green-500",
    "border-t-yellow-500",
    "border-t-purple-500",
    "border-t-red-500",
    "border-t-indigo-500",
    "border-t-pink-500",
    "border-t-sky-500",
];

export default function DiseasesPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="font-headline text-4xl font-bold">Disease & Condition Library</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Explore our comprehensive library of health conditions to learn about symptoms, causes, and treatments.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {diseases.map((disease, index) => (
          <Link href={`/diseases/${disease.slug}`} key={disease.slug} className="block h-full">
            <Card className={cn(
                "h-full flex flex-col group overflow-hidden hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1 border-t-4",
                cardColors[index % cardColors.length]
                )}>
              <CardHeader className="flex-grow">
                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                  {disease.name}
                </CardTitle>
                <CardDescription className="pt-2 line-clamp-3">{disease.shortDescription}</CardDescription>
              </CardHeader>
              <CardContent>
                 <p className="text-sm font-semibold text-primary group-hover:underline">Read More &rarr;</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
