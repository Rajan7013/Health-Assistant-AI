import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { tw } from '../../src/lib/utils';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function PrivacyPolicyScreen() {
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
                        <Text style={tw`text-3xl font-bold text-slate-900`}>Privacy Policy</Text>
                        <Text style={tw`text-slate-500 mt-1`}>Last updated: December 2024</Text>
                    </View>
                </View>

                {/* Content */}
                <View style={tw`bg-white p-6 rounded-2xl shadow-sm border border-slate-100`}>
                    <Text style={tw`text-lg font-bold text-slate-900 mb-4`}>Introduction</Text>
                    <Text style={tw`text-slate-700 leading-6 mb-6`}>
                        HealthMind AI ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application.
                    </Text>

                    <Text style={tw`text-lg font-bold text-slate-900 mb-4`}>Information We Collect</Text>
                    <Text style={tw`text-slate-700 leading-6 mb-3`}>
                        <Text style={tw`font-bold`}>Account Information:</Text> Email, name, and profile photo from your authentication provider.
                    </Text>
                    <Text style={tw`text-slate-700 leading-6 mb-3`}>
                        <Text style={tw`font-bold`}>Health Data:</Text> Symptoms, medical reports, chat messages, medicine schedules, allergies, chronic conditions, and emergency contact information.
                    </Text>
                    <Text style={tw`text-slate-700 leading-6 mb-6`}>
                        <Text style={tw`font-bold`}>Usage Data:</Text> App interactions, feature usage, and crash reports for improving the app.
                    </Text>

                    <Text style={tw`text-lg font-bold text-slate-900 mb-4`}>How We Use Your Information</Text>
                    <Text style={tw`text-slate-700 leading-6 mb-2`}>• Provide AI-powered health analysis and recommendations</Text>
                    <Text style={tw`text-slate-700 leading-6 mb-2`}>• Send medicine reminders and notifications</Text>
                    <Text style={tw`text-slate-700 leading-6 mb-2`}>• Improve and personalize your experience</Text>
                    <Text style={tw`text-slate-700 leading-6 mb-2`}>• Ensure app security and prevent fraud</Text>
                    <Text style={tw`text-slate-700 leading-6 mb-6`}>• Comply with legal obligations</Text>

                    <Text style={tw`text-lg font-bold text-slate-900 mb-4`}>Data Security</Text>
                    <Text style={tw`text-slate-700 leading-6 mb-6`}>
                        We use industry-standard encryption to protect your data. All health information is stored securely in Firebase with end-to-end encryption. We implement appropriate technical and organizational measures to maintain data security.
                    </Text>

                    <Text style={tw`text-lg font-bold text-slate-900 mb-4`}>Data Sharing</Text>
                    <Text style={tw`text-slate-700 leading-6 mb-6`}>
                        We DO NOT sell your personal health information. Your data may be shared with:
                        {'\n'}• AI service providers (Gemini AI) for analysis only
                        {'\n'}• Cloud infrastructure providers (Firebase) for secure storage
                        {'\n'}• Legal authorities if required by law
                    </Text>

                    <Text style={tw`text-lg font-bold text-slate-900 mb-4`}>Your Rights</Text>
                    <Text style={tw`text-slate-700 leading-6 mb-2`}>• Access your personal data</Text>
                    <Text style={tw`text-slate-700 leading-6 mb-2`}>• Request data correction or deletion</Text>
                    <Text style={tw`text-slate-700 leading-6 mb-2`}>• Export your health records</Text>
                    <Text style={tw`text-slate-700 leading-6 mb-2`}>• Opt-out of notifications</Text>
                    <Text style={tw`text-slate-700 leading-6 mb-6`}>• Delete your account permanently</Text>

                    <Text style={tw`text-lg font-bold text-slate-900 mb-4`}>Data Retention</Text>
                    <Text style={tw`text-slate-700 leading-6 mb-6`}>
                        We retain your data as long as your account is active. Upon account deletion, all personal data is permanently removed within 7 business days.
                    </Text>

                    <Text style={tw`text-lg font-bold text-slate-900 mb-4`}>Children's Privacy</Text>
                    <Text style={tw`text-slate-700 leading-6 mb-6`}>
                        Our app is not intended for children under 13. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us immediately.
                    </Text>

                    <Text style={tw`text-lg font-bold text-slate-900 mb-4`}>Changes to This Policy</Text>
                    <Text style={tw`text-slate-700 leading-6 mb-6`}>
                        We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy in the app and updating the "Last updated" date.
                    </Text>

                    <Text style={tw`text-lg font-bold text-slate-900 mb-4`}>Contact Us</Text>
                    <Text style={tw`text-slate-700 leading-6`}>
                        If you have questions about this Privacy Policy, please contact us at:
                        {'\n'}Email: support@healthmind.ai
                        {'\n'}Or through the app's Support section
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
