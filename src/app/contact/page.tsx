'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Phone, 
  Mail, 
  MapPin, 
  MessageCircle, 
  CheckCircle2, 
  Loader2,
  Instagram,
  Facebook,
  Twitter,
  Linkedin
} from "lucide-react";
import { useFirestore } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import Link from 'next/link';
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/ui/AnimatedSection";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  subject: z.enum(["General Inquiry", "Booking Question", "Payment Issue", "Vehicle Complaint", "Partnership", "Other"]),
  message: z.string().min(20, "Message must be at least 20 characters").max(500, "Message too long"),
});

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const db = useFirestore();

  const form = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      subject: "General Inquiry",
    }
  });

  const onSubmit = async (values: z.infer<typeof contactSchema>) => {
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "messages"), {
        ...values,
        status: "unread",
        createdAt: serverTimestamp()
      });
      setIsSuccess(true);
      toast({ title: "Message Sent! ✅", description: "Our team will contact you shortly." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: "Could not send message." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-background">
        <section className="py-24 bg-primary text-white text-center">
          <div className="container mx-auto px-4 space-y-6">
            <AnimatedSection direction="down">
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none">GET IN TOUCH</h1>
              <p className="text-blue-50/60 text-xl font-medium max-w-xl mx-auto">Elite 24/7 concierge support for all Tanzanian operations.</p>
            </AnimatedSection>
          </div>
        </section>

        <section className="py-32">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
              {/* Info Side */}
              <div className="space-y-16">
                <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-8" staggerDelay={0.12}>
                  {[
                    { icon: <Phone />, title: "Call Us", val: "+255 700 000 000", sub: "Daily 6am - 10pm", href: "tel:+255700000000", color: "bg-blue-50 text-blue-700" },
                    { icon: <MessageCircle />, title: "WhatsApp", val: "+255 700 000 000", sub: "Minutes response time", href: "https://wa.me/255700000000", color: "bg-emerald-50 text-emerald-700" },
                    { icon: <Mail />, title: "Email Support", val: "info@voltarentals.co.tz", sub: "2 hour response guarantee", href: "mailto:info@voltarentals.co.tz", color: "bg-amber-50 text-amber-700" },
                    { icon: <MapPin />, title: "Office Location", val: "Dar es Salaam, Tanzania", sub: "Mikocheni Area Hub", href: "#", color: "bg-primary/5 text-primary" },
                  ].map((card, i) => (
                    <StaggerItem key={i} direction="left">
                      <a href={card.href} target="_blank" className="p-10 rounded-[2.5rem] bg-card border border-border shadow-sm hover:shadow-2xl transition-all group block h-full">
                        <div className={`h-14 w-14 rounded-2xl ${card.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                          {card.icon}
                        </div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">{card.title}</h3>
                        <p className="text-sm font-black text-foreground truncate mb-1">{card.val}</p>
                        <p className="text-[10px] font-bold text-muted-foreground/60 uppercase">{card.sub}</p>
                      </a>
                    </StaggerItem>
                  ))}
                </StaggerContainer>

                <AnimatedSection direction="up" delay={0.3} className="p-12 bg-card rounded-[3rem] border border-border space-y-8">
                  <h3 className="text-xl font-black uppercase tracking-tight text-foreground">ELITE SOCIAL CHANNELS</h3>
                  <div className="flex gap-6">
                    {[Instagram, Facebook, Twitter, Linkedin].map((Icon, i) => (
                      <Link key={i} href="#" className="h-16 w-16 rounded-[1.5rem] bg-background border border-border shadow-sm flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                        <Icon className="h-6 w-6" />
                      </Link>
                    ))}
                  </div>
                </AnimatedSection>
              </div>

              {/* Form Side */}
              <div className="relative">
                {isSuccess ? (
                  <div className="bg-emerald-500/5 border-2 border-emerald-500/20 rounded-[3rem] p-16 text-center space-y-8 animate-in zoom-in duration-500">
                    <div className="h-24 w-24 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-2xl">
                      <CheckCircle2 className="h-12 w-12" />
                    </div>
                    <div className="space-y-4">
                      <h2 className="text-3xl font-black text-foreground uppercase tracking-tight">MESSAGE RECEIVED!</h2>
                      <p className="text-muted-foreground font-medium">Thank you for reaching out. An elite logistics manager will contact you within 2 hours.</p>
                    </div>
                    <Button onClick={() => setIsSuccess(false)} variant="outline" className="h-14 px-10 border-border text-foreground font-black rounded-2xl uppercase text-[10px] tracking-widest hover:bg-muted">
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <AnimatedSection direction="right" delay={0.2} className="bg-card rounded-[3rem] p-12 shadow-2xl border border-border">
                    <div className="mb-10">
                      <h2 className="text-3xl font-black tracking-tight uppercase text-foreground">Inquiry Terminal</h2>
                      <p className="text-muted-foreground text-sm font-medium mt-2">Submit your details to start your custom reservation.</p>
                    </div>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary">Full Name</FormLabel><FormControl><Input className="h-14 rounded-xl font-bold bg-muted border-none text-foreground" placeholder="John Mwamba" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary">Email Address</FormLabel><FormControl><Input type="email" className="h-14 rounded-xl font-bold bg-muted border-none text-foreground" placeholder="john@company.tz" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>
                          )} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField control={form.control} name="phone" render={({ field }) => (
                            <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary">Phone Number</FormLabel><FormControl><Input className="h-14 rounded-xl font-bold bg-muted border-none text-foreground" placeholder="+255..." {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField control={form.control} name="subject" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary">Subject Matter</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger className="h-14 rounded-xl font-bold bg-muted border-none text-foreground"><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent className="bg-card border-border">
                                  {["General Inquiry", "Booking Question", "Payment Issue", "Vehicle Complaint", "Partnership", "Other"].map(s => <SelectItem key={s} value={s} className="font-bold text-xs">{s}</SelectItem>)}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>
                        <FormField control={form.control} name="message" render={({ field }) => (
                          <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary">Message</FormLabel><FormControl><Textarea className="min-h-[150px] rounded-[2rem] p-6 font-medium bg-muted border-none resize-none text-foreground" placeholder="How can we assist you today?" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <Button type="submit" disabled={isSubmitting} className="w-full h-16 rounded-[2rem] bg-primary font-black text-lg shadow-xl uppercase tracking-widest text-white">
                          {isSubmitting ? <><Loader2 className="animate-spin mr-2" /> Dispatching...</> : "Submit Request"}
                        </Button>
                      </form>
                    </Form>
                  </AnimatedSection>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
