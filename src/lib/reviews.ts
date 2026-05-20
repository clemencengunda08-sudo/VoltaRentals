'use client';

import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp, 
  increment,
  arrayUnion,
  Firestore,
  getDoc
} from 'firebase/firestore';
import { Review } from './types';

/**
 * Submits a new review and updates vehicle stats.
 */
export async function submitReview(db: Firestore, reviewData: Omit<Review, 'id' | 'createdAt' | 'updatedAt' | 'helpful' | 'helpfulVoters' | 'adminReply' | 'adminReplyAt' | 'status'>): Promise<void> {
  const reviewRef = doc(collection(db, "reviews"));
  const finalReview: Review = {
    ...reviewData,
    id: reviewRef.id,
    helpful: 0,
    helpfulVoters: [],
    adminReply: null,
    adminReplyAt: null,
    status: "published",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  await setDoc(reviewRef, finalReview);

  // Mark booking as reviewed
  await updateDoc(doc(db, "bookings", reviewData.bookingId), {
    hasReview: true,
    updatedAt: serverTimestamp()
  });

  // Update car rating
  await calculateCarRating(db, reviewData.carId);
}

/**
 * Recalculates and updates the average rating for a vehicle.
 */
export async function calculateCarRating(db: Firestore, carId: string): Promise<number> {
  const q = query(collection(db, "reviews"), where("carId", "==", carId), where("status", "==", "published"));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) return 0;

  let total = 0;
  snapshot.forEach(doc => {
    total += doc.data().rating;
  });

  const average = Number((total / snapshot.size).toFixed(1));

  await updateDoc(doc(db, "cars", carId), {
    rating: average,
    totalRentals: increment(1),
    updatedAt: serverTimestamp()
  });

  return average;
}

/**
 * Votes a review as helpful.
 */
export async function voteHelpful(db: Firestore, reviewId: string, userId: string): Promise<void> {
  const ref = doc(db, "reviews", reviewId);
  const snap = await getDoc(ref);
  
  if (snap.exists()) {
    const voters = snap.data().helpfulVoters || [];
    if (!voters.includes(userId)) {
      await updateDoc(ref, {
        helpful: increment(1),
        helpfulVoters: arrayUnion(userId),
        updatedAt: serverTimestamp()
      });
    }
  }
}
