'use client';

import { updateProfile, type Auth } from 'firebase/auth';
import { doc, updateDoc, type Firestore, serverTimestamp } from 'firebase/firestore';
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
  // This will throw an error if it fails, which will be caught by the form's logic.
  await updateProfile(user, data);

  // This is a secondary operation to keep the Firestore document in sync.
  // We will attempt the update and catch any permission errors to provide
  // rich debugging information.
  const userDocRef = doc(firestore, 'users', user.uid);
  
  const updateData = {
    ...data,
    updatedAt: serverTimestamp(),
  };

  updateDoc(userDocRef, updateData)
    .catch(async (serverError) => {
      // Handle permission errors specifically
      if (serverError.code === 'permission-denied') {
        const permissionError = new FirestorePermissionError({
          path: userDocRef.path,
          operation: 'update',
          requestResourceData: data,
        });
        errorEmitter.emit('permission-error', permissionError);
      } else {
        // For other errors, you might want to log them or handle them differently
        console.error('Error updating user profile in Firestore:', serverError);
      }
    });
};
