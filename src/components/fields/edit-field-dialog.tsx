"use client";

import React, { useState, useEffect } from 'react';
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
import { CalendarIcon, Sprout, MapPin, Save, Loader2, Edit3, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFirestore, useUser, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface EditFieldDialogProps {
  field: any;
  trigger?: React.ReactNode;
}

export function EditFieldDialog({ field, trigger }: EditFieldDialogProps) {
  const [open, setOpen] = useState(false);
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);

  // Form State
  const [name, setName] = useState(field.name || '');
  const [cropType, setCropType] = useState(field.currentCropId || 'Maize');
  const [location, setLocation] = useState(field.locationDescription || '');
  const [latitude, setLatitude] = useState<number | null>(field.latitude || null);
  const [longitude, setLongitude] = useState<number | null>(field.longitude || null);
  const [soilType, setSoilType] = useState(field.soilType || 'Loamy');
  const [ph, setPh] = useState([field.soilPH || 6.5]);
  const [area, setArea] = useState(String(field.area || '2'));
  const [sowingDate, setSowingDate] = useState<Date | undefined>(
    field.sowingDate ? new Date(field.sowingDate) : undefined
  );

  const detectLocation = () => {
    if (!("geolocation" in navigator)) return;
    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setIsDetecting(false);
        toast({ title: 'Location Updated', description: 'New coordinates captured.' });
      },
      () => setIsDetecting(false)
    );
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !firestore) return;

    setIsSubmitting(true);

    const updateData = {
      name,
      currentCropId: cropType,
      locationDescription: location,
      latitude,
      longitude,
      soilType,
      soilPH: ph[0],
      area: Number(area),
      sowingDate: sowingDate ? sowingDate.toISOString() : null,
      updatedAt: new Date().toISOString()
    };

    const docRef = doc(firestore, 'users', user.uid, 'farmFields', field.id);
    
    try {
      updateDocumentNonBlocking(docRef, updateData);
      toast({ title: 'Field Updated', description: `${name} has been successfully modified.` });
      setOpen(false);
    } catch (error) {
      console.error('Error updating field:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="rounded-xl flex items-center gap-2">
            <Edit3 className="w-4 h-4" /> Edit Details
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-none shadow-2xl p-0">
        <DialogHeader className="bg-primary p-8 text-primary-foreground rounded-t-lg">
          <DialogTitle className="text-3xl font-headline flex items-center gap-3">
            <Sprout className="w-8 h-8" />
            Edit Field: {field.name}
          </DialogTitle>
          <DialogDescription className="text-primary-foreground/80 text-lg">
            Update your field metrics for accurate AI monitoring.
          </DialogDescription>
        </DialogHeader>

        <div className="p-8">
          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Field Name</Label>
              <Input 
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
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Location</Label>
                  <Button type="button" variant="ghost" size="sm" onClick={detectLocation} disabled={isDetecting} className="h-6 text-[10px] font-bold text-primary">
                    {isDetecting ? '...' : 'Relocate'}
                  </Button>
                </div>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
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
                      initialFocus 
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className="w-full h-16 rounded-2xl text-xl font-bold gap-3 shadow-xl"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : <Save className="w-6 h-6" />}
              Save Changes
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
