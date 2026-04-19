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
import { Wifi, Smartphone, Plus, Info, Loader2, ArrowLeft, Signal, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ConnectDeviceDialogProps {
  trigger?: React.ReactNode;
}

type ConnectionStep = 'method' | 'code' | 'wifi' | 'scanning' | 'success';

const MOCK_NETWORKS = [
  { name: 'AgriSensor-Node-01', signal: 'strong', id: 'as-01' },
  { name: 'AgriSensor-Node-04', signal: 'medium', id: 'as-04' },
  { name: 'AgriGrow-Hub-v2', signal: 'weak', id: 'ag-h2' },
];

export function ConnectDeviceDialog({ trigger }: ConnectDeviceDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<ConnectionStep>('method');
  const [code, setCode] = useState('');
  const [isPairing, setIsPairing] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);
  const { toast } = useToast();

  const handlePairing = (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsPairing(true);
    // Simulate pairing process
    setTimeout(() => {
      setIsPairing(false);
      setStep('success');
      toast({
        title: "Device Paired",
        description: "Your smart sensor is now syncing with the IoT Hub.",
      });
    }, 2000);
  };

  const startWifiScan = () => {
    setStep('scanning');
    setTimeout(() => {
      setStep('wifi');
    }, 3000);
  };

  const resetDialog = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setTimeout(() => {
        setStep('method');
        setCode('');
        setSelectedNetwork(null);
      }, 300);
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
              {['code', 'scanning', 'wifi'].includes(step) && (
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
                {step === 'success' ? 'Connection Successful' : 'Connect Smart Device'}
              </DialogTitle>
            </div>
            <DialogDescription className="text-base text-muted-foreground">
              {step === 'success' 
                ? 'Your device is now fully integrated into the AgriGrow ecosystem.' 
                : 'Integrate IoT hardware via Wi-Fi or integration code.'}
            </DialogDescription>
          </DialogHeader>

          {step === 'method' && (
            <div className="space-y-6">
              <p className="text-sm font-medium text-slate-500">Choose your connection method:</p>
              
              <div className="grid gap-4">
                <button 
                  onClick={startWifiScan}
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

          {step === 'scanning' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 text-center py-4">
              <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-primary/20 rounded-full animate-ping" />
                <div className="absolute inset-4 border-4 border-primary/40 rounded-full animate-ping [animation-delay:0.5s]" />
                <div className="z-10 p-6 bg-primary/10 rounded-full">
                  <Wifi className="w-10 h-10 text-primary animate-pulse" />
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-bold">Scanning for Modules</h4>
                <p className="text-muted-foreground">Searching for nearby AgriSensor Wi-Fi nodes...</p>
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

          {step === 'wifi' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="p-4 bg-muted/30 rounded-2xl flex items-start gap-3 border">
                <Info className="w-4 h-4 text-primary shrink-0 mt-1" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Select the AgriSensor Wi-Fi network that matches the label on your physical hardware to begin pairing.
                </p>
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-800 ml-1">
                  Detected Modules
                </Label>
                <div className="grid gap-2">
                  {MOCK_NETWORKS.map((nw) => (
                    <button
                      key={nw.id}
                      onClick={() => setSelectedNetwork(nw.id)}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left",
                        selectedNetwork === nw.id 
                          ? "border-primary bg-primary/5" 
                          : "border-slate-100 hover:border-slate-200"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <Wifi className={cn(
                            "w-4 h-4",
                            selectedNetwork === nw.id ? "text-primary" : "text-muted-foreground"
                          )} />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-800">{nw.name}</p>
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Signal className="w-3 h-3" /> {nw.signal} signal
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    </button>
                  ))}
                </div>
              </div>

              <Button 
                onClick={() => handlePairing()}
                disabled={isPairing || !selectedNetwork}
                className="w-full h-16 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20"
              >
                {isPairing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Connecting...
                  </>
                ) : 'Connect to Module'}
              </Button>
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

          {step === 'success' && (
            <div className="space-y-8 animate-in zoom-in-95 duration-500 text-center py-6">
              <div className="p-6 bg-green-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
              <div className="space-y-2">
                <h4 className="text-2xl font-bold text-slate-900">Module Synced</h4>
                <p className="text-muted-foreground">
                  The IoT Node is now sending data to your dashboard. You can configure calibration settings in the Hub menu.
                </p>
              </div>
              <Button 
                onClick={() => setOpen(false)}
                className="w-full h-14 rounded-2xl font-bold"
              >
                Go to Hub
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}