
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Sprout, MapPin, Droplets, Info, Save, Loader2, Thermometer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFirestore, useUser, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function AddNewFieldPage() {
  const router = useRouter();
  const { firestore } = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [cropType, setCropType] = useState('Maize');
  const [location, setLocation] = useState('');
  const [soilType, setSoilType] = useState('Loamy');
  const [irrigation, setIrrigation] = useState('Rainfed');
  const [ph, setPh] = useState([6.5]);
  const [nitrogen, setNitrogen] = useState('Optimal');
  const [phosphorus, setPhosphorus] = useState('Optimal');
  const [potassium, setPotassium] = useState('Optimal');
  const [moisture, setMoisture] = useState('35');
  const [area, setArea] = useState('2');
  const [lastYield, setLastYield] = useState('1000');
  const [sowingDate, setSowingDate] = useState<Date | undefined>(undefined);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to add a field.' });
      return;
    }

    setIsSubmitting(true);

    const fieldData = {
      userId: user.uid,
      name,
      currentCropTypeId: cropType,
      locationDescription: location,
      soilType,
      irrigationMethod: irrigation,
      soilPH: ph[0],
      nutrients: { nitrogen, phosphorus, potassium, moisture: Number(moisture) },
      areaAmount: Number(area),
      areaUnit: 'Acres',
      yieldHistoryAmount: Number(lastYield),
      plantingDate: sowingDate ? sowingDate.toISOString() : new Date().toISOString(),
      status: 'Healthy',
      createdAt: new Date().toISOString()
    };

    try {
      const colRef = collection(firestore, 'users', user.uid, 'fields');
      addDocumentNonBlocking(colRef, fieldData);
      
      toast({ title: 'Field Added', description: `${name} has been successfully registered.` });
      router.push('/fields');
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Card className="border-none shadow-2xl overflow-hidden bg-white">
        <CardHeader className="bg-primary text-primary-foreground p-8">
          <div className="flex items-center gap-3 mb-2">
            <Sprout className="w-8 h-8" />
            <CardTitle className="text-3xl font-headline">Add New Field</CardTitle>
          </div>
          <CardDescription className="text-primary-foreground/80 text-lg">
            Precise details ensure scientific AI-powered predictions.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-8">
          <form onSubmit={handleSave} className="space-y-8">
            {/* Field Name */}
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Field Name</Label>
              <Input 
                placeholder="e.g. North Ridge Field" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-14 rounded-xl bg-muted/30 border-none focus-visible:ring-primary text-lg"
              />
            </div>

            {/* Crop Type & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Crop Type</Label>
                <Select value={cropType} onValueChange={setCropType}>
                  <SelectTrigger className="h-14 rounded-xl bg-muted/30 border-none">
                    <SelectValue placeholder="Select crop" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Maize">Maize (मक्का)</SelectItem>
                    <SelectItem value="Wheat">Wheat (गेहूं)</SelectItem>
                    <SelectItem value="Rice">Rice (चावल)</SelectItem>
                    <SelectItem value="Soybean">Soybean (सोयाबीन)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Location / Region</Label>
                  <button type="button" className="text-[10px] font-bold text-primary hover:underline">Detect Live</button>
                </div>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="e.g. Karnal, Haryana" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="h-14 pl-10 rounded-xl bg-muted/30 border-none focus-visible:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* Soil Type & Irrigation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Soil Type</Label>
                <Select value={soilType} onValueChange={setSoilType}>
                  <SelectTrigger className="h-14 rounded-xl bg-muted/30 border-none">
                    <SelectValue placeholder="Select soil type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Loamy">Loamy</SelectItem>
                    <SelectItem value="Sandy">Sandy</SelectItem>
                    <SelectItem value="Clay">Clay</SelectItem>
                    <SelectItem value="Silty">Silty</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Irrigation Method</Label>
                <Select value={irrigation} onValueChange={setIrrigation}>
                  <SelectTrigger className="h-14 rounded-xl bg-muted/30 border-none">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Rainfed">Rainfed</SelectItem>
                    <SelectItem value="Drip Irrigation">Drip Irrigation</SelectItem>
                    <SelectItem value="Sprinkler">Sprinkler</SelectItem>
                    <SelectItem value="Surface (Flood)">Surface (Flood)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* pH Slider */}
            <div className="space-y-6 py-4">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Soil pH Level</Label>
                <span className="font-bold text-primary text-lg">{ph[0]}</span>
              </div>
              <Slider 
                value={ph} 
                onValueChange={setPh} 
                max={14} 
                step={0.1} 
                className="py-4"
              />
            </div>

            {/* Nutrients Panel */}
            <div className="p-6 rounded-2xl bg-muted/20 border border-muted space-y-6">
              <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground block">Nutrient Profile & Moisture</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Nitrogen</span>
                  <Select value={nitrogen} onValueChange={setNitrogen}>
                    <SelectTrigger className="h-10 bg-white border-none shadow-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Optimal">Optimal</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Phosphorus</span>
                  <Select value={phosphorus} onValueChange={setPhosphorus}>
                    <SelectTrigger className="h-10 bg-white border-none shadow-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Optimal">Optimal</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Potassium</span>
                  <Select value={potassium} onValueChange={setPotassium}>
                    <SelectTrigger className="h-10 bg-white border-none shadow-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Optimal">Optimal</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Moisture %</span>
                  <Input 
                    type="number"
                    value={moisture}
                    onChange={(e) => setMoisture(e.target.value)}
                    className="h-10 bg-white border-none shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Area & Yield */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Area (Acres)</Label>
                <Input 
                  type="number" 
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="h-14 rounded-xl bg-muted/30 border-none"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Last Season Yield (KG)</Label>
                <Input 
                  type="number" 
                  value={lastYield}
                  onChange={(e) => setLastYield(e.target.value)}
                  className="h-14 rounded-xl bg-muted/30 border-none"
                />
              </div>
            </div>

            {/* Sowing Date */}
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <CalendarIcon className="w-3 h-3" /> Sowing Date (Current Season)
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full h-14 rounded-xl bg-muted/30 border-none justify-start text-left font-normal px-4",
                      !sowingDate && "text-muted-foreground"
                    )}
                  >
                    {sowingDate ? format(sowingDate, "PPP") : <span>dd-mm-yyyy</span>}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={sowingDate}
                    onSelect={setSowingDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="pt-6 space-y-4">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full h-16 rounded-2xl text-xl font-bold gap-2 shadow-xl hover:scale-[1.01] transition-transform"
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : <Save className="w-6 h-6" />}
                Save Field Details
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => router.back()}
                className="w-full h-12 rounded-xl text-muted-foreground"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
