import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { tw } from '../../src/lib/utils';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function TermsScreen() {
    return (
        <SafeAreaView style={tw`flex-1 bg-slate-50`}>
            <ScrollView contentContainerStyle={tw`p-6 pb-24`}>
                {/* Header */}
                <View style={tw`flex-row items-center mb-6 mt-4`}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={tw`w-10 h-10 bg-white rounded-full items-center justify-center mr-3 shadow-sm`}
                    >
                        <Ionicons name="arrow-back" size={20} color="#334155" />
                    </TouchableOpacity>
                    <View>
                        <Text style={tw`text-3xl font-bold text-slate-900`}>Terms of Service</Text>
                        <Text style={tw`text-slate-500 mt-1`}>Last updated: December 2024</Text>
                    </View>
                </View>

                {/* Content */}
                <View style={tw`bg-white p-6 rounded-2xl shadow-sm border border-slate-100`}>
                    <Text style={tw`text-lg font-bold text-slate-900 mb-4`}>Acceptance of Terms</Text>
                    <Text style={tw`text-slate-700 leading-6 mb-6`}>
                        By accessing and using HealthMind AI, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the app.
                    </Text>

                    <Text style={tw`text-lg font-bold text-slate-900 mb-4`}>Medical Disclaimer</Text>
                    <Text style={tw`text-slate-700 leading-6 mb-6`}>
                        <Text style={tw`font-bold text-red-600`}>IMPORTANT: </Text>
                        HealthMind AI provides general health information and is NOT a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. Never disregard professional medical advice or delay seeking it because of information provided by this app.
                    </Text>

                    <Text style={tw`text-lg font-bold text-slate-900 mb-4`}>Emergency Situations</Text>
                    <Text style={tw`text-slate-700 leading-6 mb-6`}>
                        This app is NOT for medical emergencies. If you are experiencing a medical emergency, call your local emergency number (911, 112, etc.) or go to the nearest emergency room immediately.
                    </Text>

                    <Text style={tw`text-lg font-bold text-slate-900 mb-4`}>AI Accuracy</Text>
                    <Text style={tw`text-slate-700 leading-6 mb-6`}>
                        While we strive for accuracy, AI-generated health information may contain errors or be incomplete. The app uses advanced language models, but results should always be verified with a healthcare professional.
                    </Text>

                    <Text style={tw`text-lg font-bold text-slate-900 mb-4`}>User Responsibilities</Text>
                    <Text style={tw`text-slate-700 leading-6 mb-2`}>You agree to:</Text>
                    <Text style={tw`text-slate-700 leading-6 mb-2`}>• Provide accurate and truthful information</Text>
                    <Text style={tw`text-slate-700 leading-6 mb-2`}>• Keep your account credentials secure</Text>
                    <Text style={tw`text-slate-700 leading-6 mb-2`}>• Use the app lawfully and ethically</Text>
                    <Text style={tw`text-slate-700 leading-6 mb-2`}>• Not share inappropriate content</Text>
                    <Text style={tw`text-slate-700 leading-6 mb-6`}>• Not attempt to hack or misuse the service</Text>

                    <Text style={tw`text-lg font-bold text-slate-900 mb-4`}>Intellectual Property</Text>
                    <Text style={tw`text-slate-700 leading-6 mb-6`}>
                        All content, features, and functionality of HealthMind AI are owned by Rajan Prasaila Yadav and are protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, or distribute any part of the app without permission.
                    </Text>

                    <Text style={tw`text-lg font-bold text-slate-900 mb-4`}>User-Generated Content</Text>
                    <Text style={tw`text-slate-700 leading-6 mb-6`}>
                        You retain ownership of your health data. By using the app, you grant us a limited license to process your data to provide the service. You can delete your data at any time.
                    </Text>

                    <Text style={tw`text-lg font-bold text-slate-900 mb-4`}>Limitation of Liability</Text>
                    <Text style={tw`text-slate-700 leading-6 mb-6`}>
                        HealthMind AI and its developers shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the service. We do not guarantee uninterrupted or error-free operation.
                    </Text>

                    <Text style={tw`text-lg font-bold text-slate-900 mb-4`}>Service Modifications</Text>
                    <Text style={tw`text-slate-700 leading-6 mb-6`}>
                        We reserve the right to modify or discontinue the service at any time without notice. We may also update these Terms of Service periodically.
                    </Text>

                    <Text style={tw`text-lg font-bold text-slate-900 mb-4`}>Termination</Text>
                    <Text style={tw`text-slate-700 leading-6 mb-6`}>
                        We may terminate or suspend your account immediately if you violate these Terms. You may also delete your account at any time through the app settings.
                    </Text>

                    <Text style={tw`text-lg font-bold text-slate-900 mb-4`}>Governing Law</Text>
                    <Text style={tw`text-slate-700 leading-6 mb-6`}>
                        These Terms shall be governed by and construed in accordance with applicable laws. Any disputes shall be resolved through binding arbitration.
                    </Text>

                    <Text style={tw`text-lg font-bold text-slate-900 mb-4`}>Contact Information</Text>
                    <Text style={tw`text-slate-700 leading-6`}>
                        For questions about these Terms, contact:
                        {'\n'}Developer: Rajan Prasaila Yadav
                        {'\n'}Email: support@healthmind.ai
                        {'\n'}Through: Settings → Contact Support
                    </Text>
                </View>

                {/* Acceptance */}
                <View style={tw`bg-blue-50 p-4 rounded-2xl mt-6 border border-blue-100`}>
                    <Text style={tw`text-blue-900 text-sm leading-6 text-center`}>
                        By using HealthMind AI, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
