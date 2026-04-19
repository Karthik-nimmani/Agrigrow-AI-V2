"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CloudSun, 
  TrendingUp, 
  AlertTriangle, 
  Map as MapIcon, 
  Plus,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { aiWeatherBasedCropAdvice, type AiWeatherBasedCropAdviceOutput } from '@/ai/flows/ai-weather-based-crop-advice';

export default function Dashboard() {
  const [weatherAdvice, setWeatherAdvice] = useState<AiWeatherBasedCropAdviceOutput | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWeatherAdvice() {
      try {
        const advice = await aiWeatherBasedCropAdvice({
          location: "Punjab, India",
          cropType: "Wheat",
          currentConditions: {
            temperature: 24,
            humidity: 65,
            soilMoisture: 42
          },
          weatherForecast: "Sunny with light winds, 10% chance of rain in the next 48 hours.",
          cropGrowthStage: "Tillering"
        });
        setWeatherAdvice(advice);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchWeatherAdvice();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Welcome back, Farmer!</h1>
          <p className="text-muted-foreground">Here's what's happening on your farm today.</p>
        </div>
        <Link href="/fields/new">
          <Button className="rounded-full flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add New Field
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <MapIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Fields</p>
                <p className="text-2xl font-bold">4</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <CloudSun className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Alerts</p>
                <p className="text-2xl font-bold text-blue-600">{weatherAdvice?.riskDetected ? '1' : '0'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Yield Forecast</p>
                <p className="text-2xl font-bold text-green-600">85%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weather Intelligence */}
        <Card className="lg:col-span-2 border-none shadow-md overflow-hidden bg-white">
          <div className="bg-primary/5 p-6 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CloudSun className="w-6 h-6 text-primary" />
              <div>
                <CardTitle className="text-lg">Meteorological Intelligence</CardTitle>
                <CardDescription>Live Punjab Farm Conditions</CardDescription>
              </div>
            </div>
            {weatherAdvice?.riskDetected && (
              <Badge variant="destructive" className="animate-pulse">Active Warning</Badge>
            )}
          </div>
          <CardContent className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Temp</p>
                    <p className="text-xl font-bold">24°C</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Humidity</p>
                    <p className="text-xl font-bold">65%</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Moisture</p>
                    <p className="text-xl font-bold">42%</p>
                  </div>
                </div>

                {weatherAdvice?.alert && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3 items-start">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-amber-900">{weatherAdvice.alert}</p>
                      <p className="text-sm text-amber-800 opacity-90">{weatherAdvice.advice}</p>
                    </div>
                  </div>
                )}
                {!weatherAdvice?.alert && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                    <p className="text-sm text-green-800">{weatherAdvice?.advice || "No active risks. Optimal conditions for wheat tillering."}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Links / Recent Fields */}
        <Card className="border-none shadow-md bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Recent Fields</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: 'North Wheat Field', crop: 'Wheat', area: '12 Acres' },
              { name: 'South Orchard', crop: 'Apple', area: '5 Acres' },
              { name: 'Riverside Corn', crop: 'Corn', area: '20 Acres' }
            ].map((field, i) => (
              <Link key={i} href="/fields/1" className="block group">
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors border">
                  <div>
                    <p className="font-medium group-hover:text-primary transition-colors">{field.name}</p>
                    <p className="text-xs text-muted-foreground">{field.crop} • {field.area}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-all translate-x-0 group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
            <Link href="/fields">
              <Button variant="outline" className="w-full mt-2">View All Fields</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
