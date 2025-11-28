"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, AlertCircle, Sparkles, Calendar, ShieldCheck, Activity } from 'lucide-react';
import { explainSymptoms, SymptomExplanationOutput } from '@/ai/flows/ai-symptom-explanation';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';

type Status = 'idle' | 'loading' | 'success' | 'error';


const SymptomReport = ({ report }: { report: SymptomExplanationOutput }) => {
    return (
        <Card className="mt-8 shadow-xl border-t-4" style={{borderTopColor: report.urgency_color}}>
          <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Potential Condition</p>
                    <CardTitle className="text-3xl font-bold font-headline">{report.primary_condition}</CardTitle>
                </div>
                <Badge className="text-sm" style={{ backgroundColor: report.urgency_color, color: '#fff' }}>
                    {report.severity_level}
                </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
                <Label className="text-sm font-medium text-muted-foreground">AI Match Probability</Label>
                <div className="flex items-center gap-4 mt-2">
                    <Progress value={report.confidence_score} className="h-2" />
                    <span className="font-bold text-primary text-lg">{report.confidence_score}%</span>
                </div>
            </div>

            <Separator />
            
            <div>
                <h3 className="text-lg font-semibold mb-3">Possible Causes</h3>
                <div className="flex flex-wrap gap-2">
                    {report.root_causes.map((cause, index) => (
                        <Badge key={index} variant="secondary" className="font-normal">{cause}</Badge>
                    ))}
                </div>
            </div>

            <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                <h3 className="text-lg font-semibold mb-4">Action Plan</h3>
                <div className="space-y-4">
                     <div className="flex items-start gap-3">
                        <Sparkles className="h-5 w-5 mt-1 text-primary shrink-0" />
                        <div>
                            <p className="font-semibold">Immediate Relief</p>
                            <p className="text-sm text-muted-foreground">{report.action_plan.immediate}</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 mt-1 text-primary shrink-0" />
                        <div>
                            <p className="font-semibold">Long-Term Prevention</p>
                            <p className="text-sm text-muted-foreground">{report.action_plan.long_term}</p>
                        </div>
                    </div>
                </div>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/50 p-4 rounded-b-lg">
             <div className="flex items-center gap-3 w-full">
                <ShieldCheck className="h-6 w-6 text-muted-foreground"/>
                <div>
                    <p className="font-semibold">Recommendation</p>
                    <p className="text-sm font-bold">{report.triage_advice}</p>
                </div>
             </div>
          </CardFooter>
        </Card>
    )
}

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
      setResult(response);
      setStatus('success');
    } catch (error) {
      console.error('Error explaining symptoms:', error);
      setStatus('error');
    }
  };

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <div className="text-center">
        <Activity className="mx-auto h-12 w-12 text-primary" />
        <h1 className="font-headline text-4xl font-bold text-center mt-4 mb-2">
            AI Symptom Analyzer
        </h1>
        <p className="text-muted-foreground text-center mb-8 max-w-md mx-auto">
            Describe your symptoms to generate a diagnostic report. This is not a substitute for professional medical advice.
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Enter Your Symptoms</CardTitle>
          <CardDescription>
            Provide a detailed description of how you are feeling to generate your report.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="e.g., I have a persistent dry cough, a slight fever, and feel very tired..."
            rows={5}
            value={symptoms}
            onChange={(e) => setSymptoms(e.targe.value)}
            className="mb-4 text-base"
            disabled={status === 'loading'}
          />
          <Button
            onClick={handleSubmit}
            disabled={status === 'loading' || !symptoms.trim()}
            className="w-full"
            size="lg"
          >
            {status === 'loading' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Analyze Symptoms
          </Button>
        </CardContent>
      </Card>

      {status === 'loading' && (
        <div className="text-center mt-12">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground font-medium">AI is analyzing your symptoms and generating a report...</p>
          <p className="text-sm text-muted-foreground">This may take a moment.</p>
        </div>
      )}

      {status === 'error' && (
         <Card className="mt-8 border-destructive bg-destructive/10">
            <CardHeader className="flex-row items-center gap-3 space-y-0">
                 <AlertCircle className="h-6 w-6 text-destructive" />
                <CardTitle className="text-destructive">An Error Occurred</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-destructive/90">We're sorry, but the AI couldn't process your request at this time. This can happen with complex symptoms. Please try rephrasing or check back later.</p>
            </CardContent>
         </Card>
      )}

      {status === 'success' && result && (
        <SymptomReport report={result} />
      )}
    </div>
  );
}
