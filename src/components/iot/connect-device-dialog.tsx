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
import { Wifi, Smartphone, Plus, Info, Loader2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ConnectDeviceDialogProps {
  trigger?: React.ReactNode;
}

type ConnectionStep = 'method' | 'code' | 'wifi';

export function ConnectDeviceDialog({ trigger }: ConnectDeviceDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<ConnectionStep>('method');
  const [code, setCode] = useState('');
  const [isPairing, setIsPairing] = useState(false);
  const { toast } = useToast();

  const handlePairing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    
    setIsPairing(true);
    // Simulate pairing process
    setTimeout(() => {
      setIsPairing(false);
      setOpen(false);
      setStep('method');
      setCode('');
      toast({
        title: "Device Paired",
        description: "Your smart sensor is now syncing with the IoT Hub.",
      });
    }, 2000);
  };

  const resetDialog = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setTimeout(() => setStep('method'), 300);
      setCode('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={resetDialog}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="rounded-xl h-12 px-6 flex items-center gap-2 shadow-lg bg-primary hover:bg-primary/90">
            <Plus className="w-5 h-5" /> Connect New Device
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl rounded-3xl bg-white">
        <div className="p-8 space-y-8">
          <DialogHeader className="space-y-2 text-left">
            <div className="flex items-center gap-2">
              {step !== 'method' && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setStep('method')}
                  className="h-8 w-8 rounded-full -ml-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
              <DialogTitle className="text-2xl font-bold font-headline text-slate-900">
                Connect Smart Device
              </DialogTitle>
            </div>
            <DialogDescription className="text-base text-muted-foreground">
              Integrate IoT hardware via Wi-Fi or integration code.
            </DialogDescription>
          </DialogHeader>

          {step === 'method' && (
            <div className="space-y-6">
              <p className="text-sm font-medium text-slate-500">Choose your connection method:</p>
              
              <div className="grid gap-4">
                <button 
                  onClick={() => setStep('wifi')}
                  className="flex flex-col items-center justify-center gap-3 p-8 rounded-3xl border-2 border-slate-100 hover:border-primary/30 hover:bg-primary/5 transition-all group text-center"
                >
                  <div className="p-3 bg-primary/10 rounded-full group-hover:scale-110 transition-transform">
                    <Wifi className="w-6 h-6 text-primary" />
                  </div>
                  <span className="font-bold text-slate-800">Setup via Device Wi-Fi</span>
                </button>

                <button 
                  onClick={() => setStep('code')}
                  className="flex flex-col items-center justify-center gap-3 p-8 rounded-3xl border-2 border-slate-100 hover:border-primary/30 hover:bg-primary/5 transition-all group text-center"
                >
                  <div className="p-3 bg-primary/10 rounded-full group-hover:scale-110 transition-transform">
                    <Smartphone className="w-6 h-6 text-primary" />
                  </div>
                  <span className="font-bold text-slate-800">Enter Integration Code</span>
                </button>
              </div>
            </div>
          )}

          {step === 'code' && (
            <form onSubmit={handlePairing} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="p-6 bg-muted/40 rounded-3xl border border-muted flex gap-4 items-start">
                <div className="p-1 rounded-full border border-muted-foreground/20">
                  <Info className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Check the back of your sensor for a 6-digit alphanumeric code. Ensure the device is powered on and flashing blue.
                </p>
              </div>

              <div className="space-y-4">
                <Label className="text-xs font-black uppercase tracking-[0.2em] text-slate-800 ml-1">
                  Device Integration Code
                </Label>
                <Input 
                  placeholder="e.g. AG-X942"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="h-16 text-center text-xl font-bold tracking-widest rounded-2xl bg-muted/30 border-none focus-visible:ring-primary"
                  autoFocus
                  maxLength={10}
                />
              </div>

              <Button 
                type="submit" 
                disabled={isPairing || !code.trim()}
                className="w-full h-16 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90"
              >
                {isPairing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Pairing...
                  </>
                ) : 'Pair Device'}
              </Button>
            </form>
          )}

          {step === 'wifi' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 text-center py-4">
              <div className="p-10 bg-primary/5 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                <Wifi className="w-10 h-10 text-primary animate-pulse" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-bold">Scanning for Devices</h4>
                <p className="text-muted-foreground">Please ensure your device is in pairing mode and nearby.</p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setStep('method')}
                className="rounded-xl"
              >
                Cancel Scan
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
