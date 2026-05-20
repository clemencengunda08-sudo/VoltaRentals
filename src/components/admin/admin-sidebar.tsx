'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Car, 
  CreditCard, 
  PieChart, 
  Users, 
  Star, 
  MessageSquare, 
  Settings, 
  ShieldAlert,
  ChevronLeft,
  LogOut,
  Zap,
  X,
  Image as ImageIcon,
  Palette,
  Truck,
  UserCheck,
  ShieldCheck,
  UserPlus,
  Database
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useBranding } from '@/components/providers/BrandingProvider';

const NAV_GROUPS = [
  {
    label: "Operations",
    key: "operations",
    items: [
      { icon: LayoutDashboard, label: "Command Center", key: "commandCenter", href: "/admin", color: "text-blue-400", roles: ['super_admin', 'admin', 'company_admin', 'staff', 'viewer'] },
      { icon: ClipboardList, label: "Registry Orders", key: "registryOrders", href: "/admin/bookings", color: "text-yellow-400", roles: ['super_admin', 'admin', 'company_admin', 'staff', 'viewer'] },
      { icon: UserPlus, label: "Manual Booking", key: "manualBooking", href: "/admin/bookings/manual", color: "text-emerald-400", roles: ['super_admin', 'admin', 'company_admin', 'staff'] },
      { icon: Car, label: "Fleet Control", key: "fleetControl", href: "/admin/cars", color: "text-emerald-400", roles: ['super_admin', 'admin', 'company_admin', 'staff', 'viewer'] },
      { icon: UserCheck, label: "Driver Dispatch", key: "driverDispatch", href: "/admin/drivers", color: "text-orange-400", roles: ['super_admin', 'admin', 'company_admin', 'staff'] },
    ]
  },
  {
    label: "Intelligence",
    key: "intelligence",
    items: [
      { icon: CreditCard, label: "Financial Ledger", key: "financialLedger", href: "/admin/payments", color: "text-red-400", roles: ['super_admin', 'admin', 'company_admin', 'viewer'] },
      { icon: PieChart, label: "Analytics Terminal", key: "analyticsTerminal", href: "/admin/analytics", color: "text-purple-400", roles: ['super_admin', 'admin', 'company_admin'] },
    ]
  },
  {
    label: "Management",
    key: "management",
    items: [
      { icon: Users, label: "Elite Travelers", key: "eliteTravelers", href: "/admin/users", color: "text-orange-400", roles: ['super_admin', 'admin', 'company_admin', 'staff'] },
      { icon: Star, label: "Feedback Audit", key: "feedbackAudit", href: "/admin/reviews", color: "text-pink-400", roles: ['super_admin', 'admin', 'company_admin', 'staff'] },
      { icon: MessageSquare, label: "Inquiry Hub", key: "inquiryHub", href: "/admin/messages", color: "text-cyan-400", roles: ['super_admin', 'admin', 'company_admin', 'staff'] },
      { icon: Settings, label: "Compliance (TRA)", key: "complianceTRA", href: "/admin/settings", color: "text-emerald-500", roles: ['super_admin', 'admin', 'company_admin'] },
    ]
  },
  {
    label: "Supreme Authority",
    key: "supremeAuthority",
    items: [
      { icon: ShieldAlert, label: "Master Command", key: "masterCommand", href: "/super-admin", color: "text-rose-500", roles: ['super_admin'] },
      { icon: Users, label: "Authority Registry", key: "authorityRegistry", href: "/super-admin/admins", color: "text-indigo-400", roles: ['super_admin'] },
      { icon: Palette, label: "Theme Studio", key: "themeStudio", href: "/super-admin/settings/theme", color: "text-purple-400", roles: ['super_admin'] },
      { icon: ImageIcon, label: "Visual Media", key: "visualMedia", href: "/super-admin/media", color: "text-amber-400", roles: ['super_admin'] },
      { icon: Zap, label: "Automation Hub", key: "automationHub", href: "/super-admin/settings?tab=automation", color: "text-primary", roles: ['super_admin'] },
      { icon: Database, label: "Maintenance Protocol", key: "maintenanceProtocol", href: "/super-admin/maintenance", color: "text-red-500", roles: ['super_admin'] },
      { icon: Settings, label: "Global Protocols", key: "globalProtocols", href: "/super-admin/settings", color: "text-zinc-400", roles: ['super_admin'] },
    ]
  }
];

const SUPREME_MASTERS = [
  'clemencengunda08@gmail.com',
  'davidbyanmwijage@gmail.com',
  'super_admin@voltarentals.com'
];

