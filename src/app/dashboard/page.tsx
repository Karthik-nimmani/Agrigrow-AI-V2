
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
  MapPin,
  Edit3,
  Trash2,
  Maximize,
  FileText,
  Bug,
  X,
  Info
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
  
  const fieldsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'farmFields');
  }, [firestore, user]);

  const { data: fields, isLoading: isFieldsLoading } = useCollection(fieldsQuery);

  const [weatherData, setWeatherData] = useState({
    temp: 0,
    humidity: 0,
    soilMoisture: 45,
    location: "Ready to Sync",
    lastUpdated: "Manual Sync Required"
  });
  const [weatherAdvice, setWeatherAdvice] = useState<AiWeatherBasedCropAdviceOutput | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const fetchWeatherIntelligence = useCallback(async (lat?: number, lon?: number) => {
    if (!user) return;
    setIsRefreshing(true);
    
    try {
      let currentLat = lat || 30.9010;
      let currentLon = lon || 75.8573;

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

      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${currentLat}&longitude=${currentLon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=auto`
      );
      if (!weatherRes.ok) throw new Error("Weather API unreachable");
      const weatherJson = await weatherRes.json();
      
      let locationName = "Local Farm";
      try {
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${currentLat}&lon=${currentLon}&zoom=10`,
          { headers: { 'Accept-Language': 'en' } }
        );
        if (geoRes.ok) {
          const geoJson = await geoRes.json();
          locationName = geoJson.address.city || geoJson.address.town || geoJson.address.state || "Local Farm";
        }
      } catch (e) {
        console.warn("Geocoding service busy, using fallback location name");
      }

      const updatedTemp = weatherJson.current.temperature_2m;
      const updatedHumidity = weatherJson.current.relative_humidity_2m;

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
        weatherForecast: `Wind speed is ${weatherJson.current.wind_speed_10m} km/h. Clear skies expected.`,
        cropGrowthStage: "Vegetative"
      });
      setWeatherAdvice(res);
      
      toast({
        title: "Intelligence Updated",
        description: `Successfully synced data for ${locationName}.`
      });

    } catch (err: any) {
      console.error("Weather Sync Error:", err);
      toast({
        variant: 'destructive',
        title: "Sync Failed",
        description: "Could not fetch meteorological data. Check internet connection."
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [user, fields, toast]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDeleteField = (fieldId: string) => {
    if (!user || !firestore) return;
    const fieldRef = doc(firestore, 'users', user.uid, 'farmFields', fieldId);
    deleteDocumentNonBlocking(fieldRef);
    toast({
      title: "Field removed",
      description: "Acreage record has been successfully deleted."
    });
  };

  const totalAreaValue = fields?.reduce((acc, f) => acc + (Number(f.area) || 0), 0) || 0;
  const potentialYieldValue = Math.round(totalAreaValue * 2450); // kg
  const activeRisksCount = weatherAdvice?.riskDetected ? 1 : 0;

  if (isUserLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-10 p-4 md:p-8 pb-32 text-slate-900 bg-[#FBF9F6] min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold font-headline mb-2 text-[#332010]">Farm Overview</h1>
          <p className="text-muted-foreground text-lg">Manual sync enabled for precision cost control.</p>
        </div>
      </div>

      {/* Meteorological Intelligence - Manual Only */}
      <Card className="border-none shadow-sm bg-white overflow-hidden rounded-[2.5rem]">
        <CardHeader className="bg-[#FAF7F2] border-b flex flex-row items-center justify-between py-6 px-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <CloudSun className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Meteorological Intelligence</CardTitle>
              <CardDescription className="text-sm font-medium">{weatherData.location}</CardDescription>
            </div>
          </div>
          <Button 
            variant="default" 
            size="sm" 
            onClick={() => fetchWeatherIntelligence()} 
            disabled={isRefreshing}
            className="rounded-full h-12 px-6 shadow-lg font-bold transition-all hover:scale-105"
          >
            {isRefreshing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Sync Data
          </Button>
        </CardHeader>
        <CardContent className="p-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="space-y-8">
              <div className="grid grid-cols-3 gap-6">
                <div className="flex flex-col items-center p-6 rounded-[2rem] bg-[#F8F5F0]">
                  <Thermometer className="w-7 h-7 text-orange-500 mb-2" />
                  <span className="text-2xl font-black">{weatherData.temp}°C</span>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Temp</span>
                </div>
                <div className="flex flex-col items-center p-6 rounded-[2rem] bg-[#F8F5F0]">
                  <Droplets className="w-7 h-7 text-blue-500 mb-2" />
                  <span className="text-2xl font-black">{weatherData.humidity}%</span>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Humidity</span>
                </div>
                <div className="flex flex-col items-center p-6 rounded-[2rem] bg-[#F8F5F0]">
                  <Sprout className="w-7 h-7 text-green-600 mb-2" />
                  <span className="text-2xl font-black">{weatherData.soilMoisture}%</span>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Soil</span>
                </div>
              </div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground px-2">
                Last Sync: {weatherData.lastUpdated}
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className={`h-full rounded-[2.5rem] p-8 border transition-all duration-500 ${weatherAdvice?.riskDetected ? 'bg-amber-50 border-amber-100 shadow-inner' : 'bg-primary/5 border-primary/10'}`}>
                <div className="flex items-start gap-6">
                  <div className={`p-5 rounded-3xl shrink-0 ${weatherAdvice?.riskDetected ? 'bg-amber-100' : 'bg-primary/20'}`}>
                    <Sparkles className={`w-10 h-10 ${weatherAdvice?.riskDetected ? 'text-amber-700' : 'text-primary'}`} />
                  </div>
                  <div className="space-y-3">
                    <h4 className={`text-2xl font-bold font-headline ${weatherAdvice?.riskDetected ? 'text-amber-900' : 'text-primary'}`}>
                      {weatherAdvice?.alert || "System Ready for Analysis"}
                    </h4>
                    <p className="text-lg text-[#554030] leading-relaxed opacity-90">
                      {weatherAdvice?.advice || "Click 'Sync Data' to analyze atmospheric conditions for your current fields."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-primary text-primary-foreground rounded-[2rem] overflow-hidden">
          <CardContent className="p-8 space-y-4">
            <div className="flex items-center gap-3">
              <Sprout className="w-5 h-5 opacity-80" />
              <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Total Area</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-black tracking-tighter">{totalAreaValue.toFixed(1)}</span>
              <span className="text-xl font-bold opacity-80">Acres</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white rounded-[2rem] overflow-hidden">
          <CardContent className="p-8 space-y-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Potential Yield</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-black tracking-tighter text-[#332010]">{potentialYieldValue.toLocaleString()}</span>
              <span className="text-xl font-bold text-slate-400">kg</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white rounded-[2rem] overflow-hidden">
          <CardContent className="p-8 space-y-4">
            <div className="flex items-center gap-3 text-red-500">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active Risks</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-black tracking-tighter text-[#332010]">{activeRisksCount}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Fields Section */}
      <div className="space-y-8">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-4xl font-black font-headline text-[#332010]">Active Fields</h2>
          <Link href="/fields/new">
            <Button className="rounded-2xl h-12 px-8 font-bold shadow-lg hover:scale-105 transition-all">
              <Plus className="w-5 h-5 mr-2" /> Add New Field
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {isFieldsLoading ? (
            <div className="col-span-full py-20 flex justify-center"><Loader2 className="animate-spin text-primary h-10 w-10" /></div>
          ) : fields?.length === 0 ? (
            <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border-4 border-dashed border-slate-100">
              <p className="text-muted-foreground text-xl font-medium">No fields registered yet.</p>
            </div>
          ) : (
            fields?.map((field) => (
              <Card key={field.id} className="border-none shadow-sm bg-white rounded-[2rem] overflow-hidden group hover:shadow-xl transition-all duration-300 relative">
                <div className="flex h-full">
                  {/* Left Accent Bar */}
                  <div className="w-24 bg-[#F5F1EE] flex flex-col items-center justify-center gap-2 border-r">
                    <Sprout className="w-8 h-8 text-[#A36B27]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#A36B27]">
                      {field.currentCropId || 'CROP'}
                    </span>
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 p-8 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <Link href={`/fields/${field.id}`}>
                          <h4 className="text-2xl font-black text-[#332010] hover:text-primary transition-colors cursor-pointer leading-tight">
                            {field.name}
                          </h4>
                        </Link>
                        <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                      </div>
                      
                      <div className="space-y-2 mb-6">
                        <div className="flex items-center gap-2 text-sm text-slate-500 font-bold">
                          <MapPin className="w-4 h-4" /> {field.locationDescription || 'N/A'}
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-base font-black text-[#332010]">{field.area} <span className="text-slate-400 font-bold">Acres</span></span>
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                          <span className="text-base font-black text-[#332010]">pH <span className="text-slate-400 font-bold">{field.soilPH}</span></span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</span>
                        <span className="text-sm font-black text-green-600 uppercase tracking-wider mt-1">Ready for Harvest</span>
                      </div>
                      
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <EditFieldDialog field={field} trigger={
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary">
                            <Edit3 className="w-5 h-5" />
                          </Button>
                        } />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-destructive hover:bg-destructive/10">
                              <Trash2 className="w-5 h-5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-3xl border-none shadow-2xl">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-3xl font-black font-headline text-slate-900">Delete Field?</AlertDialogTitle>
                              <AlertDialogDescription className="text-lg text-slate-600">
                                Are you sure you want to delete "{field.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="gap-2">
                              <AlertDialogCancel className="rounded-2xl h-12 px-8 font-bold">Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteField(field.id)} className="bg-red-500 hover:bg-red-600 rounded-2xl h-12 px-8 font-bold">Delete Permanently</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-10 right-10 flex flex-col gap-5 z-50">
        <Link href="/assistant">
          <Button size="icon" className="w-20 h-20 rounded-full bg-white shadow-2xl text-primary border-4 border-white hover:scale-110 transition-transform group">
            <Bot className="w-10 h-10 group-hover:rotate-12 transition-transform" />
          </Button>
        </Link>
        
        <Popover open={isScannerOpen} onOpenChange={setIsScannerOpen}>
          <PopoverTrigger asChild>
            <Button size="icon" className={`w-20 h-20 rounded-full shadow-2xl text-white transition-all hover:scale-110 ${isScannerOpen ? 'bg-slate-900' : 'bg-primary'} border-4 border-white`}>
              {isScannerOpen ? <X className="w-10 h-10" /> : <Maximize className="w-10 h-10" />}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" side="top" className="w-72 p-4 border-none shadow-2xl rounded-[2.5rem] mb-6 mr-[-10px] bg-white">
            <div className="flex flex-col gap-3">
              <Link href="/vision/soil">
                <div className="flex items-center gap-5 p-5 rounded-[1.5rem] hover:bg-blue-50 transition-colors cursor-pointer group border-2 border-transparent hover:border-blue-100">
                  <div className="p-3 bg-blue-100 rounded-2xl group-hover:bg-blue-200"><FileText className="w-6 h-6 text-blue-600" /></div>
                  <span className="text-base font-black text-slate-800">Soil Report</span>
                </div>
              </Link>
              <Link href="/vision/disease">
                <div className="flex items-center gap-5 p-5 rounded-[1.5rem] hover:bg-red-50 transition-colors cursor-pointer group border-2 border-transparent hover:border-red-100">
                  <div className="p-3 bg-red-100 rounded-2xl group-hover:bg-red-200"><Bug className="w-6 h-6 text-red-500" /></div>
                  <span className="text-base font-black text-slate-800">Disease ID</span>
                </div>
              </Link>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
