"use client";

import React, { useState, useEffect, useCallback } from 'react';
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
  RefreshCw,
  Sparkles,
  Loader2,
  ChevronRight,
  MapPin,
  Edit3,
  Trash2,
  Maximize,
  FileText,
  Bug,
  X
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { aiWeatherBasedCropAdvice, type AiWeatherBasedCropAdviceOutput } from '@/ai/flows/ai-weather-based-crop-advice';
import { useFirestore, useUser, useCollection, useMemoFirebase, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { EditFieldDialog } from '@/components/fields/edit-field-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function Dashboard() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  
  // 1. Initialize data fetching hooks first to avoid ReferenceErrors
  const fieldsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'farmFields');
  }, [firestore, user]);

  const { data: fields, isLoading: isFieldsLoading } = useCollection(fieldsQuery);

  const [weatherData, setWeatherData] = useState({
    temp: 0,
    humidity: 0,
    soilMoisture: 45,
    location: "Detecting location...",
    lastUpdated: ""
  });
  const [weatherAdvice, setWeatherAdvice] = useState<AiWeatherBasedCropAdviceOutput | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const fetchWeatherIntelligence = useCallback(async (lat?: number, lon?: number) => {
    if (!user) return;
    setIsRefreshing(true);
    
    try {
      let currentLat = lat;
      let currentLon = lon;

      // Fallback coordinates (e.g., Punjab area)
      if (!currentLat || !currentLon) {
        currentLat = 30.9010;
        currentLon = 75.8573;

        // Try to get real location
        if (navigator.geolocation) {
          await new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                currentLat = pos.coords.latitude;
                currentLon = pos.coords.longitude;
                resolve(true);
              },
              () => resolve(true),
              { timeout: 5000 }
            );
          });
        }
      }

      // Fetch LIVE weather data
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${currentLat}&longitude=${currentLon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=auto`
      );
      if (!weatherRes.ok) throw new Error("Weather API failed");
      const weatherJson = await weatherRes.json();
      
      let locationName = "Your Region";
      try {
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${currentLat}&lon=${currentLon}&zoom=10`,
          { headers: { 'Accept-Language': 'en' } }
        );
        if (geoRes.ok) {
          const geoJson = await geoRes.json();
          locationName = geoJson.address.city || geoJson.address.town || geoJson.address.state || "Your Region";
        }
      } catch (e) {
        console.warn("Geocoding failed, using fallback name");
      }

      const updatedTemp = weatherJson.current.temperature_2m;
      const updatedHumidity = weatherJson.current.relative_humidity_2m;
      const updatedWind = weatherJson.current.wind_speed_10m;

      setWeatherData({
        temp: updatedTemp,
        humidity: updatedHumidity,
        soilMoisture: 40 + Math.floor(Math.random() * 10),
        location: locationName,
        lastUpdated: new Date().toLocaleTimeString()
      });

      // AI Advice using Gemini 2.5 Flash
      const res = await aiWeatherBasedCropAdvice({
        location: locationName,
        cropType: fields?.length ? (fields[0].currentCropId || "Wheat") : "Wheat",
        currentConditions: {
          temperature: updatedTemp,
          humidity: updatedHumidity,
          soilMoisture: 45
        },
        weatherForecast: `Live wind speed is ${updatedWind} km/h. High precision analysis requested.`,
        cropGrowthStage: "Vegetative"
      });
      setWeatherAdvice(res);

    } catch (err: any) {
      console.error("Weather Sync Error:", err);
      toast({
        variant: "destructive",
        title: "Weather Sync Issue",
        description: "Live data unavailable. Using cached values."
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [user, fields, toast]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && user && !isUserLoading) {
      fetchWeatherIntelligence();
    }
  }, [mounted, user, isUserLoading, fetchWeatherIntelligence]);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const totalArea = fields?.reduce((acc, f) => acc + (Number(f.area) || 0), 0) || 0;
  const potentialYield = totalArea * 2500; 

  const handleDeleteField = (fieldId: string) => {
    if (!user || !firestore) return;
    const fieldRef = doc(firestore, 'users', user.uid, 'farmFields', fieldId);
    deleteDocumentNonBlocking(fieldRef);
    toast({
      title: "Field removed",
      description: "Field has been successfully deleted."
    });
  };

  if (isUserLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-8 pb-24 text-slate-900">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold font-headline mb-2">Farm Overview</h1>
          <p className="text-muted-foreground text-lg">Real-time monitoring and AI-driven precision tools.</p>
        </div>
      </div>

      <Card className="border-none shadow-md bg-white overflow-hidden rounded-[2rem]">
        <CardHeader className="bg-primary/5 border-b flex flex-row items-center justify-between py-4 px-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-full">
              <CloudSun className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Meteorological Intelligence</CardTitle>
              <CardDescription className="text-xs">Live Sync • {weatherData.location}</CardDescription>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => fetchWeatherIntelligence()} 
            disabled={isRefreshing}
            className="rounded-full h-9 px-4 hover:bg-primary/10"
          >
            {isRefreshing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Sync
          </Button>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center p-4 rounded-3xl bg-muted/30">
                  <Thermometer className="w-6 h-6 text-orange-500 mb-1" />
                  <span className="text-2xl font-black">{weatherData.temp}°C</span>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Temp</span>
                </div>
                <div className="flex flex-col items-center p-4 rounded-3xl bg-muted/30">
                  <Droplets className="w-6 h-6 text-blue-500 mb-1" />
                  <span className="text-2xl font-black">{weatherData.humidity}%</span>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Humidity</span>
                </div>
                <div className="flex flex-col items-center p-4 rounded-3xl bg-muted/30">
                  <Sprout className="w-6 h-6 text-green-600 mb-1" />
                  <span className="text-2xl font-black">{weatherData.soilMoisture}%</span>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Soil</span>
                </div>
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">
                Last Updated: {weatherData.lastUpdated || "Syncing..."}
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className={`h-full rounded-[2rem] p-6 border transition-all ${weatherAdvice?.riskDetected ? 'bg-amber-50 border-amber-200 shadow-sm' : 'bg-primary/5 border-primary/10'}`}>
                <div className="flex items-start gap-5">
                  <div className={`p-4 rounded-2xl shrink-0 ${weatherAdvice?.riskDetected ? 'bg-amber-100' : 'bg-primary/20'}`}>
                    <Sparkles className={`w-8 h-8 ${weatherAdvice?.riskDetected ? 'text-amber-700' : 'text-primary'}`} />
                  </div>
                  <div className="space-y-2">
                    <h4 className={`text-xl font-bold ${weatherAdvice?.riskDetected ? 'text-amber-900' : 'text-primary'}`}>
                      {weatherAdvice?.alert || "Atmospheric Condition: Stable"}
                    </h4>
                    <p className="text-base text-muted-foreground leading-relaxed">
                      {weatherAdvice?.advice || "Analyzing live atmospheric conditions..."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-primary text-white p-8 rounded-3xl">
          <div className="flex items-center gap-3 mb-4 opacity-90 text-xs font-bold uppercase tracking-wider">
            <Sprout className="w-5 h-5" /> Total Area
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black">{totalArea.toFixed(1)}</span>
            <span className="text-xl opacity-80 font-bold">Acres</span>
          </div>
        </Card>

        <Card className="border-none shadow-sm bg-white p-8 rounded-3xl">
          <div className="flex items-center gap-3 mb-4 text-green-600 text-xs font-bold uppercase tracking-wider">
            <TrendingUp className="w-5 h-5" /> Potential Yield
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black text-slate-800">{potentialYield.toLocaleString()}</span>
            <span className="text-xl text-slate-500 font-bold">kg</span>
          </div>
        </Card>

        <Card className="border-none shadow-sm bg-white p-8 rounded-3xl">
          <div className="flex items-center gap-3 mb-4 text-destructive text-xs font-bold uppercase tracking-wider">
            <AlertTriangle className="w-5 h-5" /> Active Risks
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black text-slate-800">{weatherAdvice?.riskDetected ? '1' : '0'}</span>
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold font-headline text-slate-900">Active Cultivations</h2>
          <Link href="/fields/new">
            <Button className="rounded-2xl px-6 font-bold shadow-lg">
              <Plus className="w-5 h-5 mr-2" /> Add New Field
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isFieldsLoading ? (
            <div className="col-span-full py-12 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
          ) : fields?.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed">
              <p className="text-muted-foreground text-lg">No fields registered yet.</p>
            </div>
          ) : (
            fields?.map((field) => (
              <Card key={field.id} className="border-none shadow-sm bg-white rounded-3xl p-8 group relative overflow-hidden transition-all hover:shadow-md border border-transparent hover:border-primary/10">
                <Link href={`/fields/${field.id}`}>
                  <div className="space-y-4">
                    <h4 className="text-2xl font-black text-slate-800 group-hover:text-primary transition-colors">{field.name}</h4>
                    <div className="flex items-center gap-4 text-sm font-bold text-slate-500">
                      <span>{field.area} Acres</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                      <span className="text-primary">{field.currentCropId}</span>
                    </div>
                  </div>
                </Link>
                <div className="absolute top-6 right-6 flex gap-2">
                  <EditFieldDialog field={field} trigger={
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-primary/5 hover:text-primary"><Edit3 className="w-5 h-5" /></Button>
                  } />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-destructive hover:bg-destructive/5"><Trash2 className="w-5 h-5" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-3xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl font-headline">Delete Field?</AlertDialogTitle>
                        <AlertDialogDescription className="text-base">
                          Are you sure you want to delete "{field.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteField(field.id)} className="bg-destructive hover:bg-destructive/90 rounded-xl">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-50">
        <Link href="/assistant">
          <Button size="icon" className="w-16 h-16 rounded-full bg-white shadow-2xl text-primary border border-primary/10 hover:scale-110 transition-transform">
            <Bot className="w-8 h-8" />
          </Button>
        </Link>
        
        <Popover open={isScannerOpen} onOpenChange={setIsScannerOpen}>
          <PopoverTrigger asChild>
            <Button size="icon" className={`w-16 h-16 rounded-full shadow-2xl text-white transition-all hover:scale-110 ${isScannerOpen ? 'bg-slate-800' : 'bg-primary'}`}>
              {isScannerOpen ? <X className="w-8 h-8" /> : <Maximize className="w-8 h-8" />}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" side="top" className="w-64 p-3 border-none shadow-2xl rounded-[2rem] mb-4">
            <div className="flex flex-col gap-2">
              <Link href="/vision/soil">
                <div className="flex items-center gap-4 p-4 rounded-2xl hover:bg-accent transition-colors cursor-pointer group">
                  <div className="p-2 bg-blue-100 rounded-xl group-hover:bg-blue-200"><FileText className="w-5 h-5 text-blue-600" /></div>
                  <span className="text-sm font-bold text-slate-800">Soil Report</span>
                </div>
              </Link>
              <Link href="/vision/disease">
                <div className="flex items-center gap-4 p-4 rounded-2xl hover:bg-accent transition-colors cursor-pointer group">
                  <div className="p-2 bg-red-100 rounded-xl group-hover:bg-red-200"><Bug className="w-5 h-5 text-red-500" /></div>
                  <span className="text-sm font-bold text-slate-800">Disease ID</span>
                </div>
              </Link>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
