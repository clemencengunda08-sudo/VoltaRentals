/**
 * Official Firebase configuration for VoltaRentals.
 * Hardcoded for maximum stability in Vercel/Local environments for Demo Phase.
 */
export const firebaseConfig = {
  apiKey: "AIzaSyBmROdoDTxTwdOJUG05zLbyI6U6D74m3rQ",
  authDomain: "studio-8631917183-e222a.firebaseapp.com",
  projectId: "studio-8631917183-e222a",
  storageBucket: "studio-8631917183-e222a.firebasestorage.app",
  messagingSenderId: "144105091242",
  appId: "1:144105091242:web:e5a4c5857c5334597660d3"
};

if (typeof window !== 'undefined' && !firebaseConfig.apiKey) {
  console.warn("⚠️ VOLTA NODE WARNING: Master keys missing from registry.");
}
