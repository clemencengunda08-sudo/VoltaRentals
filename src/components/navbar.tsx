"use client";

import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LogOut, 
  Loader2, 
  Zap,
  Menu,
  X,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUser, useAuth, useFirestore } from "@/firebase";
import { signOut } from "firebase/auth";
import { toast } from "@/hooks/use-toast";
import { doc, getDoc } from "firebase/firestore";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { useBranding } from "@/components/providers/BrandingProvider";
import { ModeToggle } from "@/components/ui/ModeToggle";
import { MenuVertical } from "@/components/ui/menu-vertical";

const NAV_LINKS = [
  { name: "Fleet Registry", href: "/fleet" },
  { name: "Find My Car", href: "/find-my-car", icon: Sparkles },
  { name: "Reserve Asset", href: "/book" },
  { name: "The Standard", href: "/about" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const db = useFirestore();
  const { companyName, logoUrl } = useBranding();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const { user, loading: userLoading } = useUser();
  const auth = useAuth();

  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  // PREVENT BODY SCROLL AND GHOSTING WHEN MENU OPEN
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 60);
  });

  useEffect(() => {
    async function fetchRole() {
      if (user) {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) setUserRole(snap.data().role);
      } else {
        setUserRole(null);
      }
    }
    fetchRole();
  }, [user, db]);

  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      await signOut(auth);
      document.cookie = "user-role=; path=/; max-age=0";
      document.cookie = "user-uid=; path=/; max-age=0";
      toast({ title: "Secure exit protocol complete" });
      window.location.href = "/";
    } finally {
      setIsLoggingOut(false);
    }
  }, [auth]);

  const isStaff = userRole === 'admin' || userRole === 'super_admin';

  const brandParts = (companyName || "Volta Rentals").split(' ');
  const firstName = brandParts[0];
  const restOfName = brandParts.slice(1).join(' ');

  const menuContainerVariants = {
    hidden: { opacity: 0, x: "100%" },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.4, 
        ease: [0.16, 1, 0.3, 1],
      }
    },
    exit: { 
      opacity: 0, 
      x: "100%",
      transition: { duration: 0.3, ease: "easeInOut" }
    }
  };

  return (
    <motion.nav 
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] transition-all duration-500 flex items-center",
        scrolled 
          ? "py-3 bg-background/85 backdrop-blur-2xl border-b border-border shadow-2xl shadow-black/20" 
          : "py-6 bg-transparent border-b border-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between px-4 sm:px-6 lg:px-12">
        <Link href="/" aria-label={`${companyName || "Volta Rentals"} Home`} className="flex items-center gap-3 group shrink-0">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-3"
          >
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt={companyName} 
                className={cn(
                  "w-auto object-contain transition-all duration-500",
                  scrolled ? "h-7" : "h-9"
                )} 
              />
            ) : (
              <div className={cn(
                "flex items-center justify-center rounded-xl bg-primary text-white shadow-xl transition-all duration-500",
                scrolled ? "h-8 w-8" : "h-10 w-10"
              )}>
                <Zap size={scrolled ? 16 : 20} fill="currentColor" />
              </div>
            )}
            <span className={cn(
              "font-black tracking-tighter uppercase transition-all duration-500",
              scrolled ? "text-lg" : "text-xl",
              "text-foreground" 
            )}>
              {firstName}<span className="text-primary italic">{restOfName ? ` ${restOfName}` : ""}</span>
            </span>
          </motion.div>
        </Link>

        <div className="hidden lg:flex items-center gap-10">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link key={link.name} href={link.href} className="relative group px-2 py-1">
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-300 flex items-center gap-2",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}>
                  {link.name}
                </span>
                <motion.span
                  className="absolute -bottom-1 left-0 h-[2.5px] bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ 
                    width: isActive ? '100%' : '0%' 
                  }}
                  whileHover={{ width: '100%' }}
                  transition={{ duration: 0.3 }}
                />
              </Link>
            );
          })}
        </div>

        <div className="hidden lg:flex items-center gap-4">
          <ModeToggle />
          {!userLoading && (
            user ? (
              <div className="flex items-center gap-3">
                {isStaff && (
                  <Link href={userRole === 'super_admin' ? "/super-admin" : "/admin"}>
                    <Button variant="outline" className="h-9 px-6 rounded-xl border-primary/20 bg-muted text-primary font-black uppercase text-[9px] tracking-widest hover:bg-primary hover:text-white transition-all shadow-lg">
                      Terminal
                    </Button>
                  </Link>
                )}
                <Link href="/dashboard" aria-label="User Dashboard">
                   <div className="h-10 w-10 rounded-2xl bg-muted border border-border flex items-center justify-center text-muted-foreground hover:text-primary transition-all cursor-pointer shadow-inner">
                      <Zap size={18} fill="currentColor" />
                   </div>
                </Link>
                <Button 
                  variant="ghost" 
                  aria-label="Logout"
                  className="h-10 w-10 p-0 rounded-2xl text-muted-foreground hover:text-red-500 transition-all" 
                  onClick={handleLogout} 
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? <Loader2 className="h-4 w-4 animate-pulse" /> : <LogOut size={18} />}
                </Button>
              </div>
            ) : (
              <Link href="/auth">
                <Button className="bg-primary text-primary-foreground font-black px-8 rounded-2xl uppercase text-[10px] tracking-widest h-11 shadow-2xl hover:opacity-90 active:scale-95 transition-all">
                  Initialize Access
                </Button>
              </Link>
            )
          )}
        </div>

        <div className="flex lg:hidden items-center gap-4">
          <ModeToggle />
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            aria-label={isOpen ? "Close Menu" : "Open Menu"}
            aria-expanded={isOpen}
            className="h-10 w-10 flex items-center justify-center text-foreground hover:text-primary transition-all active:scale-90"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            variants={menuContainerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed top-0 left-0 w-full h-[100dvh] bg-background lg:hidden z-[110] flex flex-col p-6 sm:p-10 space-y-8 overflow-y-auto pb-24"
          >
            <div className="flex justify-between items-center mb-8 shrink-0">
              <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-2">
                <Zap className="text-primary h-8 w-8 fill-current" />
                <span className="font-black text-xl tracking-tighter uppercase text-foreground">
                  Volta<span className="text-primary italic">Rentals</span>
                </span>
              </Link>
              <button onClick={() => setIsOpen(false)} className="h-12 w-12 flex items-center justify-center text-foreground">
                <X size={32} />
              </button>
            </div>

            <div className="relative z-10 pt-4 flex-1">
              <MenuVertical 
                menuItems={NAV_LINKS.map(link => ({ label: link.name, href: link.href }))}
                onItemClick={() => setIsOpen(false)}
              />
            </div>

            <div className="mt-auto pb-12 space-y-8 relative z-10">
              <div className="flex flex-col gap-4">
                {user ? (
                  <Button asChild className="h-16 rounded-[1.5rem] bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs shadow-2xl">
                    <Link href="/dashboard" onClick={() => setIsOpen(false)}>Access Expedition Node</Link>
                  </Button>
                ) : (
                  <Button asChild className="h-16 rounded-[1.5rem] bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs shadow-2xl">
                    <Link href="/auth" onClick={() => setIsOpen(false)}>Secure Access Hub</Link>
                  </Button>
                )}
              </div>
              
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                   <Link href="/terms" onClick={() => setIsOpen(false)}>Terms</Link>
                   <Link href="/privacy" onClick={() => setIsOpen(false)}>Privacy</Link>
                   <Link href="/cookies" onClick={() => setIsOpen(false)}>Cookies</Link>
                </div>
                <p className="text-[9px] font-black uppercase tracking-[0.5em] text-muted-foreground/30">Volta Rentals Tanzania • Node 1.0</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
