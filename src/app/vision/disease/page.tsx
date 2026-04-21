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

    // Create preview and process AI
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      setPreviewUrl(base64String);

      try {
        const res = await aiDiseaseDetectionAndTreatmentPlan({
          photoDataUri: base64String
        });
        setResult(res);
      } catch (err: any) {
        console.error("AI Disease Detection Error:", err);
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 p-4 md:p-8 pb-24 text-slate-900">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold font-headline">Disease Identification</h1>
          <p className="text-muted-foreground">Expert AI diagnosis for regional crops.</p>
        </div>
      </div>

      <Card className="border-none shadow-xl bg-white overflow-hidden rounded-[2.5rem]">
        <CardHeader className="bg-red-50/50 border-b p-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-2xl">
              <Bug className="w-7 h-7 text-red-500" />
            </div>
            <div>
              <CardTitle className="text-2xl font-headline">Diagnose Crop Health</CardTitle>
              <CardDescription className="text-base">Upload a clear photo of the leaf or stem</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          {!previewUrl && (
            <div className="border-4 border-dashed border-slate-100 rounded-[2.5rem] p-16 text-center flex flex-col items-center gap-6 hover:border-primary/30 hover:bg-muted/30 transition-all cursor-pointer relative group">
              <input 
                type="file" 
                accept="image/*" 
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleFileUpload}
              />
              <div className="p-8 bg-primary/10 rounded-full group-hover:scale-110 transition-transform">
                <Camera className="w-14 h-14 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-800">Scan Crop Sample</h3>
                <p className="text-muted-foreground">Tap here to open camera or gallery</p>
              </div>
              <Button className="rounded-2xl px-12 h-16 text-xl font-bold shadow-xl shadow-primary/20 pointer-events-none">
                <Upload className="w-6 h-6 mr-3" /> Start Analysis
              </Button>
            </div>
          )}

          {previewUrl && (
            <div className="space-y-8">
              <div className="relative aspect-video rounded-3xl overflow-hidden border-8 border-slate-50 bg-black shadow-2xl">
                 <Image 
                  src={previewUrl} 
                  alt="Crop Preview" 
                  fill 
                  className="object-contain" 
                 />
                 {isProcessing && (
                   <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white z-10 backdrop-blur-md">
                      <div className="relative mb-6">
                        <ScanLine className="w-32 h-32 text-primary animate-pulse" />
                        <div className="h-1 w-full bg-primary absolute top-1/2 -translate-y-1/2 animate-[bounce_2s_infinite] shadow-[0_0_20px_#A36B27]" />
                      </div>
                      <p className="font-black tracking-[0.4em] text-2xl font-headline uppercase">Analyzing</p>
                      <p className="text-sm opacity-80 font-bold mt-2">Checking markers & symptoms...</p>
                   </div>
                 )}
              </div>

              {result && (
                <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-8">
                  <div className={`p-8 rounded-[2.5rem] flex items-start gap-6 ${result.diseaseDetected ? 'bg-amber-50 border-2 border-amber-200' : 'bg-green-50 border-2 border-green-200'}`}>
                    <div className={`p-4 rounded-2xl ${result.diseaseDetected ? 'bg-amber-100' : 'bg-green-100'}`}>
                      {result.diseaseDetected ? <AlertCircle className="w-10 h-10 text-amber-600" /> : <CheckCircle2 className="w-10 h-10 text-green-600" />}
                    </div>
                    <div>
                      <h3 className={`text-3xl font-black font-headline ${result.diseaseDetected ? 'text-amber-900' : 'text-green-900'}`}>
                        {result.diseaseName}
                      </h3>
                      <p className="text-lg text-slate-700 mt-2 leading-relaxed">{result.description}</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-3 px-2">
                      <ShieldCheck className="w-7 h-7 text-primary" />
                      <h4 className="text-2xl font-black font-headline">Treatment Protocol</h4>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {result.treatmentPlan.map((step, i) => (
                        <div key={i} className="flex gap-6 p-6 bg-white rounded-3xl border-2 border-slate-50 shadow-sm hover:border-primary/20 transition-all">
                          <span className="h-10 w-10 rounded-2xl bg-primary text-white flex items-center justify-center text-lg shrink-0 font-black shadow-lg">{i+1}</span>
                          <p className="text-lg font-bold text-slate-800 leading-relaxed">{step}</p>
                        </div>
                      ))}
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => { setPreviewUrl(null); setResult(null); }} 
                      className="w-full h-16 rounded-[1.5rem] border-2 text-xl font-bold hover:bg-slate-50 transition-colors"
                    >
                      Diagnose New Sample
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
