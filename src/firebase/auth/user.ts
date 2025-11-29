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
  // We will attempt the update and catch any permission errors to provide
  // rich debugging information.
  const userDocRef = doc(firestore, 'users', user.uid);
  
  updateDoc(userDocRef, data)
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: userDocRef.path,
        operation: 'update',
        requestResourceData: data,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
};
