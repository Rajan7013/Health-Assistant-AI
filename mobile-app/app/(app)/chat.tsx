import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, FlatList, ActivityIndicator, Alert, Image, StyleSheet, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { tw } from '../../src/lib/utils';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../src/context/auth';
import { createChat, addMessage, subscribeToMessages, subscribeToChats, deleteChat, updateChatTitle, ChatMessage, ChatSession } from '../../src/firebase/firestore/chats';
import { Timestamp } from 'firebase/firestore';
import Markdown from 'react-native-markdown-display';

// Welcome Screen Component
const WelcomeScreen = ({ onPromptSelect }: { onPromptSelect: (text: string) => void }) => {
    const prompts = [
        { icon: "🤒", text: "What are the symptoms of flu?" },
        { icon: "🥗", text: "Give me a healthy diet plan." },
        { icon: "💊", text: "Remind me to take my meds." },
        { icon: "🧠", text: "Tips for mental wellness." },
    ];

    return (
        <View style={tw`flex-1 items-center justify-center p-6`}>
            <View style={tw`w-20 h-20 rounded-full bg-blue-100 items-center justify-center mb-6`}>
                <MaterialCommunityIcons name="robot-happy" size={40} color="#2563EB" />
            </View>
            <Text style={tw`text-2xl font-bold text-slate-900 mb-2 text-center`}>Health Assistant AI</Text>
            <Text style={tw`text-slate-500 text-center mb-8`}>
                Your personal health companion. Ask me anything about your well-being.
            </Text>

            <View style={tw`w-full flex-row flex-wrap justify-between gap-3`}>
                {prompts.map((prompt, index) => (
                    <TouchableOpacity
                        key={index}
                        onPress={() => onPromptSelect(prompt.text)}
                        style={tw`w-[48%] bg-white p-4 rounded-2xl border border-slate-100 shadow-sm`}
                    >
                        <Text style={tw`text-2xl mb-2`}>{prompt.icon}</Text>
                        <Text style={tw`text-sm font-bold text-slate-700`}>{prompt.text}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

export default function ChatScreen() {
    const { user } = useAuth();
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);
    const [isHistoryVisible, setIsHistoryVisible] = useState(false);
    const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
    const [renamingChatId, setRenamingChatId] = useState<string | null>(null);
    const [renameValue, setRenameValue] = useState('');
    const flatListRef = useRef<FlatList>(null);

    // Subscribe to messages
    useEffect(() => {
        if (!user || !currentChatId) {
            if (!currentChatId) setMessages([]);
            return;
        }

        const unsubscribe = subscribeToMessages(user.uid, currentChatId, (newMessages) => {
            setMessages(newMessages);
        });

        return () => unsubscribe();
    }, [user, currentChatId]);

    // Subscribe to chat history
    useEffect(() => {
        if (!user) return;
        const unsubscribe = subscribeToChats(user.uid, (chats) => {
            setChatHistory(chats);
        });
        return () => unsubscribe();
    }, [user]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages, isLoading]);

    const handleSend = async (text: string = input) => {
        if (!text.trim() || !user || isLoading) return;

        const messageContent = text.trim();
        setInput('');
        setIsLoading(true);

        try {
            let chatId = currentChatId;

            // Create new chat if needed
            if (!chatId) {
                chatId = await createChat(user.uid, messageContent);
                setCurrentChatId(chatId);
            }

            // Add user message to Firestore
            await addMessage(user.uid, chatId, {
                role: 'user',
                content: messageContent,
                timestamp: Date.now(),
            });

            // Get Auth Token
            const token = await user.getIdToken();

            // Prepare API Payload
            // NOTE: Using local IP for development. Replace with production URL when deployed.
            const API_URL = 'https://health-assistant-ai-ashen.vercel.app/api/chat';

            const chatHistoryContext = messages.slice(-10).map(msg => ({
                role: msg.role,
                content: msg.content
            }));

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    message: messageContent,
                    chatHistory: chatHistoryContext,
                }),
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();

            // Add AI response to Firestore
            await addMessage(user.uid, chatId, {
                role: 'assistant',
                content: data.response,
                intent: data.intent,
                timestamp: Date.now(),
            });

        } catch (error) {
            console.error('Chat Error:', error);
            Alert.alert('Error', 'Failed to get response. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleNewChat = () => {
        setCurrentChatId(null);
        setMessages([]);
        setIsHistoryVisible(false);
    };

    const handleSelectChat = (chatId: string) => {
        setCurrentChatId(chatId);
        setIsHistoryVisible(false);
    };

    const handleDeleteChat = async (chatId: string) => {
        if (!user) return;
        Alert.alert(
            "Delete Chat",
            "Are you sure you want to delete this conversation?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteChat(user.uid, chatId);
                            if (currentChatId === chatId) {
                                handleNewChat();
                            }
                        } catch (error) {
                            console.error("Delete error:", error);
                            Alert.alert("Error", "Failed to delete chat.");
                        }
                    }
                }
            ]
        );
    };

    const handleRenameChat = async () => {
        if (!user || !renamingChatId || !renameValue.trim()) return;

        try {
            // Dynamic update: This will trigger real-time listener and update UI automatically
            await updateChatTitle(user.uid, renamingChatId, renameValue.trim());
            setRenamingChatId(null);
            setRenameValue('');
            Alert.alert("Success", "Chat renamed successfully!");
        } catch (error) {
            console.error("Rename error:", error);
            Alert.alert("Error", "Failed to rename chat.");
        }
    };

    const startRenaming = (chatId: string, currentTitle: string) => {
        setRenamingChatId(chatId);
        setRenameValue(currentTitle);
    };

    return (
        <SafeAreaView style={tw`flex-1 bg-white`} edges={['top']}>
            {/* Header */}
            <View style={tw`px-4 py-3 bg-white border-b border-slate-100 flex-row items-center justify-between shadow-sm z-10`}>
                <View style={tw`flex-row items-center`}>
                    <TouchableOpacity onPress={() => setIsHistoryVisible(true)} style={tw`mr-3 p-1`}>
                        <Ionicons name="menu" size={28} color="#1E293B" />
                    </TouchableOpacity>
                    <View>
                        <Text style={tw`font-bold text-lg text-slate-900`}>Health Assistant</Text>
                        <View style={tw`flex-row items-center`}>
                            <View style={tw`w-2 h-2 bg-green-500 rounded-full mr-1.5`} />
                            <Text style={tw`text-xs text-slate-500 font-medium`}>Online</Text>
                        </View>
                    </View>
                </View>
                <TouchableOpacity onPress={handleNewChat}>
                    <Ionicons name="create-outline" size={24} color="#64748B" />
                </TouchableOpacity>
            </View>

            {/* Messages Area */}
            {messages.length === 0 && !currentChatId ? (
                <WelcomeScreen onPromptSelect={handleSend} />
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={item => item.id || Math.random().toString()}
                    contentContainerStyle={tw`p-4 gap-6 pb-4`}
                    renderItem={({ item }) => (
                        <View style={tw`w-full flex-row ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {item.role === 'assistant' && (
                                <View style={tw`w-8 h-8 bg-blue-100 rounded-full items-center justify-center mr-2 mt-1 shadow-sm shrink-0`}>
                                    <MaterialCommunityIcons name="robot" size={16} color="#2563EB" />
                                </View>
                            )}

                            <View style={tw`max-w-[90%] rounded-2xl ${item.role === 'user'
                                ? 'bg-blue-600 rounded-tr-none px-4 py-3 shadow-sm'
                                : 'bg-transparent rounded-tl-none px-0 py-0' // AI message has no background/padding to align left
                                }`}>
                                {item.role === 'user' ? (
                                    <Text style={tw`text-base leading-6 text-white`}>
                                        {item.content}
                                    </Text>
                                ) : (
                                    <Markdown style={markdownStyles}>
                                        {item.content}
                                    </Markdown>
                                )}
                            </View>
                        </View>
                    )}
                    ListFooterComponent={isLoading ? (
                        <View style={tw`flex-row justify-start mt-2`}>
                            <View style={tw`w-8 h-8 bg-blue-100 rounded-full items-center justify-center mr-2 mt-1 shadow-sm shrink-0`}>
                                <MaterialCommunityIcons name="robot" size={16} color="#2563EB" />
                            </View>
                            <View style={tw`bg-white px-4 py-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex-row gap-1`}>
                                <View style={tw`w-2 h-2 bg-blue-400 rounded-full animate-bounce`} />
                                <View style={tw`w-2 h-2 bg-blue-400 rounded-full animate-bounce`} />
                                <View style={tw`w-2 h-2 bg-blue-400 rounded-full animate-bounce`} />
                            </View>
                        </View>
                    ) : null}
                />
            )}

            {/* Input Area */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <View style={tw`p-3 bg-white border-t border-slate-100 flex-row items-end gap-2`}>
                    <View style={tw`flex-1 bg-slate-50 border border-slate-200 rounded-2xl flex-row items-center px-4 min-h-[48px] max-h-32`}>
                        <TextInput
                            style={tw`flex-1 text-base text-slate-800 py-3`}
                            placeholder="Type a message..."
                            placeholderTextColor="#94A3B8"
                            value={input}
                            onChangeText={setInput}
                            multiline
                            maxLength={1000}
                        />
                    </View>

                    <TouchableOpacity
                        onPress={() => handleSend()}
                        disabled={!input.trim() || isLoading}
                        style={tw`w-12 h-12 bg-blue-600 rounded-full items-center justify-center shadow-lg shadow-blue-500/30 ${(!input.trim() || isLoading) ? 'opacity-50 bg-slate-300 shadow-none' : ''}`}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="white" size="small" />
                        ) : (
                            <Ionicons name="send" size={20} color="white" style={tw`ml-1`} />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>

            {/* History Modal (Sidebar) */}
            <Modal
                visible={isHistoryVisible}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setIsHistoryVisible(false)}
            >
                <View style={tw`flex-1 bg-black/50 flex-row`}>
                    <View style={tw`w-[80%] bg-white h-full shadow-2xl`}>
                        <SafeAreaView style={tw`flex-1`} edges={['top']}>
                            <View style={tw`p-4 border-b border-slate-100 flex-row items-center justify-between`}>
                                <Text style={tw`text-xl font-bold text-slate-900`}>History</Text>
                                <TouchableOpacity onPress={() => setIsHistoryVisible(false)} style={tw`p-2 bg-slate-100 rounded-full`}>
                                    <Ionicons name="close" size={20} color="#64748B" />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                onPress={handleNewChat}
                                style={tw`mx-4 mt-4 mb-2 bg-blue-600 p-3 rounded-xl flex-row items-center justify-center gap-2 shadow-md shadow-blue-500/20`}
                            >
                                <Ionicons name="add" size={20} color="white" />
                                <Text style={tw`text-white font-bold`}>New Chat</Text>
                            </TouchableOpacity>

                            <ScrollView contentContainerStyle={tw`p-4`}>
                                {chatHistory.length === 0 ? (
                                    <Text style={tw`text-slate-400 text-center mt-10`}>No chat history yet.</Text>
                                ) : (
                                    chatHistory.map((chat) => (
                                        <TouchableOpacity
                                            key={chat.id}
                                            onPress={() => handleSelectChat(chat.id)}
                                            onLongPress={() => startRenaming(chat.id, chat.title || 'New Chat')}
                                            style={tw`p-4 rounded-xl mb-2 border ${currentChatId === chat.id ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-100'}`}
                                        >
                                            <View style={tw`flex-row justify-between items-start`}>
                                                <Text style={tw`font-medium text-slate-900 flex-1 mr-2`} numberOfLines={1}>
                                                    {chat.title || 'New Chat'}
                                                </Text>
                                                <View style={tw`flex-row gap-1`}>
                                                    <TouchableOpacity
                                                        onPress={() => startRenaming(chat.id, chat.title || 'New Chat')}
                                                        style={tw`p-1`}
                                                    >
                                                        <Ionicons name="pencil-outline" size={16} color="#64748B" />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity onPress={() => handleDeleteChat(chat.id)} style={tw`p-1`}>
                                                        <Ionicons name="trash-outline" size={16} color="#94A3B8" />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                            <Text style={tw`text-xs text-slate-500 mt-1`} numberOfLines={1}>
                                                {chat.lastMessage}
                                            </Text>
                                        </TouchableOpacity>
                                    ))
                                )}
                            </ScrollView>
                        </SafeAreaView>
                    </View>
                    <TouchableOpacity style={tw`flex-1`} onPress={() => setIsHistoryVisible(false)} />
                </View>
            </Modal>

            {/* Rename Dialog Modal */}
            <Modal
                visible={renamingChatId !== null}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setRenamingChatId(null)}
            >
                <View style={tw`flex-1 bg-black/50 justify-center items-center p-6`}>
                    <View style={tw`bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl`}>
                        <Text style={tw`text-xl font-bold text-slate-900 mb-4`}>Rename Chat</Text>
                        <TextInput
                            style={tw`bg-slate-50 border border-slate-200 rounded-xl p-4 text-base mb-6`}
                            placeholder="Enter new chat name"
                            value={renameValue}
                            onChangeText={setRenameValue}
                            autoFocus
                        />
                        <View style={tw`flex-row gap-3`}>
                            <TouchableOpacity
                                onPress={() => {
                                    setRenamingChatId(null);
                                    setRenameValue('');
                                }}
                                style={tw`flex-1 bg-slate-100 p-3 rounded-xl`}
                            >
                                <Text style={tw`text-slate-700 font-bold text-center`}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleRenameChat}
                                style={tw`flex-1 bg-blue-600 p-3 rounded-xl`}
                            >
                                <Text style={tw`text-white font-bold text-center`}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const markdownStyles = StyleSheet.create({
    body: {
        fontSize: 16,
        lineHeight: 24,
        color: '#1E293B', // slate-800
    },
    heading1: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0F172A', // slate-900
        marginBottom: 10,
        marginTop: 10,
    },
    heading2: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0F172A',
        marginBottom: 8,
        marginTop: 8,
    },
    strong: {
        fontWeight: 'bold',
        color: '#0F172A',
    },
    list_item: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginBottom: 6,
    },
    bullet_list_icon: {
        marginLeft: 0,
        marginRight: 8,
        fontSize: 20,
        color: '#2563EB', // blue-600
    },
    link: {
        color: '#2563EB',
        textDecorationLine: 'underline',
    },
});
