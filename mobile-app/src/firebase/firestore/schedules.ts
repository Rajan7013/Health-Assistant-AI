import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    onSnapshot,
    getDocs,
    Timestamp,
    type Firestore,
} from 'firebase/firestore';

// This type is a subset of the main Schedule type in the page, but without UI-specific fields.
export type ScheduleDocumentData = {
    medicineName: string;
    startDate: Date;
    time: string;
    frequency: 'daily' | 'weekly';
    soundData?: string; // Base64 encoded audio (max 800KB)
};

// The data structure stored in Firestore, with a server timestamp.
type ScheduleDocument = Omit<ScheduleDocumentData, 'startDate'> & {
    startDate: Timestamp;
};

// The type that the getSchedules function will return.
export type ScheduleWithId = ScheduleDocumentData & { id: string };

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
    onData: (schedules: ScheduleWithId[]) => void
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
                    startDate: data.startDate?.toDate() || new Date(),
                };
            });
            onData(schedules);
        },
        async (error) => {
            console.error("Error fetching schedules:", error);
        }
    );

    return unsubscribe;
}

export async function getAllSchedules(firestore: Firestore, userId: string): Promise<ScheduleWithId[]> {
    const colRef = getSchedulesColRef(firestore, userId);
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map((doc) => {
        const data = doc.data() as ScheduleDocument;
        return {
            ...data,
            id: doc.id,
            startDate: data.startDate?.toDate() || new Date(),
        };
    });
}

/**
 * Adds a new schedule for a user.
 * @param firestore - The Firestore instance.
 * @param userId - The ID of the user.
 * @param scheduleData - The schedule data from the form.
 * @returns The ID of the newly created document.
 */
export async function addSchedule(
    firestore: Firestore,
    userId: string,
    scheduleData: ScheduleDocumentData
): Promise<string | null> {
    const colRef = getSchedulesColRef(firestore, userId);
    const data = {
        ...scheduleData,
        startDate: Timestamp.fromDate(scheduleData.startDate), // Convert Date to Timestamp
    };

    try {
        const docRef = await addDoc(colRef, data);
        return docRef.id;
    } catch (serverError) {
        console.error("Error adding schedule:", serverError);
        return null;
    }
}

/**
 * Deletes a schedule for a user.
 * @param firestore - The Firestore instance.
 * @param userId - The ID of the user.
 * @param scheduleId - The ID of the schedule to delete.
 */
export async function deleteSchedule(
    firestore: Firestore,
    userId: string,
    scheduleId: string
) {
    const docRef = doc(firestore, `users/${userId}/schedules/${scheduleId}`);

    try {
        await deleteDoc(docRef);
    } catch (error) {
        console.error("Error deleting schedule:", error);
    }
}
