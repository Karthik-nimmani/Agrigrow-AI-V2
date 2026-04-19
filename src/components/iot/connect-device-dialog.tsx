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
import { Wifi, Smartphone, Plus, Info, Loader2, ArrowLeft, Signal, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ConnectDeviceDialogProps {
  trigger?: React.ReactNode;
}

type ConnectionStep = 'method' | 'code' | 'wifi-instructions' | 'wifi-manual' | 'scanning' | 'success';

export function ConnectDeviceDialog({ trigger }: ConnectDeviceDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<ConnectionStep>('method');
  const [code, setCode] = useState('');
  const [ssid, setSsid] = useState('');
  const [isPairing, setIsPairing] = useState(false);
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
      setStep('wifi-instructions');
    }, 2500);
  };

  const resetDialog = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setTimeout(() => {
        setStep('method');
        setCode('');
        setSsid('');
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
              {['code', 'scanning', 'wifi-instructions', 'wifi-manual'].includes(step) && (
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
                : 'Choose a method to pair your hardware node.'}
            </DialogDescription>
          </DialogHeader>

          {step === 'method' && (
            <div className="space-y-6">
              <div className="grid gap-4">
                <button 
                  onClick={startWifiScan}
                  className="flex flex-col items-center justify-center gap-3 p-8 rounded-3xl border-2 border-slate-100 hover:border-primary/30 hover:bg-primary/5 transition-all group text-center"
                >
                  <div className="p-3 bg-primary/10 rounded-full group-hover:scale-110 transition-transform">
                    <Wifi className="w-6 h-6 text-primary" />
                  </div>
                  <span className="font-bold text-slate-800">Setup via Wi-Fi AP</span>
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
                <div className="z-10 p-6 bg-primary/10 rounded-full">
                  <Wifi className="w-10 h-10 text-primary animate-pulse" />
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-bold">Scanning Local Hardware</h4>
                <p className="text-muted-foreground">Searching for broadcast signals...</p>
              </div>
            </div>
          )}

          {step === 'wifi-instructions' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <Alert className="bg-blue-50 border-blue-100">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-900 font-bold">Action Required</AlertTitle>
                <AlertDescription className="text-blue-800 text-xs">
                  For security, browsers cannot scan Wi-Fi signals directly. Please connect your computer/phone to the Wi-Fi network named <strong>"AgriSensor-XXXX"</strong> in your system settings first.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Once connected to the sensor's broadcast network, enter the Module ID found on the label:
                </p>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Module SSID / ID</Label>
                  <Input 
                    placeholder="e.g. AgriSensor-Node-01" 
                    value={ssid}
                    onChange={(e) => setSsid(e.target.value)}
                    className="h-14 rounded-2xl bg-muted/30 border-none"
                  />
                </div>
              </div>

              <Button 
                onClick={() => handlePairing()}
                disabled={isPairing || !ssid.trim()}
                className="w-full h-16 rounded-2xl text-lg font-bold shadow-xl"
              >
                {isPairing ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : 'Confirm Connection'}
              </Button>
            </div>
          )}

          {step === 'code' && (
            <form onSubmit={handlePairing} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="p-6 bg-muted/40 rounded-3xl border border-muted flex gap-4 items-start">
                <Info className="w-5 h-5 text-primary shrink-0 mt-1" />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Enter the 6-digit code from your device label. Ensure the device status LED is <strong>flashing blue</strong>.
                </p>
              </div>

              <div className="space-y-4">
                <Label className="text-xs font-black uppercase tracking-[0.2em] text-slate-800 ml-1">
                  Integration Code
                </Label>
                <Input 
                  placeholder="e.g. AG-X942"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="h-16 text-center text-xl font-bold tracking-widest rounded-2xl bg-muted/30 border-none focus-visible:ring-primary"
                  autoFocus
                />
              </div>

              <Button 
                type="submit" 
                disabled={isPairing || !code.trim()}
                className="w-full h-16 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90"
              >
                {isPairing ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : 'Pair Device'}
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
                  Your sensor is now transmitting data to the AgriGrow Cloud. Live telemetry is available in your IoT Hub.
                </p>
              </div>
              <Button 
                onClick={() => setOpen(false)}
                className="w-full h-14 rounded-2xl font-bold"
              >
                Back to Dashboard
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
