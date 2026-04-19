"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Camera, 
  FileText, 
  Upload, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  ScanLine,
  Image as ImageIcon,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { aiDiseaseDetectionAndTreatmentPlan, type DiseaseDetectionOutput } from '@/ai/flows/ai-disease-detection-and-treatment-plan';
import Image from 'next/image';

export default function VisionPage() {
  const [activeTool, setActiveTool] = useState<'disease' | 'soil' | null>(null);
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

    // Simulate/Call AI Flow
    try {
      // In a real app, we'd pass the real dataUri
      // For this demo, we'll use a placeholder call
      const res = await aiDiseaseDetectionAndTreatmentPlan({
        photoDataUri: "data:image/jpeg;base64,..." 
      });
      
      // Artificial delay for UI "scanning" effect
      setTimeout(() => {
        setResult(res);
        setIsProcessing(false);
      }, 2000);
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold font-headline">AI Vision Suite</h1>
        <p className="text-muted-foreground">Advanced computer vision for Florafix detection and document scanning.</p>
      </div>

      {!activeTool ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card 
            className="border-none shadow-md hover:shadow-xl transition-all cursor-pointer group bg-white"
            onClick={() => setActiveTool('disease')}
          >
            <CardHeader className="text-center pt-10 pb-6">
              <div className="mx-auto p-4 bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ImageIcon className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-headline">Disease Detection</CardTitle>
              <CardDescription>Upload a crop photo to identify pests/diseases</CardDescription>
            </CardHeader>
            <CardContent className="text-center pb-10">
              <Button className="rounded-full px-8">Launch Florafix AI</Button>
            </CardContent>
          </Card>

          <Card 
            className="border-none shadow-md hover:shadow-xl transition-all cursor-pointer group bg-white"
            onClick={() => setActiveTool('soil')}
          >
            <CardHeader className="text-center pt-10 pb-6">
              <div className="mx-auto p-4 bg-accent/20 rounded-full w-16 h-16 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-8 h-8 text-accent-foreground" />
              </div>
              <CardTitle className="text-2xl font-headline">Soil Report Scanner</CardTitle>
              <CardDescription>Extract metrics from physical lab reports instantly</CardDescription>
            </CardHeader>
            <CardContent className="text-center pb-10">
              <Button className="rounded-full px-8">Scan Document</Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto space-y-6">
          <Button variant="ghost" onClick={() => { setActiveTool(null); setPreviewUrl(null); setResult(null); }} className="mb-2">
            <ChevronRight className="w-4 h-4 mr-2 rotate-180" /> Back to Suite
          </Button>

          <Card className="border-none shadow-lg bg-white overflow-hidden">
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                {activeTool === 'disease' ? <ImageIcon className="w-5 h-5 text-primary" /> : <FileText className="w-5 h-5 text-primary" />}
                {activeTool === 'disease' ? 'Florafix Disease Detection' : 'Report Extraction AI'}
              </CardTitle>
              <CardDescription>
                {activeTool === 'disease' ? 'Take or upload a clear photo of the affected plant area.' : 'Upload a clear photo or PDF of your laboratory soil test.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              {!previewUrl && (
                <div className="border-4 border-dashed rounded-3xl p-12 text-center flex flex-col items-center gap-6 hover:border-primary/40 hover:bg-muted/30 transition-all cursor-pointer relative">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleFileUpload}
                  />
                  <div className="p-5 bg-primary/10 rounded-full">
                    <Camera className="w-10 h-10 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">Upload or Snap Photo</h3>
                    <p className="text-muted-foreground text-sm">PNG, JPG, HEIC up to 10MB</p>
                  </div>
                  <Button className="rounded-full pointer-events-none">
                    <Upload className="w-4 h-4 mr-2" /> Select File
                  </Button>
                </div>
              )}

              {previewUrl && (
                <div className="space-y-6">
                  <div className="relative aspect-video rounded-2xl overflow-hidden border bg-black">
                     <Image 
                      src={previewUrl} 
                      alt="Preview" 
                      fill 
                      className="object-contain" 
                     />
                     {isProcessing && (
                       <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white z-10">
                          <div className="relative">
                            <div className="h-1 w-full bg-primary absolute top-1/2 -translate-y-1/2 animate-[bounce_2s_infinite]" />
                            <ScanLine className="w-16 h-16 text-primary animate-pulse" />
                          </div>
                          <p className="mt-4 font-bold tracking-widest text-lg font-headline">AI SCANNING...</p>
                          <p className="text-sm opacity-80">Analyzing patterns & symptoms</p>
                       </div>
                     )}
                  </div>

                  {result && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className={`p-4 rounded-xl flex items-start gap-4 mb-6 ${result.diseaseDetected ? 'bg-amber-50 border border-amber-200' : 'bg-green-50 border border-green-200'}`}>
                        {result.diseaseDetected ? <AlertCircle className="w-6 h-6 text-amber-600 mt-0.5" /> : <CheckCircle2 className="w-6 h-6 text-green-600 mt-0.5" />}
                        <div>
                          <h3 className={`text-xl font-bold font-headline ${result.diseaseDetected ? 'text-amber-900' : 'text-green-900'}`}>
                            {result.diseaseName}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">{result.description}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-bold font-headline flex items-center gap-2">
                          <ShieldCheck className="w-5 h-5 text-primary" />
                          3-Part Treatment Plan
                        </h4>
                        <div className="grid grid-cols-1 gap-3">
                          {result.treatmentPlan.map((step, i) => (
                            <div key={i} className="flex gap-4 p-4 bg-muted/40 rounded-xl border border-muted hover:border-primary/30 transition-colors">
                              <span className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-xs shrink-0 font-bold">{i+1}</span>
                              <p className="text-sm font-medium text-foreground/80">{step}</p>
                            </div>
                          ))}
                        </div>
                        <Button 
                          variant="outline" 
                          onClick={() => { setPreviewUrl(null); setResult(null); }} 
                          className="w-full mt-4 h-12 rounded-full"
                        >
                          Scan Another Photo
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
