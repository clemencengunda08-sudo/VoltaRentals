import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';

/**
 * @fileOverview Genkit Initialization with API Key Failover.
 * Dynamically selects an active key from Firestore if available.
 */

async function getActiveApiKey() {
  // Default to env if available
  const envKey = process.env.GOOGLE_GENAI_API_KEY;
  
  try {
    const brandingRef = doc(db, 'settings', 'branding');
    const snap = await getDoc(brandingRef);
    
    if (snap.exists()) {
      const keys = snap.data().aiKeys || [];
      const validKeys = keys.filter((k: string) => k && k.length > 5);
      
      if (validKeys.length > 0) {
        // Simple rotation based on current minute
        const index = new Date().getMinutes() % validKeys.length;
        return validKeys[index];
      }
    }
  } catch (e) {
    console.warn("AI Key Fetch Failed, using env.");
  }
  
  return envKey;
}

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});
