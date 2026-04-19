
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Sprout, 
  TrendingUp, 
  AlertTriangle, 
  Plus,
  Bot,
  CloudSun,
  Thermometer,
  Droplets,
  Wind,
  RefreshCw,
  Sparkles,
  Loader2,
  ChevronRight,
  MapPin
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { aiWeatherBasedCropAdvice, type AiWeatherBasedCropAdviceOutput } from '@/ai/flows/ai-weather-based-crop-advice';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';

export default function Dashboard() {
  const router = useRouter();
  const firestore = useFirestore();
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

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const fieldsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'farmFields');
  }, [firestore, user]);

  const { data: fields, isLoading: isFieldsLoading } = useCollection(fieldsQuery);

  const totalArea = fields?.reduce((acc, f) => acc + (Number(f.area) || 0), 0) || 0;
  const potentialYield = totalArea * 2500; 
  const alertCount = 0; 

  const fetchWeatherIntelligence = async () => {
    if (!user) return;
    setIsRefreshing(true);
    try {
      const res = await aiWeatherBasedCropAdvice({
        location: weatherData.location,
        cropType: fields?.length ? (fields[0].currentCropId || "Wheat") : "Wheat & Maize",
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold font-headline mb-2 text-slate-900">Farm Overview</h1>
          <p className="text-muted-foreground text-lg">Real-time monitoring and AI-driven precision tools.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-white px-3 py-1.5 rounded-full shadow-sm">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Live System Status: Optimal
        </div>
      </div>

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

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold font-headline text-slate-900">Active Fields</h2>
          <div className="flex items-center gap-3">
            <Link href="/fields">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary h-9">
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Link href="/fields/new">
              <Button size="sm" className="rounded-xl h-9 px-4 flex items-center gap-2 shadow-sm">
                <Plus className="w-4 h-4" /> Add New Field
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isFieldsLoading ? (
            Array(2).fill(0).map((_, i) => (
              <Card key={i} className="animate-pulse bg-muted/20 border-none h-48 rounded-2xl" />
            ))
          ) : fields?.length === 0 ? (
            <Card className="col-span-full border-none bg-white p-16 text-center shadow-sm rounded-3xl border border-slate-100">
              <Sprout className="w-16 h-16 text-muted-foreground/20 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-slate-800">No Fields Registered</h3>
              <p className="text-muted-foreground mb-8 max-w-xs mx-auto">Add your first acreage to start tracking soil health and yields.</p>
              <Link href="/fields/new">
                <Button size="lg" className="rounded-2xl px-8 h-12 shadow-lg">Register Field</Button>
              </Link>
            </Card>
          ) : (
            fields?.slice(0, 4).map((field) => (
              <Link key={field.id} href={`/fields/${field.id}`}>
                <Card className="border-none shadow-sm hover:shadow-md transition-all group overflow-hidden bg-white rounded-2xl flex border border-slate-50 relative">
                  {/* Status Indicator Dot */}
                  <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-destructive" />
                  
                  {/* Left Sidebar Icon Area */}
                  <div className="w-24 bg-secondary/30 flex flex-col items-center justify-center gap-2 shrink-0 group-hover:bg-secondary/50 transition-colors py-8">
                    <Sprout className="w-8 h-8 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">
                      {field.currentCropId || 'Maize'}
                    </span>
                  </div>

                  {/* Main Content Area */}
                  <div className="flex-1 flex flex-col justify-between p-6">
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <h4 className="text-xl font-bold text-slate-800 group-hover:text-primary transition-colors">
                          {field.name}
                        </h4>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                          <MapPin className="w-3 h-3" /> {field.locationDescription || 'Local Region'}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
                        <span className="flex items-center gap-1">
                          {field.area} <span className="text-muted-foreground font-normal">Acres</span>
                        </span>
                        <div className="w-1 h-1 rounded-full bg-slate-200" />
                        <span className="flex items-center gap-1">
                          <span className="text-muted-foreground font-normal">pH</span> {field.soilPH || '6.5'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">STATUS</span>
                      <span className="text-xs font-bold text-destructive">Analysis Required</span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>

      <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-50">
        <Link href="/assistant">
          <Button size="icon" className="w-12 h-12 rounded-full bg-white shadow-lg text-primary hover:bg-muted border border-muted hover:scale-110 transition-transform">
            <Bot className="w-6 h-6" />
          </Button>
        </Link>
        <Link href="/fields/new">
          <Button size="icon" className="w-16 h-16 rounded-full bg-primary shadow-xl text-white hover:bg-primary/90 hover:scale-110 transition-transform">
            <Plus className="w-8 h-8" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
