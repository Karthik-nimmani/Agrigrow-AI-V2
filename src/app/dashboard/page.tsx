"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Sprout, 
  TrendingUp, 
  AlertTriangle, 
  Plus,
  MapPin,
  Bot
} from 'lucide-react';
import Link from 'next/link';

const FIELDS = [
  { id: 1, name: 'Maize Field', crop: 'Maize', location: 'Local Region', area: '2.5 Acres', ph: '6.2', status: 'Analysis Required' },
  { id: 2, name: 'Wheat Field', crop: 'Wheat', location: 'Local Region', area: '1.8 Acres', ph: '5.8', status: 'Analysis Required' },
  { id: 3, name: 'Sakhinetipalli', crop: 'Maize', location: 'Local Region', area: '2 Acres', ph: '6.5', status: 'Analysis Required' },
  { id: 4, name: 'EX', crop: 'Rice', location: 'Lovely Professional University', area: '2.3 Acres', ph: '5.4', status: 'Analysis Required' },
];

export default function Dashboard() {
  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold font-headline mb-2">Welcome back, Farmer!</h1>
        <p className="text-muted-foreground text-lg">Monitoring your farm's performance across 4 fields.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-primary text-white overflow-hidden">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-4 opacity-90">
              <Sprout className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Total Area</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold">8.6</span>
              <span className="text-xl font-medium opacity-80">Acres</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white overflow-hidden">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-4 text-primary">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Potential Yield</span>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-5xl font-bold text-slate-800">5,900</span>
              <span className="text-xl font-medium text-slate-500">kg</span>
            </div>
            <p className="text-sm font-bold text-green-600">+15.7% vs Last Season</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white overflow-hidden">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-4 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Alerts</span>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-5xl font-bold text-slate-800">4</span>
            </div>
            <p className="text-sm font-bold text-destructive">Needs AI Analysis</p>
          </CardContent>
        </Card>
      </div>

      {/* Fields Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold font-headline">Active Fields</h2>
          <Link href="/fields/new">
            <Button variant="outline" className="rounded-lg flex items-center gap-2 border-muted-foreground/20">
              <Plus className="w-4 h-4" /> Add New Field
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {FIELDS.map((field) => (
            <Link key={field.id} href={`/fields/${field.id}`}>
              <Card className="hover:shadow-md transition-all border-none bg-white overflow-hidden group cursor-pointer">
                <CardContent className="p-0 flex">
                  {/* Left Icon Panel */}
                  <div className="w-32 bg-muted/30 flex flex-col items-center justify-center gap-2 py-8 border-r">
                    <Sprout className="w-8 h-8 text-primary/60" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">{field.crop}</span>
                  </div>
                  
                  {/* Right Info Panel */}
                  <div className="flex-1 p-6 relative">
                    <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-red-400" />
                    <h3 className="text-xl font-bold font-headline mb-1 group-hover:text-primary transition-colors">{field.name}</h3>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-6">
                      <MapPin className="w-3 h-3" />
                      <span>{field.location}</span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm mb-6 text-muted-foreground">
                      <span className="font-bold text-slate-700">{field.area}</span>
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                      <span className="font-bold text-slate-700">pH {field.ph}</span>
                    </div>

                    <div className="flex items-center justify-between border-t pt-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-destructive">{field.status}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-4">
        <Button size="icon" className="w-12 h-12 rounded-full bg-white shadow-lg text-primary hover:bg-muted border border-muted">
          <Bot className="w-6 h-6" />
        </Button>
        <Button size="icon" className="w-16 h-16 rounded-full bg-primary shadow-xl text-white hover:bg-primary/90">
          <Plus className="w-8 h-8" />
        </Button>
      </div>
    </div>
  );
}
