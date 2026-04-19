
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Upload, 
  Loader2, 
  ChevronLeft,
  Sparkles,
  Camera,
  CheckCircle2,
  Table,
  Zap
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function SoilScannerPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<any | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);

    // Simulate AI extraction
    setTimeout(() => {
      setExtractedData({
        ph: 6.8,
        nitrogen: "Medium",
        phosphorus: "High",
        potassium: "Low",
        organicMatter: "3.2%"
      });
      setIsProcessing(false);
    }, 3000);
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
          <h1 className="text-3xl font-bold font-headline">Soil Report Scanner</h1>
          <p className="text-muted-foreground">Digital extraction of lab test results.</p>
        </div>
      </div>

      <Card className="border-none shadow-xl bg-white overflow-hidden rounded-[2rem]">
        <CardHeader className="bg-blue-50/50 border-b p-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 rounded-xl">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl">Analyze pH & Nutrients</CardTitle>
              <CardDescription>Digitize your physical soil health card instantly</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          {!previewUrl && (
            <div className="border-4 border-dashed border-slate-100 rounded-[2rem] p-16 text-center flex flex-col items-center gap-6 hover:border-blue-200 hover:bg-blue-50/20 transition-all cursor-pointer relative group">
              <input 
                type="file" 
                accept="image/*" 
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleFileUpload}
              />
              <div className="p-6 bg-blue-100 rounded-full group-hover:scale-110 transition-transform">
                <Camera className="w-12 h-12 text-blue-600" />
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-bold text-slate-800">Scan Report Card</h3>
                <p className="text-muted-foreground">Upload photo of your lab report</p>
              </div>
              <Button className="rounded-2xl px-10 h-14 text-lg font-bold shadow-lg shadow-blue-200 bg-blue-600 hover:bg-blue-700 pointer-events-none">
                <Zap className="w-5 h-5 mr-2" /> Start AI Extraction
              </Button>
            </div>
          )}

          {previewUrl && (
            <div className="space-y-8">
              <div className="relative aspect-video rounded-3xl overflow-hidden border-8 border-slate-50 bg-white shadow-inner">
                 <Image src={previewUrl} alt="Report" fill className="object-contain" />
                 {isProcessing && (
                   <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center text-blue-900 z-10 backdrop-blur-md">
                      <Loader2 className="w-16 h-16 animate-spin mb-6 text-blue-600" />
                      <p className="font-black tracking-[0.3em] text-xl font-headline uppercase">Extracting Data</p>
                      <p className="text-sm opacity-60 font-medium">Reading N-P-K & pH metrics...</p>
                   </div>
                 )}
              </div>

              {extractedData && (
                <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-6">
                  <div className="p-6 bg-green-50 rounded-[2rem] border border-green-100 flex items-center gap-4">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                    <h3 className="text-xl font-bold text-green-900">Extraction Complete</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <MetricCard label="Soil pH" value={extractedData.ph} />
                    <MetricCard label="Nitrogen (N)" value={extractedData.nitrogen} />
                    <MetricCard label="Phosphorus (P)" value={extractedData.phosphorus} />
                    <MetricCard label="Potassium (K)" value={extractedData.potassium} />
                  </div>

                  <Button 
                    className="w-full h-14 rounded-2xl text-lg font-bold bg-primary"
                    onClick={() => toast({ title: "Saved to Field", description: "Metrics updated in field records." })}
                  >
                    Save to Field Records
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ label, value }: { label: string, value: any }) {
  return (
    <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-between">
      <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">{label}</span>
      <span className="text-xl font-black text-slate-900">{value}</span>
    </div>
  );
}
