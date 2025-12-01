import { NextResponse } from "next/server";
import { getAdminMessaging } from "@/firebase/admin";
import admin from "firebase-admin";

export async function POST(request: Request) {
    try {
        const { token, title, body } = await request.json();

        if (!token) {
            return NextResponse.json({ error: "Missing FCM token" }, { status: 400 });
        }

        // Initialize Admin SDK (will try to use env vars)
        const messaging = getAdminMessaging();

        // Check if messaging is initialized (it might fail if env vars are missing)
        // Note: getAdminMessaging might throw if app not init.

        const message = {
            notification: {
                title: title || "Test Notification",
                body: body || "This is a test message from the backend!",
            },
            token: token,
        };

        try {
            const response = await messaging.send(message);
            console.log("Successfully sent message:", response);
            return NextResponse.json({ success: true, messageId: response });
        } catch (sendError: any) {
            console.error("Error sending message:", sendError);
            // Check for specific error codes
            if (sendError.code === 'app/no-app') {
                return NextResponse.json({
                    error: "Firebase Admin not configured. Please add FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY to .env.local"
                }, { status: 500 });
            }
            return NextResponse.json({ error: sendError.message }, { status: 500 });
        }

    } catch (error: any) {
        console.error("API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
