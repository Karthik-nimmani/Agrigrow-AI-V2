"use client";

import React, { useState, use } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  TrendingUp, 
  Lightbulb, 
  Droplets, 
  Loader2, 
  ChevronRight,
  Info
} from 'lucide-react';
import Link from 'next/link';
import { aiYieldForecastWithExplanation, type YieldForecastOutput } from '@/ai/flows/ai-yield-forecast-with-explanation';
import { aiActionableCropRecommendations, type AiActionableCropRecommendationsOutput } from '@/ai/flows/ai-actionable-crop-recommendations-flow';

export default function FieldDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [forecast, setForecast] = useState<YieldForecastOutput | null>(null);
  const [recommendations, setRecommendations] = useState<AiActionableCropRecommendationsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateInsight = async () => {
    setIsLoading(true);
    try {
      // Forecast
      const fRes = await aiYieldForecastWithExplanation({
        cropType: "Wheat",
        fieldArea: 12,
        fieldAreaUnit: "Acres",
        soilpH: 6.8,
        yieldHistory: "Last year: 2.5 tons/acre. Consistent growth over 3 years.",
        recentRainfall: "150mm over the last 30 days. Adequate.",
        fertilizerApplied: "Urea 50kg/acre applied 10 days ago.",
        temperatureHistory: "Avg 22C, Max 28C, Min 14C.",
        humidityHistory: "Avg 60%.",
        pestsDiseasesObserved: "None observed."
      });
      setForecast(fRes);

      // Recommendations
      const rRes = await aiActionableCropRecommendations({
        cropType: "Wheat",
        soilPH: 6.8,
        areaAcres: 12,
        yieldForecast: `Predicted ${fRes.predictedYieldValue} ${fRes.predictedYieldUnit}`
      });
      setRecommendations(rRes);

    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Link href="/fields">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold font-headline">North Wheat Field</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary">Wheat</Badge>
            <span className="text-muted-foreground text-sm">• 12 Acres</span>
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
                <Button variant="outline" size="sm">Edit Details</Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border flex flex-col items-center text-center">
                  <Droplets className="w-5 h-5 text-primary mb-2" />
                  <span className="text-xs text-muted-foreground">Soil pH</span>
                  <span className="text-lg font-bold">6.8</span>
                </div>
                <div className="p-4 rounded-xl border flex flex-col items-center text-center">
                  <TrendingUp className="w-5 h-5 text-primary mb-2" />
                  <span className="text-xs text-muted-foreground">Est. Progress</span>
                  <span className="text-lg font-bold">65%</span>
                </div>
                <div className="p-4 rounded-xl border flex flex-col items-center text-center">
                  <Info className="w-5 h-5 text-primary mb-2" />
                  <span className="text-xs text-muted-foreground">Health</span>
                  <span className="text-lg font-bold text-green-600">Stable</span>
                </div>
                <div className="p-4 rounded-xl border flex flex-col items-center text-center">
                  <TrendingUp className="w-5 h-5 text-primary mb-2" />
                  <span className="text-xs text-muted-foreground">Last Yield</span>
                  <span className="text-lg font-bold">2.5 t/a</span>
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
              <Button onClick={handleGenerateInsight} disabled={isLoading} className="rounded-full px-8">
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : <TrendingUp className="w-4 h-4 mr-2" />}
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
                  { event: 'Fertilizer Applied', date: '10 days ago', note: 'Urea (50kg/acre)' },
                  { event: 'Irrigation Cycle', date: '2 weeks ago', note: '3 hours coverage' },
                  { event: 'Soil Test', date: 'Mar 15, 2024', note: 'pH 6.8, Nitrogen high' }
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
