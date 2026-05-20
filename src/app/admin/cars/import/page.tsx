'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  FileUp, 
  ArrowLeft, 
  Loader2,
  Database,
  Info,
  CheckCircle2
} from "lucide-react";
import { useFirestore, useUser } from "@/firebase";
import { collection, doc, writeBatch, serverTimestamp } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import Link from 'next/link';

export default function BulkCarImportPage() {
  const [fileData, setFileData] = useState<any[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const db = useFirestore();
  const { user } = useUser();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = text.split('\n').filter(row => row.trim() !== '');
      const headers = rows[0].split(',').map(h => h.trim().toLowerCase());
      
      const parsedData = rows.slice(1).map(row => {
        const values = row.split(',');
        const obj: any = {};
        headers.forEach((header, index) => {
          let val: any = values[index]?.trim() || '';
          // Type conversions
          if (header === 'year' || header === 'priceperday' || header === 'seats') {
            val = Number(val) || 0;
          }
          if (header === 'available') {
            val = val.toLowerCase() === 'true';
          }
          if (header === 'features') {
            val = val.split(';').map((f: string) => f.trim());
          }
          obj[header] = val;
        });
        return obj;
      });

      setFileData(parsedData);
      toast({ title: "CSV Parsed", description: `Detected ${parsedData.length} vehicles for registry.` });
    };
    reader.readAsText(file);
  };

  const processImport = async () => {
    if (fileData.length === 0) return;
    setIsImporting(true);
    
    try {
      const batch = writeBatch(db);
      const carsRef = collection(db, "cars");

      fileData.forEach((car) => {
        const newDocRef = doc(carsRef);
        batch.set(newDocRef, {
          ...car,
          id: newDocRef.id,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          addedBy: user?.uid || 'admin',
          images: car.images ? [car.images] : ['https://picsum.photos/seed/car/800/600'],
        });
      });

      await batch.commit();
      toast({ title: "Import Successful! 🚀", description: `${fileData.length} vehicles added to the fleet.` });
      setFileData([]);
    } catch (e: any) {
      toast({ variant: "destructive", title: "Import Failed", description: e.message });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex items-center gap-6">
        <Link href="/admin/cars">
          <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl bg-card border border-border shadow-sm text-foreground"><ArrowLeft size={20} /></Button>
        </Link>
        <div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">Bulk Registry Import</h1>
          <p className="text-muted-foreground uppercase text-[10px] font-black tracking-widest mt-1">Import fleet inventory via CSV terminal</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 pb-20">
        <Card className="rounded-[3rem] border-none shadow-3xl bg-card p-10 space-y-8 h-fit">
          <h2 className="text-xs font-black uppercase tracking-[0.4em] text-primary">Instructions</h2>
          <div className="space-y-6 text-sm font-medium text-white/60 leading-relaxed italic">
            <div className="p-5 bg-primary/5 border border-primary/10 rounded-2xl space-y-3">
               <p className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                 <Info size={14} /> Mandatory Headers
               </p>
               <code className="block bg-black/40 p-3 rounded font-mono text-emerald-500 text-[9px] leading-loose">
                 make, model, year, plateNumber, category, pricePerDay
               </code>
            </div>
            
            <p>1. Prepare CSV with comma-separated values.</p>
            <p>2. "PricePerDay" must be a number (e.g. 150000).</p>
            <p>3. "Category" options: SUV, Sedan, Van, Luxury, Bus.</p>
            
            <div className="pt-6 border-t border-white/5">
              <label className="block mb-3 font-black uppercase text-[10px] tracking-widest text-primary">Select CSV File</label>
              <input type="file" accept=".csv" onChange={handleFileUpload} className="w-full text-[10px] font-black uppercase tracking-widest file:bg-primary file:text-white file:border-none file:px-4 file:py-2 file:rounded-lg cursor-pointer" />
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2 rounded-[3rem] border-none shadow-3xl bg-card overflow-hidden">
          <CardHeader className="bg-white/5 border-b p-10 flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-3"><Database size={20} className="text-primary" /> Registry Preview</CardTitle>
            <Button 
              onClick={processImport} 
              disabled={fileData.length === 0 || isImporting}
              className="bg-primary text-white h-12 px-8 rounded-xl font-black uppercase text-[10px] tracking-widest gap-2 shadow-2xl"
            >
              {isImporting ? <Loader2 className="animate-spin h-4 w-4" /> : <FileUp size={18} />} 
              Commit to Registry
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {fileData.length === 0 ? (
              <div className="py-40 text-center text-white/10 italic font-black uppercase text-[10px] tracking-[0.4em]">No data detected in buffer.</div>
            ) : (
              <div className="overflow-x-auto max-h-[600px]">
                <table className="w-full text-left">
                  <thead className="bg-white/5 text-primary text-[9px] font-black uppercase tracking-widest">
                    <tr>
                      <th className="px-8 py-6">Manufacturer</th>
                      <th className="px-8 py-6">Model Identifier</th>
                      <th className="px-8 py-6">Plate ID</th>
                      <th className="px-8 py-6">Operational Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {fileData.map((car, i) => (
                      <tr key={i} className="hover:bg-white/5 transition-colors">
                        <td className="px-8 py-6 text-[10px] font-black uppercase text-white">{car.make}</td>
                        <td className="px-8 py-6 text-[10px] font-bold text-white/60">{car.model}</td>
                        <td className="px-8 py-6 text-[10px] font-black font-mono text-primary">{car.platenumber}</td>
                        <td className="px-8 py-6 text-[10px] font-black text-emerald-500">TSh {car.priceperday?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}