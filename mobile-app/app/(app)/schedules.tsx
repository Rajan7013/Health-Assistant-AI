import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { tw } from '../../src/lib/utils';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/auth';
import { db } from '../../src/config/firebase';
import { addSchedule, getSchedules, deleteSchedule, ScheduleWithId } from '../../src/firebase/firestore/schedules';
// Notifications disabled for Expo Go - enable in development build

export default function SchedulesScreen() {
    const { user } = useAuth();
    const [schedules, setSchedules] = useState<ScheduleWithId[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);

    // Form State
    const [medicineName, setMedicineName] = useState('');
    const [time, setTime] = useState('09:00');
    const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');

    // Subscribe to schedules
    useEffect(() => {
        if (!user) return;
        const unsubscribe = getSchedules(db, user.uid, (data: ScheduleWithId[]) => {
            setSchedules(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [user]);

    const handleAddSchedule = async () => {
        if (!medicineName.trim()) {
            Alert.alert('Error', 'Please enter a medicine name');
            return;
        }
        if (!time.trim() || !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
            Alert.alert('Error', 'Please enter a valid time (HH:MM format)');
            return;
        }
        if (!user) return;

        try {
            const scheduleId = await addSchedule(db, user.uid, {
                medicineName,
                time,
                startDate: new Date(),
                frequency,
            });

            // Schedule notification
            if (scheduleId) {
                const notificationId = await scheduleMedicineNotification(
                    medicineName,
                    time,
                    frequency,
                    scheduleId
                );

                if (notificationId) {
                    console.log('Notification scheduled:', notificationId);
                }
            }

            setIsModalVisible(false);
            resetForm();
            Alert.alert('Success', `Reminder set for ${medicineName} at ${time}!`);
        } catch (error) {
            console.error('Error adding schedule:', error);
            Alert.alert('Error', 'Failed to save reminder.');
        }
    };

    const handleDelete = (id: string) => {
        Alert.alert(
            "Delete Reminder",
            "Are you sure?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        if (user) await deleteSchedule(db, user.uid, id);
                    }
                }
            ]
        );
    };

    const resetForm = () => {
        setMedicineName('');
        setTime('09:00');
        setFrequency('daily');
    };

    return (
        <SafeAreaView style={tw`flex-1 bg-slate-50`}>
            <ScrollView contentContainerStyle={tw`p-6 pb-24`}>
                {/* Header */}
                <View style={tw`mb-6 mt-4 flex-row justify-between items-center`}>
                    <View>
                        <Text style={tw`text-3xl font-bold text-slate-900`}>Health <Text style={tw`text-blue-600`}>Schedule</Text></Text>
                        <Text style={tw`text-slate-500 mt-1`}>Manage your medications</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => setIsModalVisible(true)}
                        style={tw`bg-blue-600 p-3 rounded-full shadow-lg shadow-blue-500/30`}
                    >
                        <Ionicons name="add" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                {/* List */}
                {loading ? (
                    <ActivityIndicator size="large" color="#2563EB" style={tw`mt-8`} />
                ) : schedules.length === 0 ? (
                    <View style={tw`items-center justify-center py-12 opacity-50`}>
                        <MaterialCommunityIcons name="pill" size={48} color="#94A3B8" />
                        <Text style={tw`text-slate-500 mt-2`}>No reminders set</Text>
                    </View>
                ) : (
                    schedules.map((schedule) => (
                        <View key={schedule.id} style={tw`bg-white p-4 rounded-2xl mb-3 flex-row items-center shadow-sm border border-slate-100`}>
                            <View style={tw`w-12 h-12 rounded-xl bg-blue-50 items-center justify-center mr-4`}>
                                <MaterialCommunityIcons name="pill" size={24} color="#3B82F6" />
                            </View>
                            <View style={tw`flex-1`}>
                                <Text style={tw`font-bold text-slate-900 text-lg`} numberOfLines={1}>{schedule.medicineName}</Text>
                                <View style={tw`flex-row items-center gap-3 mt-1`}>
                                    <View style={tw`flex-row items-center gap-1`}>
                                        <Ionicons name="time-outline" size={14} color="#64748B" />
                                        <Text style={tw`text-slate-500 text-sm`}>{schedule.time}</Text>
                                    </View>
                                    <View style={tw`flex-row items-center gap-1`}>
                                        <Ionicons name="repeat" size={14} color="#64748B" />
                                        <Text style={tw`text-slate-500 text-sm capitalize`}>{schedule.frequency}</Text>
                                    </View>
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => handleDelete(schedule.id)} style={tw`p-2 bg-red-50 rounded-full`}>
                                <Ionicons name="trash-outline" size={20} color="#EF4444" />
                            </TouchableOpacity>
                        </View>
                    ))
                )}
            </ScrollView>

            {/* Add Modal */}
            <Modal
                visible={isModalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={tw`flex-1 bg-slate-50`}>
                    <View style={tw`px-6 py-4 bg-white border-b border-slate-100 flex-row items-center justify-between`}>
                        <Text style={tw`text-lg font-bold text-slate-900`}>Add Reminder</Text>
                        <TouchableOpacity onPress={() => setIsModalVisible(false)} style={tw`p-2 bg-slate-100 rounded-full`}>
                            <Ionicons name="close" size={20} color="#64748B" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={tw`p-6`}>
                        <Text style={tw`text-sm font-bold text-slate-700 mb-2 uppercase`}>Medicine Name</Text>
                        <TextInput
                            style={tw`bg-white border border-slate-200 rounded-xl p-4 text-base mb-6`}
                            placeholder="e.g., Paracetamol"
                            value={medicineName}
                            onChangeText={setMedicineName}
                        />

                        <Text style={tw`text-sm font-bold text-slate-700 mb-2 uppercase`}>Time</Text>
                        <View style={tw`flex-row items-center gap-2 mb-6`}>
                            <Ionicons name="time" size={20} color="#64748B" />
                            <TextInput
                                style={tw`flex-1 bg-white border border-slate-200 rounded-xl p-4 text-base`}
                                placeholder="e.g., 09:00 or 14:30"
                                value={time}
                                onChangeText={setTime}
                                keyboardType="numbers-and-punctuation"
                                maxLength={5}
                            />
                        </View>

                        <Text style={tw`text-sm font-bold text-slate-700 mb-2 uppercase`}>Frequency</Text>
                        <View style={tw`flex-row gap-4 mb-6`}>
                            <TouchableOpacity
                                onPress={() => setFrequency('daily')}
                                style={tw`flex-1 p-4 rounded-xl border-2 items-center flex-row justify-center gap-2 ${frequency === 'daily' ? 'bg-blue-50 border-blue-500' : 'bg-white border-slate-200'}`}
                            >
                                <Ionicons name="sunny" size={20} color={frequency === 'daily' ? '#2563EB' : '#64748B'} />
                                <Text style={tw`font-bold ${frequency === 'daily' ? 'text-blue-600' : 'text-slate-600'}`}>Daily</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setFrequency('weekly')}
                                style={tw`flex-1 p-4 rounded-xl border-2 items-center flex-row justify-center gap-2 ${frequency === 'weekly' ? 'bg-blue-50 border-blue-500' : 'bg-white border-slate-200'}`}
                            >
                                <Ionicons name="calendar" size={20} color={frequency === 'weekly' ? '#2563EB' : '#64748B'} />
                                <Text style={tw`font-bold ${frequency === 'weekly' ? 'text-blue-600' : 'text-slate-600'}`}>Weekly</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            onPress={handleAddSchedule}
                            style={tw`bg-blue-600 p-4 rounded-2xl items-center shadow-lg shadow-blue-500/30`}
                        >
                            <Text style={tw`text-white font-bold text-lg`}>Save Reminder</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
