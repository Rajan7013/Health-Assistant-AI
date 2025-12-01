import { useEffect, useState } from 'react';
import { messaging } from '@/firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { useToast } from '@/hooks/use-toast';
import { saveFcmToken } from '@/firebase/firestore/users';
import { useUser } from '@/firebase/auth/use-user';

export function useFcm() {
    const [token, setToken] = useState<string | null>(null);
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const { toast } = useToast();
    const { user } = useUser();

    const retrieveToken = async () => {
        if (!messaging) return;
        try {
            const currentToken = await getToken(messaging, {
                // vapidKey: 'YOUR_VAPID_KEY' // Optional
            });
            if (currentToken) {
                setToken(currentToken);
                console.log('FCM Token:', currentToken);
                if (user) {
                    await saveFcmToken(user.uid, currentToken);
                }
            } else {
                console.log('No registration token available.');
            }
        } catch (error) {
            console.error('Error retrieving FCM token:', error);
        }
    };

    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            const currentPermission = Notification.permission;
            setPermission(currentPermission);
            if (currentPermission === 'granted') {
                retrieveToken();
            }
        }
    }, [user]); // Retry if user logs in

    const requestPermission = async () => {
        if (!messaging) return null;
        try {
            const permission = await Notification.requestPermission();
            setPermission(permission);
            if (permission === 'granted') {
                await retrieveToken();
            }
        } catch (error) {
            console.error('Error requesting permission:', error);
        }
    };

    useEffect(() => {
        if (!messaging) return;
        const unsubscribe = onMessage(messaging, (payload) => {
            console.log('Message received. ', payload);
            toast({
                title: payload.notification?.title || 'New Message',
                description: payload.notification?.body,
            });
        });
        return () => unsubscribe();
    }, [toast]);

    return { token, permission, requestPermission };
}
