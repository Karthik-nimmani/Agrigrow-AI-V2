"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  User, 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Globe, 
  LogOut, 
  Save, 
  Loader2,
  Info,
  Smartphone,
  Mail
} from 'lucide-react';
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking, useCollection } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { aiWeatherBasedCropAdvice } from '@/ai/flows/ai-weather-based-crop-advice';

export default function SettingsPage() {
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    phone: '',
    preferredLanguage: 'English',
    units: 'Acres',
    notifications: true,
    weatherAlerts: true
  });

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userData, isLoading: isDataLoading } = useDoc(userDocRef);

  // Fetch fields to generate initial risk report if alerts are turned on
  const fieldsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'farmFields');
  }, [firestore, user]);

  const { data: fields } = useCollection(fieldsQuery);

  useEffect(() => {
    if (userData) {
      setFormData({
        displayName: userData.displayName || user?.displayName || '',
        email: userData.email || user?.email || '',
        phone: userData.phone || '',
        preferredLanguage: userData.preferredLanguage || 'English',
        units: userData.units || 'Acres',
        notifications: userData.notifications ?? true,
        weatherAlerts: userData.weatherAlerts ?? true
      });
    } else if (user) {
      setFormData(prev => ({
        ...prev,
        displayName: user.displayName || '',
        email: user.email || '',
        phone: user.phoneNumber || ''
      }));
    }
  }, [userData, user]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleSave = async () => {
    if (!user || !userDocRef) return;
    setIsSaving(true);
    
    try {
      updateDocumentNonBlocking(userDocRef, {
        ...formData,
        updatedAt: new Date().toISOString()
      });

      // Simulation: Send weather risk if newly enabled
      const alertsNewlyEnabled = (formData.weatherAlerts && !userData?.weatherAlerts) || (formData.notifications && !userData?.notifications);
      
      if (alertsNewlyEnabled && fields && fields.length > 0) {
        try {
          const res = await aiWeatherBasedCropAdvice({
            location: fields[0].locationDescription || "Punjab",
            cropType: fields[0].currentCropId || "Wheat",
            currentConditions: {
              temperature: 25,
              humidity: 60,
              soilMoisture: 45
            },
            weatherForecast: "Moderate humidity and clear skies expected over the next 48 hours."
          });

          toast({
            title: "Notification Service Active",
            description: `Initial weather risk report for ${fields[0].name} sent to ${formData.email}.`,
          });
        } catch (e) {
          console.error("Simulation error:", e);
        }
      }

      toast({
        title: "Settings Saved",
        description: "Your preferences have been updated successfully.",
      });
    } catch (err) {
      console.error(err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update settings.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isUserLoading || (user && isDataLoading)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline text-slate-900">Account Settings</h1>
          <p className="text-muted-foreground">Manage your profile and application preferences.</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isSaving} 
          className="rounded-xl px-6 gap-2 shadow-lg hover:scale-105 transition-transform"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-12 bg-muted/50 p-1 rounded-xl mb-8">
          <TabsTrigger value="profile" className="rounded-lg gap-2">
            <User className="w-4 h-4" /> <span className="hidden md:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="rounded-lg gap-2">
            <Globe className="w-4 h-4" /> <span className="hidden md:inline">Preferences</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-lg gap-2">
            <Bell className="w-4 h-4" /> <span className="hidden md:inline">Alerts</span>
          </TabsTrigger>
          <TabsTrigger value="account" className="rounded-lg gap-2 text-destructive">
            <Shield className="w-4 h-4" /> <span className="hidden md:inline">Account</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
            <CardHeader>
              <CardTitle>Public Profile</CardTitle>
              <CardDescription>This information is used to identify you in the system.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Display Name</Label>
                  <Input 
                    value={formData.displayName} 
                    onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                    placeholder="Your full name"
                    className="rounded-xl h-11 bg-muted/20 border-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      disabled
                      value={formData.email} 
                      className="rounded-xl h-11 pl-10 bg-muted/30 border-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      value={formData.phone} 
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="+91 0000000000"
                      className="rounded-xl h-11 pl-10 bg-muted/20 border-none"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
            <CardHeader>
              <CardTitle>Regional & Units</CardTitle>
              <CardDescription>Customize how data is presented to you.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Preferred Language</Label>
                  <Select 
                    value={formData.preferredLanguage} 
                    onValueChange={(val) => setFormData({...formData, preferredLanguage: val})}
                  >
                    <SelectTrigger className="h-11 rounded-xl bg-muted/20 border-none">
                      <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Hindi">हिन्दी (Hindi)</SelectItem>
                      <SelectItem value="Punjabi">ਪੰਜਾਬੀ (Punjabi)</SelectItem>
                      <SelectItem value="Tamil">தமிழ் (Tamil)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Area Unit</Label>
                  <Select 
                    value={formData.units} 
                    onValueChange={(val) => setFormData({...formData, units: val})}
                  >
                    <SelectTrigger className="h-11 rounded-xl bg-muted/20 border-none">
                      <SelectValue placeholder="Select Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Acres">Acres</SelectItem>
                      <SelectItem value="Hectares">Hectares</SelectItem>
                      <SelectItem value="Bigha">Bigha</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Control which alerts you receive via SMS or Email.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-6 rounded-2xl bg-muted/20 border-none">
                <div className="space-y-0.5">
                  <Label className="text-base font-bold">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive general app updates and farm news.</p>
                </div>
                <Switch 
                  checked={formData.notifications} 
                  onCheckedChange={(val) => setFormData({...formData, notifications: val})} 
                />
              </div>
              <div className="flex items-center justify-between p-6 rounded-2xl bg-muted/20 border-none">
                <div className="space-y-0.5">
                  <Label className="text-base font-bold">Weather & Risk Alerts</Label>
                  <p className="text-sm text-muted-foreground">Email warnings for frost, storms, or drought on your fields.</p>
                </div>
                <Switch 
                  checked={formData.weatherAlerts} 
                  onCheckedChange={(val) => setFormData({...formData, weatherAlerts: val})} 
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>Irreversible account actions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-6 rounded-2xl bg-destructive/5 border border-destructive/10 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-destructive">Sign Out</h4>
                  <p className="text-sm text-muted-foreground">Securely end your current session.</p>
                </div>
                <Button variant="destructive" onClick={handleSignOut} className="rounded-xl px-6 gap-2">
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
