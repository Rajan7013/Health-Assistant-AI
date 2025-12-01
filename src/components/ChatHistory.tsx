'use client';

import React, { useEffect, useState } from 'react';
import { Plus, MessageSquare, Trash2, MoreVertical, X, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    ChatSession,
    subscribeToChats,
    deleteChat,
    createChat,
    updateChatTitle
} from '@/firebase/firestore/chats';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from 'date-fns';

interface ChatHistoryProps {
    userId: string;
    currentChatId: string | null;
    onSelectChat: (chatId: string) => void;
    onNewChat: () => void;
    className?: string;
}

export default function ChatHistory({
    userId,
    currentChatId,
    onSelectChat,
    onNewChat,
    className
}: ChatHistoryProps) {
    const [chats, setChats] = useState<ChatSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingChatId, setEditingChatId] = useState<string | null>(null);
    const [newTitle, setNewTitle] = useState('');
    const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);

    useEffect(() => {
        if (!userId) return;

        const unsubscribe = subscribeToChats(userId, (updatedChats) => {
            setChats(updatedChats);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userId]);

    const handleDeleteChat = async (e: React.MouseEvent, chatId: string) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this chat?')) {
            await deleteChat(userId, chatId);
            if (currentChatId === chatId) {
                onNewChat();
            }
        }
    };

    const handleRenameClick = (e: React.MouseEvent, chat: ChatSession) => {
        e.stopPropagation();
        setEditingChatId(chat.id);
        setNewTitle(chat.title);
        setIsRenameDialogOpen(true);
    };

    const handleRenameSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingChatId && newTitle.trim()) {
            await updateChatTitle(userId, editingChatId, newTitle.trim());
            setIsRenameDialogOpen(false);
            setEditingChatId(null);
        }
    };

    return (
        <div className={cn("flex flex-col h-full bg-gray-50 dark:bg-[#0D1117] border-r border-gray-200 dark:border-gray-800", className)}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
                <Button
                    onClick={onNewChat}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-md transition-all hover:shadow-lg"
                >
                    <Plus className="mr-2 h-4 w-4" /> New Chat
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {loading ? (
                    <div className="flex justify-center p-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                    </div>
                ) : chats.length === 0 ? (
                    <div className="text-center p-4 text-gray-500 text-sm">
                        <MessageSquare className="mx-auto h-8 w-8 mb-2 opacity-20" />
                        <p>No chat history</p>
                    </div>
                ) : (
                    chats.map((chat) => (
                        <div
                            key={chat.id}
                            onClick={() => onSelectChat(chat.id)}
                            className={cn(
                                "group flex flex-col gap-1 p-3 rounded-xl cursor-pointer transition-all border border-transparent",
                                currentChatId === chat.id
                                    ? "bg-white dark:bg-[#161B22] shadow-sm border-gray-200 dark:border-gray-700"
                                    : "hover:bg-gray-100 dark:hover:bg-gray-800/50"
                            )}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <h3 className={cn(
                                    "font-medium text-sm truncate flex-1",
                                    currentChatId === chat.id ? "text-purple-700 dark:text-purple-400" : "text-gray-700 dark:text-gray-300"
                                )}>
                                    {chat.title || 'New Chat'}
                                </h3>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <MoreVertical className="h-3 w-3 text-gray-400" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                            className="text-red-600 focus:text-red-700 focus:bg-red-50"
                                            onClick={(e) => handleDeleteChat(e, chat.id)}
                                        >
                                            <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={(e) => handleRenameClick(e, chat)}
                                        >
                                            <Edit2 className="mr-2 h-3.5 w-3.5" /> Rename
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <div className="flex justify-between items-center text-[10px] text-gray-400">
                                <span className="truncate max-w-[70%]">
                                    {chat.lastMessage || 'No messages'}
                                </span>
                                <span>
                                    {formatDistanceToNow(chat.updatedAt, { addSuffix: true }).replace('about ', '')}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rename Chat</DialogTitle>
                        <DialogDescription>
                            Enter a new title for this chat session.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleRenameSubmit}>
                        <div className="grid gap-4 py-4">
                            <Input
                                id="name"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                className="col-span-3"
                                autoFocus
                            />
                        </div>
                        <DialogFooter>
                            <Button type="submit">Save changes</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
