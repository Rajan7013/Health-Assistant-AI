import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { tw } from '../../src/lib/utils';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/auth';
import { getUserProfile, saveUserProfile, UserProfile } from '../../src/firebase/firestore/users';
import { signOut } from 'firebase/auth';
import { auth } from '../../src/config/firebase';

export default function ProfileScreen() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Form fields
    const [displayName, setDisplayName] = useState('');
    const [allergies, setAllergies] = useState('');
    const [chronicConditions, setChronicConditions] = useState('');
    const [emergencyName, setEmergencyName] = useState('');
    const [emergencyPhone, setEmergencyPhone] = useState('');
    const [emergencyRelationship, setEmergencyRelationship] = useState('');

    // Dynamic load: Fetch profile from Firestore
    useEffect(() => {
        if (!user) return;
        loadProfile();
    }, [user]);

    const loadProfile = async () => {
        if (!user) return;

        try {
            const profile = await getUserProfile(user.uid);

            if (profile) {
                setDisplayName(profile.displayName || user.displayName || user.email || '');
                setAllergies(profile.allergies?.join(', ') || '');
                setChronicConditions(profile.chronicConditions?.join(', ') || '');
                setEmergencyName(profile.emergencyContact?.name || '');
                setEmergencyPhone(profile.emergencyContact?.phone || '');
                setEmergencyRelationship(profile.emergencyContact?.relationship || '');
            } else {
                setDisplayName(user.displayName || user.email || '');
            }
        } catch (error) {
            console.error('Load error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!user) return;

        if (!displayName.trim()) {
            Alert.alert('Error', 'Name is required.');
            return;
        }

        setIsSaving(true);
        try {
            // Dynamic save: Updates Firestore immediately
            await saveUserProfile(user.uid, {
                displayName: displayName.trim(),
                email: user.email || '',
                allergies: allergies.split(',').map(s => s.trim()).filter(Boolean),
                chronicConditions: chronicConditions.split(',').map(s => s.trim()).filter(Boolean),
                emergencyContact: {
                    name: emergencyName.trim(),
                    phone: emergencyPhone.trim(),
                    relationship: emergencyRelationship.trim()
                }
            });

            setIsEditing(false);
            Alert.alert('Success', 'Profile updated!');
        } catch (error) {
            console.error('Save error:', error);
            Alert.alert('Error', 'Failed to save profile.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out: ", error);
            Alert.alert("Error", "Failed to sign out.");
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={tw`flex-1 bg-slate-50 items-center justify-center`}>
                <ActivityIndicator size="large" color="#2563EB" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={tw`flex-1 bg-slate-50`}>
            <ScrollView contentContainerStyle={tw`p-6 pb-24`}>
                {/* Header */}
                <View style={tw`mb-6 mt-4 flex-row justify-between items-center`}>
                    <View>
                        <Text style={tw`text-3xl font-bold text-slate-900`}>My <Text style={tw`text-purple-600`}>Profile</Text></Text>
                        <Text style={tw`text-slate-500 mt-1`}>Manage your health info</Text>
                    </View>
                    {!isEditing && (
                        <TouchableOpacity
                            onPress={() => setIsEditing(true)}
                            style={tw`bg-purple-600 px-4 py-2 rounded-xl flex-row items-center gap-2`}
                        >
                            <Ionicons name="pencil" size={16} color="white" />
                            <Text style={tw`text-white font-bold`}>Edit</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Avatar Card */}
                <View style={tw`bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6`}>
                    <View style={tw`flex-row items-center gap-4`}>
                        <View style={tw`w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 items-center justify-center`}>
                            <Ionicons name="person" size={32} color="white" />
                        </View>
                        <View style={tw`flex-1`}>
                            <Text style={tw`text-2xl font-bold text-slate-900`}>{displayName}</Text>
                            <Text style={tw`text-slate-500`}>{user?.email}</Text>
                        </View>
                    </View>
                </View>

                {/* Basic Info */}
                <View style={tw`bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6`}>
                    <View style={tw`flex-row items-center mb-4`}>
                        <Ionicons name="person-circle" size={24} color="#8B5CF6" />
                        <Text style={tw`text-lg font-bold text-slate-900 ml-2`}>Basic Information</Text>
                    </View>

                    <Text style={tw`text-xs font-bold text-slate-600 mb-2`}>FULL NAME</Text>
                    <TextInput
                        style={tw`bg-slate-50 border border-slate-200 rounded-xl p-4 text-base mb-4 ${!isEditing && 'opacity-60'}`}
                        value={displayName}
                        onChangeText={setDisplayName}
                        editable={isEditing}
                        placeholder="Your full name"
                    />

                    <Text style={tw`text-xs font-bold text-slate-600 mb-2`}>EMAIL</Text>
                    <TextInput
                        style={tw`bg-slate-100 border border-slate-200 rounded-xl p-4 text-base opacity-60`}
                        value={user?.email || ''}
                        editable={false}
                    />
                </View>

                {/* Health Info */}
                <View style={tw`bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6`}>
                    <View style={tw`flex-row items-center mb-4`}>
                        <MaterialCommunityIcons name="heart-pulse" size={24} color="#EF4444" />
                        <Text style={tw`text-lg font-bold text-slate-900 ml-2`}>Health Information</Text>
                    </View>

                    <Text style={tw`text-xs font-bold text-slate-600 mb-2`}>ALLERGIES</Text>
                    <TextInput
                        style={tw`bg-slate-50 border border-slate-200 rounded-xl p-4 text-base mb-4 ${!isEditing && 'opacity-60'}`}
                        value={allergies}
                        onChangeText={setAllergies}
                        editable={isEditing}
                        placeholder="e.g., Peanuts, Penicillin (comma separated)"
                        multiline
                    />

                    <Text style={tw`text-xs font-bold text-slate-600 mb-2`}>CHRONIC CONDITIONS</Text>
                    <TextInput
                        style={tw`bg-slate-50 border border-slate-200 rounded-xl p-4 text-base ${!isEditing && 'opacity-60'}`}
                        value={chronicConditions}
                        onChangeText={setChronicConditions}
                        editable={isEditing}
                        placeholder="e.g., Asthma, Diabetes (comma separated)"
                        multiline
                    />
                </View>

                {/* Emergency Contact */}
                <View style={tw`bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6`}>
                    <View style={tw`flex-row items-center mb-4`}>
                        <Ionicons name="alert-circle" size={24} color="#F59E0B" />
                        <Text style={tw`text-lg font-bold text-slate-900 ml-2`}>Emergency Contact</Text>
                    </View>

                    <Text style={tw`text-xs font-bold text-slate-600 mb-2`}>CONTACT NAME</Text>
                    <TextInput
                        style={tw`bg-slate-50 border border-slate-200 rounded-xl p-4 text-base mb-4 ${!isEditing && 'opacity-60'}`}
                        value={emergencyName}
                        onChangeText={setEmergencyName}
                        editable={isEditing}
                        placeholder="e.g., John Doe"
                    />

                    <Text style={tw`text-xs font-bold text-slate-600 mb-2`}>RELATIONSHIP</Text>
                    <TextInput
                        style={tw`bg-slate-50 border border-slate-200 rounded-xl p-4 text-base mb-4 ${!isEditing && 'opacity-60'}`}
                        value={emergencyRelationship}
                        onChangeText={setEmergencyRelationship}
                        editable={isEditing}
                        placeholder="e.g., Spouse, Parent"
                    />

                    <Text style={tw`text-xs font-bold text-slate-600 mb-2`}>PHONE NUMBER</Text>
                    <TextInput
                        style={tw`bg-slate-50 border border-slate-200 rounded-xl p-4 text-base ${!isEditing && 'opacity-60'}`}
                        value={emergencyPhone}
                        onChangeText={setEmergencyPhone}
                        editable={isEditing}
                        placeholder="e.g., +1 234 567 8900"
                        keyboardType="phone-pad"
                    />
                </View>

                {/* Action Buttons */}
                {isEditing ? (
                    <View style={tw`flex-row gap-3 mb-4`}>
                        <TouchableOpacity
                            onPress={() => {
                                setIsEditing(false);
                                loadProfile();
                            }}
                            style={tw`flex-1 bg-slate-200 p-4 rounded-xl`}
                        >
                            <Text style={tw`text-slate-700 font-bold text-center`}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleSave}
                            disabled={isSaving}
                            style={tw`flex-1 bg-purple-600 p-4 rounded-xl flex-row items-center justify-center gap-2`}
                        >
                            {isSaving ? (
                                <ActivityIndicator color="white" size="small" />
                            ) : (
                                <>
                                    <Ionicons name="checkmark-circle" size={20} color="white" />
                                    <Text style={tw`text-white font-bold`}>Save</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={tw`flex-row items-center bg-white p-4 rounded-xl shadow-sm border border-red-100`}
                        onPress={handleSignOut}
                    >
                        <View style={tw`w-10 h-10 bg-red-50 rounded-full items-center justify-center mr-4`}>
                            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                        </View>
                        <Text style={tw`flex-1 text-red-600 font-bold text-base`}>Sign Out</Text>
                    </TouchableOpacity>
                )}

                <View style={tw`items-center mt-8`}>
                    <Text style={tw`text-slate-400 text-sm`}>Version 1.0.0</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
