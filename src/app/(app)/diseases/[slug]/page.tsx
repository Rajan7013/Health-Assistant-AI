import { diseases, type Disease } from '@/lib/data';
import { notFound } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, HeartPulse, HelpCircle, Shield, UserRoundCheck, AlertTriangle, Lightbulb, Stethoscope, Dna, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

export function generateStaticParams() {
  return diseases.map((disease) => ({
    slug: disease.slug,
  }));
}

function getDiseaseFromSlug(slug: string): Disease | undefined {
  return diseases.find((disease) => disease.slug === slug);
}

const detailSections = [
    { key: 'symptoms', title: 'Symptoms', icon: Stethoscope, borderColor: 'border-t-blue-500' },
    { key: 'causes', title: 'Causes', icon: Dna, borderColor: 'border-t-green-500' },
    { key: 'controlMeasures', title: 'Control Measures', icon: Shield, borderColor: 'border-t-yellow-500' },
    { key: 'examples', title: 'Examples', icon: Lightbulb, borderColor: 'border-t-purple-500' },
];

const DetailSection = ({ icon, title, content, borderColor }: { icon: React.ElementType, title: string, content: string | undefined, borderColor: string }) => {
    if (!content) return null;
    const Icon = icon;
    return (
        <Card className={cn("border-t-4 transition-shadow hover:shadow-lg", borderColor)}>
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                    <Icon className="h-6 w-6 text-primary" />
                    <span>{title}</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">{content}</p>
            </CardContent>
        </Card>
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
    <div className="max-w-6xl mx-auto">
        <div className="mb-8">
            <h1 className="font-headline text-5xl font-bold text-foreground">
                {disease.name}
            </h1>
            <p className="text-muted-foreground mt-2 max-w-3xl text-lg">{disease.shortDescription}</p>
             {tags && (
                <div className="flex flex-wrap gap-2 pt-4">
                    {tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                </div>
            )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                {detailSections.map(section => (
                    <DetailSection 
                        key={section.key}
                        icon={section.icon}
                        title={section.title}
                        content={disease.details[section.key as keyof typeof disease.details]}
                        borderColor={section.borderColor}
                    />
                ))}
            </div>
            <div className="space-y-6 lg:col-span-1">
                 <Card className="border-red-500/50 bg-red-500/10">
                    <CardHeader>
                        <CardTitle className="text-red-700 dark:text-red-400 flex items-center gap-3">
                            <UserRoundCheck className="h-6 w-6" />
                            When to Contact a Doctor
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-red-600 dark:text-red-300">{disease.details.whenToContactDoctor}</p>
                    </CardContent>
                </Card>
                 <Card className="border-orange-500/50 bg-orange-500/10">
                    <CardHeader>
                        <CardTitle className="text-orange-700 dark:text-orange-400 flex items-center gap-3">
                            <AlertTriangle className="h-6 w-6" />
                            Emergency Signs
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-orange-600 dark:text-orange-300">{disease.details.emergency}</p>
                    </CardContent>
                </Card>
            </div>
        </div>

    </div>
  );
}
