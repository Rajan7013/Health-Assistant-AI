import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AppLayout() {
    return (
        <Tabs screenOptions={{
            tabBarActiveTintColor: '#0d9488', // Teal-600
            headerShown: false,
            tabBarStyle: { height: 80, paddingBottom: 20, paddingTop: 8 },
            tabBarLabelStyle: { fontSize: 12, fontWeight: '500' }
        }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="symptoms"
                options={{
                    title: 'Health',
                    tabBarIcon: ({ color }) => <Ionicons name="heart" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="chat"
                options={{
                    title: 'Chat',
                    tabBarIcon: ({ color }) => <Ionicons name="chatbubbles" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color }) => <Ionicons name="settings" size={24} color={color} />,
                }}
            />

            {/* Hidden Routes - These are part of the app but don't show in the tab bar */}
            <Tabs.Screen name="schedules" options={{ href: null }} />
            <Tabs.Screen name="reports" options={{ href: null }} />
            <Tabs.Screen name="notes" options={{ href: null }} />
            <Tabs.Screen name="profile" options={{ href: null }} />
            <Tabs.Screen name="help" options={{ href: null }} />
            <Tabs.Screen name="privacy" options={{ href: null }} />
            <Tabs.Screen name="terms" options={{ href: null }} />
        </Tabs>
    );
}
