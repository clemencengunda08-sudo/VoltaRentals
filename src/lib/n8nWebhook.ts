const N8N_BASE = process.env.NEXT_PUBLIC_N8N_BASE_URL || 
  'https://mwijay-automation.duckdns.org/webhook-test/volta-booking';

type WebhookEvent = 
  | 'volta-booking' 
  | 'car-added' 
  | 'driver-added' 
  | 'volta-user-register' 
  | 'payment-verified' 
  | 'booking-status-updated';

export async function triggerN8N(event: WebhookEvent, payload: any) {
  try {
    const url = `${N8N_BASE}/${event}`;
    console.log(`🔔 n8n trigger: ${event}`, payload);
    
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
