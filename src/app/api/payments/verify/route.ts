import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase';
import { collection, query, where, getDocs, doc, writeBatch, serverTimestamp, addDoc } from 'firebase/firestore';
import { getPesapalToken, getPesapalStatus } from '@/lib/pesapal';
import { automation } from '@/lib/automation';

export async function GET(req: NextRequest) {
  try {
    const orderTrackingId = req.nextUrl.searchParams.get('orderTrackingId');

    if (!orderTrackingId) {
      return NextResponse.json({ error: 'Missing orderTrackingId' }, { status: 400 });
    }

    const token = await getPesapalToken();
    const status = await getPesapalStatus(token, orderTrackingId);

    const snap = await getDocs(
      query(collection(db, 'pesapalOrders'), where('orderTrackingId', '==', orderTrackingId))
    );

    const bookingId = snap.empty ? null : snap.docs[0].data().bookingId;

    // Process database updates synchronously if the payment is completed
    if (!snap.empty) {
      const orderDoc = snap.docs[0];
      const orderData = orderDoc.data();
      
      // Prevent double processing if IPN or a previous verify request already completed it
      if (status.status === 'COMPLETED' && orderData.status !== 'completed') {
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
          if (booking.userId) {
            await addDoc(collection(db, 'notifications'), {
              userId: booking.userId,
              type: 'payment_verified',
              title: 'Payment Confirmed ✅',
              message: `TSh ${Number(status.amount).toLocaleString()} confirmed via Pesapal. Your booking is now active!`,
              read: false,
              actionUrl: '/dashboard',
              createdAt: serverTimestamp(),
            });
          }
        }
      } else if (status.status === 'FAILED' && orderData.status !== 'failed') {
        const batch = writeBatch(db);
        batch.update(orderDoc.ref, { status: 'failed' });
        batch.update(doc(db, 'bookings', bookingId), { paymentStatus: 'failed' });
        await batch.commit();
      }
    }

    return NextResponse.json({
      status: status.status,
      amount: status.amount,
      bookingId,
      confirmationCode: status.confirmationCode,
      paymentMethod: status.paymentMethod,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
