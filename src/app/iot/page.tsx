
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Cpu, 
  Plus, 
  Activity, 
  Droplets, 
  ThermometerSun, 
  Settings2, 
  CheckCircle2, 
  Zap,
  Signal,
  Wifi,
  ChevronRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function IoTHubPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-10 p-4 md:p-8 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold font-headline tracking-tight text-slate-900">IoT Hub</h1>
          <p className="text-muted-foreground text-lg mt-1">Manage your smart sensors and automated hardware.</p>
        </div>
        <Button className="rounded-xl h-12 px-6 flex items-center gap-2 shadow-lg bg-primary hover:bg-primary/90">
          <Plus className="w-5 h-5" /> Connect New Device
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Streams Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 px-2">
            <Activity className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold font-headline text-slate-800">Active Streams</h2>
          </div>
          <p className="text-sm text-muted-foreground px-2 -mt-4 mb-4">Live telemetry from your fields.</p>

          <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
            <CardContent className="p-8 space-y-4">
              {/* Sensor Card 1 */}
              <div className="flex items-center justify-between p-6 rounded-2xl bg-muted/20 border border-transparent hover:border-primary/20 transition-all group">
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-white rounded-2xl shadow-sm">
                    <Droplets className="w-6 h-6 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg text-slate-800">Soil Sensor Node A1</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-[10px] font-bold uppercase px-2 py-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse" />
                        online
                      </Badge>
                      <span className="text-[10px] text-muted-foreground font-bold uppercase flex items-center gap-1">
                        <Signal className="w-3 h-3" /> strong
                      </span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="text-muted-foreground group-hover:text-primary transition-colors">
                  <Settings2 className="w-5 h-5" />
                </Button>
              </div>

              {/* Sensor Card 2 */}
              <div className="flex items-center justify-between p-6 rounded-2xl bg-muted/20 border border-transparent hover:border-primary/20 transition-all group">
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-white rounded-2xl shadow-sm">
                    <ThermometerSun className="w-6 h-6 text-orange-500" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg text-slate-800">Weather Station Pro</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-[10px] font-bold uppercase px-2 py-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse" />
                        online
                      </Badge>
                      <span className="text-[10px] text-muted-foreground font-bold uppercase flex items-center gap-1">
                        <Wifi className="w-3 h-3" /> good
                      </span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="text-muted-foreground group-hover:text-primary transition-colors">
                  <Settings2 className="w-5 h-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Benefits Sidebar */}
        <div className="space-y-6">
          <Card className="border-none shadow-md bg-white rounded-3xl overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-2xl font-headline">IoT Benefits</CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-8">
              <div className="space-y-1">
                <div className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm font-bold text-slate-800">Real-time Moisture</p>
                </div>
                <p className="text-sm text-muted-foreground ml-8 leading-relaxed">
                  Automated irrigation based on ground-truth sensor data.
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm font-bold text-slate-800">Precise pH</p>
                </div>
                <p className="text-sm text-muted-foreground ml-8 leading-relaxed">
                  Eliminates manual testing errors with continuous soil chemistry monitoring.
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm font-bold text-slate-800">Frost Alerts</p>
                </div>
                <p className="text-sm text-muted-foreground ml-8 leading-relaxed">
                  Get instant phone notifications when temperature drops below critical levels.
                </p>
              </div>

              <div className="pt-6 border-t mt-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Integration Tip</h4>
                <p className="text-xs text-muted-foreground italic leading-relaxed">
                  Pair devices using the 2.4GHz Wi-Fi band for maximum range across large fields.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Developer Section */}
      <Card className="border-none shadow-sm bg-muted/30 rounded-3xl p-12 text-center border border-muted-foreground/5">
        <div className="flex flex-col items-center gap-6">
          <div className="p-5 bg-white rounded-2xl shadow-sm border border-slate-100">
            <Cpu className="w-10 h-10 text-primary" />
          </div>
          <div className="space-y-2 max-w-2xl">
            <h2 className="text-3xl font-bold font-headline text-slate-900">Build Your Own Node</h2>
            <p className="text-muted-foreground text-lg">
              AgriGrow AI is open-source compatible. Use ESP32 or Arduino nodes to feed custom sensor data into our predictive models.
            </p>
          </div>
          <Button variant="outline" className="rounded-xl h-12 px-8 font-bold border-primary text-primary hover:bg-primary/5">
            View Developer Docs <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
