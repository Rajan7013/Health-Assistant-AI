import { doc, setDoc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/firebase";

export interface UserProfile {
    displayName?: string;
    email?: string;
    photoURL?: string;
    allergies?: string[];
    chronicConditions?: string[];
    emergencyContact?: {
        name: string;
        phone: string;
        relationship: string;
    };
    updatedAt?: Date;
}

export const saveFcmToken = async (userId: string, token: string) => {
    if (!userId || !token) return;

    try {
        const userRef = doc(db, "users", userId);
        await setDoc(userRef, {
            fcmTokens: arrayUnion(token),
            lastSeen: new Date()
        }, { merge: true });

        console.log("FCM Token saved to Firestore for user:", userId);
    } catch (error) {
        console.error("Error saving FCM token:", error);
    }
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
        const userRef = doc(db, "users", userId);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
            return docSnap.data() as UserProfile;
        }
        return null;
    } catch (error) {
        console.error("Error getting user profile:", error);
        return null;
    }
};

export const saveUserProfile = async (userId: string, data: Partial<UserProfile>) => {
    try {
        const userRef = doc(db, "users", userId);
        await setDoc(userRef, {
            ...data,
            uid: userId, // Required for 'create' security rule
            updatedAt: new Date()
        }, { merge: true });
    } catch (error) {
        console.error("Error saving user profile:", error);
        throw error;
    }
};
