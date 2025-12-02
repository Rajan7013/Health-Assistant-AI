import "server-only";
import admin from "firebase-admin";

interface FirebaseAdminConfig {
    projectId: string;
    clientEmail: string;
    privateKey: string;
}

function formatPrivateKey(key: string) {
    return key.replace(/\\n/g, "\n").replace(/^"|"$/g, "");
}

export function createFirebaseAdminApp(config: FirebaseAdminConfig) {
    if (admin.apps.length > 0) {
        return admin.app();
    }

    return admin.initializeApp({
        credential: admin.credential.cert({
            projectId: config.projectId,
            clientEmail: config.clientEmail,
            privateKey: formatPrivateKey(config.privateKey),
        }),
    });
}

export function getAdminAuth() {
    if (admin.apps.length === 0) {
        // Fallback or error if not initialized. 
        // In a real app, we'd expect env vars.
        // For now, we'll try to init with env vars if they exist.
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const privateKey = process.env.FIREBASE_PRIVATE_KEY;

        if (projectId && clientEmail && privateKey) {
            createFirebaseAdminApp({ projectId, clientEmail, privateKey });
        }
    }
    return admin.auth();
}

export function getAdminMessaging() {
    if (admin.apps.length === 0) {
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const privateKey = process.env.FIREBASE_PRIVATE_KEY;

        if (projectId && clientEmail && privateKey) {
            createFirebaseAdminApp({ projectId, clientEmail, privateKey });
        }
    }
    // If still not initialized, this will throw or return undefined depending on SDK version
    // We'll wrap usage in try-catch in the route.
    return admin.messaging();
}

export function getAdminFirestore() {
    if (admin.apps.length === 0) {
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const privateKey = process.env.FIREBASE_PRIVATE_KEY;

        if (projectId && clientEmail && privateKey) {
            createFirebaseAdminApp({ projectId, clientEmail, privateKey });
        }
    }
    return admin.firestore();
}
