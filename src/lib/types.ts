import { Timestamp } from "firebase/firestore";

export type UserRole = "customer" | "super_admin" | "company_admin" | "staff" | "viewer" | "driver";

export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  plateNumber: string;
  category: "SUV" | "Sedan" | "Van" | "Bus" | "Pickup" | "Luxury" | "Minibus";
  classTier?: "Economical" | "Comfortable" | "Luxury" | string;
  capacityTier?: "1-2" | "3-4" | "5-7" | "8+" | string;
  color: string;
  seats: number;
  transmission: "Automatic" | "Manual";
  fuelType: "Petrol" | "Diesel" | "Electric" | "Hybrid";
  pricePerDay: number;
  pricePerWeek: number;
  pricePerMonth: number;
  withDriverCostPerDay: number;
  available: boolean;
  location: "Dar es Salaam" | "Arusha" | "Dodoma" | "Mwanza" | "Zanzibar" | "Mbeya" | "Tanga" | "Morogoro";
  images: string[];
  features: string[];
  description: string;
  mileage: number;
  insuranceValid: boolean;
  insuranceExpiry: string;
  addedBy: string;
  rating: number;
  totalRentals: number;
  companyId: string;
  discountPrice?: number;
  // AI & Analytics Fields
  occupancyRate?: number; // 0-100
  pricingRecommendation?: {
    suggestedPrice: number;
    reason: string;
    trend: 'up' | 'down' | 'stable';
  };
  createdAt: Timestamp | string | any;
  updatedAt: Timestamp | string | any;
}

export interface Booking {
  id: string;
  bookingCode: string;
  userId: string;
  userName: string;
  userPhone: string;
  userEmail: string;
  vehicleId: string;
  vehicleName: string;
  vehiclePlate: string;
  vehicleCategory: string;
  pricePerDay: number;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalPrice: number;
  amountPaid: number;
  balanceDue: number;
  withDriver: boolean;
  driverCost: number;
  driverName?: string;
  driverEmail?: string;
  tripPurpose?: string;
  location: string;
  pickupLocation: string;
  pickupTime?: string;
  specialRequirements?: string;
  status: "pending" | "confirmed" | "active" | "completed" | "cancelled";
  paymentStatus: "unpaid" | "partial" | "paid";
  currency: "TZS";
  companyId: string;
  companyName: string;
  reminder48Sent: boolean;
  reminder24Sent: boolean;
  aiEmailSent: boolean;
  // Loyalty & Redemption
  pointsRedeemed?: number;
  discountApplied?: number;
  // Intelligence Node Fields
  aiPersonalityTag?: "luxury" | "corporate" | "adventure" | "standard";
  geminiInsight?: string;
  riskStatus?: "low" | "medium" | "high";
  riskReason?: string;
  rebookingAttemptedAt?: string;
  contractUrl?: string;
  hasReview?: boolean;
  notes?: { text: string; addedBy: string; addedByName: string; createdAt: string }[];
  createdAt: Timestamp | string | any;
  updatedAt: Timestamp | string | any;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  phoneNumber?: string;
  photoURL?: string;
  role: UserRole;
  companyId?: string;
  verified?: boolean;
  voltaPoints?: number;
  totalSpent?: number;
  city?: string;
  adminNotes?: { text: string; addedBy: string; addedByName: string; createdAt: string }[];
  createdAt: any;
  updatedAt: any;
}

export interface Branding {
  companyName: string;
  tagline: string;
  logoUrl: string;
  faviconUrl?: string;
  themeColor?: string;
  showSplash?: boolean;
  enableSounds?: boolean;
  heroImageUrl: string;
  heroVideoUrl: string;
  suvImageUrl: string;
  sedanImageUrl: string;
  vanImageUrl: string;
  luxuryImageUrl: string;
  aboutImageUrl?: string;
  precisionImageUrl?: string;
  experienceMediaUrl: string;
  experienceMediaType: "image" | "video";
  activeTheme: string;
  activeFont?: string;
  whatsappNumber: string;
  supportEmail: string;
  officeAddress: string;
  lipaNamba?: string;
  n8nWebhookUrl?: string;
  aiKeys?: string[];
  stats?: {
    deployed: number;
    missions: number;
    satisfaction: number;
    cities: number;
  };
  marqueeItems?: { label: string; tag: string; plate: string }[];
  updatedAt: any;
  updatedBy: string;
}

export interface Review {
  id: string;
  bookingId: string;
  bookingCode: string;
  carId: string;
  carName: string;
  customerId: string;
  customerName: string;
  rating: number;
  title: string;
  comment: string;
  tags?: string[];
  helpful?: number;
  helpfulVoters?: string[];
  adminReply?: string | null;
  adminReplyAt?: any;
  status?: "published" | "pending" | "hidden" | string;
  createdAt: any;
  updatedAt: any;
}

export interface Payment {
  id?: string;
  bookingId: string;
  orderTrackingId?: string;
  confirmationCode?: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  autoVerified?: boolean;
  source: string;
  verifiedAt?: any;
  createdAt: any;
}
