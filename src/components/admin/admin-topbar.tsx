'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Search, 
  Bell, 
  User, 
  Settings, 
  LogOut,
  X,
  ChevronRight,
  ShieldCheck,
  Menu
} from 'lucide-react';
import { useUser, useAuth, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import NotificationList from "@/components/notifications/NotificationList";
import { Input } from '@/components/ui/input';
import { motion as m, AnimatePresence } from 'framer-motion';
import { ModeToggle } from '@/components/ui/ModeToggle';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';

export function AdminTopbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const notifQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      limit(10)
    );
  }, [db, user?.uid]);
  
  const { data: notifications } = useCollection(notifQuery);
  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  const routeMap: Record<string, string> = {
    '/admin': 'Master Overview',
    '/admin/bookings': 'Reservation Registry',
    '/admin/cars': 'Fleet Inventory Hub',
    '/admin/payments': 'Financial Verification',
    '/admin/analytics': 'Business Intelligence',
    '/admin/reports': 'Audit Archives',
    '/admin/users': 'Customer CRM',
    '/admin/reviews': 'Feedback Protocol',
    '/admin/messages': 'Communication Node',
    '/admin/settings': 'System Protocols',
    '/super-admin': 'Supreme Master Control',
  };

  const getTitle = () => {
    for (const route in routeMap) {
      if (pathname.startsWith(route)) return routeMap[route];
    }
    return 'Admin Command';
  };

  const breadcrumbs = pathname.split('/').filter(Boolean);

  const handleLogout = async () => {
    await signOut(auth);
    document.cookie = "user-role=; path=/; max-age=0";
    document.cookie = "user-uid=; path=/; max-age=0";
    window.location.href = '/';
  };

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40">
      <div className="flex items-center gap-4 lg:gap-6">
        <Button 
          variant="ghost" 
          size="icon" 
          className="lg:hidden rounded-xl text-muted-foreground"
          onClick={onMenuClick}
        >
          <Menu size={20} />
        </Button>
        <div className="hidden lg:block">
          <h2 className="text-lg font-black tracking-tight text-foreground leading-none">{getTitle()}</h2>
          <div className="flex items-center gap-1.5 mt-1">
            {breadcrumbs.map((segment, i) => (
              <React.Fragment key={segment}>
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{segment}</span>
                {i < breadcrumbs.length - 1 && <ChevronRight className="h-2 w-2 text-muted-foreground/30" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <ModeToggle />
        <LanguageToggle />
        
        <AnimatePresence>
          {searchOpen ? (
            <m.div 
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 250 }}
              exit={{ opacity: 0, width: 0 }}
              className="relative"
            >
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const term = searchQuery.toLowerCase();
                  const match = Object.entries(routeMap).find(([path, name]) => 
                    name.toLowerCase().includes(term) || path.toLowerCase().includes(term)
                  );
                  if (match) {
                    router.push(match[0]);
                    setSearchOpen(false);
                    setSearchQuery('');
                  } else {
                    toast({ title: 'No matching terminal found.', variant: 'destructive' });
                  }
                }}
                className="relative"
              >
                <Input 
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Query registry..." 
                  className="h-10 rounded-xl pr-10 bg-muted border-none text-foreground text-xs font-bold"
                />
                <button 
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-primary"
                >
                  <X size={16} />
                </button>
              </form>
            </m.div>
          ) : (
            <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground" onClick={() => setSearchOpen(true)}>
              <Search className="h-5 w-5" />
            </Button>
          )}
        </AnimatePresence>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-xl relative text-muted-foreground">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0 border-none">
            <NotificationList notifications={notifications} userId={user?.uid || ''} />
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 hover:bg-muted p-1.5 rounded-2xl transition-all border border-transparent hover:border-border">
              <div className="h-8 w-8 rounded-xl bg-primary text-white flex items-center justify-center font-black text-xs shadow-lg shadow-primary/20">
                {user?.photoURL ? <img src={user.photoURL} className="w-full h-full object-cover rounded-xl" /> : user?.displayName?.charAt(0) || 'A'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-black leading-none text-foreground">{user?.displayName?.split(' ')[0] || 'Admin'}</p>
                <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Admin Protocol</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-2xl bg-card border-border">
            <DropdownMenuLabel className="font-black text-[9px] uppercase tracking-widest text-muted-foreground px-3 py-2 text-center border-b border-border mb-2">Authority Profile</DropdownMenuLabel>
            
            <DropdownMenuItem asChild>
              <Link href="/admin/profile" className="rounded-xl h-11 font-bold gap-4 text-foreground focus:bg-primary focus:text-white cursor-pointer px-4 flex items-center">
                 <User size={18} /> <span className="text-sm">Personal Registry</span>
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem asChild>
              <Link href={user?.role === 'super_admin' ? "/super-admin/settings" : "/admin/settings"} className="rounded-xl h-11 font-bold gap-4 text-foreground focus:bg-primary focus:text-white cursor-pointer px-4 flex items-center">
                 <Settings size={18} /> <span className="text-sm">Global Config</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-border my-2" />
            
            <DropdownMenuItem 
              onClick={handleLogout}
              className="rounded-xl h-11 font-bold gap-4 text-red-500 focus:bg-red-500/10 cursor-pointer px-4 flex items-center"
            >
              <LogOut size={18} /> <span className="text-sm">Terminate Session</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}