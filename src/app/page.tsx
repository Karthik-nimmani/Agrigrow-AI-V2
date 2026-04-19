import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sprout, ShieldCheck, BarChart3, CloudSun, ScanLine, MessageSquare } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 px-4 md:py-32 lg:py-48 overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
             <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full filter blur-3xl -translate-y-1/2 translate-x-1/2" />
             <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent rounded-full filter blur-3xl translate-y-1/2 -translate-x-1/2" />
          </div>
          <div className="container mx-auto text-center relative z-10">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 font-headline text-foreground">
              Cultivate Smarter with <span className="text-primary">AgriGrow AI</span>
            </h1>
            <p className="max-w-[700px] mx-auto text-lg text-muted-foreground mb-8 md:text-xl">
              Precision farming tools for every field. Use AI vision to detect diseases, get real-time weather advice, and forecast your harvest with confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button size="lg" className="px-8 text-lg rounded-full">
                  Get Started Free
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="px-8 text-lg rounded-full">
                  Explore Features
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4 font-headline">Built for the Modern Farmer</h2>
              <p className="text-muted-foreground">Every tool you need to maximize yield and minimize waste.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<BarChart3 className="w-8 h-8 text-primary" />}
                title="Yield Forecasts"
                description="Predict upcoming harvests based on historical data and current soil conditions."
              />
              <FeatureCard 
                icon={<ScanLine className="w-8 h-8 text-primary" />}
                title="AI Vision Suite"
                description="Detect pests and diseases instantly from photos. Scan soil reports for quick insights."
              />
              <FeatureCard 
                icon={<CloudSun className="w-8 h-8 text-primary" />}
                title="Meteorological Intelligence"
                description="Real-time alerts for frost, irrigation timing, and storm risks at your exact location."
              />
              <FeatureCard 
                icon={<MessageSquare className="text-primary h-8 w-8" />}
                title="AI Farm Assistant"
                description="Ask 'Agri-Bot' any farming question in multiple languages for immediate advice."
              />
              <FeatureCard 
                icon={<ShieldCheck className="w-8 h-8 text-primary" />}
                title="Offline-First"
                description="Work in the field without internet. Data syncs automatically when you're back online."
              />
              <FeatureCard 
                icon={<Sprout className="w-8 h-8 text-primary" />}
                title="Field Management"
                description="Complete tracking of crops, soil pH, and area across all your fields."
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 px-4 bg-white/50">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Sprout className="h-5 w-5 text-primary" />
            <span className="font-bold text-primary">AgriGrow AI</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2024 AgriGrow AI. Empowering rural innovation.</p>
          <div className="flex gap-6">
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary">Terms</Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-white">
      <CardContent className="pt-6">
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl font-bold mb-2 font-headline">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
