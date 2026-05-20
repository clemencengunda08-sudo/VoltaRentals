/**
 * @fileOverview Pesapal API 3.0 Utility for VoltaRentals.
 * Handles token authentication, IPN registration, and order submission.
 */

let cachedToken: string | null = null;
let tokenExpiry: number = 0;

import { db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function getPesapalToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && now < tokenExpiry) {
    return cachedToken;
  }

  // Load consumer key and secret from Firestore settings first
  let consumerKey = process.env.PESAPAL_CONSUMER_KEY || '';
  let consumerSecret = process.env.PESAPAL_CONSUMER_SECRET || '';

  try {
    const settingsSnap = await getDoc(doc(db, 'settings', 'pesapal'));
    if (settingsSnap.exists()) {
      const data = settingsSnap.data();
      if (data.consumerKey) consumerKey = data.consumerKey;
      if (data.consumerSecret) consumerSecret = data.consumerSecret;
    }
  } catch (err) {
    console.warn('Could not read Pesapal keys from Firestore settings (falling back to process.env):', err);
  }

  if (!consumerKey || !consumerSecret) {
    throw new Error('Pesapal token failed: Consumer Key and Secret must be configured in settings or environment variables.');
  }

  const res = await fetch(
    (process.env.PESAPAL_BASE_URL || 'https://cybqa.pesapal.com/pesapalv3') + '/api/Auth/RequestToken',
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        consumer_key: consumerKey,
        consumer_secret: consumerSecret,
      }),
    }
  );

  const data = await res.json();
  if (!data.token) {
    throw new Error('Pesapal token failed: ' + JSON.stringify(data));
  }

  cachedToken = data.token;
  tokenExpiry = now + 4 * 60 * 1000; // Cache for 4 minutes
  return data.token;
}

export async function registerPesapalIPN(token: string): Promise<string> {
  const res = await fetch(
    (process.env.PESAPAL_BASE_URL || 'https://cybqa.pesapal.com/pesapalv3') + '/api/URLSetup/RegisterIPN',
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
      body: JSON.stringify({
        url: (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000') + '/api/payments/ipn',
        ipn_notification_type: 'GET',
      }),
    }
  );

  const data = await res.json();
  if (!data.ipn_id) {
    throw new Error('IPN registration failed: ' + JSON.stringify(data));
  }
  return data.ipn_id;
}

export async function submitPesapalOrder(
  token: string,
  order: {
    merchantReference: string;
    amount: number;
    description: string;
    callbackUrl: string;
    notificationId: string;
    customerEmail: string;
    customerPhone: string;
    firstName: string;
    lastName: string;
  }
) {
  const res = await fetch(
    (process.env.PESAPAL_BASE_URL || 'https://cybqa.pesapal.com/pesapalv3') + '/api/Transactions/SubmitOrderRequest',
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
      body: JSON.stringify({
        id: order.merchantReference,
        currency: 'TZS',
        amount: order.amount,
        description: order.description.slice(0, 100),
        callback_url: order.callbackUrl,
        notification_id: order.notificationId,
        billing_address: {
          email_address: order.customerEmail,
          phone_number: order.customerPhone,
          country_code: 'TZ',
          first_name: order.firstName,
          last_name: order.lastName,
          city: 'Dar es Salaam',
        },
      }),
    }
  );

  const data = await res.json();
  if (!data.redirect_url) {
    throw new Error('Order submission failed: ' + JSON.stringify(data));
  }

  return {
    orderTrackingId: data.order_tracking_id,
    redirectUrl: data.redirect_url,
    merchantReference: data.merchant_reference,
  };
}

export async function getPesapalStatus(token: string, orderTrackingId: string) {
  const res = await fetch(
    (process.env.PESAPAL_BASE_URL || 'https://cybqa.pesapal.com/pesapalv3') +
      '/api/Transactions/GetTransactionStatus' +
      '?orderTrackingId=' +
      orderTrackingId,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
    }
  );

  const data = await res.json();
  return {
    status: data.payment_status_description || 'PENDING',
    amount: data.amount || 0,
    confirmationCode: data.confirmation_code || '',
    paymentMethod: data.payment_method || '',
  };
}
