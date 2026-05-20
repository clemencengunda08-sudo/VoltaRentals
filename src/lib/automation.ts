
/**
 * @fileOverview Automation utilities for triggering N8N workflows.
 * Enhanced for AI Strategic Intelligence, Risk Detection, and Personality Tags.
 */

import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';

async function triggerWebhook(endpoint: string, data: any) {
  let webhookUrl = '';
  let companyName = 'Volta Rentals Tanzania';

  try {
    const brandingRef = doc(db, 'settings', 'branding');
    const brandingSnap = await getDoc(brandingRef);
    if (brandingSnap.exists()) {
      webhookUrl = brandingSnap.data().n8nWebhookUrl || '';
      companyName = brandingSnap.data().companyName || companyName;
    }
  } catch (e) {
    console.warn("Automation: Settings fetch failed.");
  }

  if (!webhookUrl) {
    console.warn(`N8N Automation: No webhook URL configured for ${endpoint}`);
    return;
  }
  
  const payload = {
    timestamp: new Date().toISOString(),
    companyName: companyName,
    companyId: data.companyId || 'volta001',
    event: endpoint,
    
    // Core Data (Accounting Sheet Ready)
    bookingCode: data.bookingCode,
    customerName: data.userName,
    phone: data.userPhone,
    email: data.userEmail,
    vehicle: data.vehicleName,
    pickupLocation: data.pickupLocation,
    startDate: data.startDate,
    endDate: data.endDate,
    duration: data.totalDays,
    amount: data.totalPrice,
    status: data.status,
    paymentStatus: data.paymentStatus,
    amountPaid: data.amountPaid || 0,
    balanceDue: (data.totalPrice || 0) - (data.amountPaid || 0),
    
    // AI Strategic Inputs (For Gemini to Process)
    aiPersonalityTag: data.aiPersonalityTag || 'standard',
    geminiInsight: data.geminiInsight || '',
    riskStatus: data.riskStatus || 'low',
    riskReason: data.riskReason || '',
    
    // Logistics
    driverName: data.driverName || 'UNASSIGNED',
    driverEmail: data.driverEmail || '',
    reminder48Sent: data.reminder48Sent || false,
    reminder24Sent: data.reminder24Sent || false,
    contractUrl: data.contractUrl || '',
    
    raw: data
  };

  try {
    // Intelligently handle base URL vs full URL to avoid double-pathing
    let finalUrl = webhookUrl;
    if (!finalUrl.endsWith(endpoint) && !finalUrl.includes(endpoint)) {
      finalUrl = finalUrl.endsWith('/') ? `${finalUrl}${endpoint}` : `${finalUrl}/${endpoint}`;
    }

    const res = await fetch(finalUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch (e) {
    console.error(`N8N ${endpoint} Trigger Failed:`, e);
    return false;
  }
}

export const automation = {
  userRegistered: (userData: any) => triggerWebhook('volta-user-register', userData),
  newBooking: (bookingData: any) => triggerWebhook('volta-booking', bookingData),
  paymentVerified: (paymentData: any) => triggerWebhook('payment-verified', paymentData),
  bookingStatusUpdated: (bookingData: any) => triggerWebhook('booking-status-updated', bookingData),
  bookingCompleted: (bookingData: any) => triggerWebhook('booking-completed', bookingData),
  riskAlertTriggered: (alertData: any) => triggerWebhook('risk-alert', alertData),
  pricingStrategyUpdate: (priceData: any) => triggerWebhook('pricing-strategy', priceData)
};
