'use client';

import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getWhatsAppLink } from "@/lib/notifications";

interface WhatsAppButtonProps {
  phone: string;
  message: string;
  label?: string;
  className?: string;
}

export function WhatsAppButton({ phone, message, label = "Initialize Session", className }: WhatsAppButtonProps) {
  const link = getWhatsAppLink(phone, message);

  return (
    <Button 
      asChild 
      className={`bg-accent text-accent-foreground font-black tracking-tighter uppercase px-6 py-3 rounded-[1.5rem] smooth-transition hover:opacity-90 shadow-xl ${className}`}
    >
      <a href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
        <MessageCircle size={20} />
        {label}
      </a>
    </Button>
  );
}
