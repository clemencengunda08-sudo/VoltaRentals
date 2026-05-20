'use client';

import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface DataDisclosureProps {
  text?: string;
  showIcon?: boolean;
  className?: string;
}

export default function DataDisclosure({ 
  text = "Your data is protected. Read our ", 
  showIcon = true,
  className
}: DataDisclosureProps) {
  return (
    <div className={cn("flex items-center gap-2 py-2 mt-2 select-none", className)}>
      {showIcon && <ShieldCheck size={12} className="text-primary shrink-0" />}
      <p className="text-[11px] text-muted-foreground font-medium leading-none">
        {text}
        <Link href="/privacy" className="text-primary hover:underline font-bold">Privacy Policy</Link>
      </p>
    </div>
  );
}
