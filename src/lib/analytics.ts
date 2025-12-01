import { getAnalytics, logEvent as firebaseLogEvent, Analytics } from 'firebase/analytics';
import { app } from '@/firebase';

let analytics: Analytics | null = null;

// Initialize analytics only on client side
if (typeof window !== 'undefined') {
    try {
        analytics = getAnalytics(app);
    } catch (error) {
        console.error('Analytics initialization failed:', error);
    }
}

export const logEvent = (eventName: string, eventParams?: { [key: string]: any }) => {
    if (analytics) {
        try {
            firebaseLogEvent(analytics, eventName, eventParams);
        } catch (error) {
            console.warn('Failed to log analytics event:', error);
        }
    }
};

export const trackPageView = (pageName: string) => {
    logEvent('page_view', { page_title: pageName });
};

export const trackError = (error: string, component?: string) => {
    logEvent('app_error', {
        error_message: error,
        component: component || 'unknown'
    });
};

export const trackFeatureUsage = (featureName: string, action: string, metadata?: any) => {
    logEvent('feature_usage', {
        feature: featureName,
        action: action,
        ...metadata
    });
};
