'use client';

import React from "react";
import Link from "next/link";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Instagram, 
  Facebook, 
  Twitter, 
  Linkedin, 
  MessageCircle, 
  Zap
} from "lucide-react";
import { ChevronRightIcon } from "@radix-ui/react-icons";
import { Button } from "./ui/button";
import { useBranding } from "@/components/providers/BrandingProvider";
import { FlickeringGrid } from "./ui/flickering-footer";
import { useMediaQuery } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { StaggerContainer, StaggerItem } from "@/components/ui/AnimatedSection";
import { ShareButton } from "@/components/sharing/ShareButton";

export function Footer() {
  const { companyName, logoUrl, officeAddress, supportEmail, whatsappNumber, mode } = useBranding();
  const tablet = useMediaQuery("(max-width: 1024px)");

  const brandName = companyName || "VoltaRentals";
  const nameParts = brandName.split(' ');
  const firstName = nameParts[0];
  const secondName = nameParts.slice(1).join(' ');

  const footerLinks = [
    {
      title: "Fleet Registry",
      links: [
        { title: "All Vehicles", url: "/fleet" },
        { title: "SUV Portfolio", url: "/fleet" },
        { title: "Executive Sedans", url: "/fleet" },
        { title: "VIP Collection", url: "/fleet" },
      ],
    },
    {
      title: "Quick Access",
      links: [
        { title: "Book Now", url: "/book" },
        { title: "About Us", url: "/about" },
        { title: "Contact Hub", url: "/contact" },
        { title: "FAQs", url: "/faq" },
      ],
    },
    {
      title: "Legal",
      links: [
        { title: "Terms of Service", url: "/terms" },
        { title: "Privacy Policy", url: "/privacy" },
        { title: "Cookie Settings", url: "/cookies" },
      ],
    },
  ];

  return (
    <footer id="footer" className="relative w-full pt-32 bg-background overflow-hidden border-t border-border">
      <StaggerContainer 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-20"
        staggerDelay={0.1}
        delayChildren={0.1}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24">
          
          <StaggerItem direction="up" className="lg:col-span-4 space-y-8">
            <Link href="/" className="flex items-center gap-4 group">
              {logoUrl ? (
                <img src={logoUrl} alt={brandName} className="h-10 w-auto object-contain transition-transform group-hover:scale-110" />
              ) : (
                <div className="h-12 w-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-2xl transition-transform group-hover:rotate-12">
                  <Zap size={24} fill="currentColor" />
                </div>
              )}
              <span className="text-3xl font-black text-foreground tracking-tighter uppercase leading-none">
                {firstName}
                {secondName && <span className="text-primary italic"> {secondName}</span>}
              </span>
            </Link>
            <p className="text-muted-foreground text-lg leading-relaxed font-medium italic border-l-2 border-primary/20 pl-8 max-w-sm">
              "The premier logistical partner for elite travelers and critical corporate missions across the United Republic."
            </p>
            <div className="flex gap-4 items-center">
              {[Instagram, Facebook, Twitter, Linkedin].map((Icon, i) => (
                <Link 
                  key={i} 
                  href="#" 
                  aria-label={`Follow ${brandName} on social media`}
                  className="h-12 w-12 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all shadow-xl group"
                >
                  <Icon className="h-5 w-5 transition-transform group-hover:scale-110" />
                </Link>
              ))}
              <div className="h-12 w-px bg-border mx-2" />
              <ShareButton shareType="website" variant="icon" />
            </div>
          </StaggerItem>

          <div className="lg:col-span-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
              {footerLinks.map((column, columnIndex) => (
                <StaggerItem key={columnIndex} direction="up" className="space-y-6">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">
                    {column.title}
                  </h3>
                  <ul className="space-y-4">
                    {column.links.map((link, linkIndex) => (
                      <li key={linkIndex} className="group flex items-center justify-start gap-1">
                        <Link 
                          href={link.url} 
                          className="text-sm font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {link.title}
                        </Link>
                        <div className="flex size-4 items-center justify-center border border-border rounded translate-x-0 transform opacity-0 transition-all duration-300 ease-out group-hover:translate-x-1 group-hover:opacity-100">
                          <ChevronRightIcon className="h-3 w-3 text-primary" />
                        </div>
                      </li>
                    ))}
                  </ul>
                </StaggerItem>
              ))}
            </div>
          </div>
        </div>

        <StaggerItem direction="up" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 py-16 border-t border-white/5">
          <div className="flex items-start gap-5">
            <MapPin className="h-6 w-6 text-primary shrink-0" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">HQ Registry</p>
              <p className="text-sm font-bold text-foreground leading-tight">{officeAddress}</p>
            </div>
          </div>
          <div className="flex items-start gap-5">
            <Phone className="h-6 w-6 text-primary shrink-0" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">Direct Node</p>
              <p className="text-sm font-black text-foreground">{whatsappNumber}</p>
            </div>
          </div>
          <div className="flex items-center">
            <Button asChild className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl gap-3 shadow-2xl active:scale-95 transition-all uppercase tracking-widest text-xs">
              <a href={`https://wa.me/${whatsappNumber?.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                <MessageCircle size={20} /> Initialize Session
              </a>
            </Button>
          </div>
        </StaggerItem>

        <div className="py-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[9px] font-black uppercase tracking-[0.5em] text-muted-foreground/40 italic">
            © 2026 {brandName.toUpperCase()} • LICENSED OPERATIONAL PROTOCOL • TZ-NODE-01
          </p>
          <div className="flex flex-wrap justify-center gap-10 text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">
            <Link href="/terms" className="hover:text-primary transition-colors py-2 px-4">Terms</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors py-2 px-4">Privacy</Link>
            <Link href="/cookies" className="hover:text-primary transition-colors py-2 px-4">Cookies</Link>
          </div>
        </div>
      </StaggerContainer>

      {/* Cinematic Flickering Background - Uses the new integrated engine */}
      <div className="w-full h-48 md:h-72 relative mt-12 z-0">
        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-background z-10 from-20%" />
        <div className="absolute inset-0">
          <FlickeringGrid
            text={tablet ? firstName : `${firstName} ${secondName}`}
            fontSize={tablet ? 70 : 110}
            className="h-full w-full"
            squareSize={2}
            gridGap={3}
            color="hsl(var(--primary))"
            maxOpacity={mode === 'light' ? 0.3 : 0.2}
            flickerChance={0.1}
          />
        </div>
      </div>
    </footer>
  );
}
