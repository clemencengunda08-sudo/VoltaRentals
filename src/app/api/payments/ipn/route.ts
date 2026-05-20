
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import { getPesapalToken, getPesapalStatus } from '@/lib/pesapal';
import { automation } from '@/lib/automation';

export async function GET(req: NextRequest) {
  try {
    const params = req.nextUrl.searchParams;
    const orderTrackingId = params.get('OrderTrackingId') || '';
    const merchantReference = params.get('OrderMerchantReference') || '';

    // Log the IPN receipt
    await addDoc(collection(db, 'ipnLogs'), {
      orderTrackingId,
      merchantReference,
      receivedAt: serverTimestamp(),
    });

    if (!orderTrackingId) {
      return NextResponse.json({ received: true });
    }

    const token = await getPesapalToken();
    const status = await getPesapalStatus(token, orderTrackingId);

    const snap = await getDocs(
      query(collection(db, 'pesapalOrders'), where('orderTrackingId', '==', orderTrackingId))
    );

    if (snap.empty) {
      return NextResponse.json({ received: true });
    }

    const orderDoc = snap.docs[0];
    const orderData = orderDoc.data();
    const bookingId = orderData.bookingId;

    // Prevent double processing if already marked completed
    if (orderData.status === 'completed') {
      return NextResponse.json({ received: true });
    }

    if (status.status === 'COMPLETED') {
      const batch = writeBatch(db);

      // Update Booking
      batch.update(doc(db, 'bookings', bookingId), {
        status: 'confirmed',
        paymentStatus: 'paid',
        paidAt: serverTimestamp(),
        paymentReference: status.confirmationCode,
        updatedAt: serverTimestamp(),
      });

      // Update Pesapal Order Log
      batch.update(orderDoc.ref, {
        status: 'completed',
        confirmationCode: status.confirmationCode,
        completedAt: serverTimestamp(),
      });

      // Create Formal Payment Record
      const paymentRef = doc(collection(db, 'payments'));
      const paymentData = {
        bookingId,
        orderTrackingId,
        confirmationCode: status.confirmationCode,
        amount: status.amount,
        currency: 'TZS',
        paymentMethod: status.paymentMethod,
        status: 'verified',
        autoVerified: true,
        source: 'pesapal',
        verifiedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      };
      batch.set(paymentRef, paymentData);

      await batch.commit();

      // Automation Trigger
      automation.paymentVerified(paymentData);

      // Send Notification to Customer
      const bSnap = await getDocs(query(collection(db, 'bookings'), where('__name__', '==', bookingId)));
      
      if (!bSnap.empty) {
        const booking = bSnap.docs[0].data();
        const userId = booking.userId;
        if (userId) {
          await addDoc(collection(db, 'notifications'), {
            userId,
            type: 'payment_verified',
            title: 'Payment Confirmed ✅',
            message: `TSh ${Number(status.amount).toLocaleString()} confirmed via Pesapal. Your booking is now active!`,
            read: false,
            actionUrl: '/dashboard',
            createdAt: serverTimestamp(),
          });
        }
      }
    }

    if (status.status === 'FAILED') {
      await updateDoc(orderDoc.ref, { status: 'failed' });
      await updateDoc(doc(db, 'bookings', bookingId), { paymentStatus: 'failed' });
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('IPN error:', error);
    return NextResponse.json({ received: true });
  }
}
