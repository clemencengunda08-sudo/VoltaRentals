import { Metadata } from 'next';
import { AboutClient } from './about-client';

export const metadata: Metadata = {
  title: 'Our Story | VoltaRentals Tanzania',
  description: 'Learn about the Volta Standard. We are Tanzanias premier logistical partner for elite travelers, events, and corporate summits. Safety, Transparency, and Elite Service.',
  openGraph: {
    title: 'The Volta Standard | Premium Car Rentals Tanzania',
    description: 'Redefining vehicle rental standards in the United Republic of Tanzania.',
    images: ['https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=2070&auto=format&fit=crop'],
  },
};

export default function AboutPage() {
  return <AboutClient />;
}
