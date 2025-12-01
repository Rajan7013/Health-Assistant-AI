/**
 * Rate Limiter Utility
 * Limits API requests to 60 per hour per user
 */

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

const RATE_LIMIT = 60; // requests per hour
const WINDOW_MS = 60 * 60 * 1000; // 1 hour in milliseconds

export function checkRateLimit(userId: string): { allowed: boolean; resetIn?: number } {
    const now = Date.now();
    const entry = rateLimitMap.get(userId);

    // No entry or expired - allow and create new entry
    if (!entry || now > entry.resetTime) {
        rateLimitMap.set(userId, {
            count: 1,
            resetTime: now + WINDOW_MS,
        });
        return { allowed: true };
    }

    // Check if under limit
    if (entry.count < RATE_LIMIT) {
        entry.count++;
        return { allowed: true };
    }

    // Rate limit exceeded
    const resetIn = Math.ceil((entry.resetTime - now) / 1000); // seconds
    return { allowed: false, resetIn };
}

// Cleanup old entries every hour
setInterval(() => {
    const now = Date.now();
    for (const [userId, entry] of rateLimitMap.entries()) {
        if (now > entry.resetTime) {
            rateLimitMap.delete(userId);
        }
    }
}, WINDOW_MS);
