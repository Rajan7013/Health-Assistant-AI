import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { tw } from '../../src/lib/utils';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/auth';
import { auth } from '../../src/config/firebase';
import VoiceInput from '../../src/components/VoiceInput';

// Types matching the web response
interface SymptomReport {
    primary_condition: string;
    urgency_color: string;
    severity_level: string;
    confidence_score: number;
    root_causes: string[];
    action_plan: {
        immediate: string;
        long_term: string;
    };
    triage_advice: string;
}

export default function SymptomCheckerScreen() {
    const { user } = useAuth();
    const [symptoms, setSymptoms] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<SymptomReport | null>(null);

    const handleAnalyze = async () => {
        if (!symptoms.trim()) {
            Alert.alert('Error', 'Please describe your symptoms first.');
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            const token = await user?.getIdToken();

            // API endpoint - using deployed web app
            const API_URL = 'https://health-assistant-ai-ashen.vercel.app/api/symptom-checker';

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ symptoms }),
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            setResult(data);
        } catch (error: any) {
            console.error('Symptom Checker Error:', error);
            Alert.alert('Analysis Failed', 'Could not analyze symptoms. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={tw`flex-1 bg-slate-50`}>
            <ScrollView contentContainerStyle={tw`p-6`}>
                {/* Header */}
                <View style={tw`mb-6 mt-8`}>
                    <Text style={tw`text-2xl font-bold text-slate-900`}>Symptom Checker</Text>
                    <Text style={tw`text-slate-500`}>AI-powered health assessment</Text>
                </View>

                {/* Input Section */}
                <View style={tw`bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6`}>
                    <Text style={tw`text-sm font-bold text-slate-600 mb-2 uppercase`}>Your Symptoms</Text>
                    <View style={tw`flex-row items-start gap-2`}>
                        <TextInput
                            style={tw`flex-1 bg-slate-50 border border-slate-200 rounded-xl p-4 text-base min-h-[120px]`}
                            placeholder="e.g., fever, headache, cough..."
                            placeholderTextColor="#94A3B8"
                            multiline
                            textAlignVertical="top"
                            value={symptoms}
                            onChangeText={setSymptoms}
                        />
                        <VoiceInput
                            onTranscript={(text) => setSymptoms(symptoms + (symptoms ? ' ' : '') + text)}
                            color="#3B82F6"
                        />
                    </View>
                    <TouchableOpacity
                        onPress={handleAnalyze}
                        disabled={loading}
                        style={tw`bg-teal-600 rounded-xl py-4 items-center flex-row justify-center mt-4 ${loading ? 'opacity-70' : ''}`}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" style={tw`mr-2`} />
                        ) : (
                            <FontAwesome5 name="stethoscope" size={18} color="white" style={tw`mr-2`} />
                        )}
                        <Text style={tw`text-white font-bold text-base`}>
                            {loading ? 'Analyzing...' : 'Analyze Symptoms'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Results Section */}
                {result && (
                    <View style={tw`bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100`}>
                        {/* Urgency Header */}
                        <View style={tw`h-2 w-full`} style={{ backgroundColor: result.urgency_color }} />
                        <View style={tw`p-6`}>
                            <View style={tw`flex-row justify-between items-start mb-4`}>
                                <View>
                                    <Text style={tw`text-xs font-bold text-blue-600 uppercase tracking-wider mb-1`}>
                                        Potential Condition
                                    </Text>
                                    <Text style={tw`text-xl font-bold text-slate-900`}>
                                        {result.primary_condition}
                                    </Text>
                                </View>
                                <View style={tw`px-3 py-1 rounded-full`} style={{ backgroundColor: result.urgency_color }}>
                                    <Text style={tw`text-white text-xs font-bold`}>{result.severity_level}</Text>
                                </View>
                            </View>

                            {/* Confidence */}
                            <View style={tw`bg-blue-50 p-3 rounded-xl mb-4 flex-row justify-between items-center`}>
                                <Text style={tw`text-xs font-bold text-slate-600`}>AI Match Probability</Text>
                                <Text style={tw`text-lg font-black text-blue-600`}>{result.confidence_score}%</Text>
                            </View>

                            {/* Possible Causes */}
                            <View style={tw`mb-4`}>
                                <Text style={tw`font-bold text-slate-900 mb-2 flex-row items-center`}>
                                    <MaterialCommunityIcons name="brain" size={16} color="#7C3AED" /> Possible Causes
                                </Text>
                                <View style={tw`flex-row flex-wrap gap-2`}>
                                    {result.root_causes.map((cause, idx) => (
                                        <View key={idx} style={tw`bg-purple-50 px-3 py-1 rounded-lg border border-purple-100`}>
                                            <Text style={tw`text-purple-700 text-xs font-medium`}>{cause}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>

                            {/* Action Plan */}
                            <View style={tw`bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-4`}>
                                <Text style={tw`font-bold text-slate-900 mb-3`}>Action Plan</Text>

                                <View style={tw`flex-row mb-3`}>
                                    <View style={tw`w-6 h-6 bg-blue-100 rounded items-center justify-center mr-3`}>
                                        <Ionicons name="flash" size={14} color="#2563EB" />
                                    </View>
                                    <View style={tw`flex-1`}>
                                        <Text style={tw`font-bold text-slate-900 text-xs mb-1`}>Immediate Relief</Text>
                                        <Text style={tw`text-xs text-slate-600 leading-5`}>{result.action_plan.immediate}</Text>
                                    </View>
                                </View>

                                <View style={tw`flex-row`}>
                                    <View style={tw`w-6 h-6 bg-teal-100 rounded items-center justify-center mr-3`}>
                                        <Ionicons name="calendar" size={14} color="#0D9488" />
                                    </View>
                                    <View style={tw`flex-1`}>
                                        <Text style={tw`font-bold text-slate-900 text-xs mb-1`}>Long-Term Prevention</Text>
                                        <Text style={tw`text-xs text-slate-600 leading-5`}>{result.action_plan.long_term}</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Recommendation */}
                            <View style={tw`flex-row items-center bg-green-50 p-3 rounded-xl border border-green-100`}>
                                <View style={tw`p-2 bg-green-100 rounded-lg mr-3`}>
                                    <FontAwesome5 name="shield-alt" size={16} color="#16A34A" />
                                </View>
                                <View style={tw`flex-1`}>
                                    <Text style={tw`font-bold text-green-700 text-xs uppercase mb-1`}>Recommendation</Text>
                                    <Text style={tw`text-sm font-bold text-slate-900`}>{result.triage_advice}</Text>
                                </View>
                            </View>

                        </View>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
