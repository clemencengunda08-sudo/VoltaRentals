import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  await setDoc(doc(db, 'settings', 'azampay'), {
    env: 'sandbox',
    clientId: '31262501-4389-4b10-b8e0-b8f5a313ae70',
    clientSecret: 'CHBgZHSdLW8TB+4glCtj6FVy22AkjdxHXhb7Fej7qOdLy/9zqlNWif8M3wVF1bhsgG36LFhin7bKo+N0rVLqHOAub/OYmJKALTHj9O5+CcFV3t/2mRsZPMF4Cs2QC+KPUk3EjnT78F3STv+MtiGzU98lt1Vs6heejZqwuI78tHBGVW6Yp6zAVnvhszIcIE4m97esjlJL7+/0+SLE+qcAETdmZklGTw6HIOtFTZyZaFEP/jqOpiSqBsGm8ZVlMg/0yex7Rd1kYcJu3R0W2vy8AhEiCBRwx3dL041ZWNkZomv5pZvY+KkgW8FZoD9AOS0yWSRZ1WRwE5Weurni6KvC76gTXHCTzlTRlxd+c7SF+1Nwe6jbguCVYPk62FympxcdLBMRPm2K++f6SD+eiUlcFCup0KWmnkjTHiBHLODheSN2aVWEqYHMt/kCYBkdDJHkc1TYErpUQ/xsJCp6/lcIgBSrCgAtn5ZVYIv1bh62o66uItxxPEIh80LX840OEObCFQxZiYMyK4+PYQbc4gIgrmsUh1ovdGaTLC5g5PFpeUSBvIzSrO4wjraC0QvPgjNLPs9eRd+5kHVk0e3SCEX90ldjPPFgMzR/iRPk1DngxSGUy/L7gVV2zMEkqdASFTbMHVqzVhJG8/zWllZRItqw86ztO9wa59RuU8qknoW9OH0=',
    token: '9a74743d-3329-482f-8d49-37507fd4d6df',
    updatedAt: new Date()
  });
  console.log('AzamPay test credentials saved.');
}

run();
