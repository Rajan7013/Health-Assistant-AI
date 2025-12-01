import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    onSnapshot,
    limit,
    Timestamp
} from 'firebase/firestore';
import { db } from '../index';

export interface ChatMessage {
    id?: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
    intent?: string;
}

export interface ChatSession {
    id: string;
    userId: string;
    title: string;
    lastMessage: string;
    updatedAt: number;
    createdAt: number;
}

// Collection references
const getChatsCollection = (userId: string) => collection(db, 'users', userId, 'chats');
const getMessagesCollection = (userId: string, chatId: string) => collection(db, 'users', userId, 'chats', chatId, 'messages');

/**
 * Creates a new chat session
 */
export const createChat = async (userId: string, firstMessage: string): Promise<string> => {
    try {
        const title = firstMessage.length > 30 ? firstMessage.substring(0, 30) + '...' : firstMessage;
        const chatData = {
            userId,
            title,
            lastMessage: firstMessage,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        const docRef = await addDoc(getChatsCollection(userId), chatData);
        return docRef.id;
    } catch (error) {
        console.error('Error creating chat:', error);
        throw error;
    }
};

/**
 * Adds a message to a chat session
 */
export const addMessage = async (userId: string, chatId: string, message: Omit<ChatMessage, 'id'>) => {
    try {
        // Add message to subcollection
        await addDoc(getMessagesCollection(userId, chatId), {
            ...message,
            timestamp: serverTimestamp(),
        });

        // Update chat session with last message and timestamp
        const chatRef = doc(db, 'users', userId, 'chats', chatId);
        await updateDoc(chatRef, {
            lastMessage: message.content,
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error adding message:', error);
        throw error;
    }
};

/**
 * Subscribes to user's chat sessions (Real-time)
 */
export const subscribeToChats = (userId: string, callback: (chats: ChatSession[]) => void) => {
    const q = query(getChatsCollection(userId), orderBy('updatedAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
        const chats = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            // Convert Firestore timestamps to numbers for easier handling
            updatedAt: doc.data().updatedAt?.toMillis() || Date.now(),
            createdAt: doc.data().createdAt?.toMillis() || Date.now(),
        })) as ChatSession[];

        callback(chats);
    });
};

/**
 * Subscribes to messages in a chat session (Real-time)
 */
export const subscribeToMessages = (userId: string, chatId: string, callback: (messages: ChatMessage[]) => void) => {
    const q = query(getMessagesCollection(userId, chatId), orderBy('timestamp', 'asc'));

    return onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toMillis() || Date.now(),
        })) as ChatMessage[];

        callback(messages);
    });
};

/**
 * Deletes a chat session
 */
export const deleteChat = async (userId: string, chatId: string) => {
    try {
        await deleteDoc(doc(db, 'users', userId, 'chats', chatId));
    } catch (error) {
        console.error('Error deleting chat:', error);
        throw error;
    }
};

/**
 * Updates chat title
 */
export const updateChatTitle = async (userId: string, chatId: string, newTitle: string) => {
    try {
        const chatRef = doc(db, 'users', userId, 'chats', chatId);
        await updateDoc(chatRef, {
            title: newTitle,
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error updating chat title:', error);
        throw error;
    }
};

/**
 * Fetches all chat sessions (One-time)
 */
export const getAllChats = async (userId: string): Promise<ChatSession[]> => {
    const q = query(getChatsCollection(userId), orderBy('updatedAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        updatedAt: doc.data().updatedAt?.toMillis() || Date.now(),
        createdAt: doc.data().createdAt?.toMillis() || Date.now(),
    })) as ChatSession[];
};

/**
 * Fetches all messages in a chat (One-time)
 */
export const getAllMessages = async (userId: string, chatId: string): Promise<ChatMessage[]> => {
    const q = query(getMessagesCollection(userId, chatId), orderBy('timestamp', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toMillis() || Date.now(),
    })) as ChatMessage[];
};
