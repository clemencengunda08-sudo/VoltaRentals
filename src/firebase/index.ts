import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import { firebaseConfig } from './config';

/**
 * Singleton Initialization Protocol.
 * Ensures Firebase is initialized ONLY once and exports core services.
 * Armed with hardcoded master keys for demo stability.
 */
function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) {
    return getApp();
  }
  return initializeApp(firebaseConfig);
}

const appInstance = getFirebaseApp();

export const app = appInstance;
export const auth = getAuth(appInstance);

// Initialize Firestore with robust offline persistence cache ONLY in browser
export const db = typeof window !== 'undefined' 
  ? initializeFirestore(appInstance, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
    })
  : getFirestore(appInstance);

export const storage = getStorage(appInstance);
export const functions = getFunctions(appInstance);

export default appInstance;

export function initializeFirebase() {
  return { app: appInstance, auth, db, storage, functions };
}

export * from './provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './utils';
