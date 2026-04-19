
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sprout, Phone, Loader2, LogIn, Mail, ArrowLeft, UserPlus } from 'lucide-react';
import { useAuth, useUser, useFirestore, initiateAnonymousSignIn, initiateGoogleSignIn, initiateEmailSignIn, initiateEmailSignUp, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [step, setStep] = useState<'method' | 'phone' | 'otp' | 'email-login' | 'email-signup'>('method');
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  useEffect(() => {
    if (user && !isUserLoading && firestore) {
      const userRef = doc(firestore, 'users', user.uid);
      
      const profileData: any = {
        id: user.uid,
        displayName: user.displayName || displayName || 'Farmer',
        email: user.email || email || '',
        preferredLanguage: 'English',
        updatedAt: new Date().toISOString()
      };

      const sessionPhone = sessionStorage.getItem('pending_phone');
      if (sessionPhone) {
        profileData.phone = sessionPhone;
        sessionStorage.removeItem('pending_phone');
      } else if (phoneNumber) {
        profileData.phone = phoneNumber;
      }

      setDocumentNonBlocking(userRef, profileData, { merge: true });
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router, firestore, displayName, email, phoneNumber]);

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;
    setIsLoading(true);
    sessionStorage.setItem('pending_phone', phoneNumber);
    setStep('otp');
    setIsLoading(false);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    initiateAnonymousSignIn(auth);
  };

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    initiateEmailSignIn(auth, email, password);
  };

  const handleEmailSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !displayName) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all fields to create an account."
      });
      return;
    }
    setIsLoading(true);
    initiateEmailSignUp(auth, email, password);
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    initiateGoogleSignIn(auth);
  };

  const handleQuickLogin = () => {
    setIsLoading(true);
    initiateAnonymousSignIn(auth);
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md border-none shadow-2xl overflow-hidden bg-white">
        <CardHeader className="text-center pb-2 bg-primary/5 p-8 border-b">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary/10 rounded-3xl">
              <Sprout className="w-12 h-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold font-headline text-slate-900">AgriGrow AI</CardTitle>
          <CardDescription className="text-lg">Sustainable farming through precision AI</CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          {step === 'method' && (
            <div className="space-y-4">
              <Button 
                onClick={() => setStep('email-login')}
                className="w-full h-14 text-lg rounded-2xl flex items-center gap-3 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform font-bold"
              >
                <Mail className="w-5 h-5" />
                Email & Password
              </Button>

              <Button 
                variant="outline"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full h-14 text-lg rounded-2xl flex items-center gap-3 border-slate-200 hover:bg-slate-50 transition-all font-bold"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                )}
                Continue with Google
              </Button>

              <Button 
                variant="outline"
                onClick={() => setStep('phone')} 
                disabled={isLoading}
                className="w-full h-14 text-lg rounded-2xl flex items-center gap-3 border-slate-200 hover:bg-slate-50 transition-all font-bold"
              >
                <Phone className="w-5 h-5 text-slate-600" />
                Phone Number
              </Button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-100" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                  <span className="bg-white px-4 text-slate-400">OR</span>
                </div>
              </div>

              <Button 
                variant="ghost"
                onClick={handleQuickLogin}
                disabled={isLoading}
                className="w-full h-12 rounded-xl text-slate-500 hover:text-primary font-medium"
              >
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : <LogIn className="w-4 h-4 mr-2" />}
                Guest Access
              </Button>
            </div>
          )}

          {step === 'email-login' && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Email Address</label>
                <Input 
                  required 
                  type="email" 
                  placeholder="name@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-14 rounded-2xl border-slate-200 focus-visible:ring-primary" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Password</label>
                <Input 
                  required 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-14 rounded-2xl border-slate-200 focus-visible:ring-primary" 
                />
              </div>
              <Button disabled={isLoading} className="w-full h-14 text-lg rounded-2xl font-bold shadow-lg">
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : <LogIn className="w-5 h-5 mr-2" />}
                Log In
              </Button>
              <div className="flex flex-col gap-2 pt-2">
                <Button variant="link" onClick={() => setStep('email-signup')} className="text-primary font-bold">
                  New here? Create an account
                </Button>
                <Button variant="ghost" onClick={() => setStep('method')} className="text-slate-500">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Methods
                </Button>
              </div>
            </form>
          )}

          {step === 'email-signup' && (
            <form onSubmit={handleEmailSignUp} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Full Name</label>
                <Input 
                  required 
                  type="text" 
                  placeholder="John Doe" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="h-14 rounded-2xl border-slate-200 focus-visible:ring-primary" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Email Address</label>
                <Input 
                  required 
                  type="email" 
                  placeholder="name@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-14 rounded-2xl border-slate-200 focus-visible:ring-primary" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Password</label>
                <Input 
                  required 
                  type="password" 
                  placeholder="Create a password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-14 rounded-2xl border-slate-200 focus-visible:ring-primary" 
                />
              </div>
              <Button disabled={isLoading} className="w-full h-14 text-lg rounded-2xl font-bold shadow-lg bg-primary">
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : <UserPlus className="w-5 h-5 mr-2" />}
                Create Account
              </Button>
              <div className="flex flex-col gap-2 pt-2">
                <Button variant="link" onClick={() => setStep('email-login')} className="text-primary font-bold">
                  Already have an account? Log in
                </Button>
                <Button variant="ghost" onClick={() => setStep('method')} className="text-slate-500">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Methods
                </Button>
              </div>
            </form>
          )}

          {step === 'phone' && (
            <form onSubmit={handlePhoneSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Phone Number</label>
                <div className="flex">
                  <span className="flex items-center px-4 border border-r-0 rounded-l-2xl bg-slate-50 text-slate-500 font-bold">+91</span>
                  <Input 
                    required 
                    type="tel" 
                    placeholder="9998887776" 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="h-14 rounded-l-none rounded-r-2xl border-slate-200 text-lg focus-visible:ring-primary" 
                    autoFocus
                  />
                </div>
              </div>
              <Button disabled={isLoading} className="w-full h-14 text-lg rounded-2xl font-bold shadow-lg">
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : null}
                Send OTP
              </Button>
              <Button variant="ghost" onClick={() => setStep('method')} className="w-full text-slate-500 hover:text-primary">
                Back to Methods
              </Button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Enter 6-Digit OTP</label>
                <Input 
                  required 
                  type="text" 
                  maxLength={6}
                  placeholder="123456" 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="h-14 rounded-2xl border-slate-200 text-center text-2xl tracking-[1em] focus-visible:ring-primary" 
                  autoFocus
                />
              </div>
              <Button disabled={isLoading} className="w-full h-14 text-lg rounded-2xl font-bold shadow-lg">
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : null}
                Verify & Login
              </Button>
              <Button variant="ghost" onClick={() => setStep('phone')} className="w-full text-slate-500 hover:text-primary">
                Change Number
              </Button>
            </form>
          )}

          <p className="text-center text-[10px] text-slate-400 font-medium px-4">
            By signing in, you agree to our Terms of Service and Privacy Policy. Your data is encrypted and stored securely.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
