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
        <h1 className="font-headline text-4xl font-bold">Disease Library</h1>
        <p className="text-muted-foreground mt-2">
          Explore information about various health conditions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {diseases.map((disease) => (
          <Link href={`/diseases/${disease.slug}`} key={disease.slug}>
            <Card className="h-full flex flex-col group overflow-hidden hover:shadow-xl transition-shadow duration-300">
              {disease.image && (
                <div className="relative h-48 w-full">
                  <Image
                    src={disease.image.imageUrl}
                    alt={disease.image.description}
                    data-ai-hint={disease.image.imageHint}
                    width={400}
                    height={300}
                    className="object-cover h-full w-full group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle className="font-headline text-2xl group-hover:text-primary transition-colors">
                  {disease.name}
                </CardTitle>
                <CardDescription className="pt-2">{disease.shortDescription}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                 <p className="text-sm font-semibold text-primary group-hover:underline">Read More &rarr;</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
