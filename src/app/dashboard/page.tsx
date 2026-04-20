
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
  Wind,
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

  // Define fields first to avoid ReferenceError in callbacks
  const fieldsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'farmFields');
  }, [firestore, user]);

  const { data: fields, isLoading: isFieldsLoading } = useCollection(fieldsQuery);

  const fetchWeatherIntelligence = useCallback(async (lat?: number, lon?: number) => {
    if (!user) return;
    setIsRefreshing(true);
    
    try {
      let currentLat = lat;
      let currentLon = lon;

      if (!currentLat || !currentLon) {
        await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              currentLat = pos.coords.latitude;
              currentLon = pos.coords.longitude;
              resolve(true);
            },
            () => {
              toast({
                title: "Location Access Denied",
                description: "Using regional default. Enable location for precision.",
                variant: "destructive"
              });
              currentLat = 30.9010;
              currentLon = 75.8573;
              resolve(true);
            }
          );
        });
      }

      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${currentLat}&longitude=${currentLon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=auto`
      );
      const weatherJson = await weatherRes.json();
      
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${currentLat}&lon=${currentLon}&zoom=10`
      );
      const geoJson = await geoRes.json();
      const locationName = geoJson.address.city || geoJson.address.town || geoJson.address.state || "Your Region";

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

      const res = await aiWeatherBasedCropAdvice({
        location: locationName,
        cropType: fields?.length ? (fields[0].currentCropId || "Wheat") : "Wheat",
        currentConditions: {
          temperature: updatedTemp,
          humidity: updatedHumidity,
          soilMoisture: 45
        },
        weatherForecast: `Live conditions in ${locationName}. Wind speed is ${updatedWind} km/h.`,
        cropGrowthStage: "Vegetative"
      });
      setWeatherAdvice(res);

    } catch (err: any) {
      console.error("Weather Sync Error:", err);
      toast({
        variant: "destructive",
        title: "Sync Error",
        description: err.message || "Failed to retrieve live data."
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [user, toast, fields]);

  useEffect(() => {
    setMounted(true);
    if (user) {
      fetchWeatherIntelligence();
    }
  }, [user, fetchWeatherIntelligence]);

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
      description: "Field has been successfully deleted from your records."
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
              <CardDescription className="text-xs">Live Global Weather • {weatherData.location}</CardDescription>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => fetchWeatherIntelligence()} 
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
                <span>Last Updated: {mounted ? (weatherData.lastUpdated || "Syncing...") : '...'}</span>
                <span className="text-primary flex items-center gap-1">
                  <Wind className="w-3 h-3" /> Real-time Feed
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
                      {weatherAdvice?.advice || "Analyzing live atmospheric conditions for your field..."}
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
              <span className="text-5xl font-bold text-slate-800 tracking-tight">{weatherAdvice?.riskDetected ? '1' : '0'}</span>
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
              <div key={field.id} className="relative group">
                <Link href={`/fields/${field.id}`}>
                  <Card className="border-none shadow-sm hover:shadow-md transition-all bg-white rounded-2xl flex border border-slate-50 overflow-hidden min-h-[160px]">
                    <div className="w-24 bg-secondary/30 flex flex-col items-center justify-center gap-2 shrink-0 group-hover:bg-secondary/50 transition-colors py-8">
                      <Sprout className="w-8 h-8 text-primary" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">
                        {field.currentCropId || 'Maize'}
                      </span>
                    </div>
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
                      <div className="mt-4 pt-4 border-t flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">STATUS</span>
                        <span className="text-xs font-bold text-green-600">Active</span>
                      </div>
                    </div>
                  </Card>
                </Link>
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <EditFieldDialog field={field} trigger={
                    <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-white/90 shadow-sm hover:bg-white">
                      <Edit3 className="w-4 h-4 text-primary" />
                    </Button>
                  } />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-white/90 shadow-sm hover:bg-destructive hover:text-white">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Field?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{field.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteField(field.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-50">
        <Link href="/assistant">
          <Button size="icon" className="w-14 h-14 rounded-full bg-white shadow-xl text-primary border border-primary/10 hover:bg-primary/5 hover:scale-110 transition-transform">
            <Bot className="w-7 h-7" />
          </Button>
        </Link>
        
        <Popover open={isScannerOpen} onOpenChange={setIsScannerOpen}>
          <PopoverTrigger asChild>
            <Button size="icon" className={`w-14 h-14 rounded-full shadow-xl text-white transition-all hover:scale-110 ${isScannerOpen ? 'bg-primary/40' : 'bg-primary'}`}>
              {isScannerOpen ? <X className="w-7 h-7" /> : <Maximize className="w-7 h-7" />}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" side="top" className="w-64 p-2 border-none shadow-2xl rounded-3xl mb-4 animate-in slide-in-from-bottom-2 duration-300">
            <div className="flex flex-col gap-1">
              <Link href="/vision/soil">
                <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-accent transition-colors cursor-pointer group">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-800">Scan Soil Report</span>
                    <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Analyze pH & nutrients</span>
                  </div>
                </div>
              </Link>
              <Link href="/vision/disease">
                <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-accent transition-colors cursor-pointer group">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                    <Bug className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-800">Disease Identification</span>
                    <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Diagnose problems</span>
                  </div>
                </div>
              </Link>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
