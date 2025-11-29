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

  // This part can throw an error if not handled correctly, but for now we focus on the firestore part
  await updateProfile(user, data);

  const userDocRef = doc(firestore, 'users', user.uid);
  
  // Use .catch() to handle potential Firestore permission errors gracefully
  // without stopping the execution flow if the auth profile update was successful.
  updateDoc(userDocRef, data).catch(async (serverError) => {
    const permissionError = new FirestorePermissionError({
      path: userDocRef.path,
      operation: 'update',
      requestResourceData: data,
    });
    // Emit the specific error for developers to debug, but don't throw,
    // as it would trigger the generic "Update Failed" toast.
    errorEmitter.emit('permission-error', permissionError);
  });
};
