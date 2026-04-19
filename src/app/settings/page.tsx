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
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const router = useRouter();
  const { auth } = useAuth();
  const { user, isUserLoading } = useUser();
  const { firestore } = useFirestore();
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
      toast({
        title: "Settings Saved",
        description: "Your preferences have been updated successfully.",
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isUserLoading || isDataLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Account Settings</h1>
          <p className="text-muted-foreground">Manage your profile and application preferences.</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="rounded-xl px-6 gap-2">
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
          <Card className="border-none shadow-sm">
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
                    className="rounded-xl h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      disabled
                      value={formData.email} 
                      className="rounded-xl h-11 pl-10 bg-muted/30"
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
                      className="rounded-xl h-11 pl-10"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card className="border-none shadow-sm">
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
                    <SelectTrigger className="h-11 rounded-xl">
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
                    <SelectTrigger className="h-11 rounded-xl">
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
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Control which alerts you receive via SMS or App.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl border">
                <div className="space-y-0.5">
                  <Label className="text-base">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive general app updates and news.</p>
                </div>
                <Switch 
                  checked={formData.notifications} 
                  onCheckedChange={(val) => setFormData({...formData, notifications: val})} 
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border">
                <div className="space-y-0.5">
                  <Label className="text-base">Weather & Risk Alerts</Label>
                  <p className="text-sm text-muted-foreground">Get immediate warnings for frost, storms, or drought.</p>
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
          <Card className="border-none shadow-sm border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>Irreversible account actions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/10 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-destructive">Sign Out</h4>
                  <p className="text-sm text-muted-foreground">Securely end your current session.</p>
                </div>
                <Button variant="destructive" onClick={handleSignOut} className="rounded-xl px-6 gap-2">
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </div>
              <div className="p-4 rounded-xl bg-muted/30 border flex items-center justify-between">
                <div>
                  <h4 className="font-bold">Delete Account</h4>
                  <p className="text-sm text-muted-foreground">Wipe all farm data and field records permanently.</p>
                </div>
                <Button variant="outline" className="rounded-xl px-6 text-destructive border-destructive/20 hover:bg-destructive/5">
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Info className="w-4 h-4 text-muted-foreground" />
                App Information
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              <p>Version: 1.0.4-stable (Beta)</p>
              <p>Device ID: {user?.uid.substring(0, 12)}...</p>
              <div className="flex gap-4 pt-2">
                <button className="underline hover:text-primary">Privacy Policy</button>
                <button className="underline hover:text-primary">Terms of Service</button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
