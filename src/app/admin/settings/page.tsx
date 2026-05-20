'use client';

import { useState, useEffect } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { ShieldCheck, Receipt, Loader2, Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AnimatedSection } from '@/components/ui/AnimatedSection';

export default function ComplianceSettingsPage() {
  const db = useFirestore();
  const { user } = useUser();
  const [tin, setTin] = useState('');
  const [efdEmail, setEfdEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadComplianceData() {
      if (!user?.uid) return;
      try {
        const docRef = doc(db, 'companies', user.uid);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data.taxInfo) {
            setTin(data.taxInfo.tin || '');
            setEfdEmail(data.taxInfo.efdEmail || '');
          }
        }
      } catch (error) {
        console.error("Failed to load compliance data", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadComplianceData();
  }, [user, db]);

  const handleSave = async () => {
    if (!user?.uid) return;
    setIsSaving(true);
    try {
      const docRef = doc(db, 'companies', user.uid);
      await setDoc(docRef, {
        taxInfo: {
          tin: tin,
          efdEmail: efdEmail,
        },
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      toast({ title: "Compliance Synchronized! 🇹🇿", description: "TRA integration parameters updated." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Sync Failed", description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-20 text-center"><Loader2 className="animate-spin h-10 w-10 text-primary mx-auto" /></div>;

  return (
    <div className="space-y-12 pb-24 max-w-4xl">
      <AnimatedSection direction="down" delay={0.1}>
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter leading-none">Compliance Hub</h1>
          <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-[0.4em] italic">TRA & Revenue Authority Integration</p>
        </div>
      </AnimatedSection>

      <Card className="rounded-[2.5rem] border-border bg-card shadow-2xl overflow-hidden">
        <CardHeader className="bg-primary/5 border-b border-border p-10 flex flex-row items-center gap-6">
          <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl shrink-0">
            <Receipt size={32} />
          </div>
          <div>
            <CardTitle className="text-2xl font-black uppercase tracking-tight">TRA EFD Connectivity</CardTitle>
            <CardDescription className="text-xs font-black text-muted-foreground uppercase tracking-widest mt-2">
              Automated Electronic Fiscal Device (EFD) generation via N8n Webhooks.
            </CardDescription>
          </div>
          <Badge className="ml-auto bg-emerald-500/10 text-emerald-500 border-none font-black uppercase text-[10px] tracking-widest px-4 py-2">
            <ShieldCheck size={14} className="mr-2" /> Verified Node
          </Badge>
        </CardHeader>
        <CardContent className="p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-primary tracking-widest">Taxpayer Identification Number (TIN)</label>
              <Input 
                value={tin} 
                onChange={(e) => setTin(e.target.value)} 
                placeholder="e.g. 123-456-789" 
                className="h-14 rounded-2xl bg-muted border-none font-black tracking-[0.2em] text-foreground text-lg" 
              />
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-primary tracking-widest">EFD Registration Email</label>
              <Input 
                value={efdEmail} 
                onChange={(e) => setEfdEmail(e.target.value)} 
                placeholder="efd@voltarentals.co.tz" 
                className="h-14 rounded-2xl bg-muted border-none font-bold text-foreground" 
              />
            </div>
          </div>

          <div className="bg-muted/40 p-6 rounded-2xl border border-dashed border-border flex flex-col md:flex-row gap-6 items-center">
             <div className="text-[3rem] opacity-20">⚙️</div>
             <p className="text-xs font-medium italic text-muted-foreground leading-relaxed flex-1">
               "When a client completes a mobile money or card payment, the system will automatically utilize this TIN to request an official EFD receipt from the Tanzanian Revenue Authority, returning the PDF to the client via email."
             </p>
          </div>

          <Button 
            onClick={handleSave} 
            disabled={isSaving} 
            className="w-full md:w-auto h-16 px-12 rounded-[1.5rem] bg-primary text-white font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:shadow-2xl transition-all active:scale-95 gap-3"
          >
            {isSaving ? <Loader2 className="animate-spin h-5 w-5" /> : <Save size={18} />}
            Commit TRA Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}