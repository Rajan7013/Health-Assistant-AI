import { diseases, type Disease } from '@/lib/data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, HeartPulse, HelpCircle, Shield, UserRoundCheck } from 'lucide-react';

export function generateStaticParams() {
  return diseases.map((disease) => ({
    slug: disease.slug,
  }));
}

function getDiseaseFromSlug(slug: string): Disease | undefined {
  return diseases.find((disease) => disease.slug === slug);
}

const DetailSection = ({ icon, title, content }: { icon: React.ElementType, title: string, content: string | undefined }) => {
    if (!content) return null;
    const Icon = icon;
    return (
        <div>
            <h3 className="flex items-center gap-2 font-semibold text-lg mb-2">
                <Icon className="h-5 w-5 text-primary" />
                {title}
            </h3>
            <p className="text-muted-foreground">{content}</p>
        </div>
    )
};


export default function DiseaseDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const disease = getDiseaseFromSlug(params.slug);

  if (!disease) {
    notFound();
  }
  
  const tags = disease.details.types?.split(',').map(t => t.trim());

  return (
    <div className="max-w-5xl mx-auto">
        <div className="relative h-80 rounded-lg overflow-hidden mb-8">
            {disease.image && (
                <Image
                    src={disease.image.imageUrl}
                    alt={disease.image.description}
                    data-ai-hint={disease.image.imageHint}
                    fill
                    className="object-cover"
                />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-0 left-0 p-8">
                <h1 className="font-headline text-5xl font-bold text-white">
                    {disease.name}
                </h1>
                <p className="text-white/80 mt-2 max-w-2xl text-lg">{disease.shortDescription}</p>
            </div>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Condition Details</CardTitle>
                {tags && (
                    <div className="flex flex-wrap gap-2 pt-2">
                        {tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                    </div>
                )}
            </CardHeader>
            <CardContent className="space-y-6">
                <DetailSection icon={HeartPulse} title="Symptoms" content={disease.details.symptoms} />
                <DetailSection icon={HelpCircle} title="Causes" content={disease.details.causes} />
                <DetailSection icon={Shield} title="Control Measures" content={disease.details.controlMeasures} />
                <DetailSection icon={FileText} title="Examples" content={disease.details.examples} />
                
                <div className="grid md:grid-cols-2 gap-6">
                    <Card className="border-red-500/50 bg-red-500/5">
                        <CardHeader>
                            <CardTitle className="text-red-700 dark:text-red-400 flex items-center gap-2">
                                <UserRoundCheck className="h-5 w-5" />
                                When to Contact a Doctor
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-red-600 dark:text-red-300">{disease.details.whenToContactDoctor}</p>
                        </CardContent>
                    </Card>
                     <Card className="border-orange-500/50 bg-orange-500/5">
                        <CardHeader>
                            <CardTitle className="text-orange-700 dark:text-orange-400 flex items-center gap-2">
                                <HelpCircle className="h-5 w-5" />
                                Emergency Signs
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-orange-600 dark:text-orange-300">{disease.details.emergency}</p>
                        </CardContent>
                    </Card>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
