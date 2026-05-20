'use client';

import { useState, useEffect } from 'react';
import { useFirestore, useDoc } from "@/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  Save, 
  Loader2,
  ArrowLeft,
  Info
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Link from 'next/link';

export default function PaymentSettingsPage() {
  const db = useFirestore();
  const settingsRef = doc(db, "settings", "paymentInfo");
  const { data: currentInfo, loading } = useDoc(settingsRef);
  
  const [formData, setFormData] = useState({
    mpesaNumber: "", mpesaName: "",
    tigopesaNumber: "", tigopesaName: "",
    airtelNumber: "", airtelName: "",
    bankName: "", bankAccount: "",
    bankBranch: "", swiftCode: "",
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentInfo) {
      setFormData({
        mpesaNumber: currentInfo.mpesaNumber ?? "",
        mpesaName: currentInfo.mpesaName ?? "",
        tigopesaNumber: currentInfo.tigopesaNumber ?? "",
        tigopesaName: currentInfo.tigopesaName ?? "",
        airtelNumber: currentInfo.airtelNumber ?? "",
        airtelName: currentInfo.airtelName ?? "",
        bankName: currentInfo.bankName ?? "",
        bankAccount: currentInfo.bankAccount ?? "",
        bankBranch: currentInfo.bankBranch ?? "",
        swiftCode: currentInfo.swiftCode ?? "",
      });
    }
  }, [currentInfo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await setDoc(settingsRef, { ...formData, updatedAt: serverTimestamp() }, { merge: true });
      toast({ title: "Settings Synchronized" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Save Failed" });
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-6">
        <Link href="/admin/settings">
          <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-border bg-card text-foreground"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <div>
          <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter leading-none">Finance Settings</h1>
          <p className="text-muted-foreground mt-1 uppercase text-[10px] font-black tracking-widest">Configure settlement account details for client display</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* M-Pesa */}
          <Card className="rounded-[2.5rem] border-border bg-card overflow-hidden shadow-sm">
            <CardHeader className="bg-emerald-500/10 border-b border-emerald-500/20 p-8 flex flex-row items-center gap-5">
              <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/20"><Smartphone size={24} /></div>
              <div>
                <CardTitle className="text-xl font-black uppercase text-foreground tracking-tight">Vodacom M-Pesa</CardTitle>
                <CardDescription className="text-emerald-700 dark:text-emerald-500/60 text-[9px] font-bold uppercase tracking-widest">Mobile Money Settlement</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Merchant Number (+255)</Label>
                <Input value={formData.mpesaNumber ?? ""} onChange={(e) => updateField("mpesaNumber", e.target.value)} placeholder="+255 7XX XXX XXX" className="h-14 rounded-2xl bg-muted border-none font-bold text-foreground" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Account Holder Name</Label>
                <Input value={formData.mpesaName ?? ""} onChange={(e) => updateField("mpesaName", e.target.value)} placeholder="VoltaRentals Ltd" className="h-14 rounded-2xl bg-muted border-none font-bold text-foreground" />
              </div>
            </CardContent>
          </Card>

          {/* Bank Transfer */}
          <Card className="rounded-[3rem] border-border bg-card overflow-hidden shadow-sm md:col-span-2">
            <CardHeader className="bg-muted border-b border-border p-10 flex flex-row items-center gap-6">
              <div className="p-4 bg-primary/10 text-primary rounded-2xl border border-primary/20"><Building2 size={32} /></div>
              <div>
                <CardTitle className="text-2xl font-black uppercase text-foreground tracking-tight">Bank Transfer Infrastructure</CardTitle>
                <CardDescription className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mt-1">Traditional Tier-1 Settlement Details</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Financial Institution</Label><Input value={formData.bankName ?? ""} onChange={(e) => updateField("bankName", e.target.value)} placeholder="e.g. CRDB Bank" className="h-14 rounded-2xl bg-muted border-none font-bold text-foreground" /></div>
                <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Account Protocol Number</Label><Input value={formData.bankAccount ?? ""} onChange={(e) => updateField("bankAccount", e.target.value)} placeholder="XXXXXXXXXXXX" className="h-14 rounded-2xl bg-muted border-none font-bold text-foreground" /></div>
                <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Branch Hub</Label><Input value={formData.bankBranch ?? ""} onChange={(e) => updateField("bankBranch", e.target.value)} placeholder="e.g. Dar es Salaam Main" className="h-14 rounded-2xl bg-muted border-none font-bold text-foreground" /></div>
                <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">SWIFT / BIC Protocol</Label><Input value={formData.swiftCode ?? ""} onChange={(e) => updateField("swiftCode", e.target.value)} placeholder="e.g. CORUTZTZ" className="h-14 rounded-2xl bg-muted border-none font-bold text-foreground" /></div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between p-10 bg-primary/5 rounded-[2.5rem] border border-primary/10 gap-8">
          <div className="flex gap-4 text-xs text-muted-foreground font-medium max-w-md italic">
            <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            "Deployment check: These parameters are displayed site-wide on the customer settlement portal for verified 2026 rentals."
          </div>
          <Button 
            type="submit" 
            className="h-20 px-16 rounded-3xl bg-primary text-white font-black uppercase text-lg tracking-tighter shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all gap-3"
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="animate-spin h-6 w-6" /> : <Save size={24} />}
            Commit Finance Protocols
          </Button>
        </div>
      </form>
    </div>
  );
}
