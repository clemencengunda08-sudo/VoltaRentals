import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CarDetailClient } from "@/components/car-detail-client";
import { SimilarVehicles } from "@/components/similar-vehicles";
import { Car, Review } from '@/lib/types';
import { serializeDoc } from '@/lib/serialize';
import { use } from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
}

function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-TZ').format(amount);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const { db } = initializeFirebase();
  const carDoc = await getDoc(doc(db, 'cars', id));

  if (!carDoc.exists()) {
    return { title: 'Vehicle Not Found | VoltaRentals' };
  }

  const car = carDoc.data() as Car;

  return {
    title: `${car.year || ''} ${car.make || 'Elite'} ${car.model || 'Vehicle'} | VoltaRentals`,
    description: `Rent the ${car.year || ''} ${car.make} ${car.model} in ${car.location || 'Tanzania'} for TSh ${formatPrice(car.pricePerDay)}/day. ${car.seats || 'Standard'} seats, ${car.transmission}.`,
    openGraph: {
      title: `${car.year || ''} ${car.make} ${car.model} | VoltaRentals`,
      description: `Rent from TSh ${formatPrice(car.pricePerDay)}/day in ${car.location}`,
      images: car.images && car.images.length > 0 ? [car.images[0]] : ['/og-image.jpg'],
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: `${car.year || ''} ${car.make} ${car.model} | VoltaRentals`,
      description: `Rent from TSh ${formatPrice(car.pricePerDay)}/day in ${car.location}`,
      images: car.images && car.images.length > 0 ? [car.images[0]] : ['/og-image.jpg'],
    }
  };
}

export default function CarDetailPage({ params }: PageProps) {
  const { id } = use(params);
  
  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-background pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12">
          <CarDataWrapper id={id} />
        </div>
      </main>
      <Footer />
    </div>
  );
}

async function CarDataWrapper({ id }: { id: string }) {
  const { db } = initializeFirebase();
  
  const carDoc = await getDoc(doc(db, 'cars', id));
  if (!carDoc.exists()) {
    notFound();
  }
  
  const car = serializeDoc({ ...carDoc.data(), id: carDoc.id }) as Car;

  const reviewsQuery = query(
    collection(db, 'reviews'),
    where('carId', '==', id),
    limit(20)
  );
  
  const reviewsSnap = await getDocs(reviewsQuery);
  const reviews = reviewsSnap.docs
    .map(doc => serializeDoc({ ...doc.data(), id: doc.id })) as Review[];

  return (
    <div className="space-y-32">
      <CarDetailClient car={car} reviews={reviews} />
      <SimilarVehicles category={car.category} currentCarId={car.id} />
    </div>
  );
}
