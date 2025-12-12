import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAGAdn6hT9fhaGqmqN5LpcUlWV3FW-rNTw",
    authDomain: "studio-2526433000-2e931.firebaseapp.com",
    projectId: "studio-2526433000-2e931",
    storageBucket: "studio-2526433000-2e931.firebasestorage.app",
    messagingSenderId: "548223774566",
    appId: "1:548223774566:web:16693942e42061dd6a22a7",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
export const db = getFirestore(app);
export const storage = getStorage(app);
