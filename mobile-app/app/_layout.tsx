import { useEffect } from 'react';
import { Stack, router, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../src/context/auth';
import { ThemeProvider } from '../src/context/ThemeContext';
import "../global.css";
import SplashScreen from '../src/components/SplashScreen';

function InitialLayout() {
    const { user, loading } = useAuth();
    const segments = useSegments();

    useEffect(() => {
        if (loading) return;

        const inAuthGroup = segments[0] === '(auth)';

        if (user && inAuthGroup) {
            // Redirect to the app home if user is signed in and trying to access auth screens
            router.replace('/(app)');
        } else if (!user && !inAuthGroup) {
            // Redirect to login if user is not signed in and trying to access app screens
            router.replace('/(auth)/login');
        }
    }, [user, loading, segments]);

    if (loading) return <SplashScreen />;

    return (
        <Stack>
            <Stack.Screen name="(app)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack>
    );
}

export default function RootLayout() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <InitialLayout />
            </AuthProvider>
        </ThemeProvider>
    );
}
