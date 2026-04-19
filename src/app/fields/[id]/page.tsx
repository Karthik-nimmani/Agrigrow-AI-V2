"use client";

import React, { useState, use, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  TrendingUp, 
  Lightbulb, 
  Droplets, 
  Loader2, 
  ChevronRight,
  Info,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { aiYieldForecastWithExplanation, type YieldForecastOutput } from '@/ai/flows/ai-yield-forecast-with-explanation';
import { aiActionableCropRecommendations, type AiActionableCropRecommendationsOutput } from '@/ai/flows/ai-actionable-crop-recommendations-flow';
import { useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function FieldDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [forecast, setForecast] = useState<YieldForecastOutput | null>(null);
  const [recommendations, setRecommendations] = useState<AiActionableCropRecommendationsOutput | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);

  const fieldRef = useMemoFirebase(() => {
    if (!firestore || !user || !id) return null;
    return doc(firestore, 'users', user.uid, 'farmFields', id);
  }, [firestore, user, id]);

  const { data: field, isLoading: isFieldLoading } = useDoc(fieldRef);

  const handleGenerateInsight = async () => {
    if (!field) return;
    setIsLoadingInsight(true);
    try {
      const fRes = await aiYieldForecastWithExplanation({
        cropType: field.currentCropId || "Wheat",
        fieldArea: field.area || 0,
        fieldAreaUnit: field.unitOfArea || "Acres",
        soilpH: field.soilPH || 6.5,
        yieldHistory: "Consistent growth.",
        recentRainfall: "Adequate.",
        fertilizerApplied: "Standard application.",
        temperatureHistory: "Optimal.",
        humidityHistory: "Optimal.",
        pestsDiseasesObserved: "None."
      });
      setForecast(fRes);

      const rRes = await aiActionableCropRecommendations({
        cropType: field.currentCropId || "Wheat",
        soilPH: field.soilPH || 6.5,
        areaAcres: field.area || 0,
        yieldForecast: `Predicted ${fRes.predictedYieldValue} ${fRes.predictedYieldUnit}`
      });
      setRecommendations(rRes);
    } catch (err: any) {
      console.error(err);
      const isQuotaError = err.message?.includes('429') || err.message?.includes('quota');
      toast({
        variant: 'destructive',
        title: isQuotaError ? 'AI Quota Exceeded' : 'Generation Error',
        description: isQuotaError 
          ? 'The AI is currently at capacity. Please try again in a few minutes.' 
          : 'Failed to generate field insights. Please check your data and try again.',
      });
    } finally {
      setIsLoadingInsight(false);
    }
  };

  if (isFieldLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!field) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground mb-4">Field not found.</p>
        <Link href="/fields"><Button variant="outline">Back to Fields</Button></Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 p-4 md:p-8">
      <div className="flex items-center gap-4">
        <Link href="/fields">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold font-headline">{field.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary">{field.currentCropId}</Badge>
            <span className="text-muted-foreground text-sm">• {field.area} {field.unitOfArea}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-md overflow-hidden bg-white">
            <CardHeader className="bg-primary/5 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Field Summary</CardTitle>
                  <CardDescription>Current agronomic metrics</CardDescription>
                </div>
                <Link href={`/fields`}>
                   <Button variant="outline" size="sm">Manage Field</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border flex flex-col items-center text-center">
                  <Droplets className="w-5 h-5 text-primary mb-2" />
                  <span className="text-xs text-muted-foreground">Soil pH</span>
                  <span className="text-lg font-bold">{field.soilPH}</span>
                </div>
                <div className="p-4 rounded-xl border flex flex-col items-center text-center">
                  <TrendingUp className="w-5 h-5 text-primary mb-2" />
                  <span className="text-xs text-muted-foreground">Area</span>
                  <span className="text-lg font-bold">{field.area}</span>
                </div>
                <div className="p-4 rounded-xl border flex flex-col items-center text-center">
                  <Info className="w-5 h-5 text-primary mb-2" />
                  <span className="text-xs text-muted-foreground">Health</span>
                  <span className="text-lg font-bold text-green-600">Stable</span>
                </div>
                <div className="p-4 rounded-xl border flex flex-col items-center text-center">
                  <TrendingUp className="w-5 h-5 text-primary mb-2" />
                  <span className="text-xs text-muted-foreground">Type</span>
                  <span className="text-lg font-bold">{field.soilType || 'N/A'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {!forecast && (
            <div className="p-12 text-center bg-muted/30 rounded-2xl border-2 border-dashed border-muted flex flex-col items-center gap-4">
              <TrendingUp className="w-12 h-12 text-muted-foreground/40" />
              <div>
                <h3 className="text-xl font-bold font-headline mb-2">No Yield Forecast Yet</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">Generate an AI-powered forecast to see your predicted harvest and get actionable recommendations.</p>
              </div>
              <Button onClick={handleGenerateInsight} disabled={isLoadingInsight} className="rounded-full px-8">
                {isLoadingInsight ? <Loader2 className="animate-spin mr-2" /> : <TrendingUp className="w-4 h-4 mr-2" />}
                Generate AI Forecast
              </Button>
            </div>
          )}

          {forecast && (
            <div className="space-y-6">
              <Card className="border-none shadow-md bg-white">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">AI Yield Forecast</CardTitle>
                    <CardDescription>Based on historical & environmental data</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-6 bg-primary/5 rounded-2xl text-center border border-primary/10">
                    <span className="text-muted-foreground text-sm uppercase tracking-widest font-medium">Predicted Harvest</span>
                    <h2 className="text-4xl font-bold text-primary mt-1">{forecast.predictedYieldValue} {forecast.predictedYieldUnit}</h2>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-xl">
                    <h4 className="font-bold flex items-center gap-2 mb-2 text-sm">
                      <Info className="w-4 h-4 text-primary" />
                      Why this prediction?
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {forecast.explanation}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {recommendations && (
                <Card className="border-none shadow-md bg-white">
                  <CardHeader className="flex flex-row items-center gap-4">
                    <div className="p-3 bg-accent/20 rounded-full">
                      <Lightbulb className="w-6 h-6 text-accent-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Generative Recommendations</CardTitle>
                      <CardDescription>Tangible steps to maximize output</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-3">
                      {recommendations.recommendations.map((rec, i) => (
                        <div key={i} className="flex gap-4 p-4 rounded-xl border border-muted hover:border-primary/30 transition-colors bg-white">
                          <div className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-xs shrink-0">{i+1}</div>
                          <p className="text-sm font-medium">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-md bg-white">
            <CardHeader>
              <CardTitle className="text-lg">Field History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
               <div className="space-y-0">
                {[
                  { event: 'Field Registered', date: 'Just now', note: 'New acreage entry' }
                ].map((item, i) => (
                  <div key={i} className="px-6 py-4 flex gap-4 border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0"></div>
                    <div>
                      <p className="font-bold text-sm">{item.event}</p>
                      <p className="text-xs text-muted-foreground">{item.date}</p>
                      <p className="text-xs text-muted-foreground mt-1 opacity-80">{item.note}</p>
                    </div>
                  </div>
                ))}
               </div>
               <div className="p-4">
                <Button variant="ghost" className="w-full text-primary flex items-center gap-2">
                  View Full History <ChevronRight className="w-4 h-4" />
                </Button>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
