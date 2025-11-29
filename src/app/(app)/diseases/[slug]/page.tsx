import { diseases, type Disease } from '@/lib/data';
import { notFound } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, HeartPulse, HelpCircle, Shield, UserRoundCheck, AlertTriangle } from 'lucide-react';

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
        <Card>
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
                <DetailSection icon={HeartPulse} title="Symptoms" content={disease.details.symptoms} />
                <DetailSection icon={HelpCircle} title="Causes" content={disease.details.causes} />
                <DetailSection icon={Shield} title="Control Measures" content={disease.details.controlMeasures} />
                <DetailSection icon={FileText} title="Examples" content={disease.details.examples} />
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
