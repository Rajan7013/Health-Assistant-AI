import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';

export interface UserProfile {
    displayName: string;
    email: string;
    allergies?: string[];
    chronicConditions?: string[];
    emergencyContact?: {
        name: string;
        phone: string;
        relationship: string;
    };
    createdAt?: any;
    updatedAt?: any;
}

/**
 * Get user profile from Firestore
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            return userSnap.data() as UserProfile;
        }
        return null;
    } catch (error) {
        console.error('Error getting user profile:', error);
        throw error;
    }
};

export const saveUserProfile = async (userId: string, profileData: Partial<UserProfile>) => {
    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            // Update existing - exclude protected fields
            const updateData = { ...profileData };
            delete updateData.email; // Don't update email (protected)

            await updateDoc(userRef, {
                ...updateData,
                updatedAt: serverTimestamp()
            });
        } else {
            // Create new - MUST include uid for security rules
            await setDoc(userRef, {
                ...profileData,
                uid: userId, // Required by security rules for create
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
        }
    } catch (error) {
        console.error('Error saving user profile:', error);
        throw error;
    }
};
