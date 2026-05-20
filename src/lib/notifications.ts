'use client';

import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc,
  deleteDoc,
  serverTimestamp, 
  Firestore 
} from 'firebase/firestore';

export type NotificationType = 
  | "booking_received"
  | "booking_confirmed"
  | "booking_cancelled"
  | "booking_active"
  | "booking_completed"
  | "payment_received"
  | "payment_verified"
  | "payment_rejected"
  | "reminder_pickup"
  | "reminder_return"
  | "general";

export type NotificationPayload = {
  userId: string;
  customerName: string;
  customerPhone: string;
  bookingCode: string;
  vehicleName: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  type: NotificationType;
};

/**
 * Saves a notification to Firestore for in-app tracking.
 */
export async function saveNotificationToFirestore(db: Firestore, data: {
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  actionUrl?: string | null
}): Promise<void> {
  const notifRef = doc(collection(db, "notifications"));
  await setDoc(notifRef, {
    ...data,
    id: notifRef.id,
    read: false,
    createdAt: serverTimestamp(),
  });
}

/**
 * Alias for backward compatibility.
 */
export const createNotification = saveNotificationToFirestore;

/**
 * Marks a specific notification as read.
 */
export async function markAsRead(db: Firestore, notificationId: string): Promise<void> {
  await updateDoc(doc(db, "notifications", notificationId), {
    read: true,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Marks all notifications for a user as read.
 */
export async function markAllAsRead(db: Firestore, userId: string): Promise<void> {
  console.log("Marking all read for:", userId);
  // Real implementation would batch update where userId == userId and read == false
}

/**
 * Returns a pre-filled WhatsApp link for Tanzania market.
 */
export function getWhatsAppLink(phone: string, text: string): string {
  const cleanPhone = phone.replace(/\+/g, '').replace(/\s/g, '').replace(/\D/g, '');
  const encodedMessage = encodeURIComponent(text);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

/**
 * Handles "Booking Created" automated notification.
 */
export async function sendBookingCreatedNotification(db: Firestore, p: NotificationPayload) {
  const message = `Hello ${p.customerName}, your booking for ${p.vehicleName} has been received.\n\nBooking Code: ${p.bookingCode}\nDates: ${p.startDate} to ${p.endDate}\nTotal: TSh ${p.totalPrice.toLocaleString()}\n\nPlease complete payment to confirm your booking.\n\nVoltaRentals.`;
  
  await saveNotificationToFirestore(db, {
    userId: p.userId,
    type: "booking_received",
    title: "Registry Acknowledged",
    message: `Booking ${p.bookingCode} is logged. Complete payment to secure asset.`,
    actionUrl: `/dashboard/bookings/${p.bookingCode}`,
  });

  return getWhatsAppLink(p.customerPhone, message);
}

/**
 * Handles "Payment Confirmed" automated notification.
 */
export async function sendPaymentConfirmedNotification(db: Firestore, p: NotificationPayload) {
  const message = `Hello ${p.customerName}, payment confirmed for booking ${p.bookingCode}. Your ${p.vehicleName} is reserved from ${p.startDate} to ${p.endDate}. Our team will contact you before pickup.\n\nVoltaRentals.`;
  
  await saveNotificationToFirestore(db, {
    userId: p.userId,
    type: "payment_verified",
    title: "Settlement Verified ✅",
    message: `Payment for ${p.bookingCode} is verified. Your expedition is confirmed.`,
    actionUrl: `/dashboard`,
  });

  return getWhatsAppLink(p.customerPhone, message);
}

export async function deleteNotification(db: Firestore, notificationId: string): Promise<void> {
  await deleteDoc(doc(db, "notifications", notificationId));
}
