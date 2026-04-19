
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Camera, 
  Upload, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  ScanLine,
  Bug,
  ChevronLeft,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { aiDiseaseDetectionAndTreatmentPlan, type DiseaseDetectionOutput } from '@/ai/flows/ai-disease-detection-and-treatment-plan';
import Image from 'next/image';
import Link from 'next/link';

export default function DiseaseDetectionPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<DiseaseDetectionOutput | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setResult(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const res = await aiDiseaseDetectionAndTreatmentPlan({
        photoDataUri: "data:image/jpeg;base64,..." 
      });
      
      setTimeout(() => {
        setResult(res);
        setIsProcessing(false);
      }, 2500);
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 p-4 md:p-8 pb-24">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold font-headline">Disease Identification</h1>
          <p className="text-muted-foreground">AI-powered diagnosis and treatment planning.</p>
        </div>
      </div>

      <Card className="border-none shadow-xl bg-white overflow-hidden rounded-[2rem]">
        <CardHeader className="bg-red-50/50 border-b p-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-100 rounded-xl">
              <Bug className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <CardTitle className="text-xl">Diagnose Problems</CardTitle>
              <CardDescription>Upload a clear photo of the affected plant area</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          {!previewUrl && (
            <div className="border-4 border-dashed border-slate-100 rounded-[2rem] p-16 text-center flex flex-col items-center gap-6 hover:border-primary/30 hover:bg-muted/30 transition-all cursor-pointer relative group">
              <input 
                type="file" 
                accept="image/*" 
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleFileUpload}
              />
              <div className="p-6 bg-primary/10 rounded-full group-hover:scale-110 transition-transform">
                <Camera className="w-12 h-12 text-primary" />
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-bold text-slate-800">Scan Crop Sample</h3>
                <p className="text-muted-foreground">Tap here to open camera or upload photo</p>
              </div>
              <Button className="rounded-2xl px-10 h-14 text-lg font-bold shadow-lg shadow-primary/20 pointer-events-none">
                <Upload className="w-5 h-5 mr-2" /> Start Analysis
              </Button>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mt-4">
                <Sparkles className="w-3 h-3" /> Powered by Florafix AI
              </div>
            </div>
          )}

          {previewUrl && (
            <div className="space-y-8">
              <div className="relative aspect-video rounded-3xl overflow-hidden border-8 border-slate-50 bg-black shadow-inner">
                 <Image 
                  src={previewUrl} 
                  alt="Preview" 
                  fill 
                  className="object-contain" 
                 />
                 {isProcessing && (
                   <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white z-10 backdrop-blur-sm">
                      <div className="relative">
                        <div className="h-1.5 w-full bg-primary absolute top-1/2 -translate-y-1/2 animate-[bounce_2s_infinite] shadow-[0_0_15px_rgba(163,107,39,0.8)]" />
                        <ScanLine className="w-24 h-24 text-primary animate-pulse" />
                      </div>
                      <p className="mt-6 font-black tracking-[0.3em] text-xl font-headline uppercase">Analyzing Sample</p>
                      <p className="text-sm opacity-60 font-medium">Detecting patterns & disease markers...</p>
                   </div>
                 )}
              </div>

              {result && (
                <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-6">
                  <div className={`p-6 rounded-[2rem] flex items-start gap-5 ${result.diseaseDetected ? 'bg-amber-50 border border-amber-200' : 'bg-green-50 border border-green-200'}`}>
                    <div className={`p-3 rounded-2xl ${result.diseaseDetected ? 'bg-amber-100' : 'bg-green-100'}`}>
                      {result.diseaseDetected ? <AlertCircle className="w-8 h-8 text-amber-600" /> : <CheckCircle2 className="w-8 h-8 text-green-600" />}
                    </div>
                    <div>
                      <h3 className={`text-2xl font-bold font-headline ${result.diseaseDetected ? 'text-amber-900' : 'text-green-900'}`}>
                        {result.diseaseName}
                      </h3>
                      <p className="text-base text-muted-foreground mt-2 leading-relaxed">{result.description}</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-3 px-2">
                      <ShieldCheck className="w-6 h-6 text-primary" />
                      <h4 className="text-xl font-bold font-headline">Scientific Treatment Plan</h4>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {result.treatmentPlan.map((step, i) => (
                        <div key={i} className="flex gap-5 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:border-primary/30 transition-all">
                          <span className="h-8 w-8 rounded-xl bg-primary text-white flex items-center justify-center text-sm shrink-0 font-bold shadow-md">{i+1}</span>
                          <p className="text-base font-medium text-slate-800 leading-relaxed">{step}</p>
                        </div>
                      ))}
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => { setPreviewUrl(null); setResult(null); }} 
                      className="w-full h-14 rounded-2xl border-2 text-lg font-bold hover:bg-slate-50"
                    >
                      Diagnose Another Crop
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
