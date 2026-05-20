'use client';

import { useState, useEffect } from 'react';
import { useFirestore, useUser, VoltaUser } from '@/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { 
  User, 
  Camera, 
  Save, 
  Loader2, 
  ShieldCheck, 
  Smartphone, 
  Mail, 
  Lock,
  ArrowLeft
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function StaffProfilePage() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    displayName: '',
    phoneNumber: '',
    photoURL: ''
  });

  useEffect(() => {
    const currentUser = user;
    if (!currentUser) return;
    const activeUser = currentUser as VoltaUser;
    async function load() {
      const snap = await getDoc(doc(db, 'users', activeUser.uid));
      if (snap.exists()) {
        const data = snap.data();
        setProfile({
          displayName: data.displayName || activeUser.displayName || '',
          phoneNumber: data.phoneNumber || '',
          photoURL: data.photoURL || activeUser.photoURL || ''
        });
      }
      setLoading(false);
    }
    load();
  }, [db, user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        ...profile,
        updatedAt: serverTimestamp()
      });
      toast({ title: "Registry Records Updated! ✨" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Action Failed" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary h-12 w-12" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <div className="flex items-center gap-6">
        <Link href="/admin">
          <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl bg-card border-border"><ArrowLeft size={20} /></Button>
        </Link>
        <div>
          <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter leading-none">Identity Terminal</h1>
          <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest mt-2">Manage your staff credentials and dispatch node</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <Card className="md:col-span-1 rounded-[2.5rem] border-border bg-card overflow-hidden shadow-2xl">
          <CardContent className="p-10 text-center space-y-6">
            <div className="relative inline-block group">
              <Avatar className="h-32 w-32 rounded-[2rem] border-4 border-primary/20 shadow-3xl ring-4 ring-primary/10 transition-transform group-hover:scale-105">
                <AvatarImage src={profile.photoURL} />
                <AvatarFallback className="bg-primary text-white text-4xl font-black">{profile.displayName?.charAt(0)}</AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 right-0 h-10 w-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-xl border-4 border-card">
                <Camera size={18} />
              </button>
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-foreground uppercase tracking-tight">{profile.displayName}</h3>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest italic">{user?.email}</p>
            </div>
            <Badge className="bg-emerald-500/10 text-emerald-500 border-none px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest w-full justify-center">
              <ShieldCheck size={12} className="mr-2" /> Authorized Staff
            </Badge>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 rounded-[3rem] border-border bg-card p-10 lg:p-12 shadow-3xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <Lock size={180} />
          </div>
          <form onSubmit={handleSave} className="space-y-8 relative z-10">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Staff Display Name</Label>
                  <Input value={profile.displayName} onChange={e => setProfile({...profile, displayName: e.target.value})} className="h-12 bg-muted border-none font-bold text-foreground" required />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Dispatch Phone</Label>
                  <Input value={profile.phoneNumber} onChange={e => setProfile({...profile, phoneNumber: e.target.value})} className="h-12 bg-muted border-none font-bold text-foreground" placeholder="+255..." />
                </div>
             </div>

             <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Registry Photo URL</Label>
                <Input value={profile.photoURL} onChange={e => setProfile({...profile, photoURL: e.target.value})} className="h-12 bg-muted border-none font-bold text-foreground" placeholder="https://..." />
             </div>

             <Button 
                type="submit" 
                disabled={saving}
                className="w-full h-16 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[11px] rounded-2xl shadow-xl transition-all active:scale-95 gap-3"
              >
                {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                {saving ? 'Synchronizing Registry...' : 'Commit Protocol Changes'}
              </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

function Badge({ children, className }: any) {
  return <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${className}`}>{children}</div>;
}