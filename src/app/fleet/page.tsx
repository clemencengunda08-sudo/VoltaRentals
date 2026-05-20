import { Metadata } from 'next';
import { FleetClient } from './fleet-client';

export const metadata: Metadata = {
  title: 'Elite Fleet Registry | VoltaRentals Tanzania',
  description: 'Browse our collection of premium SUVs, Luxury Sedans, and Executive Vans. Verified vehicle registry for elite travelers in Dar es Salaam, Arusha, and Zanzibar.',
  openGraph: {
    title: 'Elite Fleet Registry | VoltaRentals Tanzania',
    description: 'The premier logistical collection for elite travelers in Tanzania.',
    images: ['https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2070&auto=format&fit=crop'],
  },
};

export default function FleetPage() {
  return <FleetClient />;
}
