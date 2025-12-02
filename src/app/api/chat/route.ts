import { NextRequest, NextResponse } from 'next/server';
import { contextAwareChatbot, type ContextAwareChatbotInput } from '@/ai/flows/context-aware-chatbot';
import { checkRateLimit } from '@/lib/rate-limiter';
import { getAdminAuth, getAdminFirestore } from '@/firebase/admin';

// Initialize Firebase Admin (server-side only) via helper
try {
    getAdminAuth();
} catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
}

export async function POST(request: NextRequest) {
    try {
        // Get auth token from request
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const token = authHeader.split('Bearer ')[1];

        // Verify Firebase token
        let decodedToken;
        try {
            decodedToken = await getAdminAuth().verifyIdToken(token);
        } catch (error) {
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            );
        }

        const userId = decodedToken.uid;

        // Check rate limit
        const rateLimitResult = checkRateLimit(userId);
        if (!rateLimitResult.allowed) {
            return NextResponse.json(
                {
                    error: 'Rate limit exceeded',
                    resetIn: rateLimitResult.resetIn,
                },
                { status: 429 }
            );
        }

        // Fetch User Profile from Firestore (Admin SDK)
        const db = getAdminFirestore();
        const userDoc = await db.collection('users').doc(userId).get();
        const userProfile = userDoc.exists ? userDoc.data() : undefined;

        // Parse request body
        const body = await request.json() as ContextAwareChatbotInput;

        // Call AI flow with user profile
        const result = await contextAwareChatbot({
            ...body,
            userProfile: userProfile ? {
                allergies: userProfile.allergies,
                chronicConditions: userProfile.chronicConditions,
                emergencyContact: userProfile.emergencyContact
            } : undefined
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error in chat API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
