"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Loader2, AlertCircle, FileText, Shield, HeartPulse, HelpCircle, UserRoundCheck } from 'lucide-react';
import { explainSymptoms, SymptomExplanationOutput } from '@/ai/flows/ai-symptom-explanation';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function SymptomCheckerPage() {
  const [symptoms, setSymptoms] = useState('');
  const [result, setResult] = useState<SymptomExplanationOutput | null>(null);
  const [status, setStatus] = useState<Status>('idle');

  const handleSubmit = async () => {
    if (!symptoms.trim()) return;

    setStatus('loading');
    setResult(null);

    try {
      const response = await explainSymptoms({ symptoms });

      // Simulate a slightly longer response time for better UX
      setTimeout(() => {
        setResult(response);
        setStatus('success');
      }, 500);

    } catch (error) {
      console.error('Error explaining symptoms:', error);
      setStatus('error');
    }
  };

  const parseExplanation = (explanation: string) => {
    const sections: { [key: string]: string } = {};
    const regex = /\*\*(.*?)\*\*:/g;
    let match;
    let lastIndex = 0;
    let lastTitle = 'introduction';

    // Initial text before the first heading
    const firstMatch = regex.exec(explanation);
    if(firstMatch && firstMatch.index > 0) {
        sections['introduction'] = explanation.substring(0, firstMatch.index).trim();
    }
    regex.lastIndex = 0; // Reset regex

    while ((match = regex.exec(explanation)) !== null) {
      if (lastIndex !== 0) {
        sections[lastTitle] = explanation.substring(lastIndex, match.index).trim();
      }
      lastTitle = match[1].trim().toLowerCase().replace(/\s+/g, '_');
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex > 0) {
      sections[lastTitle] = explanation.substring(lastIndex).trim();
    }
    
    if (Object.keys(sections).length === 0) {
        return {introduction: explanation};
    }

    return sections;
  };

  const sections = result ? parseExplanation(result.explanation) : {};

  const sectionConfig = [
    { key: 'possible_causes', title: 'Possible Causes', icon: HelpCircle },
    { key: 'control_measures', title: 'Control Measures', icon: Shield },
    { key: 'types', title: 'Types', icon: FileText },
    { key: 'examples', title: 'Examples', icon: FileText },
    { key: 'when_to_contact_doctors', title: 'When to Contact Doctors', icon: UserRoundCheck },
  ];

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <h1 className="font-headline text-4xl font-bold text-center mb-2">
        AI Symptom Checker
      </h1>
      <p className="text-muted-foreground text-center mb-8">
        Describe your symptoms, and our AI will provide potential insights. This is not a substitute for professional medical advice.
      </p>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Describe Your Symptoms</CardTitle>
          <CardDescription>
            Please provide a detailed description of how you are feeling.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="e.g., I have a persistent dry cough, a slight fever, and feel very tired..."
            rows={5}
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            className="mb-4"
            disabled={status === 'loading'}
          />
          <Button
            onClick={handleSubmit}
            disabled={status === 'loading' || !symptoms.trim()}
            className="w-full"
          >
            {status === 'loading' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Analyze Symptoms
          </Button>
        </CardContent>
      </Card>

      {status === 'loading' && (
        <div className="text-center mt-8">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-muted-foreground">AI is analyzing your symptoms...</p>
        </div>
      )}

      {status === 'error' && (
         <Card className="mt-8 border-destructive bg-destructive/10">
            <CardHeader className="flex-row items-center gap-3">
                 <AlertCircle className="h-6 w-6 text-destructive" />
                <CardTitle className="text-destructive">An Error Occurred</CardTitle>
            </CardHeader>
            <CardContent>
                <p>We're sorry, but we couldn't process your request at this time. Please try again later.</p>
            </CardContent>
         </Card>
      )}

      {status === 'success' && result && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <HeartPulse className="h-6 w-6 text-primary" />
                Symptom Analysis Report
            </CardTitle>
            <CardDescription>
              Based on the symptoms you provided, here is a general overview.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sections.introduction && <p className="mb-6">{sections.introduction}</p>}

            <Accordion type="multiple" className="w-full" defaultValue={sectionConfig.map(s => s.key)}>
              {sectionConfig.map(section =>
                sections[section.key] ? (
                  <AccordionItem key={section.key} value={section.key}>
                    <AccordionTrigger className="text-lg font-semibold">
                      <div className="flex items-center gap-2">
                        <section.icon className="h-5 w-5" />
                        {section.title}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="prose prose-sm dark:prose-invert max-w-none">
                      <p>{sections[section.key]}</p>
                    </AccordionContent>
                  </AccordionItem>
                ) : null
              )}
            </Accordion>
             <div className="mt-6 border-l-4 border-yellow-500 bg-yellow-500/10 p-4 rounded-r-lg">
                <h4 className="font-bold text-yellow-800 dark:text-yellow-300">Disclaimer</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-200">
                    This information is generated by AI and is for informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
                </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
