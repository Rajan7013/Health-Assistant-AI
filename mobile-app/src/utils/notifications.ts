import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

/**
 * Request notification permissions
 */
export async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('medicine-reminders', {
            name: 'Medicine Reminders',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
            sound: 'default',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            alert('Failed to get push notification permissions!');
            return null;
        }
    } else {
        alert('Must use physical device for Push Notifications');
        return null;
    }

    return true;
}

/**
 * Schedule a medicine reminder notification
 */
export async function scheduleMedicineNotification(
    medicineName: string,
    time: string, // "HH:MM" format
    frequency: 'daily' | 'weekly',
    scheduleId: string
): Promise<string | null> {
    try {
        const [hours, minutes] = time.split(':').map(Number);

        const trigger: Notifications.NotificationTriggerInput = frequency === 'daily'
            ? {
                hour: hours,
                minute: minutes,
                repeats: true,
            }
            : {
                weekday: new Date().getDay() + 1, // Current day of week
                hour: hours,
                minute: minutes,
                repeats: true,
            };

        const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
                title: "Time for your medicine! 💊",
                body: `Take ${medicineName}`,
                sound: 'default',
                priority: Notifications.AndroidNotificationPriority.MAX,
                vibrate: [0, 250, 250, 250],
                data: { scheduleId },
            },
            trigger,
        });

        console.log('Notification scheduled:', notificationId);
        return notificationId;
    } catch (error) {
        console.error('Error scheduling notification:', error);
        return null;
    }
}

/**
 * Cancel a scheduled notification
 */
export async function cancelNotification(notificationId: string) {
    try {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
        console.log('Notification cancelled:', notificationId);
    } catch (error) {
        console.error('Error cancelling notification:', error);
    }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications() {
    try {
        await Notifications.cancelAllScheduledNotificationsAsync();
        console.log('All notifications cancelled');
    } catch (error) {
        console.error('Error cancelling all notifications:', error);
    }
}

/**
 * Get all scheduled notifications
 */
export async function getAllScheduledNotifications() {
    try {
        const notifications = await Notifications.getAllScheduledNotificationsAsync();
        console.log('Scheduled notifications:', notifications.length);
        return notifications;
    } catch (error) {
        console.error('Error getting notifications:', error);
        return [];
    }
}
