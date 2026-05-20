'use client';

import React, { useState } from 'react';
import { 
  Share2, 
  MoreHorizontal, 
  Check, 
  Copy 
} from 'lucide-react';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import * as shareUtils from "@/lib/sharing";
import { ShareCardPreview } from "./ShareCardPreview";

interface ShareButtonProps {
  shareType: "car" | "booking" | "website" | "fleet";
  data?: any;
  variant?: "icon" | "button" | "fab";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ShareButton({ 
  shareType, 
  data, 
  variant = "button", 
  size = "md",
  className 
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const getUrl = () => {
    if (typeof window === 'undefined') return 'https://voltarentals.co.tz';
    const baseUrl = window.location.origin;
    if (shareType === "car" && data?.id) return `${baseUrl}/cars/${data.id}`;
    if (shareType === "fleet") return `${baseUrl}/fleet`;
    return baseUrl;
  };

  const url = getUrl();

  const handleShare = async (platform: string) => {
    const text = shareType === "car" 
      ? shareUtils.generateCarShareMessage(data, url)
      : shareType === "booking"
      ? shareUtils.generateBookingShareMessage(data)
      : shareType === "fleet"
      ? shareUtils.generateFleetShareMessage(data)
      : shareUtils.generateWebsiteShareMessage();

    switch (platform) {
      case 'whatsapp':
        const shared = await shareUtils.nativeShare({ title: 'VoltaRentals', text, url });
        if (!shared) shareUtils.shareOnWhatsApp(text, url);
        break;
      case 'twitter':
        shareUtils.shareOnTwitter(text, url);
        break;
      case 'facebook':
        shareUtils.shareOnFacebook(url);
        break;
      case 'instagram':
        shareUtils.shareOnInstagramStory(url);
        break;
      case 'copy':
        await shareUtils.copyLink(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        break;
      case 'more':
        shareUtils.nativeShare({ title: 'VoltaRentals', text, url });
        break;
    }
  };

  const trigger = variant === "icon" ? (
    <Button variant="ghost" size="icon" className={cn("rounded-xl text-muted-foreground hover:text-primary", className)}>
      <Share2 size={size === 'sm' ? 14 : 18} />
    </Button>
  ) : variant === "fab" ? (
    <Button className={cn("fixed bottom-8 right-8 h-14 w-14 rounded-full bg-primary text-white shadow-3xl z-50", className)}>
      <Share2 size={24} />
    </Button>
  ) : (
    <Button 
      variant="outline" 
      size={size === 'md' ? 'default' : size} 
      className={cn("rounded-xl font-black uppercase text-[10px] tracking-widest gap-2", className)}
    >
      <Share2 size={size === 'sm' ? 14 : 16} /> Share
    </Button>
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        {trigger}
      </PopoverTrigger>
      <PopoverContent align="center" className="w-80 p-6 rounded-[2rem] bg-card border-border shadow-3xl">
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Share this experience</p>
          </div>

          {(shareType === "car" || shareType === "booking") && (
            <ShareCardPreview car={data} booking={data} type={shareType} />
          )}

          <div className="grid grid-cols-2 gap-3">
            {/* Row 1 */}
            <button 
              onClick={() => handleShare('whatsapp')}
              className="flex items-center gap-3 p-3 rounded-2xl bg-[#25D366]/5 hover:bg-[#25D366]/10 transition-all border border-transparent hover:border-[#25D366]/20 group"
            >
              <div className="h-9 w-9 rounded-full bg-[#25D366]/10 flex items-center justify-center text-[#25D366] shrink-0 group-hover:scale-110 transition-transform">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </div>
              <span className="text-[11px] font-bold text-foreground">WhatsApp</span>
            </button>

            <button 
              onClick={() => handleShare('twitter')}
              className="flex items-center gap-3 p-3 rounded-2xl bg-foreground/5 hover:bg-foreground/10 transition-all border border-transparent hover:border-foreground/20 group"
            >
              <div className="h-9 w-9 rounded-full bg-foreground/10 flex items-center justify-center text-foreground shrink-0 group-hover:scale-110 transition-transform">
                <span className="text-sm font-black">X</span>
              </div>
              <span className="text-[11px] font-bold text-foreground">Twitter</span>
            </button>

            {/* Row 2 */}
            <button 
              onClick={() => handleShare('facebook')}
              className="flex items-center gap-3 p-3 rounded-2xl bg-[#1877F2]/5 hover:bg-[#1877F2]/10 transition-all border border-transparent hover:border-[#1877F2]/20 group"
            >
              <div className="h-9 w-9 rounded-full bg-[#1877F2]/10 flex items-center justify-center text-[#1877F2] shrink-0 group-hover:scale-110 transition-transform">
                <span className="text-lg font-black lowercase">f</span>
              </div>
              <span className="text-[11px] font-bold text-foreground">Facebook</span>
            </button>

            <button 
              onClick={() => handleShare('instagram')}
              className="flex items-center gap-3 p-3 rounded-2xl bg-primary/5 hover:bg-primary/10 transition-all border border-transparent hover:border-primary/20 group"
            >
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform">
                <span className="text-[10px] font-black">IG</span>
              </div>
              <span className="text-[11px] font-bold text-foreground">Stories</span>
            </button>

            {/* Row 3 */}
            <button 
              onClick={() => handleShare('copy')}
              className="flex items-center gap-3 p-3 rounded-2xl bg-muted hover:bg-muted/80 transition-all border border-transparent hover:border-border group"
            >
              <div className="h-9 w-9 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground shrink-0 group-hover:scale-110 transition-transform">
                {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
              </div>
              <span className="text-[11px] font-bold text-foreground">{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>

            <button 
              onClick={() => handleShare('more')}
              className="flex items-center gap-3 p-3 rounded-2xl bg-muted hover:bg-muted/80 transition-all border border-transparent hover:border-border group"
            >
              <div className="h-9 w-9 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground shrink-0 group-hover:scale-110 transition-transform">
                <MoreHorizontal size={18} />
              </div>
              <span className="text-[11px] font-bold text-foreground">More</span>
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
