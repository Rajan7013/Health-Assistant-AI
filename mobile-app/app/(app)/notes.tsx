import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { tw } from '../../src/lib/utils';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../../src/context/auth';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, orderBy, updateDoc } from 'firebase/firestore';
import { db } from '../../src/config/firebase';

interface Note {
    id: string;
    title: string;
    content: string;
    category: string;
    updatedAt: any;
}

export default function NotesScreen() {
    const { user } = useAuth();
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Form State
    const [editingNote, setEditingNote] = useState<Note | null>(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('General');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, 'users', user.uid, 'notes'),
            orderBy('updatedAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedNotes: Note[] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Note));
            setNotes(fetchedNotes);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const handleSaveNote = async () => {
        if (!title.trim() || !content.trim()) {
            Alert.alert('Error', 'Please enter both title and content.');
            return;
        }

        setSaving(true);
        try {
            const noteData = {
                userId: user?.uid,
                title,
                content,
                category,
                updatedAt: new Date(),
            };

            if (editingNote) {
                await updateDoc(doc(db, 'users', user.uid, 'notes', editingNote.id), noteData);
            } else {
                await addDoc(collection(db, 'users', user.uid, 'notes'), {
                    ...noteData,
                    createdAt: new Date(),
                });
            }

            closeModal();
            Alert.alert('Success', 'Note saved successfully!');
        } catch (error) {
            console.error('Error saving note:', error);
            Alert.alert('Error', 'Could not save note.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        Alert.alert(
            'Delete Note',
            'Are you sure you want to delete this note?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(db, 'users', user.uid, 'notes', id));
                        } catch (error) {
                            console.error('Error deleting:', error);
                        }
                    }
                }
            ]
        );
    };

    const openModal = (note?: Note) => {
        if (note) {
            setEditingNote(note);
            setTitle(note.title);
            setContent(note.content);
            setCategory(note.category);
        } else {
            setEditingNote(null);
            setTitle('');
            setContent('');
            setCategory('General');
        }
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setEditingNote(null);
        setTitle('');
        setContent('');
    };

    const filteredNotes = notes.filter(note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <SafeAreaView style={tw`flex-1 bg-slate-50`}>
            <View style={tw`p-6 pb-0`}>
                {/* Header */}
                <View style={tw`flex-row justify-between items-center mb-6 mt-2`}>
                    <View>
                        <Text style={tw`text-2xl font-bold text-slate-900`}>Health Notes</Text>
                        <Text style={tw`text-slate-500`}>Track your well-being</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => openModal()}
                        style={tw`bg-blue-600 w-10 h-10 rounded-full items-center justify-center shadow-lg shadow-blue-200`}
                    >
                        <Ionicons name="add" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Search */}
                <View style={tw`bg-white p-3 rounded-xl mb-4 flex-row items-center border border-slate-100`}>
                    <Ionicons name="search" size={20} color="#94A3B8" style={tw`mr-2`} />
                    <TextInput
                        placeholder="Search notes..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        style={tw`flex-1 text-slate-700`}
                    />
                </View>
            </View>

            <ScrollView contentContainerStyle={tw`p-6 pt-0 pb-24`}>
                {loading ? (
                    <ActivityIndicator size="large" color="#2563EB" style={tw`mt-10`} />
                ) : filteredNotes.length === 0 ? (
                    <View style={tw`items-center justify-center py-20 opacity-50`}>
                        <Ionicons name="journal-outline" size={48} color="#94A3B8" />
                        <Text style={tw`text-slate-500 mt-2`}>No notes found</Text>
                    </View>
                ) : (
                    filteredNotes.map((note) => (
                        <TouchableOpacity
                            key={note.id}
                            onPress={() => openModal(note)}
                            style={tw`bg-white p-5 rounded-2xl mb-4 shadow-sm border border-slate-100`}
                        >
                            <View style={tw`flex-row justify-between items-start mb-2`}>
                                <View style={tw`bg-blue-50 px-2 py-1 rounded-md`}>
                                    <Text style={tw`text-blue-700 text-xs font-bold`}>{note.category}</Text>
                                </View>
                                <TouchableOpacity onPress={() => handleDelete(note.id)}>
                                    <Ionicons name="trash-outline" size={16} color="#94A3B8" />
                                </TouchableOpacity>
                            </View>
                            <Text style={tw`font-bold text-slate-900 text-lg mb-1`}>{note.title}</Text>
                            <Text style={tw`text-slate-500 leading-5`} numberOfLines={3}>{note.content}</Text>
                            <Text style={tw`text-slate-400 text-xs mt-3 text-right`}>
                                {note.updatedAt?.toDate ? new Date(note.updatedAt.toDate()).toLocaleDateString() : 'Just now'}
                            </Text>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>

            {/* Edit/Create Modal */}
            <Modal
                animationType="slide"
                visible={modalVisible}
                onRequestClose={closeModal}
                presentationStyle="pageSheet"
            >
                <View style={tw`flex-1 bg-slate-50`}>
                    <View style={tw`p-6 flex-row justify-between items-center bg-white border-b border-slate-100`}>
                        <Text style={tw`text-xl font-bold text-slate-900`}>
                            {editingNote ? 'Edit Note' : 'New Note'}
                        </Text>
                        <TouchableOpacity onPress={closeModal}>
                            <Text style={tw`text-blue-600 font-bold`}>Cancel</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={tw`p-6`}>
                        <Text style={tw`font-bold text-slate-700 mb-2`}>Title</Text>
                        <TextInput
                            style={tw`bg-white rounded-xl p-4 text-slate-900 mb-4 border border-slate-200 font-bold`}
                            placeholder="Note Title"
                            value={title}
                            onChangeText={setTitle}
                        />

                        <Text style={tw`font-bold text-slate-700 mb-2`}>Category</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tw`mb-4`}>
                            {['General', 'Symptoms', 'Medication', 'Doctor Visit', 'Diet'].map(cat => (
                                <TouchableOpacity
                                    key={cat}
                                    onPress={() => setCategory(cat)}
                                    style={tw`mr-2 px-4 py-2 rounded-full border ${category === cat
                                        ? 'bg-blue-600 border-blue-600'
                                        : 'bg-white border-slate-200'
                                        }`}
                                >
                                    <Text style={tw`font-bold ${category === cat ? 'text-white' : 'text-slate-600'
                                        }`}>{cat}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <Text style={tw`font-bold text-slate-700 mb-2`}>Content</Text>
                        <TextInput
                            style={tw`bg-white rounded-xl p-4 text-slate-900 border border-slate-200 min-h-[200px] text-base leading-6`}
                            placeholder="Write your notes here..."
                            value={content}
                            onChangeText={setContent}
                            multiline
                            textAlignVertical="top"
                        />
                    </ScrollView>

                    <View style={tw`p-6 bg-white border-t border-slate-100`}>
                        <TouchableOpacity
                            onPress={handleSaveNote}
                            disabled={saving}
                            style={tw`bg-blue-600 rounded-xl py-4 items-center`}
                        >
                            {saving ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={tw`text-white font-bold text-lg`}>Save Note</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
