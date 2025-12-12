import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    query,
    onSnapshot,
    orderBy,
    serverTimestamp,
    updateDoc,
    getDocs,
    type Firestore,
    type Timestamp
} from 'firebase/firestore';
import { ref, deleteObject, type FirebaseStorage } from 'firebase/storage';

export interface Report {
    id: string;
    userId: string;
    name: string;
    url?: string;
    path?: string; // Storage path (optional now)
    type: 'pdf' | 'image';
    createdAt: Timestamp;
    analysis?: any; // Store the AI analysis result
}

export const COLLECTION_NAME = 'reports';

export async function addReport(
    firestore: Firestore,
    userId: string,
    data: Omit<Report, 'id' | 'userId' | 'createdAt'>
) {
    // Store in users/{userId}/reports
    const colRef = collection(firestore, 'users', userId, COLLECTION_NAME);
    return addDoc(colRef, {
        ...data,
        userId,
        createdAt: serverTimestamp(),
    });
}

export async function saveAnalysis(
    firestore: Firestore,
    userId: string,
    reportId: string,
    analysis: any
) {
    // Update users/{userId}/reports/{reportId}
    const docRef = doc(firestore, 'users', userId, COLLECTION_NAME, reportId);
    return updateDoc(docRef, {
        analysis
    });
}

export function getReports(
    firestore: Firestore,
    userId: string,
    callback: (reports: Report[]) => void
) {
    // Query users/{userId}/reports
    const q = query(
        collection(firestore, 'users', userId, COLLECTION_NAME),
        orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        const reports = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Report));
        callback(reports);
    });
}

export async function deleteReport(
    firestore: Firestore,
    storage: FirebaseStorage | null,
    report: Report
) {
    // 1. Delete from Storage (only if path exists)
    if (report.path && storage) {
        try {
            const storageRef = ref(storage, report.path);
            await deleteObject(storageRef);
        } catch (error) {
            console.warn("Could not delete from storage (might not exist):", error);
        }
    }

    // 2. Delete from Firestore: users/{userId}/reports/{reportId}
    const docRef = doc(firestore, 'users', report.userId, COLLECTION_NAME, report.id);
    await deleteDoc(docRef);
}

export async function getAllReports(firestore: Firestore, userId: string): Promise<Report[]> {
    const q = query(
        collection(firestore, 'users', userId, COLLECTION_NAME),
        orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as Report));
}
