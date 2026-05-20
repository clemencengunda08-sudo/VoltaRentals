import { Booking } from "./types";
import { format } from "date-fns";

/**
 * Generates a pre-filled WhatsApp link for Tanzania numbers.
 */
export function getWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

/**
 * Message for confirmed booking.
 */
export function getBookingConfirmedMessage(booking: Booking): string {
  const start = format(new Date(booking.startDate), "PPP");
  const end = format(new Date(booking.endDate), "PPP");
  
  return `Hello ${booking.userName}! 🎉

Your VoltaRentals booking has been confirmed!

📋 Booking: ${booking.bookingCode}
🚗 Vehicle: ${booking.vehicleName}
📅 Dates: ${start} → ${end}
💰 Total: TSh ${booking.totalPrice.toLocaleString()}

Please complete payment to secure your booking.
Pay here: https://voltarentals.co.tz/booking/${booking.id}/payment

Thank you for choosing VoltaRentals! 🚗`;
}

/**
 * Message for verified payment.
 */
export function getPaymentVerifiedMessage(booking: Booking): string {
  return `Hello ${booking.userName}! ✅

Your payment for ${booking.bookingCode} has been verified!

🚗 Vehicle: ${booking.vehicleName}
📅 Pickup: ${format(new Date(booking.startDate), "PPP")}
💳 Amount Paid: TSh ${booking.totalPrice.toLocaleString()}

Your booking is fully confirmed. Please arrive at the pickup location on time.

VoltaRentals Team 🇹🇿`;
}

/**
 * Reminder message.
 */
export function getBookingReminderMessage(booking: Booking): string {
  return `Hello ${booking.userName}! 🔔

Friendly reminder for your VoltaRentals booking ${booking.bookingCode} starting tomorrow, ${format(new Date(booking.startDate), "EEEE")}.

Vehicle: ${booking.vehicleName}
Location: ${booking.pickupLocation}

We look forward to seeing you! 🚗`;
}
