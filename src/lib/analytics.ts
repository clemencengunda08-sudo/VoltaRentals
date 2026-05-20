'use client';

import { 
  collection, 
  query, 
  where, 
  getDocs, 
  Firestore, 
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { 
  startOfMonth, 
  endOfMonth, 
  subMonths, 
  format, 
  isSameMonth, 
  subDays,
  startOfDay,
  endOfDay,
  eachDayOfInterval,
  isSameDay
} from 'date-fns';
import { Booking, Car, Payment, UserProfile } from './types';

/**
 * Fetches revenue and booking counts grouped by month for a specific year.
 */
export async function getRevenueByMonth(db: Firestore, year: number) {
  const bookingsRef = collection(db, "bookings");
  const q = query(bookingsRef, where("paymentStatus", "==", "paid"));
  const snapshot = await getDocs(q);
  
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const data = months.map(month => ({ month, revenue: 0, bookings: 0 }));

  snapshot.forEach(doc => {
    const booking = doc.data() as Booking;
    const date = booking.createdAt?.toDate?.() || new Date(0);
    if (date.getFullYear() === year) {
      const monthIndex = date.getMonth();
      data[monthIndex].revenue += booking.totalPrice || 0;
      data[monthIndex].bookings += 1;
    }
  });

  return data;
}

/**
 * Aggregates bookings by their current status.
 */
export async function getBookingsByStatus(db: Firestore) {
  const bookingsRef = collection(db, "bookings");
  const snapshot = await getDocs(bookingsRef);
  
  const statusCounts: Record<string, number> = {
    pending: 0,
    confirmed: 0,
    active: 0,
    completed: 0,
    cancelled: 0
  };

  snapshot.forEach(doc => {
    const status = doc.data().status;
    if (statusCounts[status] !== undefined) {
      statusCounts[status]++;
    }
  });

  return [
    { name: "Pending", value: statusCounts.pending, color: "#F59E0B" },
    { name: "Confirmed", value: statusCounts.confirmed, color: "#3B82F6" },
    { name: "Active", value: statusCounts.active, color: "#8B5CF6" },
    { name: "Completed", value: statusCounts.completed, color: "#10B981" },
    { name: "Cancelled", value: statusCounts.cancelled, color: "#EF4444" }
  ];
}

/**
 * Aggregates bookings and revenue by car category.
 */
export async function getBookingsByCategory(db: Firestore) {
  const bookingsRef = collection(db, "bookings");
  const snapshot = await getDocs(bookingsRef);
  
  const categories: Record<string, { count: number, revenue: number }> = {};

  snapshot.forEach(doc => {
    const b = doc.data() as Booking;
    const cat = b.vehicleCategory || "SUV";
    if (!categories[cat]) categories[cat] = { count: 0, revenue: 0 };
    categories[cat].count++;
    if (b.paymentStatus === 'paid') categories[cat].revenue += b.totalPrice || 0;
  });

  return Object.entries(categories).map(([category, data]) => ({
    category,
    count: data.count,
    revenue: data.revenue
  })).sort((a, b) => b.revenue - a.revenue);
}

/**
 * Identifies the most profitable cars in the fleet.
 */
export async function getTopPerformingCars(db: Firestore, limitCount: number = 5) {
  const carsRef = collection(db, "cars");
  const carsSnap = await getDocs(carsRef);
  
  const bookingsRef = collection(db, "bookings");
  const bookingsSnap = await getDocs(query(bookingsRef, where("paymentStatus", "==", "paid")));
  
  const carStats: Record<string, { name: string, category: string, rentals: number, revenue: number, image: string, rating: number }> = {};

  carsSnap.forEach(doc => {
    const car = doc.data() as Car;
    carStats[car.id] = {
      name: `${car.make} ${car.model}`,
      category: car.category,
      rentals: 0,
      revenue: 0,
      image: car.images?.[0] || "",
      rating: car.rating || 0
    };
  });

  bookingsSnap.forEach(doc => {
    const b = doc.data() as Booking;
    if (carStats[b.vehicleId]) {
      carStats[b.vehicleId].rentals++;
      carStats[b.vehicleId].revenue += b.totalPrice || 0;
    }
  });

  return Object.values(carStats)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limitCount);
}

/**
 * Calculates high-level revenue statistics and growth.
 */
