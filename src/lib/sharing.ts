'use client';

/**
 * @fileOverview Social sharing utilities for VoltaRentals.
 */

import { toast } from "@/hooks/use-toast";

function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-TZ').format(amount);
}

function formatDate(date: any): string {
  const d = date?.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString('en-TZ', { 
    day: 'numeric', month: 'short', year: 'numeric' 
  });
}

export function shareOnWhatsApp(message: string, url?: string): void {
  const encoded = encodeURIComponent(message + (url ? '\n\n' + url : ''));
  window.open('https://wa.me/?text=' + encoded, '_blank');
}

export function shareOnTwitter(text: string, url?: string): void {
  const encoded = encodeURIComponent(text);
  const urlEncoded = url ? '&url=' + encodeURIComponent(url) : '';
  window.open('https://twitter.com/intent/tweet?text=' + encoded + urlEncoded, '_blank');
}

export function shareOnFacebook(url: string): void {
  window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url), '_blank');
}

export function shareOnInstagramStory(url: string): void {
  // Instagram doesn't have a direct web share API for stories
  navigator.clipboard.writeText(url).then(() => {
    toast({
      title: "Ready to share! 📸",
      description: "Screenshot this page and share on Instagram Stories! The link has been copied to your clipboard.",
    });
  });
}

export async function copyLink(url: string): Promise<void> {
  await navigator.clipboard.writeText(url);
  toast({ title: "Link copied! 📋", description: "You can now paste it anywhere." });
}

export async function nativeShare(data: { title: string, text: string, url: string }): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share(data);
      return true;
    } catch (err) {
      console.warn("Native share failed:", err);
      return false;
    }
  }
  return false;
}

export function generateCarShareMessage(car: any, url: string): string {
  return `🚗 *Check out this vehicle on VoltaRentals!*

━━━━━━━━━━━━━━━━━━━━
🏷️ *${car.year} ${car.make} ${car.model}*
━━━━━━━━━━━━━━━━━━━━

📋 Category: ${car.category}
👥 Seats: ${car.seats || 'Standard'} passengers
⚙️ Transmission: ${car.transmission}
⛽ Fuel: ${car.fuelType}
📍 Location: ${car.location}

💰 *Starting at TSh ${formatPrice(car.pricePerDay)}/day*

✅ Fully insured
✅ Well maintained
✅ Professional service

🌐 Book online now:
${url}

━━━━━━━━━━━━━━━━━━━━
🇹🇿 VoltaRentals - Premium Car Rentals Tanzania`;
}

export function generateBookingShareMessage(booking: any): string {
  return `🎉 *I just booked a car with VoltaRentals!*

━━━━━━━━━━━━━━━━━━━━
🚗 *${booking.vehicleName}*
📅 ${formatDate(booking.startDate)} → ${formatDate(booking.endDate)}
📍 ${booking.pickupLocation || 'Dar es Salaam'}
━━━━━━━━━━━━━━━━━━━━

Looking for reliable car rental in Tanzania?
Check out VoltaRentals! 🇹🇿

🌐 voltarentals.co.tz

#VoltaRentals #CarRental #Tanzania`;
}

export function generateWebsiteShareMessage(): string {
  return `🚗 *VoltaRentals - Premium Car Rentals in Tanzania*

Looking for reliable vehicle rental?

✅ 50+ Premium Vehicles
✅ SUVs, Sedans, Luxury, Vans, Buses
✅ Professional Drivers Available
✅ Serving 8+ Cities in Tanzania
✅ Digital Booking & Contracts
✅ M-Pesa Payment Accepted

💰 Starting from TSh 80,000/day

🌐 Book now: voltarentals.co.tz

━━━━━━━━━━━━━━━━━━━━
Weddings 💍 | Corporate 🏢 | Safari 🦁
Airport ✈️ | Events 🎓 | Long Term 📅
━━━━━━━━━━━━━━━━━━━━

🇹🇿 Your trusted car rental partner`;
}

export function generateFleetShareMessage(cars: any[]): string {
  const total = cars.length;
  const list = cars.slice(0, 5).map((car, i) => 
    `${i + 1}. *${car.make} ${car.model}* - TSh ${formatPrice(car.pricePerDay)}/day`
  ).join('\n');

  return `🚗 *VoltaRentals Fleet Highlights*

Top vehicles available now:

${list}

${total > 5 ? `...and ${total - 5} more vehicles!` : ''}

🌐 Browse full fleet: voltarentals.co.tz/fleet

🇹🇿 VoltaRentals Tanzania`;
}
