"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Wifi, Smartphone, Plus } from 'lucide-react';

interface ConnectDeviceDialogProps {
  trigger?: React.ReactNode;
}

export function ConnectDeviceDialog({ trigger }: ConnectDeviceDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="rounded-xl h-12 px-6 flex items-center gap-2 shadow-lg bg-primary hover:bg-primary/90">
            <Plus className="w-5 h-5" /> Connect New Device
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
        <div className="p-8 space-y-8">
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle className="text-2xl font-bold font-headline text-slate-900">Connect Smart Device</DialogTitle>
            <DialogDescription className="text-base text-muted-foreground">
              Integrate IoT hardware via Wi-Fi or integration code.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <p className="text-sm font-medium text-slate-500">Choose your connection method:</p>
            
            <div className="grid gap-4">
              <button className="flex flex-col items-center justify-center gap-3 p-8 rounded-3xl border-2 border-slate-100 hover:border-primary/30 hover:bg-primary/5 transition-all group text-center">
                <div className="p-3 bg-primary/10 rounded-full group-hover:scale-110 transition-transform">
                  <Wifi className="w-6 h-6 text-primary" />
                </div>
                <span className="font-bold text-slate-800">Setup via Device Wi-Fi</span>
              </button>

              <button className="flex flex-col items-center justify-center gap-3 p-8 rounded-3xl border-2 border-slate-100 hover:border-primary/30 hover:bg-primary/5 transition-all group text-center">
                <div className="p-3 bg-primary/10 rounded-full group-hover:scale-110 transition-transform">
                  <Smartphone className="w-6 h-6 text-primary" />
                </div>
                <span className="font-bold text-slate-800">Enter Integration Code</span>
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
