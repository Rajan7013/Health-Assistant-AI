'use client';

import { updateProfile, type Auth } from 'firebase/auth';
import { doc, updateDoc, type Firestore } from 'firebase/firestore';

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

  // Update Firebase Auth profile
  await updateProfile(user, data);

  // Update Firestore user document
  const userDocRef = doc(firestore, 'users', user.uid);
  await updateDoc(userDocRef, data);
};