export async function getRevenueStats(db: Firestore) {
  const bookingsRef = collection(db, "bookings");
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  
  const snapshot = await getDocs(query(
    bookingsRef, 
    where("paymentStatus", "==", "paid"),
    where("createdAt", ">=", ninetyDaysAgo),
    limit(500)
  ));
  
  const now = new Date();
  const startOfThisMonth = startOfMonth(now);
  const startOfLastMonth = startOfMonth(subMonths(now, 1));
  const endOfLastMonth = endOfMonth(subMonths(now, 1));

  let todayRev = 0, weekRev = 0, thisMonthRev = 0, lastMonthRev = 0, allTimeRev = 0;

  snapshot.forEach(doc => {
    const b = doc.data() as Booking;
    const date = b.createdAt?.toDate?.() || new Date(0);
    const amount = b.totalPrice || 0;

    allTimeRev += amount;
    if (isSameDay(date, now)) todayRev += amount;
    if (date >= subDays(now, 7)) weekRev += amount;
    if (date >= startOfThisMonth) thisMonthRev += amount;
    if (date >= startOfLastMonth && date <= endOfLastMonth) lastMonthRev += amount;
  });

  const momGrowth = lastMonthRev === 0 ? 0 : ((thisMonthRev - lastMonthRev) / lastMonthRev) * 100;

  return {
    todayRevenue: todayRev,
    thisWeekRevenue: weekRev,
    thisMonthRevenue: thisMonthRev,
    lastMonthRevenue: lastMonthRev,
    allTimeRevenue: allTimeRev,
    monthOverMonthGrowth: Number(momGrowth.toFixed(1))
  };
}

/**
 * Calculates customer acquisition and retention metrics.
 */
export async function getCustomerStats(db: Firestore) {
  const usersRef = collection(db, "users");
  const snapshot = await getDocs(usersRef);
  
  const now = new Date();
  const startOfThisMonth = startOfMonth(now);
  const startOfLastMonth = startOfMonth(subMonths(now, 1));

  let total = 0, thisMonth = 0, lastMonth = 0;

  snapshot.forEach(doc => {
    const u = doc.data() as UserProfile;
    const date = u.createdAt?.toDate() || now;
    total++;
    if (date >= startOfThisMonth) thisMonth++;
    else if (date >= startOfLastMonth) lastMonth++;
  });

  const growth = lastMonth === 0 ? 0 : ((thisMonth - lastMonth) / lastMonth) * 100;

  return {
    totalCustomers: total,
    newThisMonth: thisMonth,
    customerGrowth: Number(growth.toFixed(1))
  };
}

/**
 * Generates daily trend data for charts.
 */
export async function getBookingTrends(db: Firestore, days: number = 30) {
  const bookingsRef = collection(db, "bookings");
  const startDate = startOfDay(subDays(new Date(), days));
  const q = query(bookingsRef, where("createdAt", ">=", startDate));
  const snapshot = await getDocs(q);

  const interval = eachDayOfInterval({
    start: startDate,
    end: endOfDay(new Date())
  });

  const data = interval.map(date => ({
    date: format(date, "dd MMM"),
    bookings: 0,
    revenue: 0,
    rawDate: date
  }));

  snapshot.forEach(doc => {
    const b = doc.data() as Booking;
    const bDate = b.createdAt?.toDate?.() || new Date(0);
    const dayData = data.find(d => isSameDay(d.rawDate, bDate));
    if (dayData) {
      dayData.bookings++;
      if (b.paymentStatus === 'paid') dayData.revenue += b.totalPrice || 0;
    }
  });

  return data;
}

/**
 * Calculates how often each car is booked (Occupancy).
 */
export async function getOccupancyRate(db: Firestore) {
  const carsRef = collection(db, "cars");
  const carsSnap = await getDocs(carsRef);
  
  const bookingsRef = collection(db, "bookings");
  const bookingsSnap = await getDocs(query(bookingsRef, where("status", "in", ["active", "completed"])));
  
  const now = new Date();
  const thirtyDaysAgo = subDays(now, 30);

  const stats: Record<string, { name: string, category: string, bookedDays: number, status: boolean }> = {};

  carsSnap.forEach(doc => {
    const car = doc.data() as Car;
    stats[car.id] = { name: `${car.make} ${car.model}`, category: car.category, bookedDays: 0, status: car.available };
  });

  bookingsSnap.forEach(doc => {
    const b = doc.data() as Booking;
    const start = new Date(b.startDate);
    if (start >= thirtyDaysAgo && stats[b.vehicleId]) {
      stats[b.vehicleId].bookedDays += b.totalDays || 0;
    }
  });

  return Object.entries(stats).map(([id, data]) => ({
    carId: id,
    carName: data.name,
    category: data.category,
    occupancyRate: Math.min(100, Number(((data.bookedDays / 30) * 100).toFixed(1))),
    status: data.status ? "Available" : "Maintenance"
  })).sort((a, b) => b.occupancyRate - a.occupancyRate);
}
