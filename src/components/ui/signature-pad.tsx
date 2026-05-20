
"use client";

import { SignaturePad } from "@ark-ui/react/signature-pad";
import { useState } from "react";
import { FileText, CheckCircle, AlertCircle } from "lucide-react";

export default function VoltaSignaturePad({ 
  onSign, 
  title = "Digital Authorization",
  description = "Please provide your signature for the registry."
}: { 
  onSign?: (data: any) => void;
  title?: string;
  description?: string;
}) {
  const [hasSignature, setHasSignature] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleDrawEnd = (details: any) => {
    setHasSignature(true);
    if (onSign) onSign(details);
  };

  const handleSubmit = () => {
    if (hasSignature) {
      setIsSubmitted(true);
    }
  };

  return (
    <div className="bg-card border border-border w-full p-8 rounded-[2rem] shadow-xl overflow-hidden relative">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-black uppercase tracking-tight text-foreground">
            {title}
          </h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            {description}
          </p>
        </div>

        <div className="space-y-4">
          <SignaturePad.Root onDrawEnd={handleDrawEnd}>
            <SignaturePad.Label className="text-[9px] font-black uppercase tracking-widest text-primary ml-1">
              Registry Signature *
            </SignaturePad.Label>
            <SignaturePad.Control className="relative w-full h-40 bg-muted/50 rounded-2xl border-2 border-primary/20 group hover:border-primary transition-all shadow-inner">
              <SignaturePad.Segment className="w-full h-full stroke-foreground fill-none stroke-[3]" />
              <SignaturePad.ClearTrigger className="absolute top-4 right-4 px-3 py-1.5 bg-background border border-border text-[8px] font-black uppercase tracking-widest text-primary hover:bg-primary hover:text-white rounded-lg shadow-sm transition-colors">
                Clear Buffer
              </SignaturePad.ClearTrigger>
              <SignaturePad.Guide className="absolute bottom-6 left-4 right-4 border-b-2 border-primary/20" />
            </SignaturePad.Control>
          </SignaturePad.Root>

          <div className="flex items-center space-x-2 px-2">
            {hasSignature ? (
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            ) : (
              <AlertCircle className="w-4 h-4 text-muted-foreground/30" />
            )}
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
              {hasSignature ? "Node Authorization Received" : "Signature Required"}
            </span>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleSubmit}
            disabled={!hasSignature || isSubmitted}
            className="w-full h-14 bg-primary text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-xl disabled:opacity-30 disabled:grayscale transition-all active:scale-95"
          >
            {isSubmitted ? "Registry Synced" : "Commit to Registry"}
          </button>
        </div>

        {isSubmitted && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                Digital Agreement Locked
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

