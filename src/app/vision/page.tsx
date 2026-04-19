
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Bug,
  ImageIcon,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

export default function VisionLandingPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-10 p-4 md:p-8 pb-24 text-slate-900">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
          <Sparkles className="w-3 h-3" />
          AI Vision Suite
        </div>
        <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight">Farm Sight Intelligence</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Advanced computer vision tools to analyze your farm's health and documentation in seconds.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Link href="/vision/disease">
          <Card className="border-none shadow-md hover:shadow-xl transition-all group bg-white cursor-pointer h-full">
            <CardHeader className="text-center pt-10 pb-6">
              <div className="mx-auto p-5 bg-red-50 rounded-2xl w-20 h-20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Bug className="w-10 h-10 text-red-500" />
              </div>
              <CardTitle className="text-2xl font-headline">Disease Identification</CardTitle>
              <CardDescription className="text-base px-4">
                Upload a crop photo to identify pests and diseases with 94% accuracy.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pb-10">
              <Button className="rounded-full px-8 h-12 font-bold group-hover:bg-primary group-hover:text-white transition-colors">
                Launch Diagnosis <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/vision/soil">
          <Card className="border-none shadow-md hover:shadow-xl transition-all group bg-white cursor-pointer h-full">
            <CardHeader className="text-center pt-10 pb-6">
              <div className="mx-auto p-5 bg-blue-50 rounded-2xl w-20 h-20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileText className="w-10 h-10 text-blue-600" />
              </div>
              <CardTitle className="text-2xl font-headline">Soil Report Scanner</CardTitle>
              <CardDescription className="text-base px-4">
                Digitize laboratory soil test results and extract critical pH and N-P-K metrics.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pb-10">
              <Button className="rounded-full px-8 h-12 font-bold group-hover:bg-primary group-hover:text-white transition-colors">
                Scan Report <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="p-10 bg-primary/5 rounded-[2.5rem] border border-primary/10 flex flex-col md:flex-row items-center gap-8">
        <div className="p-5 bg-white rounded-3xl shadow-sm border border-slate-100">
          <Sparkles className="w-12 h-12 text-primary" />
        </div>
        <div className="space-y-2 flex-1 text-center md:text-left">
          <h3 className="text-xl font-bold font-headline">Precision Agriculture</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Our vision models are trained on over 500,000 regional crop samples, ensuring localized accuracy for farms across India and the sub-continent.
          </p>
        </div>
      </div>
    </div>
  );
}
