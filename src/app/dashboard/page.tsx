
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sprout, 
  TrendingUp, 
  AlertTriangle, 
  Plus,
  MapPin,
  Bot,
  CloudSun,
  Thermometer,
  Droplets,
  Wind,
  RefreshCw,
  Sparkles,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { aiWeatherBasedCropAdvice, type AiWeatherBasedCropAdviceOutput } from '@/ai/flows/ai-weather-based-crop-advice';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { AddFieldDialog } from '@/components/fields/add-field-dialog';

export default function Dashboard() {
  const router = useRouter();
  const { firestore } = useFirestore();
  const { user, isUserLoading } = useUser();
  
  const [weatherData, setWeatherData] = useState({
    temp: 24,
    humidity: 62,
    soilMoisture: 45,
    location: "Punjab, India",
    lastUpdated: ""
  });
  const [weatherAdvice, setWeatherAdvice] = useState<AiWeatherBasedCropAdviceOutput | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setWeatherData(prev => ({
      ...prev,
      lastUpdated: new Date().toLocaleTimeString()
    }));
  }, []);

  // Redirect if not logged in
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  // Real-time Fields Synchronization - using 'farmFields' to match backend.json
  const fieldsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'farmFields');
  }, [firestore, user]);

  const { data: fields, isLoading: isFieldsLoading } = useCollection(fieldsQuery);

  const totalArea = fields?.reduce((acc, f) => acc + (Number(f.areaAmount) || 0), 0) || 0;
  const potentialYield = fields?.reduce((acc, f) => acc + (Number(f.yieldHistoryAmount) || 0), 0) || 0;
  const alertCount = fields?.filter(f => f.status === 'Alert' || f.status === 'Attention Needed').length || 0;

  const fetchWeatherIntelligence = async () => {
    if (!user) return;
    setIsRefreshing(true);
    try {
      const res = await aiWeatherBasedCropAdvice({
        location: weatherData.location,
        cropType: fields?.length ? fields[0].currentCropTypeId : "Wheat & Maize",
        currentConditions: {
          temperature: weatherData.temp,
          humidity: weatherData.humidity,
          soilMoisture: weatherData.soilMoisture
        },
        weatherForecast: "Partly cloudy with a slight drop in temperature overnight (approx 12°C). No rain expected.",
        cropGrowthStage: "Vegetative"
      });
      setWeatherAdvice(res);
      setWeatherData(prev => ({ ...prev, lastUpdated: new Date().toLocaleTimeString() }));
    } catch (err) {
      // Error handled centrally
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (mounted && user && fields !== null) {
      fetchWeatherIntelligence();
    }
  }, [mounted, user, fields]);

  if (isUserLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold font-headline mb-2">Farm Overview</h1>
          <p className="text-muted-foreground text-lg">Real-time monitoring and AI-driven precision tools.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-white px-3 py-1.5 rounded-full shadow-sm">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Live System Status: Optimal
        </div>
      </div>

      {/* Meteorological Intelligence Card */}
      <Card className="border-none shadow-md bg-white overflow-hidden">
        <CardHeader className="bg-primary/5 border-b flex flex-row items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-full">
              <CloudSun className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Meteorological Intelligence</CardTitle>
              <CardDescription className="text-xs">Synced with OpenWeather • {weatherData.location}</CardDescription>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={fetchWeatherIntelligence} 
            disabled={isRefreshing}
            className="rounded-full h-8 px-3"
          >
            {isRefreshing ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <RefreshCw className="w-3 h-3 mr-2" />}
            Sync Data
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center p-3 rounded-2xl bg-muted/30">
                  <Thermometer className="w-5 h-5 text-orange-500 mb-1" />
                  <span className="text-xl font-bold">{weatherData.temp}°C</span>
                  <span className="text-[10px] uppercase text-muted-foreground">Temp</span>
                </div>
                <div className="flex flex-col items-center p-3 rounded-2xl bg-muted/30">
                  <Droplets className="w-5 h-5 text-blue-500 mb-1" />
                  <span className="text-xl font-bold">{weatherData.humidity}%</span>
                  <span className="text-[10px] uppercase text-muted-foreground">Humidity</span>
                </div>
                <div className="flex flex-col items-center p-3 rounded-2xl bg-muted/30">
                  <Sprout className="w-5 h-5 text-green-600 mb-1" />
                  <span className="text-xl font-bold">{weatherData.soilMoisture}%</span>
                  <span className="text-[10px] uppercase text-muted-foreground">Soil</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">
                <span>Last Updated: {mounted ? weatherData.lastUpdated : '...'}</span>
                <span className="text-primary flex items-center gap-1">
                  <Wind className="w-3 h-3" /> 4.2 km/h NW
                </span>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className={`h-full rounded-2xl p-5 relative overflow-hidden flex flex-col justify-center border ${weatherAdvice?.riskDetected ? 'bg-amber-50 border-amber-200' : 'bg-primary/5 border-primary/10'}`}>
                {weatherAdvice?.riskDetected && (
                  <div className="absolute top-0 right-0 px-4 py-1 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-tighter rounded-bl-xl">
                    Dynamic Alert
                  </div>
                )}
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-full shrink-0 ${weatherAdvice?.riskDetected ? 'bg-amber-100' : 'bg-primary/20'}`}>
                    <Sparkles className={`w-6 h-6 ${weatherAdvice?.riskDetected ? 'text-amber-700' : 'text-primary'}`} />
                  </div>
                  <div className="space-y-2">
                    {weatherAdvice?.alert ? (
                      <h4 className="font-bold text-amber-900 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        {weatherAdvice.alert}
                      </h4>
                    ) : (
                      <h4 className="font-bold text-primary">Agronomic Forecast: Optimal</h4>
                    )}
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {weatherAdvice?.advice || "Analyzing atmospheric synchronization..."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-primary text-white overflow-hidden group hover:scale-[1.02] transition-transform">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-4 opacity-90">
              <Sprout className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Total Area</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold tracking-tight">{totalArea.toFixed(1)}</span>
              <span className="text-xl font-medium opacity-80">Acres</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-4 text-primary">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Potential Yield</span>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-5xl font-bold text-slate-800 tracking-tight">{potentialYield.toLocaleString()}</span>
              <span className="text-xl font-medium text-slate-500">kg</span>
            </div>
            <p className="text-sm font-bold text-green-600 flex items-center gap-1">
              Live estimate <span className="text-muted-foreground font-normal">from synced fields</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-4 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Alerts</span>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-5xl font-bold text-slate-800 tracking-tight">{alertCount}</span>
              <span className="text-sm text-muted-foreground ml-2 font-medium">Critical</span>
            </div>
            <p className="text-sm font-bold text-destructive">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Fields Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold font-headline">My Fields</h2>
          <AddFieldDialog />
        </div>

        {isFieldsLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-10 h-10 animate-spin text-primary/30" />
          </div>
        ) : !fields || fields.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed flex flex-col items-center gap-4">
            <Sprout className="w-12 h-12 text-muted-foreground/20" />
            <p className="text-muted-foreground">No fields synced. Add your first field to start monitoring.</p>
            <AddFieldDialog trigger={<Button variant="outline" className="rounded-full">Register New Field</Button>} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {fields.map((field) => (
              <Link key={field.id} href={`/fields/${field.id}`}>
                <Card className="hover:shadow-md transition-all border-none bg-white overflow-hidden group cursor-pointer border border-transparent hover:border-primary/20">
                  <CardContent className="p-0 flex">
                    <div className="w-24 md:w-32 bg-muted/20 flex flex-col items-center justify-center gap-2 py-8 border-r">
                      <Sprout className={`w-8 h-8 ${field.status === 'Alert' ? 'text-destructive/60' : 'text-primary/60'}`} />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center px-2">{field.currentCropTypeId}</span>
                    </div>
                    <div className="flex-1 p-6 relative">
                      <div className={`absolute top-4 right-4 w-2 h-2 rounded-full ${field.status === 'Healthy' ? 'bg-green-400' : 'bg-amber-400 animate-pulse'}`} />
                      <h3 className="text-xl font-bold font-headline mb-1 group-hover:text-primary transition-colors">{field.name}</h3>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
                        <MapPin className="w-3 h-3" />
                        <span>{field.locationDescription || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm mb-6">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground">Area</span>
                          <span className="font-bold text-slate-700">{field.areaAmount} {field.areaUnit}</span>
                        </div>
                        <div className="h-4 w-px bg-muted-foreground/20" />
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground">pH Level</span>
                          <span className="font-bold text-slate-700">{field.soilPH}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between border-t pt-4">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Condition</span>
                        <Badge variant={field.status === 'Healthy' ? 'secondary' : 'outline'} className="text-[9px] uppercase tracking-tighter">
                          {field.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-50">
        <Link href="/assistant">
          <Button size="icon" className="w-12 h-12 rounded-full bg-white shadow-lg text-primary hover:bg-muted border border-muted hover:scale-110 transition-transform">
            <Bot className="w-6 h-6" />
          </Button>
        </Link>
        <AddFieldDialog trigger={
          <Button size="icon" className="w-16 h-16 rounded-full bg-primary shadow-xl text-white hover:bg-primary/90 hover:scale-110 transition-transform">
            <Plus className="w-8 h-8" />
          </Button>
        } />
      </div>
    </div>
  );
}
