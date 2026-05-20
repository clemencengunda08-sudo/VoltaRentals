
'use client';

import { 
  collection, 
  query, 
  where, 
  getDocs, 
  Firestore,
  addDoc,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { differenceInCalendarDays, format, addDays, isWithinInterval, startOfDay, endOfDay } from 'date-fns';

/**
 * Checks if a vehicle is available for a given date range.
 * Considers bookings (pending, confirmed, active) and manual blocks.
 */
export async function checkCarAvailability(
  db: Firestore,
  carId: string, 
  startDate: Date, 
  endDate: Date,
  excludeBookingId?: string
): Promise<{
  available: boolean;
  conflictingDates: string[];
  message: string;
}> {
  const conflictingDates: string[] = [];
  const reqStart = startOfDay(startDate);
  const reqEnd = endOfDay(endDate);

  // 1. Check existing bookings
  const bookingsRef = collection(db, 'bookings');
  const qBookings = query(
    bookingsRef,
    where('vehicleId', '==', carId),
    where('status', 'in', ['pending', 'confirmed', 'active'])
  );

  const bookingSnap = await getDocs(qBookings);
  bookingSnap.forEach((doc) => {
    if (excludeBookingId && doc.id === excludeBookingId) return;
    
    const data = doc.data();
    const existingStart = new Date(data.startDate);
    const existingEnd = new Date(data.endDate);

    // Overlap Logic: existingStart <= requestedEnd AND existingEnd >= requestedStart
    if (existingStart <= reqEnd && existingEnd >= reqStart) {
      conflictingDates.push(`${format(existingStart, 'MMM dd')} - ${format(existingEnd, 'MMM dd')}`);
    }
  });

  // 2. Check manual blocks
  const blocksRef = collection(db, 'cars', carId, 'blockedDates');
  const blocksSnap = await getDocs(blocksRef);
  blocksSnap.forEach((doc) => {
    const data = doc.data();
    const blockStart = new Date(data.startDate);
    const blockEnd = new Date(data.endDate);

    if (blockStart <= reqEnd && blockEnd >= reqStart) {
      conflictingDates.push(`${format(blockStart, 'MMM dd')} - ${format(blockEnd, 'MMM dd')} (Blocked)`);
    }
  });

  const available = conflictingDates.length === 0;
  return {
    available,
    conflictingDates,
    message: available 
      ? "Vehicle is available for your selected dates!" 
      : "This vehicle is already booked for some of your selected dates."
  };
}

/**
 * Returns an array of all booked/blocked dates for a car.
 */
export async function getBookedDatesForCar(db: Firestore, carId: string): Promise<Date[]> {
  const dates: Date[] = [];
  
  // Get bookings
  const qBookings = query(
    collection(db, 'bookings'),
    where('vehicleId', '==', carId),
    where('status', 'in', ['pending', 'confirmed', 'active'])
  );
  const bSnap = await getDocs(qBookings);
  bSnap.forEach(d => {
    const data = d.data();
    let curr = startOfDay(new Date(data.startDate));
    const end = startOfDay(new Date(data.endDate));
    while (curr <= end) {
      dates.push(new Date(curr));
      curr = addDays(curr, 1);
    }
  });

  // Get blocks
  const qBlocks = query(collection(db, 'cars', carId, 'blockedDates'));
  const blSnap = await getDocs(qBlocks);
  blSnap.forEach(d => {
    const data = d.data();
    let curr = startOfDay(new Date(data.startDate));
    const end = startOfDay(new Date(data.endDate));
    while (curr <= end) {
      dates.push(new Date(curr));
      curr = addDays(curr, 1);
    }
  });

  return dates;
}

/**
 * Calculates the total rental price with breakdown.
 * Modified to support Tanzania-specific fees (airport, insurance).
 */
export function calculateRentalPrice(
  pricePerDay: number,
  startDate: Date,
  endDate: Date,
  withDriver: boolean,
  driverCostPerDay: number,
  insurancePerDay: number = 0,
  airportFee: number = 0
) {
  const totalDays = Math.max(1, differenceInCalendarDays(endDate, startDate) + 1);
  const carCost = totalDays * pricePerDay;
  const driverCost = withDriver ? totalDays * driverCostPerDay : 0;
  const insuranceCost = totalDays * insurancePerDay;
  const totalPrice = carCost + driverCost + insuranceCost + airportFee;

  const formatter = new Intl.NumberFormat('en-TZ', {
    style: 'currency',
    currency: 'TZS',
    minimumFractionDigits: 0,
  });

  return {
    totalDays,
    carCost,
    driverCost,
    insuranceCost,
    airportFee,
    totalPrice,
    formattedTotal: formatter.format(totalPrice).replace('TZS', 'TSh'),
  };
}
