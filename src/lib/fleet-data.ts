
import { PlaceHolderImages } from './placeholder-images';

export interface EV {
  id: string;
  make: string;
  model: string;
  year: number;
  capacity: number;
  range: string;
  pricePerDay: number;
  suitability: string[];
  features: string[];
  imageUrl: string;
  description: string;
}

const getImage = (id: string) => PlaceHolderImages.find(img => img.id === id)?.imageUrl || "";

export const FLEET: EV[] = [
  {
    id: 'fleet-1',
    make: 'Toyota',
    model: 'Land Cruiser V8',
    year: 2026,
    capacity: 7,
    range: '800km (Diesel)',
    pricePerDay: 450000,
    suitability: ['Wedding', 'Corporate', 'VIP Transport'],
    features: ['Armored Options', 'Luxury Leather', 'Climate Control', 'Professional Chauffeur'],
    imageUrl: getImage('model-s'), // Reusing IDs but content is new
    description: 'The ultimate symbol of prestige in Dar es Salaam. Perfect for high-profile weddings and executive business trips.'
  },
  {
    id: 'fleet-2',
    make: 'Toyota',
    model: 'Prado TXL',
    year: 2023,
    capacity: 7,
    range: '750km (Petrol)',
    pricePerDay: 250000,
    suitability: ['Business', 'Tourism', 'Personal Use'],
    features: ['4WD Capability', 'Spacious Cargo', 'Bluetooth Audio', 'Reliable Performance'],
    imageUrl: getImage('rivian-r1s'),
    description: 'A versatile workhorse for both city driving and up-country trips to Arusha or Dodoma.'
  },
  {
    id: 'fleet-3',
    make: 'Mercedes-Benz',
    model: 'S-Class S500',
    year: 2026,
    capacity: 4,
    range: '600km',
    pricePerDay: 750000,
    suitability: ['Wedding', 'VIP Events'],
    features: ['Panoramic Roof', 'Massaging Seats', 'Ambient Lighting', 'Premium Sound'],
    imageUrl: getImage('lucid-air'),
    description: 'Absolute luxury for the most special occasions. Arrive in unparalleled comfort and status.'
  },
  {
    id: 'fleet-4',
    make: 'Toyota',
    model: 'Alphard Executive',
    year: 2022,
    capacity: 7,
    range: '650km',
    pricePerDay: 300000,
    suitability: ['Wedding', 'Group Corporate', 'Airport Transfer'],
    features: ['Captain Seats', 'Dual Sunroof', 'Auto Sliding Doors', 'Silent Cabin'],
    imageUrl: getImage('mercedes-eqs'),
    description: 'The favorite choice for bridal parties and VIP group movement across Tanzania.'
  },
  {
    id: 'fleet-5',
    make: 'Range Rover',
    model: 'Sport HSE',
    year: 2026,
    capacity: 5,
    range: '700km',
    pricePerDay: 600000,
    suitability: ['Corporate', 'Luxury Personal', 'VIP'],
    features: ['Dynamic Suspension', 'Meridian Audio', 'Touch Pro Duo', 'Matrix LED'],
    imageUrl: getImage('porsche-taycan'),
    description: 'Combine performance with elegance for your business meetings in Dodoma.'
  }
];
