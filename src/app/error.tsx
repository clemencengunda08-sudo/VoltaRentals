'use client';

import { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center py-32 bg-red-50/30 text-center px-4">
        <div className="h-24 w-24 bg-red-100 text-red-600 rounded-[2rem] flex items-center justify-center mb-8 shadow-xl">
          <AlertCircle size={48} />
        </div>
        <h2 className="text-4xl font-black tracking-tight text-primary mb-4 uppercase">System Malfunction</h2>
        <p className="text-muted-foreground text-lg font-medium max-w-md mx-auto mb-12 leading-relaxed italic">
          "We encountered an unexpected operational barrier."
        </p>
        <div className="flex gap-4">
          <Button onClick={() => reset()} className="h-16 px-10 bg-primary text-white font-black rounded-2xl shadow-2xl gap-2">
            <RotateCcw className="h-5 w-5" /> Reboot Session
          </Button>
          <Button asChild variant="ghost" className="h-16 px-10 text-primary font-black rounded-2xl">
            <a href="tel:+255700000000">Call Concierge</a>
          </Button>
        </div>
      </main>
      <Footer />
    </>
  );
}
