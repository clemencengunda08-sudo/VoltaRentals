'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useDoc, useFirestore, useUser } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Star, CheckCircle2, Loader2, ArrowLeft, ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { submitReview } from "@/lib/reviews";
import Image from "next/image";
import Link from 'next/link';

const reviewSchema = z.object({
  rating: z.number().min(1, "Please select a rating").max(5),
  title: z.string().min(3, "Title too short").max(80, "Title too long"),
  comment: z.string().min(20, "Please describe your experience in at least 20 characters").max(500),
  tags: z.array(z.string()).min(1, "Select at least one highlight"),
  recommend: z.boolean({ required_error: "Please select if you would recommend us" }),
});

const TAGS = [
  "Clean Vehicle", "On Time", "Great Driver", "Well Maintained", 
  "Good Value", "Easy Booking", "Smooth Pickup", "Good Communication", 
  "Comfortable Ride", "Would Recommend"
];

const RATING_LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent!"];

export default function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const db = useFirestore();
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const bookingRef = doc(db, "bookings", id);
  const { data: booking, loading } = useDoc(bookingRef);

  const form = useForm<z.infer<typeof reviewSchema>>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      tags: [],
    }
  });

  const onSubmit = async (values: z.infer<typeof reviewSchema>) => {
    if (!user || !booking) return;
    setIsSubmitting(true);
    try {
      await submitReview(db, {
        bookingId: booking.id,
        bookingCode: booking.bookingCode,
        carId: booking.vehicleId,
        carName: booking.vehicleName,
        customerId: user.uid,
        customerName: user.displayName || user.email?.split('@')[0] || 'Customer',
        rating: values.rating,
        title: values.title,
        comment: values.comment,
        tags: values.tags,
      });
      setIsSuccess(true);
      toast({ title: "Review Submitted! 🌟", description: "Thank you for your feedback." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Submission Failed", description: e.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;
  if (!booking) return <div className="text-center py-20">Booking not found.</div>;

  if (isSuccess) {
    return (
      <>
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center py-20 px-4">
          <div className="bg-card p-12 rounded-[3rem] border border-border shadow-2xl text-center max-w-lg animate-in zoom-in duration-500">
            <CheckCircle2 className="h-24 w-24 mx-auto mb-6 text-emerald-500" />
            <h2 className="text-3xl font-black text-white mb-4">Thank you! 🌟</h2>
            <p className="text-muted-foreground mb-8">Your feedback helps us maintain the Volta standard.</p>
            <Button asChild className="h-14 px-10 rounded-2xl bg-primary font-black shadow-xl">
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 py-12 bg-background pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-8 rounded-xl gap-2"><ArrowLeft className="h-4 w-4" /> Back to Dashboard</Button>
          </Link>
          
          <div className="mb-12">
            <h1 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter">Share Experience</h1>
            <p className="text-muted-foreground">Rating for {booking.vehicleName} ({booking.bookingCode})</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Card className="rounded-[2.5rem] border border-border shadow-sm bg-card overflow-hidden">
                <CardContent className="p-8 space-y-8">
                  <FormField control={form.control} name="rating" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary">Star Rating</FormLabel>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex gap-2">
                          {[1,2,3,4,5].map(s => (
                            <button key={s} type="button" onClick={() => field.onChange(s)} className="transition-all md:hover:scale-110">
                              <Star className={cn("h-10 w-10", s <= field.value ? "fill-secondary text-secondary" : "text-muted")} />
                            </button>
                          ))}
                        </div>
                        <span className="text-lg font-black text-secondary">{RATING_LABELS[field.value]}</span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary">Review Title</FormLabel>
                      <FormControl><Input placeholder="e.g. Amazing experience!" className="h-14 rounded-2xl font-bold bg-muted border-none" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="comment" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary">Detailed Feedback</FormLabel>
                      <FormControl><Textarea className="min-h-[150px] rounded-[2rem] p-6 text-sm resize-none bg-muted border-none" placeholder="How was the service?" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </CardContent>
              </Card>

              <Button type="submit" disabled={isSubmitting} className="w-full h-16 rounded-[2rem] bg-primary font-black text-xl shadow-2xl uppercase tracking-widest">
                {isSubmitting ? <><Loader2 className="animate-spin mr-2" /> Submitting...</> : "Submit Review"}
              </Button>
            </form>
          </Form>
        </div>
      </main>
      <Footer />
    </>
  );
}
