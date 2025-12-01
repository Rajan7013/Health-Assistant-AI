"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, AlertCircle, Sparkles, Calendar, ShieldCheck, BrainCircuit, ArrowRight } from 'lucide-react';
import VoiceInput from '@/components/VoiceInput';
import { explainSymptoms, SymptomExplanationOutput } from '@/ai/flows/ai-symptom-explanation';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

type Status = 'idle' | 'loading' | 'success' | 'error';

const SymptomReport = ({ report }: { report: SymptomExplanationOutput }) => {
  return (
    <Card className="shadow-md border-0 bg-white dark:bg-[#161B22] rounded-3xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-right-8 duration-700 relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-green-500 to-red-500 p-[2px] rounded-3xl -z-10 opacity-100"></div>
      <div className="h-full w-full bg-white dark:bg-[#161B22] rounded-[22px] flex flex-col overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shrink-0" style={{ backgroundColor: report.urgency_color }} />
        <CardHeader className="p-4 pb-1 shrink-0">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-[#2563EB] dark:text-blue-400 uppercase tracking-wider mb-0.5">Potential Condition</p>
              <CardTitle className="text-xl font-black text-[#0A1D42] dark:text-[#F0F6FC] leading-tight">{report.primary_condition}</CardTitle>
            </div>
            <Badge className="text-xs px-3 py-1 rounded-full font-bold shadow-sm border-0" style={{ backgroundColor: report.urgency_color, color: '#fff' }}>
              {report.severity_level}
            </Badge>
          </div>
        </CardHeader>

        <div className="flex-1 p-4 pt-1 space-y-3">
          <div className="bg-[#F0F5FF] dark:bg-[#0D1117] p-3 rounded-xl border border-blue-100 dark:border-blue-900/30">
            <Label className="text-xs font-bold text-[#475569] dark:text-[#8B949E] mb-1.5 block">AI Match Probability</Label>
            <div className="flex items-center gap-3">
              <Progress value={report.confidence_score} className="h-3 rounded-full bg-blue-100 dark:bg-blue-900/30 [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-cyan-400" />
              <span className="font-black text-[#2563EB] dark:text-blue-400 text-lg">{report.confidence_score}%</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-[#0A1D42] dark:text-[#F0F6FC] mb-2 flex items-center gap-1.5">
              <div className="p-1 bg-purple-100 dark:bg-purple-900/30 rounded-md">
                <BrainCircuit className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
              </div>
              Possible Causes
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {report.root_causes.map((cause, index) => (
                <Badge key={index} variant="secondary" className="font-medium text-xs py-1 px-2.5 rounded-lg bg-purple-50 text-purple-900 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-200 border border-purple-100 dark:border-purple-800">{cause}</Badge>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-800/30">
            <h3 className="text-sm font-bold text-[#0A1D42] dark:text-[#F0F6FC] mb-2">Action Plan</h3>
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5">
                <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded-md shrink-0">
                  <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-bold text-[#0A1D42] dark:text-[#F0F6FC] mb-0.5 text-xs">Immediate Relief</p>
                  <p className="text-xs text-[#475569] dark:text-[#8B949E] leading-relaxed line-clamp-2">{report.action_plan.immediate}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="p-1 bg-teal-100 dark:bg-teal-900/30 rounded-md shrink-0">
                  <Calendar className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <p className="font-bold text-[#0A1D42] dark:text-[#F0F6FC] mb-0.5 text-xs">Long-Term Prevention</p>
                  <p className="text-xs text-[#475569] dark:text-[#8B949E] leading-relaxed line-clamp-2">{report.action_plan.long_term}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <CardFooter className="bg-[#F8FAFC] dark:bg-[#0D1117]/50 p-4 border-t border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-3 w-full">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg shrink-0">
              <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="font-bold text-green-700 dark:text-green-400 text-[10px] uppercase tracking-wide mb-0.5">Recommendation</p>
              <p className="text-sm font-bold text-[#0A1D42] dark:text-[#F0F6FC] leading-tight">{report.triage_advice}</p>
            </div>
          </div>
        </CardFooter>
      </div>
    </Card>
  )
}

export default function SymptomCheckerPage() {
  const [symptoms, setSymptoms] = useState('');
  const [result, setResult] = useState<SymptomExplanationOutput | null>(null);
  const [status, setStatus] = useState<Status>('idle');

  useEffect(() => {
    import('@/lib/analytics').then(({ trackPageView }) => {
      trackPageView('symptom_checker');
    });
  }, []);

  const handleVoiceTranscript = (text: string) => {
    setSymptoms(prev => prev + (prev ? ' ' : '') + text);
  };

  const handleSubmit = async () => {
    if (!symptoms.trim()) return;

    setStatus('loading');
    setResult(null);

    import('@/lib/analytics').then(({ trackFeatureUsage }) => {
      trackFeatureUsage('symptom_checker', 'analyze');
    });

    try {
      // Get Firebase auth token
      const { auth } = await import('@/firebase');
      const user = auth.currentUser;

      if (!user) {
        throw new Error('You must be logged in to analyze symptoms.');
      }

      const token = await user.getIdToken();

      const response = await fetch('/api/symptom-checker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ symptoms }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          const data = await response.json();
          throw new Error(`Rate limit exceeded. Please try again in ${Math.ceil(data.resetIn / 60)} minutes.`);
        }
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
      setStatus('success');
    } catch (error) {
      console.error('Error explaining symptoms:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      import('@/lib/analytics').then(({ trackError }) => {
        trackError(errorMsg, 'SymptomChecker');
      });
      setStatus('error');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-[#F0F5FF] dark:bg-[#0D1117] font-[Poppins] text-[#0A1D42] dark:text-[#F0F6FC] pb-20">

      {/* Left Panel - Input (20%) - Sticky & Floating */}
      <div className="w-[20%] min-w-[220px] bg-white dark:bg-[#161B22] flex flex-col p-3 shadow-md z-10 sticky top-24 h-[calc(100vh-12rem)] rounded-3xl ml-4 my-4 border-0 relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-cyan-300 p-[2px] rounded-3xl -z-10 opacity-100"></div>
        <div className="h-full w-full bg-white dark:bg-[#161B22] rounded-[22px] flex flex-col p-3">
          <div className="mb-3">
            <h2 className="text-lg font-black text-[#0A1D42] dark:text-[#F0F6FC] leading-tight">Symptom<br /><span className="text-purple-600">Analyzer</span></h2>
            <p className="text-[10px] text-[#475569] dark:text-[#8B949E] mt-1">AI Health Assessment</p>
          </div>

          <div className="flex-1 flex flex-col gap-3 relative">
            <div className="absolute top-2 right-2 z-10">
              <VoiceInput onTranscript={handleVoiceTranscript} disabled={status === 'loading'} className="h-8 w-8" />
            </div>
            <Textarea
              placeholder="Describe symptoms..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              className="flex-1 resize-none p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0D1117] border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-xs"
              disabled={status === 'loading'}
            />
            <Button
              onClick={handleSubmit}
              disabled={status === 'loading' || !symptoms.trim()}
              className="w-full h-10 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md shadow-purple-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] font-bold text-sm"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  Analyze <ArrowRight className="ml-2 h-3 w-3" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Right Panel - Output (80%) */}
      <div className="flex-1 p-2 flex flex-col items-center justify-start pt-10 bg-[#F0F5FF] dark:bg-[#0D1117]">
        <div className="w-full max-w-4xl -mt-8">
          {/* Initial State */}
          {status === 'idle' && !result && (
            <div className="flex flex-col items-center justify-center h-full py-20 text-center space-y-4 opacity-60">
              <div className="p-4 bg-white dark:bg-[#161B22] rounded-2xl shadow-sm animate-bounce-slow">
                <Sparkles className="h-8 w-8 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0A1D42] dark:text-[#F0F6FC] mb-1">Ready to Assist</h3>
                <p className="text-xs text-[#475569] dark:text-[#8B949E] max-w-xs mx-auto">
                  Enter symptoms on the left to generate a report.
                </p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center h-full py-20 text-center space-y-4 animate-in fade-in zoom-in duration-500">
              <div className="relative h-16 w-16">
                <div className="absolute inset-0 rounded-full border-4 border-purple-100 dark:border-purple-900/30"></div>
                <div className="absolute inset-0 rounded-full border-4 border-purple-600 border-t-transparent animate-spin"></div>
                <Loader2 className="absolute inset-0 m-auto h-6 w-6 text-purple-600 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0A1D42] dark:text-[#F0F6FC] mb-0.5">Analyzing...</h3>
                <p className="text-xs text-[#475569] dark:text-[#8B949E]">Consulting medical knowledge base.</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <div className="flex items-center justify-center h-full py-20">
              <Card className="max-w-sm border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900/30 rounded-2xl overflow-hidden shadow-lg">
                <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                    <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-red-900 dark:text-red-200 mb-1">Analysis Failed</h3>
                    <p className="text-xs text-red-700 dark:text-red-300">Please check your connection and try again.</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setStatus('idle')} className="mt-1 border-red-200 hover:bg-red-100 text-red-700 h-8 text-xs">
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Results */}
          {status === 'success' && result && (
            <SymptomReport report={result} />
          )}
        </div>
      </div>
    </div>
  );
}
