'use client';

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { AmbientBackground } from "@/components/effects/AmbientBackground";
import { PageTransition } from "@/components/effects/PageTransition";
import { ScrollAssistant } from "@/components/ui/ScrollAssistant";
import { CompareProvider } from "@/context/CompareContext";
import { CompareBar } from "@/components/ui/CompareBar";
import { TopProgressBar } from "@/components/ui/TopProgressBar";
import { SideScrollTrack } from "@/components/ui/SideScrollTrack";

/**
 * Root Public Layout.
 * Centralized registry for global scroll UI and ambient effects.
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CompareProvider>
      <div className="relative min-h-screen bg-background">
        
        {/* ── Global Scroll UI Protocol ── */}
        <TopProgressBar />
        <SideScrollTrack />
        <ScrollAssistant />
        <CompareBar />

        {/* ── Ambient Environment ── */}
        <AmbientBackground />
        
        {/* ── Application Shell ── */}
        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">
            <PageTransition>
              {children}
            </PageTransition>
          </main>
          <Footer />
        </div>

      </div>
    </CompareProvider>
  );
}
