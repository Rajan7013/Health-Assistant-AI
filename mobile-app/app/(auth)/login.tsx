import { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { signInAnonymously } from 'firebase/auth';
import { auth } from '../../src/config/firebase';
import { tw } from '../../src/lib/utils';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
    const [loading, setLoading] = useState(false);

    const handleGoogleLogin = async () => {
        // Native Google Sign-In is disabled for Expo Go
        Alert.alert(
            "Expo Go Mode",
            "Google Sign-In requires a Development Build. Logging you in anonymously for testing.",
            [
                {
                    text: "OK",
                    onPress: handleMockLogin
                }
            ]
        );
    };

    const handleMockLogin = async () => {
        try {
            setLoading(true);
            // Use Anonymous auth for dev/testing in Expo Go
            await signInAnonymously(auth);
            // Auth state listener in _layout.tsx will handle redirection
        } catch (error: any) {
            console.error("Mock Login Error:", error);
            Alert.alert('Login failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = () => {
        router.replace('/(app)');
    };

    return (
        <SafeAreaView style={tw`flex-1 bg-white`}>
            <View style={tw`flex-1 px-8 justify-center`}>
                <View style={tw`items-center mb-16`}>
                    <View style={tw`w-28 h-28 bg-blue-50 rounded-3xl items-center justify-center mb-6 shadow-sm`}>
                        <Ionicons name="medical" size={48} color="#2563EB" />
                    </View>
                    <Text style={tw`text-3xl font-bold text-slate-900 mb-2 text-center`}>
                        Health Assistant
                    </Text>
                    <Text style={tw`text-slate-500 text-center text-base leading-6`}>
                        Your personal AI companion for{'\n'}a healthier, happier life.
                    </Text>
                </View>

                <View style={tw`gap-4`}>
                    <TouchableOpacity
                        style={tw`flex-row items-center bg-white border border-slate-200 px-6 py-4 rounded-2xl shadow-sm active:bg-slate-50`}
                        onPress={handleGoogleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#2563EB" style={tw`mr-4`} />
                        ) : (
                            <Image
                                source={{ uri: 'https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg' }}
                                style={tw`w-6 h-6 mr-4`}
                            />
                        )}
                        <Text style={tw`text-slate-700 font-semibold text-lg flex-1 text-center`}>
                            {loading ? 'Logging in...' : 'Continue with Google'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={tw`py-4`}
                        onPress={handleSkip}
                    >
                        <Text style={tw`text-slate-400 text-sm text-center font-medium`}>
                            Skip for now (Developer Mode)
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={tw`p-6`}>
                <Text style={tw`text-slate-300 text-xs text-center`}>
                    By continuing, you agree to our Terms & Privacy Policy
                </Text>
            </View>
        </SafeAreaView>
    );
}
