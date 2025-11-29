'use client';

import { updateProfile, type Auth } from 'firebase/auth';
import { doc, updateDoc, type Firestore } from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

type UpdateData = {
  displayName?: string;
};

export const updateUserProfile = async (
  auth: Auth,
  firestore: Firestore,
  data: UpdateData
) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No user is currently signed in.');
  }

  // This is the primary operation: updating the user's auth profile.
  // This will throw an error if it fails, which will be caught by the form's logic.
  await updateProfile(user, data);

  // This is a secondary operation to keep the Firestore document in sync.
  // We will attempt the update, but we won't show a UI error if it fails,
  // as the primary auth update has already succeeded. This prevents the
  // misleading error toast.
  const userDocRef = doc(firestore, 'users', user.uid);
  try {
    await updateDoc(userDocRef, data);
  } catch (error) {
    // Log the error for debugging, but don't show it to the user
    // as it can be confusing if the main profile update worked.
    console.error("Firestore sync failed, but user's auth profile was updated:", error);
  }
};
