'use client';

import { updateProfile, type User } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { initializeFirebase } from '..';

const { auth, firestore } = initializeFirebase();

type UpdateData = {
  displayName?: string;
};

export const updateUserProfile = async (data: UpdateData) => {
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
