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
  MapPin, 
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const CITIES = [
  "Dar es Salaam", "Arusha", "Mwanza", "Dodoma",
  "Mbeya", "Morogoro", "Tanga", "Zanzibar", "Iringa"
];

export default function ProfilePage() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<any>({
    firstName: '',
    lastName: '',
    phone: '',
    dob: '',
    city: 'Dar es Salaam'
  });
  const [docs, setDocs] = useState({
    idFront: { status: 'none', url: '' },
    idBack: { status: 'none', url: '' },
    license: { status: 'none', url: '' }
  });

  useEffect(() => {
    const currentUser = user;
    if (!currentUser) return;
    const activeUser = currentUser as VoltaUser;
    async function loadProfile() {
      const snap = await getDoc(doc(db, 'users', activeUser.uid));
      if (snap.exists()) {
        const data = snap.data();
        setProfile({
          firstName: data.firstName || activeUser.displayName?.split(' ')[0] || '',
          lastName: data.lastName || activeUser.displayName?.split(' ').slice(1).join(' ') || '',
          phone: data.phoneNumber?.replace('+255', '') || '',
          dob: data.dob || '',
          city: data.city || 'Dar es Salaam'
        });
        setDocs(data.identityDocs || {
          idFront: { status: 'none', url: '' },
          idBack: { status: 'none', url: '' },
          license: { status: 'none', url: '' }
        });
      }
      setLoading(false);
    }
    loadProfile();
  }, [db, user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        firstName: profile.firstName,
        lastName: profile.lastName,
        displayName: `${profile.firstName} ${profile.lastName}`,
        phoneNumber: '+255' + profile.phone,
        dob: profile.dob,
        city: profile.city,
        updatedAt: serverTimestamp()
      });
      toast({ title: 'Identity Records Updated! ✨' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Update failed' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDocUpload = (type: string) => {
    // In production this would trigger Cloudinary/Firebase Storage upload
    toast({ title: 'Registry Sync', description: 'Document upload terminal initialized.' });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary h-12 w-12" /></div>;

  const DocCard = ({ title, docKey }: any) => {
    const d = (docs as any)[docKey];
    return (
      <div className="space-y-3">
        <Label className="text-[10px] font-black uppercase tracking-widest text-[hsl(213,25%,72%)]">{title}</Label>
        <div 
          onClick={() => handleDocUpload(docKey)}
          className={cn(
            "h-40 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 cursor-pointer transition-all hover:bg-white/5",
            d.status === 'verified' ? "bg-emerald-500/5 border-emerald-500/20" : "bg-[hsl(220,38%,14%)] border-[hsl(220,35%,18%)]"
          )}
        >
          {d.status === 'verified' ? (
            <div className="text-center">
              <CheckCircle2 className="text-emerald-500 mx-auto mb-2" size={32} />
              <p className="text-xs font-black text-emerald-500 uppercase tracking-widest">Verified Protocol</p>
            </div>
          ) : (
            <div className="text-center">
              <Upload className="text-[hsl(213,25%,45%)] mx-auto mb-2" size={24} />
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Append Document</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-12 pb-20">
      <div>
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Identity Profile</h1>
        <p className="text-[hsl(213,25%,65%)] mt-2 font-medium">Maintain your elite traveler credentials and registry ID</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        <div className="w-full lg:w-80 space-y-8">
           <Card className="bg-[hsl(220,43%,11%)] border-[hsl(220,35%,18%)] rounded-[3rem] overflow-hidden shadow-2xl">
            <CardContent className="p-10 text-center space-y-6">
              <div className="relative inline-block group">
                <Avatar className="h-32 w-32 rounded-[2.5rem] border-4 border-white/5 shadow-2xl ring-4 ring-primary/20">
                  <AvatarImage src={user?.photoURL || ''} />
                  <AvatarFallback className="bg-primary text-white text-4xl font-black">{profile.firstName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <button className="absolute bottom-0 right-0 h-10 w-10 bg-primary text-white rounded-2xl flex items-center justify-center shadow-xl border-4 border-[hsl(220,43%,11%)] opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={18} />
                </button>
              </div>
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight leading-none">{profile.firstName} {profile.lastName}</h3>
                <p className="text-[10px] text-[hsl(213,25%,45%)] font-black uppercase tracking-[0.3em] mt-3">{user?.email}</p>
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-500 border-none px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] w-full justify-center">
                <ShieldCheck size={12} className="mr-2" /> Elite Rank Secured
              </Badge>
            </CardContent>
           </Card>

           <div className="p-8 bg-primary/10 border border-primary/20 rounded-[2.5rem] space-y-4">
              <h4 className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                <AlertCircle size={14} /> Security Disclosure
              </h4>
              <p className="text-blue-100/60 text-[10px] font-medium leading-relaxed italic">
                "Your identity documents are stored in encrypted Tanzanian cloud nodes and are purely for reservation verification purposes."
              </p>
           </div>
        </div>

        <div className="flex-1 space-y-10">
          <Card className="bg-[hsl(220,43%,11%)] border-[hsl(220,35%,18%)] rounded-[3rem] p-10 lg:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <User size={200} className="text-white" />
            </div>
            <form onSubmit={handleSave} className="space-y-10 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-[hsl(213,25%,72%)]">First Given Name</Label>
                  <Input value={profile.firstName} onChange={e => setProfile({...profile, firstName: e.target.value})} className="bg-[hsl(220,38%,14%)] border-[hsl(220,35%,18%)] h-12 rounded-xl text-white font-bold" required />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-[hsl(213,25%,72%)]">Registry Surname</Label>
                  <Input value={profile.lastName} onChange={e => setProfile({...profile, lastName: e.target.value})} className="bg-[hsl(220,38%,14%)] border-[hsl(220,35%,18%)] h-12 rounded-xl text-white font-bold" required />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-[hsl(213,25%,72%)]">Phone Number (+255)</Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(213,25%,45%)] font-black text-xs">+255</span>
                    <Input value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} className="bg-[hsl(220,38%,14%)] border-[hsl(220,35%,18%)] h-12 pl-14 rounded-xl text-white font-bold" placeholder="7XXXXXXXX" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-[hsl(213,25%,72%)]">Operational Hub / City</Label>
                  <select 
                    value={profile.city} 
                    onChange={e => setProfile({...profile, city: e.target.value})}
                    className="w-full bg-[hsl(220,38%,14%)] border border-[hsl(220,35%,18%)] h-12 rounded-xl px-4 text-white font-bold outline-none appearance-none"
                  >
                    {CITIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-10 border-t border-white/5">
                 <h3 className="text-white font-black uppercase tracking-widest text-xs mb-8 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-primary" /> Identity Verification Archive
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <DocCard title="National ID (Front)" docKey="idFront" />
                  <DocCard title="National ID (Back)" docKey="idBack" />
                  <DocCard title="Driver's License" docKey="license" />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isSaving}
                className="w-full h-16 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[11px] rounded-2xl shadow-2xl transition-all active:scale-95 gap-3"
              >
                {isSaving ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                {isSaving ? 'Synchronizing Archive...' : 'Commit Registry Changes'}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}