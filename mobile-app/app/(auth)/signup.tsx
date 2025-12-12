import { useState } from 'react';
import { View, Text, TouchableOpacity, Image, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { tw } from '../../src/lib/utils';
import { Ionicons } from '@expo/vector-icons';

export default function SignupScreen() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSignup = () => {
        // Placeholder for Signup logic
        console.log("Signup with:", name, email, password);
        router.replace('/(app)');
    };

    return (
        <SafeAreaView style={tw`flex-1 bg-white`}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={tw`flex-1`}
            >
                <ScrollView contentContainerStyle={tw`flex-grow justify-center px-8`}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={tw`absolute top-4 left-8 z-10 w-10 h-10 bg-slate-50 rounded-full items-center justify-center`}
                    >
                        <Ionicons name="arrow-back" size={24} color="#64748B" />
                    </TouchableOpacity>

                    {/* Header Section */}
                    <View style={tw`items-center mb-8 mt-12`}>
                        <Text style={tw`text-2xl font-bold text-slate-900 mb-2 text-center`}>
                            Create Account
                        </Text>
                        <Text style={tw`text-slate-500 text-center text-sm`}>
                            Join us to start your journey
                        </Text>
                    </View>

                    {/* Form Section */}
                    <View style={tw`gap-4 mb-6`}>
                        <View>
                            <Text style={tw`text-slate-700 font-medium mb-2 ml-1`}>Full Name</Text>
                            <TextInput
                                style={tw`bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900`}
                                placeholder="John Doe"
                                placeholderTextColor="#94A3B8"
                                value={name}
                                onChangeText={setName}
                            />
                        </View>

                        <View>
                            <Text style={tw`text-slate-700 font-medium mb-2 ml-1`}>Email Address</Text>
                            <TextInput
                                style={tw`bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900`}
                                placeholder="hello@example.com"
                                placeholderTextColor="#94A3B8"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>

                        <View>
                            <Text style={tw`text-slate-700 font-medium mb-2 ml-1`}>Password</Text>
                            <TextInput
                                style={tw`bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900`}
                                placeholder="••••••••"
                                placeholderTextColor="#94A3B8"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>

                        <TouchableOpacity
                            style={tw`bg-blue-600 py-4 rounded-xl shadow-md shadow-blue-200 mt-4`}
                            onPress={handleSignup}
                        >
                            <Text style={tw`text-white font-bold text-center text-lg`}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={tw`flex-row items-center mb-6`}>
                        <View style={tw`flex-1 h-[1px] bg-slate-200`} />
                        <Text style={tw`mx-4 text-slate-400 text-xs`}>OR SIGN UP WITH</Text>
                        <View style={tw`flex-1 h-[1px] bg-slate-200`} />
                    </View>

                    {/* Social Auth */}
                    <TouchableOpacity
                        style={tw`flex-row items-center justify-center bg-white border border-slate-200 px-6 py-4 rounded-xl shadow-sm mb-6`}
                        onPress={() => { }} // Reuse Google logic if needed
                    >
                        <Image
                            source={{ uri: 'https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg' }}
                            style={tw`w-6 h-6 mr-3`}
                        />
                        <Text style={tw`text-slate-700 font-semibold text-base`}>
                            Google
                        </Text>
                    </TouchableOpacity>

                    {/* Footer */}
                    <View style={tw`flex-row justify-center items-center gap-1 mb-8`}>
                        <Text style={tw`text-slate-500 text-sm`}>Already have an account?</Text>
                        <TouchableOpacity onPress={() => router.back()}>
                            <Text style={tw`text-blue-600 font-bold text-sm`}>Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
