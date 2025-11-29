
'use client';

import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  Timestamp,
  type Firestore,
} from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';
import type { Schedule } from '@/app/(app)/schedule/page';

// The data structure used in the form and local state.
type ScheduleFormData = Omit<Schedule, 'id'>;

// The data structure stored in Firestore, with a server timestamp.
type ScheduleDocument = Omit<ScheduleFormData, 'startDate'> & {
  startDate: Timestamp;
};

// Function to get the schedules collection reference for a user.
const getSchedulesColRef = (firestore: Firestore, userId: string) => {
  return collection(firestore, `users/${userId}/schedules`);
};

/**
 * Listens for real-time updates to a user's schedules.
 * @param firestore - The Firestore instance.
 * @param userId - The ID of the user whose schedules to fetch.
 * @param onData - Callback function to handle the updated schedules.
 * @returns An unsubscribe function to stop listening for updates.
 */
export function getSchedules(
  firestore: Firestore,
  userId: string,
  onData: (schedules: Schedule[]) => void
) {
  const colRef = getSchedulesColRef(firestore, userId);

  const unsubscribe = onSnapshot(
    colRef,
    (snapshot) => {
      const schedules = snapshot.docs.map((doc) => {
        const data = doc.data() as ScheduleDocument;
        return {
          ...data,
          id: doc.id,
          // Convert Firestore Timestamp to JavaScript Date object.
          startDate: data.startDate.toDate(),
        };
      });
      onData(schedules);
    },
    async (error) => {
      const permissionError = new FirestorePermissionError({
        path: colRef.path,
        operation: 'list',
      });
      errorEmitter.emit('permission-error', permissionError);
    }
  );

  return unsubscribe;
}

/**
 * Adds a new schedule for a user.
 * @param firestore - The Firestore instance.
 * @param userId - The ID of the user.
 * @param scheduleData - The schedule data from the form.
 */
export function addSchedule(
  firestore: Firestore,
  userId: string,
  scheduleData: ScheduleFormData
) {
  const colRef = getSchedulesColRef(firestore, userId);
  const data = {
    ...scheduleData,
    startDate: Timestamp.fromDate(scheduleData.startDate), // Convert Date to Timestamp
  };

  addDoc(colRef, data).catch(async (serverError) => {
    const permissionError = new FirestorePermissionError({
      path: colRef.path,
      operation: 'create',
      requestResourceData: data,
    });
    errorEmitter.emit('permission-error', permissionError);
  });
}

/**
 * Deletes a schedule for a user.
 * @param firestore - The Firestore instance.
 * @param userId - The ID of the user.
 * @param scheduleId - The ID of the schedule to delete.
 */
export function deleteSchedule(
  firestore: Firestore,
  userId: string,
  scheduleId: string
) {
  const docRef = doc(firestore, `users/${userId}/schedules/${scheduleId}`);

  deleteDoc(docRef).catch(async (serverError) => {
    const permissionError = new FirestorePermissionError({
      path: docRef.path,
      operation: 'delete',
    });
    errorEmitter.emit('permission-error', permissionError);
  });
}

    