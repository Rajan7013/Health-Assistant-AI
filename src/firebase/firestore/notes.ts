import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    onSnapshot,
    Timestamp
} from 'firebase/firestore';
import { db } from '../index';

export interface Note {
    id?: string;
    userId: string;
    title: string;
    content: string;
    category?: string;
    tags?: string[];
    createdAt: number;
    updatedAt: number;
}

// Collection reference
const getNotesCollection = (userId: string) => collection(db, 'users', userId, 'notes');

/**
 * Creates a new note
 */
export const addNote = async (userId: string, noteData: Omit<Note, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
        const data = {
            userId,
            ...noteData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        const docRef = await addDoc(getNotesCollection(userId), data);
        return docRef.id;
    } catch (error) {
        console.error('Error adding note:', error);
        throw error;
    }
};

/**
 * Updates an existing note
 */
export const updateNote = async (userId: string, noteId: string, updates: Partial<Omit<Note, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) => {
    try {
        const noteRef = doc(db, 'users', userId, 'notes', noteId);
        await updateDoc(noteRef, {
            ...updates,
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error updating note:', error);
        throw error;
    }
};

/**
 * Deletes a note
 */
export const deleteNote = async (userId: string, noteId: string) => {
    try {
        await deleteDoc(doc(db, 'users', userId, 'notes', noteId));
    } catch (error) {
        console.error('Error deleting note:', error);
        throw error;
    }
};

/**
 * Subscribes to user's notes (Real-time)
 */
export const subscribeToNotes = (userId: string, callback: (notes: Note[]) => void) => {
    const q = query(getNotesCollection(userId), orderBy('updatedAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
        const notes = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            // Convert Firestore timestamps to numbers
            updatedAt: doc.data().updatedAt?.toMillis() || Date.now(),
            createdAt: doc.data().createdAt?.toMillis() || Date.now(),
        })) as Note[];

        callback(notes);
    });
};
