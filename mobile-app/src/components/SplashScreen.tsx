import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { tw } from '../lib/utils';

export default function SplashScreen() {
    return (
        <View style={tw`flex-1 bg-blue-600 items-center justify-center`}>
            <View style={tw`mb-6`}>
                <View style={tw`w-32 h-32 bg-white rounded-full items-center justify-center shadow-lg`}>
                    <Ionicons name="medical" size={64} color="#2563EB" />
                </View>
            </View>

            <View>
                <Text style={tw`text-3xl font-bold text-white text-center mb-2`}>
                    Health Assistant
                </Text>
                <Text style={tw`text-blue-100 text-center text-lg`}>
                    Your AI Health Companion
                </Text>
            </View>
        </View>
    );
}