export function AdminSidebar({ isOpen, onClose }: { isOpen?: boolean, onClose?: () => void }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { user } = useUser();
  const auth = useAuth();
  const { companyName } = useBranding();
  const { t } = useLanguage();

  const userRole = user?.role || 'admin';
  const isSuperAdmin = userRole === 'super_admin' || (user?.email && SUPREME_MASTERS.includes(user.email));

  return (
    <motion.aside
      initial={false}
      animate={{ 
        width: collapsed ? 80 : 280,
        x: (typeof window !== 'undefined' && window.innerWidth < 1024) 
          ? (isOpen ? 0 : -280) 
          : 0
      }}
      className={cn(
        "h-screen bg-card border-r border-border flex flex-col fixed lg:relative z-50 transition-all duration-300 ease-in-out shadow-2xl lg:shadow-none",
        "lg:translate-x-0"
      )}
    >
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[-1] lg:hidden" 
          onClick={onClose}
        />
      )}
      <div className="h-20 flex items-center px-6 border-b border-border overflow-hidden">
        <Link href="/admin" className="flex items-center gap-3 shrink-0" onClick={onClose}>
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Zap className="h-6 w-6 text-secondary fill-current" />
          </div>
          <AnimatePresence>
            {(!collapsed || (typeof window !== 'undefined' && window.innerWidth < 1024)) && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="whitespace-nowrap"
              >
                <p className="font-black text-foreground text-lg leading-none tracking-tighter uppercase">{(companyName || 'Volta').split(' ')[0]}<span className="text-primary">Node</span></p>
                <p className="text-[8px] text-muted-foreground font-black uppercase tracking-widest mt-1">Authority: {isSuperAdmin ? 'SUPER ADMIN' : 'ADMINISTRATOR'}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
        
        {/* Mobile Close Button */}
        <button onClick={onClose} className="lg:hidden ml-auto text-muted-foreground hover:text-primary">
          <X size={20} />
        </button>
      </div>

      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-24 h-7 w-7 rounded-full bg-primary text-white border-2 border-background flex items-center justify-center hover:scale-110 transition-transform z-50 shadow-xl hidden lg:flex"
      >
        <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
      </button>

      <nav className="flex-1 overflow-y-auto no-scrollbar py-8 px-4 space-y-8">
        {NAV_GROUPS.map((group) => {
          const visibleItems = group.items.filter(item => {
            if (isSuperAdmin) return true;
            return item.roles.includes(userRole);
          });
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.key} className="space-y-2">
              {!collapsed && (
                <p className="px-4 text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/30">{t(group.key, group.label)}</p>
              )}
              <div className="space-y-1">
                {visibleItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                  return (
                    <TooltipProvider key={item.key} delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link
                            href={item.href}
                            onClick={onClose}
                            className={cn(
                              "flex items-center gap-4 px-4 h-12 rounded-xl transition-all relative group",
                              isActive 
                                ? "bg-primary text-white shadow-xl" 
                                : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                            )}
                          >
                            <item.icon className={cn("h-5 w-5 shrink-0 transition-transform group-hover:scale-110", isActive ? "text-secondary fill-current" : item.color)} />
                            {(!collapsed || (typeof window !== 'undefined' && window.innerWidth < 1024)) && (
                              <span className="text-[10px] font-black uppercase tracking-widest">{t(item.key, item.label)}</span>
                            )}
                            {isActive && !collapsed && (
                              <motion.div 
                                layoutId="sidebar-active"
                                className="absolute right-0 w-1 h-6 bg-secondary rounded-full"
                              />
                            )}
                          </Link>
                        </TooltipTrigger>
                        {collapsed && (
                          <TooltipContent side="right" className="bg-primary border-none text-white font-black text-[10px] uppercase tracking-widest px-4 py-2">
                            {item.label}
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="p-6 border-t border-border space-y-4">
        <div className="flex items-center gap-3 px-2">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary border border-primary/20 shrink-0 overflow-hidden relative">
            {user?.photoURL ? (
              <img 
                src={user.photoURL} 
                className="w-full h-full object-cover" 
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).parentElement!.innerText = user?.displayName?.charAt(0) || 'A';
                }}
              />
            ) : user?.displayName?.charAt(0) || 'A'}
          </div>
          {!collapsed || (typeof window !== 'undefined' && window.innerWidth < 1024) ? (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-foreground truncate uppercase">{user?.displayName?.split(' ')[0] || 'Admin'}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                 <ShieldCheck size={8} className="text-emerald-500" />
                 <p className="text-[7px] text-muted-foreground font-bold truncate uppercase tracking-widest">
                   {isSuperAdmin ? t('masterArchitect', 'MASTER ARCHITECT') : t('adminProtocol', 'ADMIN PROTOCOL')}
                 </p>
              </div>
            </div>
          ) : null}
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={async () => {
             await signOut(auth);
             document.cookie = "user-role=; path=/; max-age=0";
             document.cookie = "user-uid=; path=/; max-age=0";
             window.location.href = '/';
          }}
          className={cn(
            "w-full rounded-xl text-muted-foreground hover:bg-red-500/10 hover:text-red-500 justify-start h-12 transition-all",
            collapsed && "px-0 justify-center"
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {(!collapsed || (typeof window !== 'undefined' && window.innerWidth < 1024)) && (
            <span className="ml-3 text-[10px] font-black uppercase tracking-widest">{t('terminateSession', 'Terminate Session')}</span>
          )}
        </Button>
      </div>
    </motion.aside>
  );
}
