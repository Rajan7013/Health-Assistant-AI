import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getMessaging } from 'firebase/messaging';

import { firebaseConfig } from './config';

export function initializeFirebase(): {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
} {
  const apps = getApps();
  const firebaseApp =
    apps.find((app) => app.name === firebaseConfig.projectId) ||
    initializeApp(firebaseConfig, firebaseConfig.projectId);

  const auth = getAuth(firebaseApp);
  const firestore = getFirestore(firebaseApp);

  return { firebaseApp, auth, firestore };
}

// Initialize default app for direct exports
const apps = getApps();
const defaultApp = apps.find((app) => app.name === firebaseConfig.projectId) ||
  initializeApp(firebaseConfig, firebaseConfig.projectId);

export const app = defaultApp;
export const auth = getAuth(defaultApp);
export const db = getFirestore(defaultApp);
export const storage = getStorage(defaultApp);
export const messaging = typeof window !== "undefined" ? getMessaging(defaultApp) : null;

export { FirebaseProvider, useFirebase, useAuth, useFirestore, useFirebaseApp } from './provider';
export { FirebaseClientProvider } from './client-provider';
export { useUser } from './auth/use-user';
export { errorEmitter } from './error-emitter';
export { FirestorePermissionError } from './errors';
