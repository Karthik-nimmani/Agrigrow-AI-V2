
"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Sprout, MapPin, Save, Loader2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFirestore, useUser, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface AddFieldDialogProps {
  trigger?: React.ReactNode;
}

export function AddFieldDialog({ trigger }: AddFieldDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { firestore } = useFirestore();
  const { user, isUserLoading } = useUser();
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Session Required', description: 'Please sign in to register your field.' });
      router.push('/login');
      return;
    }

    if (!name || !location || !area) {
      toast({ variant: 'destructive', title: 'Missing Info', description: 'Please fill in all required fields.' });
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
      nutrients: { 
        nitrogen, 
        phosphorus, 
        potassium, 
        moisture: Number(moisture) 
      },
      areaAmount: Number(area),
      areaUnit: 'Acres',
      yieldHistoryAmount: Number(lastYield),
      plantingDate: sowingDate ? sowingDate.toISOString() : new Date().toISOString(),
      status: 'Healthy',
      createdAt: new Date().toISOString()
    };

    const colRef = collection(firestore, 'users', user.uid, 'fields');
    
    // Using non-blocking update as per guidelines
    addDocumentNonBlocking(colRef, fieldData)
      .then(() => {
        toast({ title: 'Success', description: `${name} has been added to your field list.` });
        setOpen(false);
        resetForm();
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const resetForm = () => {
    setName('');
    setCropType('Maize');
    setLocation('');
    setSoilType('Loamy');
    setIrrigation('Rainfed');
    setPh([6.5]);
    setSowingDate(undefined);
    setArea('2');
    setLastYield('1000');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="rounded-full flex items-center gap-2 px-6 shadow-md hover:shadow-lg transition-all">
            <Plus className="w-4 h-4" /> Add New Field
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline flex items-center gap-2 text-primary">
            <Sprout className="w-6 h-6" />
            Field Registration
          </DialogTitle>
          <DialogDescription>
            Input your field details for AI monitoring and precision analytics.
          </DialogDescription>
        </DialogHeader>

        {(!user && !isUserLoading) ? (
          <div className="p-8 text-center space-y-4">
            <p className="text-muted-foreground">Login required to manage farm data.</p>
            <Button onClick={() => router.push('/login')} className="w-full h-12 rounded-xl">Go to Login</Button>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Field Name</Label>
              <Input 
                placeholder="e.g. West Farm Block A" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-12 rounded-xl bg-muted/30 border-none focus-visible:ring-primary text-base"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Crop Type</Label>
                <Select value={cropType} onValueChange={setCropType}>
                  <SelectTrigger className="h-12 rounded-xl bg-muted/30 border-none">
                    <SelectValue placeholder="Select crop" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Maize">Maize (मक्का)</SelectItem>
                    <SelectItem value="Wheat">Wheat (गेहूं)</SelectItem>
                    <SelectItem value="Rice">Rice (चावल)</SelectItem>
                    <SelectItem value="Soybean">Soybean (सोयाबीन)</SelectItem>
                    <SelectItem value="Sugarcane">Sugarcane (गन्ना)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="e.g. Karnal, Punjab" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    className="h-12 pl-10 rounded-xl bg-muted/30 border-none focus-visible:ring-primary"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 py-2">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Soil pH Level</Label>
                <span className="font-bold text-primary text-lg">{ph[0]}</span>
              </div>
              <Slider value={ph} onValueChange={setPh} max={14} step={0.1} className="py-4" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-muted/20 border border-muted/50">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Nitrogen</span>
                <Select value={nitrogen} onValueChange={setNitrogen}>
                  <SelectTrigger className="h-9 bg-white border-none shadow-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Optimal">Optimal</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Phosphorus</span>
                <Select value={phosphorus} onValueChange={setPhosphorus}>
                  <SelectTrigger className="h-9 bg-white border-none shadow-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Optimal">Optimal</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Potassium</span>
                <Select value={potassium} onValueChange={setPotassium}>
                  <SelectTrigger className="h-9 bg-white border-none shadow-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Optimal">Optimal</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Moisture %</span>
                <Input 
                  type="number" 
                  value={moisture} 
                  onChange={(e) => setMoisture(e.target.value)} 
                  className="h-9 bg-white border-none shadow-sm" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Area (Acres)</Label>
                <Input 
                  type="number" 
                  value={area} 
                  onChange={(e) => setArea(e.target.value)} 
                  required
                  className="h-12 rounded-xl bg-muted/30 border-none" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sowing Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant={"outline"} 
                      className={cn(
                        "w-full h-12 rounded-xl bg-muted/30 border-none justify-start text-left font-normal px-4", 
                        !sowingDate && "text-muted-foreground"
                      )}
                    >
                      {sowingDate ? format(sowingDate, "PPP") : <span>Select date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={sowingDate} onSelect={setSowingDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className="w-full h-14 rounded-xl text-lg font-bold gap-2 shadow-xl hover:scale-[1.01] transition-transform"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : <Save className="w-5 h-5" />}
              Register Field
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
