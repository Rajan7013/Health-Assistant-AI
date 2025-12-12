import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEYS = {
    DARK_MODE: '@settings_dark_mode',
    NOTIFICATIONS: '@settings_notifications',
};

export const SettingsStorage = {
    // Dark Mode
    async getDarkMode(): Promise<boolean> {
        try {
            const value = await AsyncStorage.getItem(SETTINGS_KEYS.DARK_MODE);
            return value === 'true';
        } catch (error) {
            console.error('Error reading dark mode:', error);
            return false;
        }
    },

    async setDarkMode(enabled: boolean): Promise<void> {
        try {
            await AsyncStorage.setItem(SETTINGS_KEYS.DARK_MODE, enabled.toString());
        } catch (error) {
            console.error('Error saving dark mode:', error);
        }
    },

    // Notifications
    async getNotifications(): Promise<boolean> {
        try {
            const value = await AsyncStorage.getItem(SETTINGS_KEYS.NOTIFICATIONS);
            return value === 'true';
        } catch (error) {
            console.error('Error reading notifications:', error);
            return false;
        }
    },

    async setNotifications(enabled: boolean): Promise<void> {
        try {
            await AsyncStorage.setItem(SETTINGS_KEYS.NOTIFICATIONS, enabled.toString());
        } catch (error) {
            console.error('Error saving notifications:', error);
        }
    },

    // Clear all settings
    async clearAll(): Promise<void> {
        try {
            await AsyncStorage.multiRemove([
                SETTINGS_KEYS.DARK_MODE,
                SETTINGS_KEYS.NOTIFICATIONS,
            ]);
        } catch (error) {
            console.error('Error clearing settings:', error);
        }
    }
};
