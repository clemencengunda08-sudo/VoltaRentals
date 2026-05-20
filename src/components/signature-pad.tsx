'use client';

import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { X, Check, UploadCloud } from 'lucide-react';

export function SignaturePad({ bookingId, type = 'client', onSigned }: { bookingId: string, type?: 'client' | 'admin', onSigned?: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const db = useFirestore();

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Calculate aspect ratio to fit image into canvas
        const hRatio = canvas.width / img.width;
        const vRatio = canvas.height / img.height;
        const ratio  = Math.min( hRatio, vRatio );
        const centerShift_x = ( canvas.width - img.width*ratio ) / 2;
        const centerShift_y = ( canvas.height - img.height*ratio ) / 2;  
        
        ctx.drawImage(img, 0,0, img.width, img.height, centerShift_x, centerShift_y, img.width*ratio, img.height*ratio);  
        setHasSignature(true);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const saveSignature = async () => {
    if (!hasSignature || !canvasRef.current) return;
    setIsSaving(true);
    try {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      const updateField = type === 'admin' ? { adminSignature: dataUrl } : { clientSignature: dataUrl };
      await updateDoc(doc(db, 'bookings', bookingId), updateField);
      toast({ title: "Signature Captured", description: "Document legally stamped." });
      if (onSigned) onSigned();
    } catch (e) {
      toast({ variant: "destructive", title: "Failed to capture signature" });
    } finally {
      setIsSaving(false);
    }
  };

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0F172A'; 
  }, []);

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-primary/20 rounded-[1.5rem] bg-white overflow-hidden relative touch-none shadow-inner h-[150px]">
        <canvas
          ref={canvasRef}
          width={800}
          height={300}
          className="w-full h-full cursor-crosshair bg-transparent"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {!hasSignature && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center gap-2">
            <span className="text-primary/10 font-black uppercase text-2xl tracking-widest">SIGN HERE</span>
            <span className="text-muted-foreground/30 text-[9px] font-bold uppercase">or draw with your finger</span>
          </div>
        )}
      </div>
      <div className="flex gap-2 sm:gap-4 flex-wrap">
        <Button onClick={clear} variant="outline" className="flex-1 rounded-xl uppercase font-black text-[10px] tracking-widest text-muted-foreground gap-2 h-12">
          <X size={14} /> Clear
        </Button>
        <div className="flex-1 min-w-[120px]">
          <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
          <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full rounded-xl uppercase font-black text-[10px] tracking-widest text-primary border-primary/20 bg-primary/5 hover:bg-primary/10 gap-2 h-12">
            <UploadCloud size={14} /> Upload
          </Button>
        </div>
        <Button onClick={saveSignature} disabled={!hasSignature || isSaving} className="w-full sm:w-auto sm:flex-[2] bg-primary text-white rounded-xl uppercase font-black text-[10px] tracking-widest gap-2 shadow-lg h-12 hover:bg-primary/90">
          {isSaving ? "Saving..." : <><Check size={14} /> Seal Document</>}
        </Button>
      </div>
    </div>
  );
}
