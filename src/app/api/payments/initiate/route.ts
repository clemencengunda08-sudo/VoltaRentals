import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase';
import { doc, getDoc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getPesapalToken, registerPesapalIPN, submitPesapalOrder } from '@/lib/pesapal';

export async function POST(req: NextRequest) {
  try {
    const {
      bookingId,
      bookingCode,
      amount,
      customerEmail,
      customerPhone,
      customerName,
      vehicleName,
    } = await req.json();

    if (!bookingId || !bookingCode || !amount || !customerEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const token = await getPesapalToken();

    // Ensure IPN is registered
    const settingsRef = doc(db, 'settings', 'pesapal');
    const settingsSnap = await getDoc(settingsRef);
    let ipnId: string;

    if (settingsSnap.exists() && settingsSnap.data().ipnId) {
      ipnId = settingsSnap.data().ipnId;
    } else {
      ipnId = await registerPesapalIPN(token);
      try {
        await setDoc(settingsRef, { ipnId, createdAt: serverTimestamp() }, { merge: true });
      } catch (err) {
        console.warn('Bypassed saving Pesapal IPN ID to settings due to Firestore client permission boundary:', err);
      }
    }

    const parts = customerName.trim().split(' ');
    const firstName = parts[0] || 'Customer';
    const lastName = parts.slice(1).join(' ') || 'User';

    const order = await submitPesapalOrder(token, {
      merchantReference: bookingCode,
      amount: Number(amount),
      description: 'VoltaRentals - ' + vehicleName,
      callbackUrl: (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000') + '/payment/callback',
      notificationId: ipnId,
      customerEmail,
      customerPhone: customerPhone || '+255700000000',
      firstName,
      lastName,
    });

    // Log the order for internal tracking
    await addDoc(collection(db, 'pesapalOrders'), {
      bookingId,
      bookingCode,
      orderTrackingId: order.orderTrackingId,
      merchantReference: order.merchantReference,
      redirectUrl: order.redirectUrl,
      amount: Number(amount),
      currency: 'TZS',
      status: 'pending',
      customerEmail,
      createdAt: serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      redirectUrl: order.redirectUrl,
      orderTrackingId: order.orderTrackingId,
    });
  } catch (error: any) {
    console.error('Payment initiation error:', error);
    const message = error.message || 'Payment gateway error';
    const isGatewayError = message.includes('token') || message.includes('Pesapal') || message.includes('fetch') || message.includes('Failed');
    return NextResponse.json({ 
      error: message,
      fallbackSuggested: isGatewayError,
      fallbackReason: isGatewayError ? 'Online gateway unavailable. Use M-Pesa manual payment as an alternative.' : undefined
    }, { status: 500 });
  }
}
