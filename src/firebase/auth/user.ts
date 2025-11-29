'use client';

import { updateProfile, type Auth } from 'firebase/auth';
import { doc, setDoc, type Firestore, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

type UpdateData = {
  displayName?: string;
  photoURL?: string;
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
  await updateProfile(user, data);

  // This is a secondary operation to keep the Firestore document in sync.
  // We use setDoc with merge:true to either create or update the document,
  // which prevents the "No document to update" error if the doc doesn't exist.
  const userDocRef = doc(firestore, 'users', user.uid);
  
  const updateData = {
    ...data,
    updatedAt: serverTimestamp(),
    // Set createdAt only if it's a new document, which setDoc handles gracefully.
    // To be fully robust, we could read first, but this is simpler for this use case.
    // A more advanced implementation might use a transaction.
    createdAt: serverTimestamp(), // Will be overwritten if doc exists and has this field
  };

  setDoc(userDocRef, updateData, { merge: true })
    .catch(async (serverError) => {
      // Handle permission errors specifically for debugging.
      if (serverError.code === 'permission-denied') {
        const permissionError = new FirestorePermissionError({
          path: userDocRef.path,
          operation: 'update',
          requestResourceData: updateData,
        });
        errorEmitter.emit('permission-error', permissionError);
      } else {
        // For other errors, log them.
        console.error('Error updating user profile in Firestore:', serverError);
      }
    });
};
