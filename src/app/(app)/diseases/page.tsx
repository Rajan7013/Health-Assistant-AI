import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { diseases } from '@/lib/data';
import Image from 'next/image';
import Link from 'next/link';

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
        {diseases.map((disease) => (
          <Link href={`/diseases/${disease.slug}`} key={disease.slug} className="block h-full">
            <Card className="h-full flex flex-col group overflow-hidden hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
              {disease.image?.imageUrl && (
                <div className="relative h-48 w-full">
                  <Image
                    src={disease.image.imageUrl}
                    alt={disease.image.description}
                    data-ai-hint={disease.image.imageHint}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
              )}
              <CardHeader className="flex-grow">
                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                  {disease.name}
                </CardTitle>
                <CardDescription className="pt-2 line-clamp-2">{disease.shortDescription}</CardDescription>
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
