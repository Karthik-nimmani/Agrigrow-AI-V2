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
import { useFirestore, useUser, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface AddFieldDialogProps {
  trigger?: React.ReactNode;
}

export function AddFieldDialog({ trigger }: AddFieldDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [cropType, setCropType] = useState('Maize');
  const [location, setLocation] = useState('');
  const [soilType, setSoilType] = useState('Loamy');
  const [ph, setPh] = useState([6.5]);
  const [area, setArea] = useState('2');
  const [sowingDate, setSowingDate] = useState<Date | undefined>(undefined);

  const handleSave = async (e: React.FormEvent) => {
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

    const fieldId = crypto.randomUUID();
    const fieldData = {
      id: fieldId,
      userId: user.uid,
      name,
      currentCropId: cropType,
      locationDescription: location,
      soilType,
      soilPH: ph[0],
      area: Number(area),
      unitOfArea: 'Acres',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = doc(firestore, 'users', user.uid, 'farmFields', fieldId);
    
    try {
      setDocumentNonBlocking(docRef, fieldData, { merge: true });
      toast({ title: 'Success', description: `${name} has been added to your field list.` });
      setOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error adding field:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName('');
    setCropType('Maize');
    setLocation('');
    setSoilType('Loamy');
    setPh([6.5]);
    setSowingDate(undefined);
    setArea('2');
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-none shadow-2xl p-0">
        <DialogHeader className="bg-primary p-8 text-primary-foreground rounded-t-lg">
          <DialogTitle className="text-3xl font-headline flex items-center gap-3">
            <Sprout className="w-8 h-8" />
            Field Registration
          </DialogTitle>
          <DialogDescription className="text-primary-foreground/80 text-lg">
            Input your field details for AI monitoring and precision analytics.
          </DialogDescription>
        </DialogHeader>

        <div className="p-8">
          {(!user && !isUserLoading) ? (
            <div className="text-center space-y-4 py-8">
              <p className="text-muted-foreground">Login required to manage farm data.</p>
              <Button onClick={() => router.push('/login')} className="w-full h-12 rounded-xl">Go to Login</Button>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Field Name</Label>
                <Input 
                  placeholder="e.g. West Farm Block A" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-14 rounded-xl bg-muted/30 border-none focus-visible:ring-primary text-base"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Crop Type</Label>
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
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="e.g. Karnal, Punjab" 
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                      className="h-14 pl-12 rounded-xl bg-muted/30 border-none focus-visible:ring-primary"
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Area (Acres)</Label>
                  <Input 
                    type="number" 
                    value={area} 
                    onChange={(e) => setArea(e.target.value)} 
                    required
                    className="h-14 rounded-xl bg-muted/30 border-none" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sowing Date</Label>
                  <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button 
                        variant={"outline"} 
                        className={cn(
                          "w-full h-14 rounded-xl bg-muted/30 border-none justify-start text-left font-normal px-4", 
                          !sowingDate && "text-muted-foreground"
                        )}
                      >
                        {sowingDate ? format(sowingDate, "PPP") : <span>Select date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar 
                        mode="single" 
                        selected={sowingDate} 
                        onSelect={(date) => {
                          setSowingDate(date);
                          setIsCalendarOpen(false);
                        }} 
                        onClear={() => {
                          setSowingDate(undefined);
                          setIsCalendarOpen(false);
                        }}
                        onToday={() => {
                          setSowingDate(new Date());
                          setIsCalendarOpen(false);
                        }}
                        initialFocus 
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full h-16 rounded-2xl text-xl font-bold gap-3 shadow-xl hover:scale-[1.01] transition-all"
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : <Save className="w-6 h-6" />}
                Register Field
              </Button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
