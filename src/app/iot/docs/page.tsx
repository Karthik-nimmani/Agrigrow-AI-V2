"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Cpu, 
  Code2, 
  Settings, 
  Zap, 
  Globe, 
  Terminal,
  ExternalLink,
  BookOpen,
  Waves
} from 'lucide-react';
import Link from 'next/link';

export default function IoTDocsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-10 p-4 md:p-8 pb-24 text-slate-900">
      <div className="flex items-center gap-4">
        <Link href="/iot">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold font-headline">Build Your Own Node</h1>
          <p className="text-muted-foreground">Technical guide for open-source agricultural hardware.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden border border-slate-100">
          <CardHeader className="p-8 pb-4">
            <div className="p-3 bg-primary/10 rounded-2xl w-fit mb-4">
              <Cpu className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Recommended Hardware</CardTitle>
            <CardDescription>Industrial-grade sensors for farm environments.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-0 space-y-4">
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span><strong>Microcontroller:</strong> ESP32-WROOM (Dual-core with built-in Wi-Fi/Bluetooth)</span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span><strong>Soil Moisture:</strong> Capacitive Soil Moisture Sensor v1.2 (Corrosion resistant)</span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span><strong>Power:</strong> TP4056 with 18650 Li-ion battery and 5V 1W Solar Panel</span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span><strong>Enclosure:</strong> IP67 Rated Waterproof Junction Box</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden border border-slate-100">
          <CardHeader className="p-8 pb-4">
            <div className="p-3 bg-accent/20 rounded-2xl w-fit mb-4">
              <Terminal className="w-6 h-6 text-accent-foreground" />
            </div>
            <CardTitle>Software Setup</CardTitle>
            <CardDescription>Tools needed for local development.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-0 space-y-4">
            <div className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-2xl border border-muted">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Required IDE</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Arduino IDE 2.0+</span>
                  <Link href="https://www.arduino.cc/en/software" target="_blank">
                    <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold">Download <ExternalLink className="w-3 h-3 ml-1" /></Button>
                  </Link>
                </div>
              </div>
              <div className="p-4 bg-muted/30 rounded-2xl border border-muted">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Essential Libraries</p>
                <ul className="text-xs space-y-1.5 opacity-80">
                  <li>• Firebase Arduino Client (by Mobizt)</li>
                  <li>• ArduinoJSON</li>
                  <li>• DHT sensor library (for humidity)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-2 px-2">
          <Code2 className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold font-headline">Integration Code</h2>
        </div>
        
        <Card className="border-none shadow-md bg-slate-900 text-slate-300 rounded-3xl overflow-hidden">
          <CardHeader className="p-6 border-b border-white/5 bg-slate-800/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold tracking-widest uppercase">AgriNode_Firmware.ino</span>
              <Button variant="ghost" size="sm" className="h-7 text-[10px] text-white hover:bg-white/10">Copy Code</Button>
            </div>
          </CardHeader>
          <CardContent className="p-8 font-mono text-[13px] leading-relaxed overflow-x-auto">
            <pre className="whitespace-pre">
{`#include <WiFi.h>
#include <Firebase_ESP_Client.h>

// 1. Define Network & API Credentials
#define WIFI_SSID "Your_Farm_WiFi"
#define WIFI_PASSWORD "Your_Password"
#define API_KEY "AIzaSy..."
#define USER_UID "user_12345"

void setup() {
  Serial.begin(115200);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  // 2. Initialize Firebase Connectivity
  Firebase.begin(API_KEY, USER_UID);
}

void loop() {
  // 3. Read Analog Sensor Data
  int moisture = analogRead(34);
  
  // 4. Transmit to AgriGrow Cloud
  String path = "/users/" + String(USER_UID) + "/telemetry";
  Firebase.RTDB.setInt(&fbdo, path + "/moisture", moisture);
  
  delay(600000); // Sync every 10 minutes
}`}
            </pre>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-2 px-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold font-headline">Community Resources</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ResourceLink 
            title="Arduino Forums" 
            desc="Global DIY community" 
            href="https://forum.arduino.cc" 
            icon={<Zap className="w-4 h-4" />}
          />
          <ResourceLink 
            title="ESP32 Guide" 
            desc="Pinout & Deep Sleep" 
            href="https://randomnerdtutorials.com" 
            icon={<Settings className="w-4 h-4" />}
          />
          <ResourceLink 
            title="Open Agriculture" 
            desc="Shared farm tech" 
            href="https://openag.media.mit.edu" 
            icon={<Globe className="w-4 h-4" />}
          />
        </div>
      </div>

      <div className="p-8 bg-primary/5 rounded-3xl border border-primary/10 text-center">
        <p className="text-sm text-muted-foreground italic leading-relaxed max-w-2xl mx-auto">
          "The goal of open hardware is to ensure that farmers own the data they produce. By building your own node, you ensure transparency and lower long-term costs for your operation."
        </p>
      </div>
    </div>
  );
}

function ResourceLink({ title, desc, href, icon }: { title: string, desc: string, href: string, icon: React.ReactNode }) {
  return (
    <Link href={href} target="_blank">
      <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:border-primary/40 hover:bg-primary/5 transition-all group h-full">
        <div className="flex items-center gap-2 mb-2 text-primary">
          {icon}
          <span className="font-bold text-sm text-slate-900">{title}</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
      </div>
    </Link>
  );
}
