import { NextRequest, NextResponse } from 'next/server';
import { explainSymptoms, type SymptomExplanationInput } from '@/ai/flows/ai-symptom-explanation';
import { checkRateLimit } from '@/lib/rate-limiter';
import { getAdminAuth } from '@/firebase/admin';

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

        // Parse request body
        const body = await request.json() as SymptomExplanationInput;

        // Validate input
        if (!body.symptoms || body.symptoms.trim().length === 0) {
            return NextResponse.json(
                { error: 'Symptoms are required' },
                { status: 400 }
            );
        }

        // Call AI flow
        const result = await explainSymptoms(body);

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error in symptom-checker API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
