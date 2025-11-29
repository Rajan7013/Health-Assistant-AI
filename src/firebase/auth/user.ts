'use client';

import { updateProfile, type User } from 'firebase/auth';
import {
  doc,
  setDoc,
  serverTimestamp,
  type Firestore,
} from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

type UpdateData = {
  displayName?: string;
  photoURL?: string;
};

export const updateUserProfile = async (
  firestore: Firestore,
  user: User,
  data: UpdateData
) => {
  if (!user) {
    throw new Error('No user is currently signed in.');
  }

  // 1. Update the Firebase Auth user profile. This is the primary source of truth.
  await updateProfile(user, data);

  // 2. Prepare the data for Firestore.
  const updateData = {
    ...data,
    updatedAt: serverTimestamp(),
  };

  // 3. Sync the update to the user's document in Firestore.
  const userDocRef = doc(firestore, 'users', user.uid);

  // Use setDoc with { merge: true }.
  // - If the document exists, it updates the fields (like `updateDoc`).
  // - If the document does NOT exist (due to a race condition on signup),
  //   it will create it with this data, solving the "No document to update" error.
  setDoc(userDocRef, updateData, { merge: true }).catch(
    async (serverError) => {
      // This error handling is crucial for debugging security rule denials.
      if (serverError.code === 'permission-denied') {
        const permissionError = new FirestorePermissionError({
          path: userDocRef.path,
          operation: 'update',
          requestResourceData: updateData,
        });
        errorEmitter.emit('permission-error', permissionError);
      } else {
        // For other errors (e.g., network), log them to the console.
        console.error('Error syncing user profile to Firestore:', serverError);
      }
    }
  );
};
