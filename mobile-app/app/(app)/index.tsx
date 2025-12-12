import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { tw } from '../../src/lib/utils';
import { useAuth } from '../../src/context/auth';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { db } from '../../src/config/firebase';
import { getSchedules, ScheduleWithId } from '../../src/firebase/firestore/schedules';
import { getUserProfile } from '../../src/firebase/firestore/users';

const ActionButton = ({ icon, title, onPress }: any) => (
    <TouchableOpacity
        onPress={onPress}
        style={tw`bg-teal-600 rounded-3xl p-6 w-[48%] aspect-square items-center justify-center mb-4 shadow-sm`}
    >
        <View style={tw`mb-3`}>
            {icon}
        </View>
        <Text style={tw`text-white text-center font-semibold text-base leading-5`}>
            {title}
        </Text>
    </TouchableOpacity>
);

export default function Dashboard() {
    const { user } = useAuth();
    const [displayName, setDisplayName] = useState('');
    const [greeting, setGreeting] = useState('Good Morning');
    const [schedules, setSchedules] = useState<ScheduleWithId[]>([]);
    const [nextMedicine, setNextMedicine] = useState<any>(null);
    const [timeRemaining, setTimeRemaining] = useState('');

    // Get time-based greeting
    useEffect(() => {
        const updateGreeting = () => {
            const hour = new Date().getHours();
            if (hour < 12) setGreeting('Good Morning');
            else if (hour < 17) setGreeting('Good Afternoon');
            else setGreeting('Good Evening');
        };
        updateGreeting();
        const interval = setInterval(updateGreeting, 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    // Fetch display name from Firestore profile (dynamic)
    useEffect(() => {
        if (!user) return;
        getUserProfile(user.uid).then(profile => {
            if (profile?.displayName) {
                // Extract first name only
                const firstName = profile.displayName.split(' ')[0];
                setDisplayName(firstName);
            } else {
                setDisplayName(user.displayName?.split(' ')[0] || user.email?.split('@')[0] || 'Guest');
            }
        });
    }, [user]);

    // Fetch schedules
    useEffect(() => {
        if (!user) return;
        const unsubscribe = getSchedules(db, user.uid, (data) => {
            setSchedules(data);
        });
        return () => unsubscribe();
    }, [user]);

    // Calculate next medicine
    useEffect(() => {
        const calculateNext = () => {
            if (schedules.length === 0) {
                setNextMedicine(null);
                return;
            }

            const now = new Date();
            let closestSchedule = null;
            let closestTime = Infinity;

            schedules.forEach(schedule => {
                const [hours, minutes] = schedule.time.split(':').map(Number);
                const scheduleDate = new Date();
                scheduleDate.setHours(hours, minutes, 0, 0);

                // If passed today, check tomorrow for daily
                if (scheduleDate < now && schedule.frequency === 'daily') {
                    scheduleDate.setDate(scheduleDate.getDate() + 1);
                }

                const timeDiff = scheduleDate.getTime() - now.getTime();

                if (timeDiff > 0 && timeDiff < closestTime) {
                    closestTime = timeDiff;
                    closestSchedule = { ...schedule, nextOccurrence: scheduleDate };
                }
            });

            setNextMedicine(closestSchedule);

            // Format time remaining
            if (closestSchedule) {
                const hours = Math.floor(closestTime / (1000 * 60 * 60));
                const minutes = Math.floor((closestTime % (1000 * 60 * 60)) / (1000 * 60));
                if (hours > 0) {
                    setTimeRemaining(`In ${hours}h ${minutes}m`);
                } else if (minutes > 0) {
                    setTimeRemaining(`In ${minutes} min`);
                } else {
                    setTimeRemaining('Soon');
                }
            }
        };

        calculateNext();
        const interval = setInterval(calculateNext, 60000); // Update every minute
        return () => clearInterval(interval);
    }, [schedules]);

    return (
        <SafeAreaView style={tw`flex-1 bg-white`}>
            <ScrollView contentContainerStyle={tw`p-6 pb-24`}>
                {/* Header */}
                <View style={tw`flex-row justify-between items-center mb-6 mt-8`}>
                    <View style={tw`flex-row items-center gap-2`}>
                        <View style={tw`w-8 h-8 bg-pink-100 rounded-full items-center justify-center`}>
                            <MaterialCommunityIcons name="brain" size={20} color="#0d9488" />
                        </View>
                        <Text style={tw`text-xl font-bold text-slate-900`}>HealthMind AI</Text>
                    </View>

                    <TouchableOpacity onPress={() => router.push('/(app)/profile')}>
                        {user?.photoURL ? (
                            <Image
                                source={{ uri: user.photoURL }}
                                style={tw`w-10 h-10 rounded-full bg-pink-100`}
                            />
                        ) : (
                            <View style={tw`w-10 h-10 rounded-full bg-pink-100 items-center justify-center`}>
                                <Text style={tw`text-teal-700 font-bold text-lg`}>
                                    {displayName ? displayName[0].toUpperCase() : 'G'}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Greeting Card */}
                <View style={tw`bg-teal-600 rounded-3xl p-6 mb-6 flex-row justify-between items-center shadow-sm`}>
                    <View style={tw`flex-1`}>
                        <Text style={tw`text-white text-lg font-medium mb-1`}>
                            {greeting}, {displayName}.
                        </Text>
                        <Text style={tw`text-teal-50 text-base`}>
                            How are you feeling today?
                        </Text>
                    </View>
                    <Ionicons name="sunny" size={40} color="#FDB813" />
                </View>

                {/* Next Medicine Widget */}
                {nextMedicine ? (
                    <TouchableOpacity
                        onPress={() => router.push('/(app)/schedules')}
                        style={tw`bg-gradient-to-br from-purple-500 to-blue-600 rounded-3xl p-6 mb-6 shadow-lg`}
                    >
                        <View style={tw`flex-row items-center mb-3`}>
                            <View style={tw`w-12 h-12 bg-white/20 rounded-full items-center justify-center mr-4`}>
                                <MaterialCommunityIcons name="pill" size={24} color="white" />
                            </View>
                            <View style={tw`flex-1`}>
                                <Text style={tw`text-white/80 text-xs font-medium mb-1`}>NEXT MEDICINE</Text>
                                <Text style={tw`text-white text-xl font-bold`}>{nextMedicine.medicineName}</Text>
                            </View>
                        </View>
                        <View style={tw`flex-row items-center justify-between bg-white/10 rounded-2xl p-3`}>
                            <View style={tw`flex-row items-center gap-2`}>
                                <Ionicons name="time" size={16} color="white" />
                                <Text style={tw`text-white font-bold`}>{timeRemaining}</Text>
                            </View>
                            <Text style={tw`text-white/90`}>{nextMedicine.time}</Text>
                        </View>
                        <View style={tw`flex-row items-center gap-2 mt-2`}>
                            <Ionicons name="repeat" size={14} color="rgba(255,255,255,0.7)" />
                            <Text style={tw`text-white/70 text-xs capitalize`}>{nextMedicine.frequency}</Text>
                        </View>
                    </TouchableOpacity>
                ) : (
                    <View style={tw`bg-slate-100 rounded-3xl p-6 mb-6 items-center`}>
                        <MaterialCommunityIcons name="pill-off" size={40} color="#94A3B8" />
                        <Text style={tw`text-slate-500 mt-2 font-medium`}>No scheduled medicines</Text>
                        <TouchableOpacity
                            onPress={() => router.push('/(app)/schedules')}
                            style={tw`mt-3 bg-teal-600 px-4 py-2 rounded-full`}
                        >
                            <Text style={tw`text-white font-bold`}>Add Medicine</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Quick Actions Grid */}
                <Text style={tw`text-xl font-bold text-slate-900 mb-4`}>Quick Actions</Text>
                <View style={tw`flex-row flex-wrap justify-between`}>
                    <ActionButton
                        title={`Symptom\nChecker`}
                        icon={<FontAwesome5 name="thermometer-three-quarters" size={32} color="white" />}
                        onPress={() => router.push('/(app)/symptoms')}
                    />
                    <ActionButton
                        title={`Health\nChat`}
                        icon={<Ionicons name="chatbubbles-outline" size={36} color="white" />}
                        onPress={() => router.push('/(app)/chat')}
                    />
                    <ActionButton
                        title={`Medical\nReports`}
                        icon={<MaterialCommunityIcons name="dna" size={40} color="white" />}
                        onPress={() => router.push('/(app)/reports')}
                    />
                    <ActionButton
                        title={`Schedule\nMedicine`}
                        icon={<MaterialCommunityIcons name="pill" size={36} color="white" />}
                        onPress={() => router.push('/(app)/schedules')}
                    />
                    <ActionButton
                        title="Health Notes"
                        icon={<Ionicons name="journal" size={36} color="white" />}
                        onPress={() => router.push('/(app)/notes')}
                    />
                </View>
            </ScrollView>
        </SafeAreaView >
    );
}
