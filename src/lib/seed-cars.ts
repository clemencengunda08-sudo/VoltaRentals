'use client';

import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp,
  Firestore 
} from "firebase/firestore";
import { FLEET } from "./fleet-data";
import { Car } from "./types";

/**
 * Migration script to seed Firestore with initial fleet data from fleet-data.ts
 */
export async function seedCarsToFirestore(db: Firestore) {
  console.log("Starting car seeding process...");
  let successCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const staticCar of FLEET) {
    try {
      // Check if car with this plate number already exists
      const plateNumber = `T ${Math.floor(Math.random() * 900 + 100)} ABC`; // Generating fake plate for seeding
      const carsRef = collection(db, "cars");
      const q = query(carsRef, where("plateNumber", "==", plateNumber));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        console.log(`Car with plate ${plateNumber} already exists. Skipping.`);
        skippedCount++;
        continue;
      }

      const newCarRef = doc(collection(db, "cars"));
      
      const carData: Partial<Car> = {
        id: newCarRef.id,
        make: staticCar.make,
        model: staticCar.model,
        year: staticCar.year,
        plateNumber: plateNumber,
        category: ((staticCar as any).category) || "SUV",
        color: "Black",
        seats: staticCar.capacity,
        transmission: "Automatic",
        fuelType: "Diesel",
        pricePerDay: staticCar.pricePerDay,
        pricePerWeek: staticCar.pricePerDay * 6,
        pricePerMonth: staticCar.pricePerDay * 25,
        withDriverCostPerDay: 50000,
        available: true,
        location: ((staticCar as any).location) || "Dar es Salaam",
        images: [staticCar.imageUrl],
        features: staticCar.features || [],
        description: staticCar.description,
        mileage: 0,
        insuranceValid: true,
        insuranceExpiry: new Date(2027, 0, 1).toISOString(),
        addedBy: "system",
        rating: 5,
        totalRentals: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(newCarRef, carData);
      console.log(`Successfully seeded: ${staticCar.make} ${staticCar.model}`);
      successCount++;
    } catch (error) {
      console.error(`Error seeding car ${staticCar.model}:`, error);
      errorCount++;
    }
  }

  // Mark as seeded in settings
  try {
    const settingsRef = doc(db, "settings", "fleet");
    await setDoc(settingsRef, { seeded: true }, { merge: true });
  } catch (err) {
    console.error("Error updating seed settings:", err);
  }

  return { successCount, skippedCount, errorCount };
}
