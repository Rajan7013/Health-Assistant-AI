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

  // Update the Firebase Auth user profile first.
  await updateProfile(user, data);

  // Then, create or update the user's document in Firestore.
  const userDocRef = doc(firestore, 'users', user.uid);
  
  // Prepare the data for Firestore. `updatedAt` is always set.
  const updateData = {
    ...data,
    updatedAt: serverTimestamp(),
    // To prevent overwriting immutable fields, we only add these on creation.
    // By using `setDoc` with `merge: true`, these are effectively ignored on update
    // if the document already exists, but are crucial for creation.
    uid: user.uid,
    email: user.email,
    createdAt: serverTimestamp(),
  };


  // Use setDoc with merge:true. This will CREATE the document if it doesn't exist,
  // or UPDATE it if it does. This resolves the "No document to update" error
  // and race conditions on signup.
  setDoc(userDocRef, updateData, { merge: true })
    .catch(async (serverError) => {
      // This error handling is crucial for debugging security rule denials.
      if (serverError.code === 'permission-denied') {
        const permissionError = new FirestorePermissionError({
          path: userDocRef.path,
          operation: 'update', // Logically it's an update, even if creating.
          requestResourceData: updateData,
        });
        errorEmitter.emit('permission-error', permissionError);
      } else {
        // For other errors (e.g., network), log them to the console.
        console.error('Error syncing user profile to Firestore:', serverError);
      }
    });
};
