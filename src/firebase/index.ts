import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

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

export { FirebaseProvider, useFirebase, useAuth, useFirestore, useFirebaseApp } from './provider';
export { FirebaseClientProvider } from './client-provider';
export { useUser } from './auth/use-user';
export { errorEmitter } from './error-emitter';
export { FirestorePermissionError } from './errors';

    