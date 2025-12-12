import { View, Text, TouchableOpacity, ScrollView, Switch, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { tw } from '../../src/lib/utils';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../../src/config/firebase';
import { useAuth } from '../../src/context/auth';
import { router } from 'expo-router';
import { SettingsStorage } from '../../src/utils/settingsStorage';
import { useTheme } from '../../src/context/ThemeContext';

export default function SettingsScreen() {
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Load settings on mount
    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const notif = await SettingsStorage.getNotifications();
            setNotificationsEnabled(notif);
        } catch (error) {
            console.error('Failed to load settings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNotificationsToggle = async (value: boolean) => {
        setNotificationsEnabled(value);
        await SettingsStorage.setNotifications(value);
        Alert.alert(
            'Notifications ' + (value ? 'Enabled' : 'Disabled'),
            value
                ? 'Notification preferences saved. Note: Push notifications require a development build.'
                : 'You will not receive medicine reminders.'
        );
    };

    const handleDarkModeToggle = async () => {
        await toggleTheme();
        Alert.alert(
            `${theme === 'light' ? 'Dark' : 'Light'} Mode Enabled`,
            'Theme has been changed successfully!'
        );
    };

    const handleSignOut = async () => {
        Alert.alert(
            "Sign Out",
            "Are you sure you want to sign out?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Sign Out",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await signOut(auth);
                        } catch (error) {
                            console.error("Error signing out:", error);
                            Alert.alert("Error", "Failed to sign out.");
                        }
                    }
                }
            ]
        );
    };

    const SettingItem = ({ icon, iconColor, title, subtitle, onPress, rightElement }: any) => (
        <TouchableOpacity
            onPress={onPress}
            disabled={!onPress}
            style={tw`bg-white p-4 rounded-2xl mb-3 flex-row items-center shadow-sm border border-slate-100`}
        >
            <View style={tw`w-12 h-12 rounded-full ${iconColor} items-center justify-center mr-4`}>
                {icon}
            </View>
            <View style={tw`flex-1`}>
                <Text style={tw`font-bold text-slate-900 text-base`}>{title}</Text>
                {subtitle && <Text style={tw`text-slate-500 text-xs mt-0.5`}>{subtitle}</Text>}
            </View>
            {rightElement}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={tw`flex-1 bg-slate-50`}>
            <ScrollView contentContainerStyle={tw`p-6 pb-24`}>
                {/* Header */}
                <View style={tw`mb-6 mt-4`}>
                    <Text style={tw`text-3xl font-bold text-slate-900`}>
                        App <Text style={tw`text-teal-600`}>Settings</Text>
                    </Text>
                    <Text style={tw`text-slate-500 mt-1`}>Manage your preferences</Text>
                </View>

                {/* Account Section */}
                <Text style={tw`text-xs font-bold text-slate-600 mb-3 uppercase`}>Account</Text>

                <SettingItem
                    icon={<Ionicons name="person" size={24} color="#8B5CF6" />}
                    iconColor="bg-purple-100"
                    title="Profile"
                    subtitle={user?.email}
                    onPress={() => router.push('/(app)/profile')}
                    rightElement={<Ionicons name="chevron-forward" size={20} color="#94A3B8" />}
                />

                {/* App Preferences */}
                <Text style={tw`text-xs font-bold text-slate-600 mb-3 mt-6 uppercase`}>Preferences</Text>

                <SettingItem
                    icon={<Ionicons name="notifications" size={24} color="#3B82F6" />}
                    iconColor="bg-blue-100"
                    title="Notifications"
                    subtitle={notificationsEnabled ? "Enabled" : "Disabled"}
                    rightElement={
                        <Switch
                            value={notificationsEnabled}
                            onValueChange={handleNotificationsToggle}
                            trackColor={{ false: '#D1D5DB', true: '#0D9488' }}
                            thumbColor={notificationsEnabled ? '#FFFFFF' : '#F3F4F6'}
                        />
                    }
                />

                <SettingItem
                    icon={<Ionicons name="moon" size={24} color="#F59E0B" />}
                    iconColor="bg-amber-100"
                    title="Dark Mode"
                    subtitle={theme === 'dark' ? "Enabled" : "Disabled"}
                    rightElement={
                        <Switch
                            value={theme === 'dark'}
                            onValueChange={handleDarkModeToggle}
                            trackColor={{ false: '#D1D5DB', true: '#0D9488' }}
                            thumbColor={theme === 'dark' ? '#FFFFFF' : '#F3F4F6'}
                        />
                    }
                />

                {/* Support */}
                <Text style={tw`text-xs font-bold text-slate-600 mb-3 mt-6 uppercase`}>Support</Text>

                <SettingItem
                    icon={<Ionicons name="help-circle" size={24} color="#10B981" />}
                    iconColor="bg-green-100"
                    title="Help & FAQ"
                    subtitle="Get answers to common questions"
                    onPress={() => router.push('/(app)/help')}
                    rightElement={<Ionicons name="chevron-forward" size={20} color="#94A3B8" />}
                />

                <SettingItem
                    icon={<MaterialCommunityIcons name="email" size={24} color="#06B6D4" />}
                    iconColor="bg-cyan-100"
                    title="Contact Support"
                    subtitle="Get help from our team"
                    onPress={() => Linking.openURL('mailto:support@healthmind.ai')}
                    rightElement={<Ionicons name="chevron-forward" size={20} color="#94A3B8" />}
                />

                {/* Legal */}
                <Text style={tw`text-xs font-bold text-slate-600 mb-3 mt-6 uppercase`}>Legal</Text>

                <SettingItem
                    icon={<Ionicons name="document-text" size={24} color="#6366F1" />}
                    iconColor="bg-indigo-100"
                    title="Privacy Policy"
                    onPress={() => router.push('/(app)/privacy')}
                    rightElement={<Ionicons name="chevron-forward" size={20} color="#94A3B8" />}
                />

                <SettingItem
                    icon={<Ionicons name="shield-checkmark" size={24} color="#8B5CF6" />}
                    iconColor="bg-purple-100"
                    title="Terms of Service"
                    onPress={() => router.push('/(app)/terms')}
                    rightElement={<Ionicons name="chevron-forward" size={20} color="#94A3B8" />}
                />

                {/* About */}
                <Text style={tw`text-xs font-bold text-slate-600 mb-3 mt-6 uppercase`}>About</Text>

                <View style={tw`bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-4`}>
                    <View style={tw`items-center mb-4`}>
                        <View style={tw`w-16 h-16 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full items-center justify-center mb-3`}>
                            <MaterialCommunityIcons name="brain" size={32} color="white" />
                        </View>
                        <Text style={tw`text-xl font-bold text-slate-900 mb-1`}>HealthMind AI</Text>
                        <Text style={tw`text-slate-500 text-sm`}>Version 1.0.0</Text>
                    </View>

                    <View style={tw`border-t border-slate-100 pt-4`}>
                        <Text style={tw`text-center text-slate-600 text-sm mb-2`}>Developed by</Text>
                        <Text style={tw`text-center text-teal-600 font-bold text-base`}>
                            Rajan Prasaila Yadav
                        </Text>
                        <Text style={tw`text-center text-slate-400 text-xs mt-3`}>
                            © 2024 HealthMind AI. All rights reserved.
                        </Text>
                    </View>
                </View>

                {/* Sign Out */}
                <TouchableOpacity
                    onPress={handleSignOut}
                    style={tw`bg-white p-4 rounded-2xl flex-row items-center shadow-sm border border-red-100`}
                >
                    <View style={tw`w-12 h-12 rounded-full bg-red-100 items-center justify-center mr-4`}>
                        <Ionicons name="log-out" size={24} color="#EF4444" />
                    </View>
                    <Text style={tw`flex-1 font-bold text-red-600 text-base`}>Sign Out</Text>
                </TouchableOpacity>

                {/* Disclaimer */}
                <View style={tw`bg-amber-50 p-4 rounded-2xl mt-6 border border-amber-100`}>
                    <View style={tw`flex-row items-start gap-3`}>
                        <Ionicons name="warning" size={20} color="#F59E0B" />
                        <Text style={tw`flex-1 text-amber-800 text-xs leading-5`}>
                            <Text style={tw`font-bold`}>Medical Disclaimer: </Text>
                            This app provides general health information and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider.
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
