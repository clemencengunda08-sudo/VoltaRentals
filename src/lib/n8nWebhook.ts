import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';

const N8N_BASE = process.env.NEXT_PUBLIC_N8N_BASE_URL || 
  'https://mwijay-automation.duckdns.org/webhook-test/volta-booking';

type WebhookEvent = 
  | 'volta-booking' 
  | 'car-added' 
  | 'driver-added' 
  | 'volta-user-register' 
  | 'payment-verified' 
  | 'booking-status-updated'
  | 'telegram-webhook';

export async function triggerN8N(event: WebhookEvent, payload: any) {
  try {
    let specificUrl = '';

    // 1. Check environment variable overrides first
    if (event === 'volta-booking') specificUrl = process.env.NEXT_PUBLIC_N8N_URL_BOOKING || '';
    else if (event === 'payment-verified') specificUrl = process.env.NEXT_PUBLIC_N8N_URL_PAYMENT || '';
    else if (event === 'booking-status-updated') specificUrl = process.env.NEXT_PUBLIC_N8N_URL_STATUS || '';
    else if (event === 'car-added') specificUrl = process.env.NEXT_PUBLIC_N8N_URL_CAR || '';
    else if (event === 'driver-added') specificUrl = process.env.NEXT_PUBLIC_N8N_URL_DRIVER || '';
    else if (event === 'volta-user-register') specificUrl = process.env.NEXT_PUBLIC_N8N_URL_USER || '';
    else if (event === 'telegram-webhook') specificUrl = process.env.NEXT_PUBLIC_N8N_URL_TELEGRAM || '';

    // 2. Check Firestore overrides if environment variables are not configured
    if (!specificUrl) {
      try {
        const brandingRef = doc(db, 'settings', 'branding');
        const brandingSnap = await getDoc(brandingRef);
        if (brandingSnap.exists()) {
          const snapData = brandingSnap.data();
          if (event === 'volta-booking') specificUrl = snapData.webhookUrlBooking || '';
          else if (event === 'payment-verified') specificUrl = snapData.webhookUrlPayment || '';
          else if (event === 'booking-status-updated') specificUrl = snapData.webhookUrlStatus || '';
          else if (event === 'car-added') specificUrl = snapData.webhookUrlCar || '';
          else if (event === 'driver-added') specificUrl = snapData.webhookUrlDriver || '';
          else if (event === 'volta-user-register') specificUrl = snapData.webhookUrlUser || '';
          else if (event === 'telegram-webhook') specificUrl = snapData.webhookUrlTelegram || '';
        }
      } catch (firestoreErr) {
        console.warn('n8nWebhook: Firestore overrides fetch skipped or failed.');
      }
    }

    let url = '';
    if (specificUrl) {
      url = specificUrl.trim();
    } else {
      let inputUrl = N8N_BASE.trim().replace(/\/+$/, '');
      
      // Determine if sandbox or production webhook type
      let webhookType = 'webhook-test';
      if (inputUrl.includes('/webhook/')) {
        webhookType = 'webhook';
      } else if (inputUrl.includes('/webhook-test/')) {
        webhookType = 'webhook-test';
      } else if (inputUrl.endsWith('/webhook')) {
        webhookType = 'webhook';
      } else if (inputUrl.endsWith('/webhook-test')) {
        webhookType = 'webhook-test';
      }
      
      // Extract base domain
      let baseDomain = '';
      try {
        const parsed = new URL(inputUrl);
        baseDomain = `${parsed.protocol}//${parsed.host}`;
      } catch {
        const match = inputUrl.match(/^(https?:\/\/[^\/]+)/);
        baseDomain = match ? match[1] : inputUrl;
      }
      
      if (event === 'telegram-webhook') {
        url = `${baseDomain}/${webhookType}/volta-tg-bot/webhook`;
      } else {
        url = `${baseDomain}/${webhookType}/volta-booking/${event}`;
      }
    }

    console.log(`🔔 n8n trigger: ${event} -> ${url}`, payload);
    
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    
    if (!res.ok) throw new Error(`Webhook failed: ${res.status}`);
    const data = await res.json();
    console.log(`✅ n8n success:`, data);
    return data;
  } catch (error) {
    console.error(`❌ n8n error (${event}):`, error);
    // Don't throw — webhooks should not block main flow
    return null;
  }
}

// Convenience functions
export const notifyTelegramBot = (payload: any) =>
  triggerN8N('telegram-webhook', payload);

export const notifyNewCar = (car: any) => 
  triggerN8N('car-added', {
    firebaseId: car.id,
    make: car.make || car.brand,
    model: car.model || car.name,
    plateNumber: car.plateNumber || car.plate,
    category: car.category || car.type,
    dailyRate: Number(car.dailyRate || car.rate || car.pricePerDay),
    status: car.status || 'Available',
    imageUrl: car.imageUrl || car.image || car.images?.[0],
    description: car.description,
  });

export const notifyNewDriver = (driver: any) =>
  triggerN8N('driver-added', {
    firebaseId: driver.id,
    fullName: driver.fullName || driver.displayName || driver.name,
    phone: driver.phoneNumber || driver.phone,
    email: driver.email,
    licenseNumber: driver.licenseNumber || 'N/A',
    status: driver.status || 'Available',
    experience: driver.experience || 0,
    rating: driver.rating || 5.0,
  });

export const notifyNewUser = (user: any) =>
  triggerN8N('volta-user-register', {
    firebaseId: user.uid || user.id,
    name: user.displayName || user.name,
    email: user.email,
    phone: user.phoneNumber || user.phone,
  });

export const notifyNewBooking = (booking: any, carData: any) =>
  triggerN8N('volta-booking', {
    firebaseId: booking.id,
    bookingCode: booking.bookingCode,
    customerName: booking.customerName || booking.userName,
    phone: booking.phone || booking.userPhone,
    email: booking.email || booking.userEmail,
    vehicle: `${carData.make} ${carData.model}`,
    carId: carData.id,
    plateNumber: carData.plateNumber,
    pickupLocation: booking.pickupLocation || 'Dar es Salaam',
    startDate: booking.startDate,
    endDate: booking.endDate,
    dailyRate: Number(carData.dailyRate || carData.pricePerDay),
    chauffeur: booking.chauffeur || booking.driverIncluded || false,
    notes: booking.notes || '',
  });
