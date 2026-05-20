'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Home, 
  CalendarDays, 
  User, 
  Zap,
  Bell,
  ShieldCheck,
  Loader2,
  LogOut,
  Car
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser, useAuth, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import NotificationList from "@/components/notifications/NotificationList";
import { useScroll, useMotionValueEvent } from "framer-motion";

const NAV_ITEMS = [
  { label: 'Home', icon: Home, path: '/dashboard' },
  { label: 'Fleet', icon: Car, path: '/fleet' },
  { label: 'Bookings', icon: CalendarDays, path: '/dashboard/bookings' },
  { label: 'Profile', icon: User, path: '/dashboard/profile' },
];

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 60);
  });
  
  const notifQuery = useMemoFirebase(() => {
    if (!user) return null;
    // REMOVED orderBy to prevent Index Errors and Vercel Crashes.
    // Client-side sorting is used instead.
    return query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      limit(20)
    );
  }, [db, user?.uid]);
  
  const { data: rawNotifications } = useCollection(notifQuery);
  
  const notifications = useMemo(() => {
    if (!rawNotifications) return [];
    // CLIENT-SIDE SORTING: Newest first protocol
    return [...rawNotifications].sort((a: any, b: any) => {
      const dateA = a.createdAt?.toDate?.() || new Date(0);
      const dateB = b.createdAt?.toDate?.() || new Date(0);
      return dateB.getTime() - dateA.getTime();
    });
  }, [rawNotifications]);

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  const handleLogout = async () => {
    await signOut(auth);
    document.cookie = "user-role=; path=/; max-age=0";
    document.cookie = "user-uid=; path=/; max-age=0";
    window.location.href = '/';
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin text-primary h-12 w-12" /></div>;
  if (!user) return null; 

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 lg:pb-0">
      <header className={cn(
        "h-20 flex items-center justify-between px-6 lg:px-12 sticky top-0 z-40 transition-all duration-500",
        scrolled ? "bg-card/90 backdrop-blur-xl border-b border-border shadow-lg" : "bg-card border-b border-border"
      )}>
        <Link href="/" className="flex items-center gap-2 group">
          <Zap className="text-primary h-8 w-8 fill-current group-hover:scale-110 transition-transform" />
          <span className={cn(
            "font-black text-white tracking-tighter uppercase transition-all",
            scrolled ? "text-lg" : "text-xl"
          )}>
            Volta<span className="text-primary italic">Rentals</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-10">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link 
                key={item.path} 
                href={item.path} 
                className={cn(
                  "text-[10px] font-black uppercase tracking-widest transition-all hover:text-primary",
                  isActive ? "text-primary border-b-2 border-primary pb-1" : "text-muted-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground relative">
                <Bell size={20} />
                {unreadCount > 0 && <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0 border-none">
              <NotificationList notifications={notifications} userId={user.uid} />
            </PopoverContent>
          </Popover>

          <div className="h-10 w-px bg-border mx-2 hidden lg:block" />
          
          <div className="flex items-center gap-3">
            <div className="hidden lg:block text-right">
              <p className="text-xs font-black text-white uppercase leading-none">{user.displayName || 'Client'}</p>
              <div className="flex items-center justify-end gap-1 mt-1">
                <ShieldCheck size={10} className="text-emerald-500" />
                <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Verified</span>
              </div>
            </div>
            <Avatar className="h-10 w-10 rounded-xl ring-2 ring-primary/20">
              <AvatarImage src={user.photoURL || ''} />
              <AvatarFallback className="bg-primary text-white font-black">{user.displayName?.charAt(0) || 'C'}</AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="h-10 w-10 text-muted-foreground hover:text-red-500"><LogOut size={18} /></Button>
          </div>
        </div>
      </header>

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto w-full">
        {children}
      </main>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border flex items-center justify-around px-4 z-50">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link 
              key={item.path} 
              href={item.path} 
              className={cn(
                "flex flex-col items-center gap-1 transition-all flex-1",
                isActive ? "text-primary" : "text-muted-foreground/60"
              )}
            >
              <item.icon size={20} />
              <span className="text-[9px] font-black uppercase tracking-tighter">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
