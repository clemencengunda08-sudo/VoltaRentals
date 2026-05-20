'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Zap, 
  Globe, 
  Smartphone, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  ChevronUp, 
  Download, 
  Eye, 
  EyeOff, 
  Play,
  UserPlus,
  Car,
  ShieldCheck,
  Send,
  ArrowRight,
  Info,
  ChevronDown
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { 
  isPresentationMode, 
  enablePresentationMode, 
  disablePresentationMode 
} from '@/lib/presentation';

export function DemoWidget() {
  const { language, setLanguage, t } = useLanguage();
  const db = useFirestore();
  const [isOpen, setIsOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [presentation, setPresentation] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  
  // Collapsible sections for organized triggers
  const [openSection, setOpenSection] = useState<'workflows' | 'fleet' | 'accounts' | null>('workflows');

  // Webhook trigger states
  const [triggering, setTriggering] = useState<string | null>(null);
  const [triggerResult, setTriggerResult] = useState<{ endpoint: string; status: number | string; body: string } | null>(null);

  useEffect(() => {
    // 1. Listen for PWA Install Prompt (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      toast({ title: "App Installed Successfully! 📱" });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // 2. Detect iOS Device
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Check if already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // 3. Read localstorage values
    setDemoMode(localStorage.getItem('volta_demo_mode') === 'true');
    setPresentation(isPresentationMode());

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }
    if (!deferredPrompt) {
      toast({ 
        title: "Installation Note", 
        description: "This web app is already installed or your browser does not support quick installation prompts." 
      });
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const toggleDemoMode = () => {
    const nextVal = !demoMode;
    setDemoMode(nextVal);
    localStorage.setItem('volta_demo_mode', nextVal ? 'true' : 'false');
    toast({ 
      title: nextVal ? "Demo Mode Active ⚡" : "Demo Mode Disabled",
      description: nextVal ? "All payment routes are running in simulated sandbox mode." : "Payment routes will expect live integrations."
    });
    setTimeout(() => window.location.reload(), 1000);
  };

  const togglePresentation = () => {
    const nextVal = !presentation;
    setPresentation(nextVal);
    if (nextVal) {
      enablePresentationMode();
      toast({ 
        title: "Presentation Mode Enabled 🎬", 
        description: "Prices are rounded for premium visual delivery. Inactivity limits secured." 
      });
    } else {
      disablePresentationMode();
      toast({ title: "Presentation Mode Disabled" });
    }
    setTimeout(() => window.location.reload(), 1000);
  };

  const triggerMockWebhook = async (endpoint: string) => {
    setTriggering(endpoint);
    setTriggerResult(null);

    let baseWebhookUrl = '';
    let specificUrl = '';
    let companyName = 'Volta Rentals';

    try {
      const brandingRef = doc(db, 'settings', 'branding');
      const brandingSnap = await getDoc(brandingRef);
      if (brandingSnap.exists()) {
        const snapData = brandingSnap.data();
        baseWebhookUrl = snapData.n8nWebhookUrl || '';
        companyName = snapData.companyName || companyName;

        if (endpoint === 'volta-booking') specificUrl = snapData.webhookUrlBooking || '';
        else if (endpoint === 'payment-verified') specificUrl = snapData.webhookUrlPayment || '';
        else if (endpoint === 'booking-status-updated') specificUrl = snapData.webhookUrlStatus || '';
        else if (endpoint === 'car-added') specificUrl = snapData.webhookUrlCar || '';
        else if (endpoint === 'driver-added') specificUrl = snapData.webhookUrlDriver || '';
        else if (endpoint === 'volta-user-register') specificUrl = snapData.webhookUrlUser || '';
        else if (endpoint === 'telegram-webhook') specificUrl = snapData.webhookUrlTelegram || '';
      }
    } catch (e) {
      console.warn("DemoWidget: Firestore settings fetch failed.");
    }

    // Fallback URL generation matching automation.ts
    let finalUrl = specificUrl.trim();
    if (!finalUrl && baseWebhookUrl) {
      let inputUrl = baseWebhookUrl.trim().replace(/\/+$/, '');
      let webhookType = inputUrl.includes('/webhook/') ? 'webhook' : 'webhook-test';
      
      let baseDomain = '';
      try {
        const parsed = new URL(inputUrl);
        baseDomain = `${parsed.protocol}//${parsed.host}`;
      } catch {
        const match = inputUrl.match(/^(https?:\/\/[^\/]+)/);
        baseDomain = match ? match[1] : inputUrl;
      }

      if (endpoint === 'telegram-webhook') {
        finalUrl = `${baseDomain}/${webhookType}/volta-tg-bot/webhook`;
      } else {
        finalUrl = `${baseDomain}/${webhookType}/volta-booking/${endpoint}`;
      }
    }

    if (!finalUrl) {
      setTriggering(null);
      toast({ 
        variant: "destructive", 
        title: "No Target Webhook", 
        description: `Please configure a valid webhook URL for /${endpoint} in settings first.` 
      });
      return;
    }

    // Comprehensive payload mapping matching all production/sandbox workflows
    const payloadMap: Record<string, any> = {
      'volta-booking': {
        bookingCode: 'VR-TEST99',
        firebaseId: 'test_booking_123',
        customerName: 'Clemence Ngunda',
        phone: '+255790942616',
        email: 'clemencengunda08@gmail.com',
        vehicle: 'Toyota Land Cruiser V8',
        plateNumber: 'T 777 DFF',
        pickupLocation: 'Julius Nyerere International Airport (DAR)',
        startDate: new Date().toISOString().slice(0, 10),
        endDate: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
        durationDays: 3,
        totalAmount: 770000,
        status: 'Confirmed',
        paymentStatus: 'Pending',
        amountPaid: 0,
        balanceDue: 770000,
        notes: 'Simulated Place Booking payload.'
      },
      'payment-verified': {
        bookingCode: 'VR-TEST99',
        amountPaid: 770000,
        trackingId: 'pesapal_track_998877',
        paymentMethod: 'M-Pesa',
        processedAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
      },
      'booking-status-updated': {
        bookingCode: 'VR-TEST99',
        status: 'Active',
        paymentStatus: 'Paid',
        updatedAt: new Date().toISOString(),
        notes: 'Status update: Logistics assigned and TRA node activated.'
      },
      'car-added': {
        carName: 'Range Rover Sport V8',
        plateNumber: 'T 888 DZZ',
        category: 'SUV Premium',
        dailyRate: 350000,
        status: 'Available',
        fuelType: 'Diesel',
        transmission: 'Automatic',
        features: ['Sunroof', '4WD', 'GPS Navigation']
      },
      'driver-added': {
        driverName: 'Rashid Athumani',
        phone: '+255788123456',
        licenseNumber: 'TZ-DL-998877',
        status: 'Available',
        assignedVehicle: 'UNASSIGNED',
        yearsExperience: 8
      },
      'volta-user-register': {
        userName: 'Rehema John',
        userEmail: 'rehema.john@example.tz',
        userPhone: '+255711223344',
        role: 'customer',
        loyaltyTier: 'Gold',
        registeredAt: new Date().toISOString()
      },
      'telegram-webhook': {
        update_id: 998877665,
        message: {
          message_id: 420,
          from: { id: 554433221, is_bot: false, first_name: "Davie", last_name: "Mwijage", username: "mwijay" },
          chat: { id: -10099887766, title: "Volta Fleet Control", type: "group" },
          date: Math.floor(Date.now() / 1000),
          text: "🔥 New booking VR-TEST99 is ready for dispatch!"
        }
      }
    };

    const finalPayload = {
      timestamp: new Date().toISOString(),
      companyName: companyName,
      companyId: 'volta001',
      event: endpoint,
      ...payloadMap[endpoint]
    };

    try {
      const res = await fetch(finalUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalPayload)
      });

      let responseText = '';
      try {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          responseText = JSON.stringify(await res.json(), null, 2);
        } else {
          responseText = await res.text();
        }
      } catch {
        responseText = 'Response payload parsed';
      }

      setTriggerResult({
        endpoint,
        status: res.status,
        body: responseText.slice(0, 200) + (responseText.length > 200 ? '...' : '')
      });

      toast({
        title: res.ok ? `✅ Trigger Sent!` : `⚠️ Server Replied: ${res.status}`,
        description: `Target: /${endpoint}. Check n8n dashboard for execution log.`
      });
    } catch (e: any) {
      setTriggerResult({
        endpoint,
        status: 'ERR',
        body: e.message || 'Connection timeout or CORS blockade.'
      });
      toast({
        variant: "destructive",
        title: `❌ Connection Failed`,
        description: e.message || "Failed to reach target webhook endpoint."
      });
    } finally {
      setTriggering(null);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      {/* Expanded Control Box */}
      {isOpen && (
        <div className="mb-4 w-[21rem] max-h-[82vh] overflow-y-auto bg-[#080813]/95 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-2xl p-6 space-y-5 animate-in fade-in slide-in-from-bottom-5 duration-300 no-scrollbar text-white">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="text-primary h-4 w-4 animate-pulse" />
              <h4 className="text-[10px] font-black uppercase tracking-wider text-white">Volta Demo Suite</h4>
            </div>
            <button 
              onClick={() => {
                setIsOpen(false);
                setShowIOSInstructions(false);
              }}
              className="text-[9px] font-black uppercase text-gray-400 hover:text-white transition-colors"
            >
              [CLOSE]
            </button>
          </div>

          {/* iOS Install Instructions Slide-in */}
          {showIOSInstructions ? (
            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 space-y-4 animate-in slide-in-from-right duration-300">
              <div className="flex items-center justify-between">
                <h5 className="text-[9px] font-black uppercase text-primary tracking-widest flex items-center gap-1.5">
                  <Smartphone size={12} className="animate-bounce" /> PWA Mobile Setup
                </h5>
                <button 
                  onClick={() => setShowIOSInstructions(false)}
                  className="text-[8px] font-bold text-gray-400 hover:text-white"
                >
                  [Back]
                </button>
              </div>
              <div className="space-y-3 text-[11px] text-gray-300">
                <div className="flex items-start gap-2.5">
                  <span className="h-5 w-5 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-[9px] font-black shrink-0">1</span>
                  <p className="leading-tight pt-0.5">
                    Tap Safari's <span className="font-extrabold text-white inline-flex items-center gap-1 bg-white/10 px-1.5 py-0.5 rounded text-[10px]">Share Button <Download size={10} className="inline text-sky-400" /></span> in the bottom toolbar.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="h-5 w-5 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-[9px] font-black shrink-0">2</span>
                  <p className="leading-tight pt-0.5">
                    Scroll down the sharesheet and select <span className="font-extrabold text-white inline-flex items-center gap-1 bg-white/10 px-1.5 py-0.5 rounded text-[10px]">"Add to Home Screen" <Sparkles size={10} className="inline text-amber-400" /></span>.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="h-5 w-5 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-[9px] font-black shrink-0">3</span>
                  <p className="leading-tight pt-0.5">
                    Tap <span className="font-extrabold text-primary">"Add"</span> in the top-right corner to finalize the premium application install!
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Interactive Environment Toggles */}
              <div className="space-y-2.5">
                <h5 className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Environment Setup</h5>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={toggleDemoMode}
                    className={cn(
                      "h-10 px-3 rounded-xl border flex items-center justify-center gap-1.5 text-[8px] font-black uppercase tracking-wider transition-all",
                      demoMode 
                        ? "bg-amber-500/20 border-amber-500/50 text-amber-400 shadow-lg shadow-amber-500/10" 
                        : "bg-white/5 border-transparent text-gray-400 hover:text-white"
                    )}
                  >
                    <Zap size={10} className={cn(demoMode && "fill-current animate-pulse text-amber-400")} />
                    Demo Mode
                  </button>
                  <button 
                    onClick={togglePresentation}
                    className={cn(
                      "h-10 px-3 rounded-xl border flex items-center justify-center gap-1.5 text-[8px] font-black uppercase tracking-wider transition-all",
                      presentation 
                        ? "bg-primary/20 border-primary/50 text-primary shadow-lg shadow-primary/10" 
                        : "bg-white/5 border-transparent text-gray-400 hover:text-white"
                    )}
                  >
                    {presentation ? <Eye size={10} /> : <EyeOff size={10} />}
                    Present Mode
                  </button>
                </div>
              </div>

              {/* Language Shortcuts */}
              <div className="space-y-2.5">
                <h5 className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Language Portal</h5>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setLanguage('en')}
                    className={cn(
                      "h-10 px-3 rounded-xl border text-[8px] font-black uppercase tracking-wider transition-all",
                      language === 'en' 
                        ? "bg-white text-black border-white font-extrabold shadow-lg" 
                        : "bg-white/5 border-transparent text-gray-400 hover:text-white"
                    )}
                  >
                    English (EN)
                  </button>
                  <button 
                    onClick={() => setLanguage('sw')}
                    className={cn(
                      "h-10 px-3 rounded-xl border text-[8px] font-black uppercase tracking-wider transition-all",
                      language === 'sw' 
                        ? "bg-white text-black border-white font-extrabold shadow-lg" 
                        : "bg-white/5 border-transparent text-gray-400 hover:text-white"
                    )}
                  >
                    Kiswahili (SW)
                  </button>
                </div>
              </div>

              {/* Collapsible Trigger Section */}
              <div className="space-y-3">
                <h5 className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Interactive Webhook Dispatches</h5>
                
                {/* 1. CORE OPERATIONS */}
                <div className="border border-white/5 rounded-2xl overflow-hidden bg-white/[0.01]">
                  <button 
                    onClick={() => setOpenSection(openSection === 'workflows' ? null : 'workflows')}
                    className="w-full px-4 py-3 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-gray-300 hover:bg-white/5 transition-all"
                  >
                    <span>1. Core Bookings</span>
                    <ChevronDown size={12} className={cn("transition-transform duration-200", openSection === 'workflows' && "rotate-180")} />
                  </button>
                  {openSection === 'workflows' && (
                    <div className="p-3 pt-0 flex flex-col gap-1.5 animate-in slide-in-from-top-1 duration-200">
                      {[
                        { key: 'volta-booking', label: 'Place Booking', desc: '/volta-booking', icon: Sparkles },
                        { key: 'payment-verified', label: 'Verify Payment', desc: '/payment-verified', icon: Zap },
                        { key: 'booking-status-updated', label: 'Update Status', desc: '/booking-status-updated', icon: ShieldCheck }
                      ].map(trigger => (
                        <button
                          key={trigger.key}
                          disabled={triggering !== null}
                          onClick={() => triggerMockWebhook(trigger.key)}
                          className="w-full p-2.5 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-between text-[8px] font-black uppercase tracking-wider transition-all disabled:opacity-50"
                        >
                          <div className="flex items-center gap-2">
                            <trigger.icon size={12} className="text-primary shrink-0" />
                            <div className="text-left leading-normal">
                              <div className="text-white">{trigger.label}</div>
                              <div className="text-[7px] text-gray-400 font-mono normal-case">{trigger.desc}</div>
                            </div>
                          </div>
                          {triggering === trigger.key ? (
                            <Loader2 size={10} className="animate-spin text-primary" />
                          ) : (
                            <Play size={8} className="fill-current text-gray-400" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. FLEET & STAFF */}
                <div className="border border-white/5 rounded-2xl overflow-hidden bg-white/[0.01]">
                  <button 
                    onClick={() => setOpenSection(openSection === 'fleet' ? null : 'fleet')}
                    className="w-full px-4 py-3 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-gray-300 hover:bg-white/5 transition-all"
                  >
                    <span>2. Fleet & Staff</span>
                    <ChevronDown size={12} className={cn("transition-transform duration-200", openSection === 'fleet' && "rotate-180")} />
                  </button>
                  {openSection === 'fleet' && (
                    <div className="p-3 pt-0 flex flex-col gap-1.5 animate-in slide-in-from-top-1 duration-200">
                      {[
                        { key: 'car-added', label: 'Add Fleet Car', desc: '/car-added', icon: Car },
                        { key: 'driver-added', label: 'Add Fleet Driver', desc: '/driver-added', icon: UserPlus }
                      ].map(trigger => (
                        <button
                          key={trigger.key}
                          disabled={triggering !== null}
                          onClick={() => triggerMockWebhook(trigger.key)}
                          className="w-full p-2.5 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-between text-[8px] font-black uppercase tracking-wider transition-all disabled:opacity-50"
                        >
                          <div className="flex items-center gap-2">
                            <trigger.icon size={12} className="text-primary shrink-0" />
                            <div className="text-left leading-normal">
                              <div className="text-white">{trigger.label}</div>
                              <div className="text-[7px] text-gray-400 font-mono normal-case">{trigger.desc}</div>
                            </div>
                          </div>
                          {triggering === trigger.key ? (
                            <Loader2 size={10} className="animate-spin text-primary" />
                          ) : (
                            <Play size={8} className="fill-current text-gray-400" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. SIGNALS & COMMUNICATIONS */}
                <div className="border border-white/5 rounded-2xl overflow-hidden bg-white/[0.01]">
                  <button 
                    onClick={() => setOpenSection(openSection === 'accounts' ? null : 'accounts')}
                    className="w-full px-4 py-3 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-gray-300 hover:bg-white/5 transition-all"
                  >
                    <span>3. Users & Telegram</span>
                    <ChevronDown size={12} className={cn("transition-transform duration-200", openSection === 'accounts' && "rotate-180")} />
                  </button>
                  {openSection === 'accounts' && (
                    <div className="p-3 pt-0 flex flex-col gap-1.5 animate-in slide-in-from-top-1 duration-200">
                      {[
                        { key: 'volta-user-register', label: 'User Registration', desc: '/volta-user-register', icon: UserPlus },
                        { key: 'telegram-webhook', label: 'Telegram Bot Node', desc: '/volta-tg-bot/webhook', icon: Send }
                      ].map(trigger => (
                        <button
                          key={trigger.key}
                          disabled={triggering !== null}
                          onClick={() => triggerMockWebhook(trigger.key)}
                          className="w-full p-2.5 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-between text-[8px] font-black uppercase tracking-wider transition-all disabled:opacity-50"
                        >
                          <div className="flex items-center gap-2">
                            <trigger.icon size={12} className="text-primary shrink-0" />
                            <div className="text-left leading-normal">
                              <div className="text-white">{trigger.label}</div>
                              <div className="text-[7px] text-gray-400 font-mono normal-case">{trigger.desc}</div>
                            </div>
                          </div>
                          {triggering === trigger.key ? (
                            <Loader2 size={10} className="animate-spin text-primary" />
                          ) : (
                            <Play size={8} className="fill-current text-gray-400" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Webhook Response Console */}
              {triggerResult && (
                <div className="bg-[#05050c] border border-white/10 rounded-xl p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[7px] font-black uppercase text-gray-400">Execution Response</span>
                    <span className={cn(
                      "text-[7px] font-black px-1 rounded",
                      triggerResult.status === 200 || triggerResult.status === 201
                        ? "bg-emerald-500/10 text-emerald-400" 
                        : "bg-rose-500/10 text-rose-400"
                    )}>
                      HTTP {triggerResult.status}
                    </span>
                  </div>
                  <pre className="text-[8px] font-mono text-gray-300 overflow-x-auto whitespace-pre-wrap leading-tight max-h-24 no-scrollbar">
                    {triggerResult.body}
                  </pre>
                </div>
              )}

              {/* Native PWA Installer Trigger */}
              <div className="border-t border-white/10 pt-4">
                {isInstalled ? (
                  <div className="flex items-center gap-2 justify-center py-2 text-emerald-400 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                    <CheckCircle2 size={12} />
                    <span className="text-[8px] font-black uppercase tracking-wider">standalone Web PWA Active</span>
                  </div>
                ) : (
                  <button 
                    onClick={handleInstallPWA}
                    className="w-full h-11 bg-gradient-to-r from-primary to-rose-600 text-white rounded-xl flex items-center justify-center gap-2 text-[8px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:from-primary/95 hover:to-rose-650 transition-all active:scale-95"
                  >
                    <Smartphone size={12} className="animate-bounce shrink-0" />
                    Install App on Mobile / Desk
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (isOpen) {
            setShowIOSInstructions(false);
          }
        }}
        className={cn(
          "h-14 w-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl relative border",
          isOpen 
            ? "bg-white text-black border-white scale-95" 
            : "bg-primary hover:bg-primary/95 text-white border-primary/20 animate-pulse hover:scale-105"
        )}
        aria-label="Toggle Demo Suite"
      >
        {isOpen ? (
          <ChevronUp size={22} className="rotate-180 transition-transform duration-300" />
        ) : (
          <>
            <Sparkles size={20} className="text-secondary fill-current" />
            {(deferredPrompt || isIOS) && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-emerald-500 text-white font-black text-[8px] rounded-full flex items-center justify-center animate-bounce shadow">
                !
              </span>
            )}
          </>
        )}
      </button>
    </div>
  );
}
