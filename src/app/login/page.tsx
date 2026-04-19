"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sprout, Phone, Mail, Loader2 } from 'lucide-react';
import { useAuth, useUser, initiateAnonymousSignIn } from '@/firebase';

export default function LoginPage() {
  const [step, setStep] = useState<'method' | 'phone' | 'otp'>('method');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const auth = useAuth();
  const { user } = useUser();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // For prototype, we'll use anonymous sign-in even for the phone flow to get a real session
    initiateAnonymousSignIn(auth);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    initiateAnonymousSignIn(auth);
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    initiateAnonymousSignIn(auth);
  };

  const handleQuickLogin = () => {
    setIsLoading(true);
    initiateAnonymousSignIn(auth);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md border-none shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Sprout className="w-10 h-10 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold font-headline">Welcome to AgriGrow AI</CardTitle>
          <CardDescription>Secure login for your farm management</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {step === 'method' && (
            <div className="space-y-4">
              <Button 
                onClick={handleQuickLogin}
                disabled={isLoading}
                className="w-full h-12 text-lg rounded-lg flex items-center gap-3"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : <Sprout className="w-5 h-5" />}
                Quick Login (Prototype)
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-muted-foreground">Or Use Standard Methods</span></div>
              </div>

              <Button 
                variant="outline"
                onClick={() => setStep('phone')} 
                className="w-full h-12 text-lg rounded-lg flex items-center gap-3 border-muted-foreground/20"
              >
                <Phone className="w-5 h-5" />
                Login with Phone Number
              </Button>

              <Button 
                variant="outline" 
                onClick={handleGoogleLogin}
                className="w-full h-12 text-lg rounded-lg flex items-center gap-3 border-muted-foreground/20"
              >
                <Mail className="w-5 h-5" />
                Sign in with Google
              </Button>
            </div>
          )}

          {step === 'phone' && (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Enter your Phone Number</label>
                <div className="flex">
                  <span className="flex items-center px-3 border border-r-0 rounded-l-md bg-muted text-muted-foreground">+91</span>
                  <Input 
                    required 
                    type="tel" 
                    placeholder="9998887776" 
                    className="rounded-l-none" 
                    autoFocus
                  />
                </div>
              </div>
              <Button disabled={isLoading} className="w-full h-12 text-lg">
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : null}
                Send OTP
              </Button>
              <Button variant="ghost" onClick={() => setStep('method')} className="w-full">
                Back to Methods
              </Button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Enter the 6-digit OTP</label>
                <Input 
                  required 
                  type="text" 
                  maxLength={6} 
                  placeholder="123456" 
                  className="text-center text-2xl tracking-[0.5em] font-mono h-14"
                  autoFocus
                />
              </div>
              <Button disabled={isLoading} className="w-full h-12 text-lg">
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : null}
                Verify & Login
              </Button>
              <div className="text-center">
                <button type="button" className="text-sm text-primary font-medium hover:underline">
                  Resend OTP in 30s
                </button>
              </div>
              <Button variant="ghost" onClick={() => setStep('phone')} className="w-full">
                Back to Phone Number
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
