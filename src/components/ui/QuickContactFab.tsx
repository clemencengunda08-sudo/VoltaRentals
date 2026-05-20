'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Phone, Mail, X, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Optimized Quick Contact FAB.
 * Reduced size (h-10) for surgical precision.
 */
export function QuickContactFab() {
  const [isOpen, setIsOpen] = useState(false);

  const contacts = [
    { icon: Phone, label: "Call Us", href: "tel:+255700000000", color: "bg-blue-600" },
    { icon: MessageCircle, label: "WhatsApp", href: "https://wa.me/255700000000", color: "bg-emerald-600" },
    { icon: Mail, label: "Email", href: "mailto:info@voltarentals.co.tz", color: "bg-amber-600" },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-[99] flex flex-col items-center gap-3">
      <AnimatePresence>
        {isOpen && (
          <div className="flex flex-col items-center gap-2 mb-1">
            {contacts.map((contact, i) => (
              <motion.a
                key={contact.label}
                href={contact.href}
                initial={{ opacity: 0, y: 15, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.8 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-1.5 rounded-lg text-white shadow-xl transition-transform active:scale-95 border border-white/10",
                  contact.color
                )}
              >
                <contact.icon size={14} />
                <span className="text-[9px] font-black uppercase tracking-widest">{contact.label}</span>
              </motion.a>
            ))}
          </div>
        )}
      </AnimatePresence>

      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-10 w-10 rounded-xl shadow-2xl transition-all duration-500",
          isOpen ? "bg-card text-foreground rotate-90" : "bg-primary text-white"
        )}
      >
        {isOpen ? <X size={20} /> : <Zap size={20} className="fill-current" />}
      </Button>
    </div>
  );
}
