'use client';

import { useState, useEffect, Suspense } from 'react'
import { doc, setDoc, serverTimestamp, onSnapshot, collection, addDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import { toast } from '@/hooks/use-toast'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Loader2, Save, Globe, Cpu, Zap, ShieldCheck, Bell, Key, Link as LinkIcon,
  Plus, CheckCircle2, XCircle, AlertTriangle, Webhook, ExternalLink
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function SuperAdminSettingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>}>
      <SettingsPageInner />
    </Suspense>
  );
}

function SettingsPageInner() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'branding';
  const [saving, setSaving] = useState(false);
  const [testingWebhook, setTestingWebhook] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState<'idle'|'ok'|'fail'>('idle');
  const [securityPin, setSecurityPin] = useState('8104');
  const [webhookStatuses, setWebhookStatuses] = useState<Record<string, 'idle'|'ok'|'fail'>>({
    'volta-booking': 'idle',
    'payment-verified': 'idle',
    'booking-status-updated': 'idle',
    'car-added': 'idle',
    'driver-added': 'idle',
    'volta-user-register': 'idle',
  });
  const [testingWebhooks, setTestingWebhooks] = useState<Record<string, boolean>>({
    'volta-booking': false,
    'payment-verified': false,
    'booking-status-updated': false,
    'car-added': false,
    'driver-added': false,
    'volta-user-register': false,
  });
  const [lastResponses, setLastResponses] = useState<Record<string, any>>({});
  const [expandedPayloads, setExpandedPayloads] = useState<Record<string, boolean>>({});
  const [form, setForm] = useState<any>({ 
    companyName: 'Volta Rentals', 
    tagline: 'Elite Mobility for the Modern Executive',
    supportEmail: 'info@voltarentals.co.tz',
    whatsappNumber: '+255 790942616',
    officeAddress: 'Mikocheni, Dar es Salaam',
    lipaNamba: '',
    lipaNambaName: '',
    tin: '',
    efdEmail: '',
    aiKeys: ['', '', ''],
    broadcastTitle: '',
    broadcastMessage: '',
    n8nWebhookUrl: '',
    pesapalEnv: 'sandbox',
    pesapalKey: '',
    pesapalSecret: '',
    azamPayEnv: 'sandbox',
    azamPayClientId: '',
    azamPayClientSecret: '',
    azamPayToken: '',
  });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'branding'), (snap) => {
      if (snap.exists()) setForm((prev: any) => ({ ...prev, ...snap.data() }));
    });
    const unsubPesapal = onSnapshot(doc(db, 'settings', 'pesapal'), (snap) => {
      if (snap.exists()) setForm((prev: any) => ({ ...prev, pesapalEnv: snap.data().env, pesapalKey: snap.data().consumerKey, pesapalSecret: snap.data().consumerSecret }));
    });
    const unsubAzam = onSnapshot(doc(db, 'settings', 'azampay'), (snap) => {
      if (snap.exists()) setForm((prev: any) => ({ ...prev, azamPayEnv: snap.data().env, azamPayClientId: snap.data().clientId, azamPayClientSecret: snap.data().clientSecret, azamPayToken: snap.data().token }));
    });
    const unsubSecurity = onSnapshot(doc(db, 'settings', 'security'), (snap) => {
      if (snap.exists() && snap.data().pin) setSecurityPin(snap.data().pin);
    });
    return () => { unsub(); unsubPesapal(); unsubAzam(); unsubSecurity(); };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Save Branding Settings (Only branding related fields)
      const brandingData = {
        companyName: form.companyName,
        tagline: form.tagline,
        supportEmail: form.supportEmail,
        whatsappNumber: form.whatsappNumber,
        officeAddress: form.officeAddress,
        logoUrl: form.logoUrl ?? "",
        lipaNamba: form.lipaNamba ?? "",
        lipaNambaName: form.lipaNambaName ?? "",
        tin: form.tin ?? "",
        efdEmail: form.efdEmail ?? "",
        n8nWebhookUrl: form.n8nWebhookUrl ?? "",
        updatedAt: serverTimestamp()
      };
      await setDoc(doc(db, 'settings', 'branding'), brandingData, { merge: true });

      // 2. Save Pesapal Credentials
      if (form.pesapalKey) {
        await setDoc(doc(db, 'settings', 'pesapal'), {
          env: form.pesapalEnv,
          consumerKey: form.pesapalKey,
          consumerSecret: form.pesapalSecret,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }

      // 3. Save AzamPay Credentials
      if (form.azamPayClientId) {
        await setDoc(doc(db, 'settings', 'azampay'), {
          env: form.azamPayEnv,
          clientId: form.azamPayClientId,
          clientSecret: form.azamPayClientSecret,
          token: form.azamPayToken,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }

      // 4. Save AI Keys separately to keep doc size small
      if (form.aiKeys && form.aiKeys.length > 0) {
        await setDoc(doc(db, 'settings', 'ai'), {
          keys: form.aiKeys,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }

      toast({ title: "✅ System State Synchronized" });
    } catch (error: any) {
      console.error("Save error:", error);
      toast({ variant: "destructive", title: "Sync Failed", description: error.message });
    } finally {
      setSaving(false);
    }
  };

  const testWebhook = async () => {
    if (!form.n8nWebhookUrl) {
      toast({ variant: "destructive", title: "Enter webhook URL first" });
      return;
    }
    setTestingWebhook(true);
    setWebhookStatus('idle');
    try {
      const endpoint = 'volta-booking';
      let targetUrl = form.n8nWebhookUrl;
      
      // Prevent double-pathing if user provides a full URL
      if (!targetUrl.endsWith(endpoint) && !targetUrl.includes(endpoint)) {
        targetUrl = targetUrl.endsWith('/') ? `${targetUrl}${endpoint}` : `${targetUrl}/${endpoint}`;
      }

      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingCode: 'TEST-000000',
          userName: 'Volta Test Hub',
          email: 'test@voltarentals.co.tz',
          phone: '+255700000000',
          vehicleName: 'Test Sentinel SUV',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 86400000).toISOString(),
          totalPrice: 100000,
          companyId: 'volta001',
          source: 'super_admin_test',
        }),
      });
      setWebhookStatus(res.ok ? 'ok' : 'fail');
      toast({ title: res.ok ? '✅ Webhook Connected!' : '⚠️ Webhook rejection', variant: res.ok ? 'default' : 'destructive' });
    } catch {
      setWebhookStatus('fail');
      toast({ variant: "destructive", title: "Webhook unreachable" });
    } finally {
      setTestingWebhook(false);
    }
  };

  const testSingleWebhook = async (endpoint: string, payload: any) => {
    if (!form.n8nWebhookUrl) {
      toast({ variant: "destructive", title: "Enter webhook URL first" });
      return;
    }
    setTestingWebhooks(prev => ({ ...prev, [endpoint]: true }));
    setWebhookStatuses(prev => ({ ...prev, [endpoint]: 'idle' }));
    try {
      let targetUrl = form.n8nWebhookUrl;
      
      // Prevent double-pathing if user provides a full URL
      if (!targetUrl.endsWith(endpoint) && !targetUrl.includes(endpoint)) {
        targetUrl = targetUrl.endsWith('/') ? `${targetUrl}${endpoint}` : `${targetUrl}/${endpoint}`;
      }

      // Add timestamp and company context to match automation.ts behavior
      const companyName = form.companyName || 'Volta Rentals Tanzania';
      const finalPayload = {
        timestamp: new Date().toISOString(),
        companyName: companyName,
        companyId: 'volta001',
        event: endpoint,
        ...payload
      };

      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalPayload),
      });

      let responseText = '';
      try {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const json = await res.json();
          responseText = JSON.stringify(json, null, 2);
          setLastResponses(prev => ({ ...prev, [endpoint]: { status: res.status, body: json } }));
        } else {
          responseText = await res.text();
          setLastResponses(prev => ({ ...prev, [endpoint]: { status: res.status, body: responseText } }));
        }
      } catch (err) {
        responseText = 'Response read failed';
      }

      const isOk = res.ok;
      setWebhookStatuses(prev => ({ ...prev, [endpoint]: isOk ? 'ok' : 'fail' }));
      
      if (endpoint === 'volta-booking') {
        setWebhookStatus(isOk ? 'ok' : 'fail');
      }
      
      toast({ 
        title: isOk ? `✅ ${endpoint} Connected!` : `⚠️ ${endpoint} Failed`, 
        description: isOk ? `Successfully reached n8n (HTTP ${res.status}).` : `n8n returned HTTP ${res.status}. Check details below.`,
        variant: isOk ? 'default' : 'destructive' 
      });
    } catch (e: any) {
      setWebhookStatuses(prev => ({ ...prev, [endpoint]: 'fail' }));
      if (endpoint === 'volta-booking') {
        setWebhookStatus('fail');
      }
      setLastResponses(prev => ({ ...prev, [endpoint]: { status: 'ERR', body: e.message || 'Connection failed/timeout' } }));
      toast({ variant: "destructive", title: `❌ ${endpoint} Webhook Unreachable`, description: e.message || "Failed to fetch" });
    } finally {
      setTestingWebhooks(prev => ({ ...prev, [endpoint]: false }));
    }
  };

  const sendBroadcast = async () => {
    if (!form.broadcastTitle || !form.broadcastMessage) return;
    setSaving(true);
    try {
      await addDoc(collection(db, "notifications"), {
        title: form.broadcastTitle,
        message: form.broadcastMessage,
        type: 'general',
        userId: 'global',
        read: false,
        createdAt: serverTimestamp()
      });
      toast({ title: "📡 Broadcast Dispatched!" });
      setForm({ ...form, broadcastTitle: '', broadcastMessage: '' });
    } catch {
      toast({ variant: "destructive", title: "Broadcast Failed" });
    } finally {
      setSaving(false);
    }
  };

  const testAzamPay = async () => {
    if (!form.azamPayClientId || !form.azamPayClientSecret) {
      toast({ variant: "destructive", title: "Missing AzamPay Credentials" });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/payments/azampay/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          env: form.azamPayEnv,
          clientId: form.azamPayClientId,
          clientSecret: form.azamPayClientSecret,
          appName: form.azamPayToken || 'VoltaRentals' // Fallback to verified app name
        })
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "✅ AzamPay Connected", description: "Sandbox / Live token generated successfully!" });
      } else {
        toast({ variant: "destructive", title: "Connection Failed", description: data.error || "Invalid keys" });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Connection Failed" });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSecurityPin = async () => {
    if (securityPin.length !== 4 || isNaN(Number(securityPin))) {
      toast({ variant: "destructive", title: "Invalid PIN", description: "Security passkey must be exactly 4 digits." });
      return;
    }
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'security'), {
        pin: securityPin,
        updatedAt: serverTimestamp()
      }, { merge: true });
      toast({ title: "✅ Supreme Authority PIN Updated!" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Update Failed", description: error.message });
    } finally {
      setSaving(false);
    }
  };

  const updateAiKey = (index: number, val: string) => {
    const keys = [...(form.aiKeys || [])];
    keys[index] = val;
    setForm({ ...form, aiKeys: keys });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-border pb-8">
        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tighter uppercase leading-none text-foreground">Global Control</h1>
          <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest italic">System-level configuration & intelligence nodes</p>
        </div>
      </div>

      <Tabs defaultValue={defaultTab} className="space-y-10">
        <TabsList className="bg-card border border-border p-1 rounded-2xl h-auto flex flex-wrap gap-1">
          <TabsTrigger value="branding" className="rounded-xl px-6 py-3 font-black uppercase text-[10px] tracking-widest gap-2"><Globe size={14}/> Branding</TabsTrigger>
          <TabsTrigger value="automation" className="rounded-xl px-6 py-3 font-black uppercase text-[10px] tracking-widest gap-2"><Webhook size={14}/> Automation</TabsTrigger>
          <TabsTrigger value="ai" className="rounded-xl px-6 py-3 font-black uppercase text-[10px] tracking-widest gap-2"><Key size={14}/> AI Nodes</TabsTrigger>
          <TabsTrigger value="broadcast" className="rounded-xl px-6 py-3 font-black uppercase text-[10px] tracking-widest gap-2"><Bell size={14}/> Broadcast</TabsTrigger>
          <TabsTrigger value="system" className="rounded-xl px-6 py-3 font-black uppercase text-[10px] tracking-widest gap-2"><Cpu size={14}/> System Status</TabsTrigger>
        </TabsList>

        {/* ── BRANDING TAB ── */}
        <TabsContent value="branding">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* PUBLIC PROFILE */}
            <Card className="rounded-[2.5rem] border-border bg-card p-10 shadow-2xl space-y-8 flex flex-col justify-between">
              <div className="space-y-8">
                <div className="flex items-center gap-3"><Globe className="text-primary h-6 w-6" /><h2 className="text-sm font-black uppercase tracking-widest text-foreground">Public Profile</h2></div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Company Name</label>
                    <Input value={form.companyName ?? ""} onChange={e => setForm({...form, companyName: e.target.value})} className="h-12 bg-muted border-none font-bold text-foreground" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Tagline</label>
                    <Input value={form.tagline ?? ""} onChange={e => setForm({...form, tagline: e.target.value})} className="h-12 bg-muted border-none font-bold text-foreground" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Logo URL</label>
                    <Input value={form.logoUrl ?? ""} onChange={e => setForm({...form, logoUrl: e.target.value})} className="h-12 bg-muted border-none font-bold text-foreground" placeholder="https://..." />
                  </div>
                </div>
              </div>
              <div className="space-y-4 pt-6">
                <Button onClick={handleSave} disabled={saving} className="w-full h-14 bg-primary font-black uppercase tracking-widest text-[10px] rounded-xl text-white">
                  {saving ? <Loader2 className="animate-spin h-4 w-4" /> : <Save size={16} className="mr-2" />} Commit Identity
                </Button>
                <div className="pt-4 flex items-center justify-between border-t border-border">
                  <p className="text-[10px] font-black uppercase text-muted-foreground">Color & Fonts</p>
                  <Link href="/super-admin/settings/theme" className="text-[10px] font-black text-primary uppercase underline tracking-widest">Open Theme Studio</Link>
                </div>
              </div>
            </Card>

            {/* GLOBAL SUPPORT PROTOCOL */}
            <Card className="rounded-[2.5rem] border-border bg-card p-10 shadow-2xl space-y-8">
              <div className="flex items-center gap-3"><Globe className="text-primary h-6 w-6" /><h2 className="text-sm font-black uppercase tracking-widest text-foreground">Global Support Protocol</h2></div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Support Email</label>
                  <Input value={form.supportEmail ?? ""} onChange={e => setForm({...form, supportEmail: e.target.value})} className="h-12 bg-muted border-none font-bold text-foreground" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">WhatsApp Number</label>
                  <Input value={form.whatsappNumber ?? ""} onChange={e => setForm({...form, whatsappNumber: e.target.value})} className="h-12 bg-muted border-none font-bold text-foreground" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Office Address</label>
                  <Input value={form.officeAddress ?? ""} onChange={e => setForm({...form, officeAddress: e.target.value})} className="h-12 bg-muted border-none font-bold text-foreground" />
                </div>
              </div>
            </Card>

            {/* CORPORATE COMPLIANCE & LIPA NAMBA */}
            <Card className="rounded-[2.5rem] border-border bg-card p-10 shadow-2xl space-y-8">
              <div className="flex items-center gap-3"><ShieldCheck className="text-primary h-6 w-6" /><h2 className="text-sm font-black uppercase tracking-widest text-foreground">Financial & TRA Compliance</h2></div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Manual Lipa Namba / Phone No</label>
                  <Input value={form.lipaNamba ?? ""} onChange={e => setForm({...form, lipaNamba: e.target.value})} className="h-12 bg-muted border-none font-bold text-foreground" placeholder="e.g. 5228830 or +255..." />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Lipa Namba Registered Name</label>
                  <Input value={form.lipaNambaName ?? ""} onChange={e => setForm({...form, lipaNambaName: e.target.value})} className="h-12 bg-muted border-none font-bold text-foreground" placeholder="e.g. VOLTA RENTALS (M-PESA)" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Taxpayer Identification Number (TIN)</label>
                  <Input value={form.tin ?? ""} onChange={e => setForm({...form, tin: e.target.value})} className="h-12 bg-muted border-none font-bold text-foreground font-mono" placeholder="9-digit corporate TIN..." />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">TRA Registered EFD Email</label>
                  <Input value={form.efdEmail ?? ""} onChange={e => setForm({...form, efdEmail: e.target.value})} className="h-12 bg-muted border-none font-bold text-foreground" placeholder="efd@domain.com" />
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* ── AUTOMATION TAB ── */}
        <TabsContent value="automation">
          <div className="space-y-8">

            {/* n8n Webhook Section */}
            <Card className="rounded-[2.5rem] border-border bg-card p-10 shadow-2xl space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Webhook className="text-primary h-6 w-6" />
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-widest text-foreground">n8n Webhook Testing Terminal</h2>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest mt-1">Configure and individually test each automation webhook trigger</p>
                  </div>
                </div>
                <Button onClick={handleSave} disabled={saving} className="h-12 bg-primary font-black uppercase tracking-widest text-[10px] rounded-xl gap-2 px-6 self-start md:self-auto">
                  {saving ? <Loader2 className="animate-spin h-4 w-4" /> : <Save size={16} />} Save Webhook URL
                </Button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">n8n Webhook Base URL (Without Trailing Slash)</label>
                  <Input
                    value={form.n8nWebhookUrl ?? ""}
                    onChange={e => setForm({...form, n8nWebhookUrl: e.target.value})}
                    placeholder="e.g. https://mwijay-automation.duckdns.org/webhook-test"
                    className="h-12 bg-muted border-none font-mono text-xs text-foreground"
                  />
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-[10px] text-muted-foreground leading-relaxed">
                  <p className="text-[9px] font-black uppercase text-primary mb-1">🔗 Integration Architecture</p>
                  Each trigger will append its event path (e.g. <code className="bg-muted px-1 rounded text-primary font-mono">/volta-booking</code>) to the base URL configured above. Make sure your n8n workflow triggers match these paths.
                </div>

                {/* Webhook Testing Harness */}
                {form.n8nWebhookUrl && (
                  <div className="space-y-6 pt-4 border-t border-border">
                    <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Independent Trigger Harness</h3>
                    
                    <div className="grid grid-cols-1 gap-6">
                      {[
                        {
                          key: 'volta-booking',
                          label: '🚀 New Booking Webhook',
                          desc: 'Triggered when client places a booking. Processes details, syncs sheets, dispatches email & manager Telegram alert.',
                          payload: {
                            bookingCode: 'VR-TEST99',
                            firebaseId: 'test_booking_123',
                            customerName: 'Clemence Ngunda',
                            phone: '+255790942616',
                            email: 'clemencengunda08@gmail.com',
                            vehicle: 'Toyota Land Cruiser V8',
                            carId: 'car_lc_v8_001',
                            plateNumber: 'T 777 DFF',
                            pickupLocation: 'Julius Nyerere International Airport (DAR)',
                            startDate: new Date().toISOString().slice(0, 10),
                            endDate: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
                            durationDays: 3,
                            dailyRate: 250000,
                            totalAmount: 770000,
                            airportSurcharge: 20000,
                            chauffeurFee: 150000,
                            baseAmount: 600000,
                            status: 'Confirmed',
                            paymentStatus: 'Pending',
                            amountPaid: 0,
                            balanceDue: 770000,
                            driverName: 'Assigned Driver',
                            driverEmail: 'driver@voltarentals.co.tz',
                            reminder48hSent: 'No',
                            reminder24hSent: 'No',
                            createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
                            lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 19),
                            aiTag: 'VIP Customer',
                            notes: 'Testing Volta New Booking n8n Integration.',
                            chauffeurRequested: 'Yes'
                          }
                        },
                        {
                          key: 'payment-verified',
                          label: '💳 Payment Verified Webhook',
                          desc: 'Triggered when clients complete card or mobile money payments. Dispatches trauma-free billing & syncs spreadsheet ledgers.',
                          payload: {
                            bookingCode: 'VR-TEST99',
                            amountPaid: 770000,
                            trackingId: 'pesapal_track_998877',
                            paymentMethod: 'M-Pesa',
                            processedAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
                          }
                        },
                        {
                          key: 'booking-status-updated',
                          label: '📋 Booking Status Webhook',
                          desc: 'Triggered when status changes to Active or Cancelled. Re-calibrates TRA EFD compliance nodes and automates logistics.',
                          payload: {
                            bookingCode: 'VR-TEST99',
                            status: 'Active',
                            paymentStatus: 'Paid',
                            updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
                          }
                        },
                        {
                          key: 'car-added',
                          label: '🚗 Car Added Webhook',
                          desc: 'Triggered when a vehicle is introduced to Fleet Control. Automatically creates a record in your Google Sheet database.',
                          payload: {
                            carId: 'CAR-LC-V8-001',
                            firebaseId: 'car_lc_v8_001',
                            make: 'Toyota',
                            model: 'Land Cruiser V8',
                            plateNumber: 'T 777 DFF',
                            category: 'Luxury SUV',
                            dailyRate: 250000,
                            status: 'Available',
                            imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf',
                            description: 'Supreme executive V8 Land Cruiser with presidential comfort.',
                            createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
                            lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 19)
                          }
                        },
                        {
                          key: 'driver-added',
                          label: '🧑‍✈️ Driver Added Webhook',
                          desc: 'Triggered upon onboarding a new driver in Driver Dispatch. Syncs driver credentials and metrics sheets.',
                          payload: {
                            driverId: 'DRV-JMW-001',
                            firebaseId: 'driver_jmw_001',
                            fullName: 'James Mwangi',
                            phone: '+255788123456',
                            email: 'james.mwangi@voltarentals.co.tz',
                            licenseNumber: 'TZ-DL-98765',
                            status: 'Available',
                            experience: 8,
                            rating: 4.9,
                            totalTrips: 42,
                            createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
                          }
                        },
                        {
                          key: 'volta-user-register',
                          label: '👤 User Register Webhook',
                          desc: 'Triggered when new clients sign up. Initiates welcoming flows, dispatches custom HTML emails and maps CRM database records.',
                          payload: {
                            userId: 'USR-JM-001',
                            firebaseId: 'user_jm_001',
                            name: 'Jane Miller',
                            email: 'jane.miller@example.com',
                            phone: '+255655987654',
                            totalBookings: 0,
                            totalSpent: 0,
                            vipStatus: 'Standard',
                            registeredAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
                          }
                        }
                      ].map(trigger => {
                        const status = webhookStatuses[trigger.key] || 'idle';
                        const isTesting = testingWebhooks[trigger.key] || false;
                        const response = lastResponses[trigger.key];
                        const isPayloadExpanded = expandedPayloads[trigger.key] || false;

                        return (
                          <div key={trigger.key} className="bg-muted/40 border border-border rounded-2xl p-6 space-y-4 hover:border-primary/20 transition-all duration-300">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-xs font-black uppercase text-foreground">{trigger.label}</h4>
                                  <code className="text-[8px] font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                                    /{trigger.key}
                                  </code>
                                </div>
                                <p className="text-[10px] text-muted-foreground leading-relaxed max-w-xl">{trigger.desc}</p>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[8px] font-black uppercase ${
                                  status === 'ok' ? 'bg-emerald-500/10 text-emerald-500' :
                                  status === 'fail' ? 'bg-red-500/10 text-red-500' :
                                  'bg-muted text-muted-foreground'
                                }`}>
                                  {status === 'ok' && <CheckCircle2 size={8} />}
                                  {status === 'fail' && <XCircle size={8} />}
                                  {status === 'idle' && <AlertTriangle size={8} />}
                                  {status === 'ok' ? 'Connected' : status === 'fail' ? 'Failed' : 'Ready'}
                                </div>
                                <Button 
                                  onClick={() => testSingleWebhook(trigger.key, trigger.payload)} 
                                  disabled={isTesting}
                                  className="h-10 px-4 rounded-xl bg-foreground text-background hover:bg-foreground/90 font-black text-[9px] uppercase tracking-widest gap-1.5 transition-all"
                                >
                                  {isTesting ? <Loader2 className="animate-spin h-3 w-3" /> : <Zap size={10} />}
                                  Trigger
                                </Button>
                              </div>
                            </div>

                            {/* Payload Toggle & Console Logs */}
                            <div className="flex gap-4 text-[9px] font-black uppercase">
                              <button 
                                onClick={() => setExpandedPayloads(prev => ({ ...prev, [trigger.key]: !isPayloadExpanded }))}
                                className="text-primary hover:underline transition-all tracking-wider"
                              >
                                {isPayloadExpanded ? 'Hide Payload' : 'View Payload Schema'}
                              </button>
                              
                              {response && (
                                <span className={response.status >= 200 && response.status < 300 ? "text-emerald-500" : "text-rose-500"}>
                                  Last Status: {response.status}
                                </span>
                              )}
                            </div>

                            {isPayloadExpanded && (
                              <pre className="text-[9px] font-mono bg-background border border-border p-4 rounded-xl text-muted-foreground overflow-x-auto max-h-60 leading-normal">
                                {JSON.stringify(trigger.payload, null, 2)}
                              </pre>
                            )}

                            {response && (
                              <div className="bg-background border border-border/80 rounded-xl p-4 space-y-1.5">
                                <p className="text-[8px] font-black uppercase text-muted-foreground">n8n Execution Log Response</p>
                                <pre className="text-[9px] font-mono text-foreground overflow-x-auto max-h-40 whitespace-pre-wrap leading-normal">
                                  {typeof response.body === 'string' ? response.body : JSON.stringify(response.body, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Pesapal Payment Gateway Section */}
            <Card className="rounded-[2.5rem] border-border bg-card p-10 shadow-2xl space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <LinkIcon className="text-primary h-6 w-6" />
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-widest">Pesapal Payment Gateway</h2>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest mt-1">Configure M-Pesa / Card payment credentials</p>
                  </div>
                </div>
                <a href="https://developer.pesapal.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[9px] text-primary font-black uppercase tracking-widest hover:underline">
                  Pesapal Docs <ExternalLink size={10} />
                </a>
              </div>

              <div className="space-y-6">
                <div className="flex gap-3">
                  {['sandbox', 'production'].map(env => (
                    <button
                      key={env}
                      onClick={() => setForm({...form, pesapalEnv: env})}
                      className={`flex-1 h-12 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${
                        form.pesapalEnv === env
                          ? 'bg-primary text-white shadow-xl'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {env === 'sandbox' ? '🧪 Sandbox (Testing)' : '🚀 Production (Live)'}
                    </button>
                  ))}
                </div>

                {form.pesapalEnv === 'sandbox' && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3">
                    <AlertTriangle className="text-amber-500 shrink-0" size={16} />
                    <p className="text-[10px] text-amber-600 font-black uppercase leading-relaxed">
                      Sandbox mode active — payments won't be real. Switch to Production when ready to go live.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Consumer Key</label>
                    <Input
                      type="password"
                      value={form.pesapalKey ?? ""}
                      onChange={e => setForm({...form, pesapalKey: e.target.value})}
                      placeholder="From Pesapal dashboard..."
                      className="h-12 bg-muted border-none font-mono text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Consumer Secret</label>
                    <Input
                      type="password"
                      value={form.pesapalSecret ?? ""}
                      onChange={e => setForm({...form, pesapalSecret: e.target.value})}
                      placeholder="From Pesapal dashboard..."
                      className="h-12 bg-muted border-none font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="bg-muted/50 rounded-xl p-4 border border-border space-y-2">
                  <p className="text-[9px] font-black uppercase text-muted-foreground">Pesapal IPN Callback URL</p>
                  <code className="text-[10px] font-mono text-primary block">
                    {typeof window !== 'undefined' ? window.location.origin : 'https://yourapp.com'}/api/payments/ipn
                  </code>
                  <p className="text-[9px] text-muted-foreground">Register this URL in your Pesapal merchant dashboard under IPN settings.</p>
                </div>
              </div>

            </Card>

            {/* AzamPay Gateway Section */}
            <Card className="rounded-[2.5rem] border-border bg-card p-10 shadow-2xl space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <LinkIcon className="text-primary h-6 w-6" />
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-widest">AzamPay Integration</h2>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest mt-1">Configure AzamPay credentials for mobile payments</p>
                  </div>
                </div>
                <a href="https://azampay.co.tz/docs" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[9px] text-primary font-black uppercase tracking-widest hover:underline">
                  Azam Docs <ExternalLink size={10} />
                </a>
              </div>

              <div className="space-y-6">
                <div className="flex gap-3">
                  {['sandbox', 'production'].map(env => (
                    <button
                      key={env}
                      onClick={() => setForm({...form, azamPayEnv: env})}
                      className={`flex-1 h-12 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${
                        form.azamPayEnv === env
                          ? 'bg-primary text-white shadow-xl'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {env === 'sandbox' ? '🧪 Sandbox (Testing)' : '🚀 Production (Live)'}
                    </button>
                  ))}
                </div>

                {form.azamPayEnv === 'sandbox' && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3">
                    <AlertTriangle className="text-amber-500 shrink-0" size={16} />
                    <p className="text-[10px] text-amber-600 font-black uppercase leading-relaxed">
                      Sandbox mode active — payments won't be real. Switch to Production when ready to go live.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Client ID</label>
                    <Input
                      type="password"
                      value={form.azamPayClientId ?? ""}
                      onChange={e => setForm({...form, azamPayClientId: e.target.value})}
                      placeholder="e.g. 31262501-..."
                      className="h-12 bg-muted border-none font-mono text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Azam Portal App Name</label>
                    <Input
                      value={form.azamPayToken ?? ""}
                      onChange={e => setForm({...form, azamPayToken: e.target.value})}
                      placeholder="e.g. VoltaRentals"
                      className="h-12 bg-muted border-none font-mono text-xs"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Client Secret Key</label>
                    <Input
                      type="password"
                      value={form.azamPayClientSecret ?? ""}
                      onChange={e => setForm({...form, azamPayClientSecret: e.target.value})}
                      placeholder="e.g. CHBgZHSdLW8TB..."
                      className="h-12 bg-muted border-none font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button onClick={testAzamPay} disabled={saving} variant="outline" className="h-14 px-8 rounded-xl font-black uppercase text-[10px] tracking-widest border-border gap-2">
                  {saving ? <Loader2 className="animate-spin h-4 w-4" /> : <Zap size={16} />} Test Token API
                </Button>
                <Button onClick={handleSave} disabled={saving} className="flex-1 h-14 bg-primary font-black uppercase tracking-widest text-[10px] rounded-xl shadow-xl gap-2">
                  {saving ? <Loader2 className="animate-spin h-5" /> : <Save size={20} />} Save Payment Config
                </Button>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* ── AI NODES TAB ── */}
        <TabsContent value="ai">
          <Card className="rounded-[2.5rem] border-border bg-card p-10 space-y-10 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3"><Zap className="text-primary h-6 w-6" /><h2 className="text-sm font-black uppercase tracking-widest text-foreground">Gemini API Failover Node</h2></div>
              <div className="bg-emerald-500/10 text-emerald-500 rounded-full px-3 py-1 text-[8px] font-black uppercase">Load Balancing Active</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[0,1,2,3,4,5,6,7,8,9].map(i => (
                <div key={i} className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Secret Key Node 0{i+1}</label>
                  <Input type="password" value={form.aiKeys?.[i] || ""} onChange={e => updateAiKey(i, e.target.value)} placeholder="AIzaSy..." className="h-12 bg-muted border-none font-mono text-xs text-foreground" />
                </div>
              ))}
            </div>
            <Button onClick={handleSave} disabled={saving} className="h-16 px-12 bg-primary font-black uppercase tracking-widest text-[10px] rounded-xl shadow-xl gap-2 text-white">
              {saving ? <Loader2 className="animate-spin h-5" /> : <Save size={20} />} Synchronize AI Cloud
            </Button>
          </Card>

          {/* AUTHORITY NODE SECURITY CARD */}
          <Card className="rounded-[2.5rem] border-border bg-card p-10 space-y-8 shadow-2xl mt-10">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-primary h-6 w-6" />
              <div>
                <h2 className="text-sm font-black uppercase tracking-widest text-foreground">Authority Node Security</h2>
                <p className="text-[9px] text-muted-foreground uppercase tracking-widest mt-1">Configure secondary master security credentials</p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Supreme Secondary passkey PIN (4-digit numeric)</label>
                <Input 
                  maxLength={4}
                  value={securityPin} 
                  onChange={e => setSecurityPin(e.target.value)} 
                  className="h-12 bg-muted border-none font-black text-2xl tracking-[0.5em] text-foreground text-center max-w-[200px]" 
                />
              </div>
              <Button onClick={handleSaveSecurityPin} disabled={saving} className="h-14 px-8 bg-primary font-black uppercase tracking-widest text-[10px] rounded-xl text-white gap-2">
                {saving ? <Loader2 className="animate-spin h-4 w-4" /> : <Save size={16} />} Commit Security Passkey
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* ── BROADCAST TAB ── */}
        <TabsContent value="broadcast">
          <Card className="rounded-[2.5rem] border-border bg-card p-10 space-y-8 shadow-2xl">
            <div className="flex items-center gap-3"><Bell className="text-primary h-6 w-6" /><h2 className="text-sm font-black uppercase tracking-widest text-foreground">Global Broadcast Alert</h2></div>
            <div className="space-y-4">
              <Input value={form.broadcastTitle} onChange={e => setForm({...form, broadcastTitle: e.target.value})} placeholder="Alert Title (e.g. Easter Special!)" className="h-12 bg-muted border-none text-foreground font-bold" />
              <textarea value={form.broadcastMessage} onChange={e => setForm({...form, broadcastMessage: e.target.value})} placeholder="Write message to all elite travelers..." className="w-full bg-muted border-none rounded-2xl p-6 min-h-[120px] text-sm text-foreground focus:ring-1 focus:ring-primary outline-none font-bold" />
            </div>
            <Button onClick={sendBroadcast} disabled={saving || !form.broadcastTitle} className="h-16 px-12 bg-emerald-600 hover:bg-emerald-700 font-black uppercase tracking-widest text-[10px] rounded-xl shadow-xl gap-2 text-white">
              {saving ? <Loader2 className="animate-spin h-5" /> : <Zap size={20} />} Dispatch Broadcast
            </Button>
          </Card>
        </TabsContent>

        {/* ── SYSTEM STATUS TAB ── */}
        <TabsContent value="system">
          <Card className="rounded-[2.5rem] border-border bg-card p-10 space-y-10 shadow-2xl">
            <div className="flex items-center gap-3"><Cpu className="text-primary h-6 w-6" /><h2 className="text-sm font-black uppercase tracking-widest text-foreground">Application Engine Status</h2></div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'PWA Manifest', status: 'OK', ok: true },
                { label: 'Service Worker', status: 'Active', ok: true },
                { label: 'Offline Mode', status: 'Available', ok: true },
                { label: 'Install Prompt', status: 'Enabled', ok: true },
                { label: 'n8n Webhook', status: form.n8nWebhookUrl ? 'Configured' : 'Not Set', ok: !!form.n8nWebhookUrl },
                { label: 'Pesapal', status: form.pesapalEnv === 'production' ? 'Production' : 'Sandbox', ok: form.pesapalEnv === 'production' },
                { label: 'AI Keys', status: form.aiKeys?.filter(Boolean).length > 0 ? `${form.aiKeys.filter(Boolean).length} Active` : 'None', ok: form.aiKeys?.filter(Boolean).length > 0 },
                { label: 'Firestore', status: 'Connected', ok: true },
              ].map(item => (
                <div key={item.label} className="p-6 bg-muted/50 rounded-2xl border border-border flex flex-col items-center gap-3">
                  {item.ok ? <CheckCircle2 className="text-emerald-500" size={20} /> : <AlertTriangle className="text-amber-500" size={20} />}
                  <span className="text-[9px] font-black uppercase tracking-widest text-center text-foreground">{item.label}</span>
                  <span className={`text-[8px] font-black uppercase ${item.ok ? 'text-emerald-500' : 'text-amber-500'}`}>{item.status}</span>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
