'use client';

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, orderBy } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Receipt, 
  ArrowRight,
  Car,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function PaymentHistoryPage() {
  const { user, loading: userLoading } = useUser();
  const db = useFirestore();

  const paymentsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, "payments"),
      where("customerId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
  }, [db, user]);

  const { data: payments, loading } = useCollection(paymentsQuery);

  const stats = {
    totalPaid: payments?.filter(p => p.status === 'verified').reduce((acc, p) => acc + p.amount, 0) || 0,
    pendingCount: payments?.filter(p => p.status === 'pending_verification').length || 0,
    totalBookingsValue: payments?.reduce((acc, p) => acc + p.amount, 0) || 0,
  };

  if (userLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

  return (
    <>
      <Navbar />
      <main className="flex-1 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <h1 className="text-3xl font-bold font-headline mb-2 text-primary">Payment Records</h1>
              <p className="text-muted-foreground">Monitor all your luxury car rental transactions in Tanzania.</p>
            </div>
            <Link href="/fleet">
              <Button className="bg-primary hover:bg-primary/90 rounded-xl h-12 px-8">Rent a Vehicle</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
            <Card className="rounded-3xl border-none shadow-sm bg-emerald-50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform"><CheckCircle2 size={40} className="text-emerald-900" /></div>
              <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">Total Verified Paid</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-emerald-900">TSh {stats.totalPaid.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-none shadow-sm bg-yellow-50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform"><Clock size={40} className="text-yellow-900" /></div>
              <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-bold text-yellow-800 uppercase tracking-widest">Pending Verification</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-yellow-900">{stats.pendingCount} Record{stats.pendingCount !== 1 && 's'}</div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-none shadow-sm bg-blue-50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform"><Car size={40} className="text-blue-900" /></div>
              <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-bold text-blue-800 uppercase tracking-widest">Transaction Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-blue-900">TSh {stats.totalBookingsValue.toLocaleString()}</div>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-3xl border-none shadow-sm overflow-hidden bg-white border border-secondary/10">
            <CardHeader className="bg-secondary/5 border-b">
              <CardTitle className="text-xl">History of Settlements</CardTitle>
              <CardDescription>A complete log of all payments submitted for your bookings.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-12 text-center text-muted-foreground animate-pulse font-bold">Synchronizing Payment Data...</div>
              ) : !payments || payments.length === 0 ? (
                <div className="p-24 text-center">
                  <Receipt className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
                  <p className="text-muted-foreground font-medium italic">No payment records detected in your history.</p>
                  <Button variant="outline" className="mt-6 rounded-xl" asChild><Link href="/fleet">Discover our Fleet</Link></Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="font-bold text-[10px] uppercase tracking-widest pl-8">Booking</TableHead>
                        <TableHead className="font-bold text-[10px] uppercase tracking-widest">Experience</TableHead>
                        <TableHead className="font-bold text-[10px] uppercase tracking-widest">Settlement</TableHead>
                        <TableHead className="font-bold text-[10px] uppercase tracking-widest">Method</TableHead>
                        <TableHead className="font-bold text-[10px] uppercase tracking-widest">Verified Status</TableHead>
                        <TableHead className="font-bold text-[10px] uppercase tracking-widest text-right pr-8">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments?.map((p) => {
                        const statusColors = {
                          pending_verification: "bg-yellow-100 text-yellow-700 border-yellow-200",
                          verified: "bg-emerald-100 text-emerald-700 border-emerald-200",
                          rejected: "bg-red-100 text-red-700 border-red-200"
                        };
                        
                        return (
                          <TableRow key={p.id} className="hover:bg-primary/5 transition-colors">
                            <TableCell className="font-mono font-bold text-accent text-xs pl-8">{p.bookingCode}</TableCell>
                            <TableCell className="text-xs font-black uppercase text-primary">{p.carName}</TableCell>
                            <TableCell className="text-xs font-black">TSh {p.amount?.toLocaleString()}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize text-[8px] font-bold border-primary/20">{p.paymentMethod}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant="outline" 
                                className={cn("rounded-full uppercase px-3 text-[8px]", statusColors[p.status as keyof typeof statusColors])}
                              >
                                {p.status?.replace('_', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right pr-8">
                              <Button variant="ghost" size="sm" asChild className="rounded-xl font-bold group">
                                <Link href={`/booking/${p.bookingId}/payment`}>
                                  Receipt <ArrowRight className="h-3 w-3 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
