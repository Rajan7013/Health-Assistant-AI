import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { tw } from '../../src/lib/utils';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <TouchableOpacity
            onPress={() => setIsExpanded(!isExpanded)}
            style={tw`bg-white p-4 rounded-2xl mb-3 shadow-sm border border-slate-100`}
        >
            <View style={tw`flex-row items-center justify-between`}>
                <Text style={tw`flex-1 font-bold text-slate-900 pr-2`}>{question}</Text>
                <Ionicons
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="#64748B"
                />
            </View>
            {isExpanded && (
                <Text style={tw`text-slate-600 mt-3 leading-6`}>{answer}</Text>
            )}
        </TouchableOpacity>
    );
};

export default function HelpScreen() {
    const faqs = [
        {
            question: "How do I analyze my medical reports?",
            answer: "Go to the Medical Reports tab, tap 'Upload File' or 'Take Photo', select your report (blood test, X-ray, etc.), and our AI will analyze it within seconds. You'll get a detailed analysis with key findings and recommendations."
        },
        {
            question: "Is my health data secure?",
            answer: "Yes! All your data is encrypted and stored securely in Firebase. We never share your personal health information with third parties. You can delete your data anytime from your profile."
        },
        {
            question: "How accurate is the symptom checker?",
            answer: "Our AI symptom checker uses advanced language models trained on medical data. However, it's for informational purposes only and NOT a substitute for professional medical advice. Always consult a doctor for serious concerns."
        },
        {
            question: "Can I set medicine reminders?",
            answer: "Yes! Go to Schedule Medicine, add your medication name, time, and frequency (daily/weekly). The app will show your next medicine on the dashboard. Push notifications require a development build."
        },
        {
            question: "How do I edit my profile?",
            answer: "Go to Settings → Profile. You can add your name, allergies, chronic conditions, and emergency contact information. This helps the AI provide more personalized health advice."
        },
        {
            question: "What should I do in a medical emergency?",
            answer: "🚨 This app is NOT for emergencies! If you're experiencing a medical emergency, call your local emergency number (911, 112, etc.) or go to the nearest hospital immediately."
        },
        {
            question: "Can I export my health data?",
            answer: "Yes! Go to Settings → Contact Support and request your data export. We'll send you a copy of all your health records in a secure format."
        },
        {
            question: "Why isn't voice input working?",
            answer: "Voice input for symptoms and chat requires a development build and microphone permissions. For now, it shows a placeholder in Expo Go. You can still type your queries normally."
        },
        {
            question: "How do I delete my account?",
            answer: "Go to Settings → Contact Support and request account deletion. We'll permanently delete all your data within 7 days as per our privacy policy."
        }
    ];

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
                        <Text style={tw`text-3xl font-bold text-slate-900`}>Help & FAQ</Text>
                        <Text style={tw`text-slate-500 mt-1`}>Common questions answered</Text>
                    </View>
                </View>

                {/* Emergency Alert */}
                <View style={tw`bg-red-50 p-4 rounded-2xl mb-6 border border-red-100`}>
                    <View style={tw`flex-row items-start gap-3`}>
                        <Ionicons name="alert-circle" size={24} color="#EF4444" />
                        <View style={tw`flex-1`}>
                            <Text style={tw`font-bold text-red-900 mb-1`}>Medical Emergency?</Text>
                            <Text style={tw`text-red-800 text-sm leading-5`}>
                                This app is for information only. In emergencies, call 911 or your local emergency number immediately.
                            </Text>
                        </View>
                    </View>
                </View>

                {/* FAQ List */}
                <Text style={tw`text-xs font-bold text-slate-600 mb-3 uppercase`}>Frequently Asked Questions</Text>

                {faqs.map((faq, index) => (
                    <FAQItem key={index} question={faq.question} answer={faq.answer} />
                ))}

                {/* Contact Section */}
                <View style={tw`bg-blue-50 p-6 rounded-2xl mt-6 border border-blue-100`}>
                    <Text style={tw`font-bold text-blue-900 text-lg mb-2`}>Still need help?</Text>
                    <Text style={tw`text-blue-800 mb-4`}>
                        Our support team is here to assist you with any questions or concerns.
                    </Text>
                    <TouchableOpacity
                        onPress={() => router.push('/(app)/settings')}
                        style={tw`bg-blue-600 p-4 rounded-xl flex-row items-center justify-center gap-2`}
                    >
                        <Ionicons name="mail" size={20} color="white" />
                        <Text style={tw`text-white font-bold`}>Contact Support</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
