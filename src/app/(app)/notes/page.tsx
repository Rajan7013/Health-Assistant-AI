"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@/firebase/auth/use-user';
import {
    addNote,
    updateNote,
    deleteNote,
    subscribeToNotes,
    Note
} from '@/firebase/firestore/notes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger
} from '@/components/ui/dialog';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardFooter
} from '@/components/ui/card';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Loader2,
    FileText,
    Calendar,
    Tag,
    X
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

export default function NotesPage() {
    const { user } = useUser();
    const { toast } = useToast();
    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentNote, setCurrentNote] = useState<Note | null>(null);
    const [formData, setFormData] = useState({ title: '', content: '', category: 'General' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!user) return;

        const unsubscribe = subscribeToNotes(user.uid, (fetchedNotes) => {
            setNotes(fetchedNotes);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const filteredNotes = notes.filter(note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleOpenDialog = (note?: Note) => {
        if (note) {
            setCurrentNote(note);
            setFormData({
                title: note.title,
                content: note.content,
                category: note.category || 'General'
            });
        } else {
            setCurrentNote(null);
            setFormData({ title: '', content: '', category: 'General' });
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async () => {
        if (!user || !formData.title.trim() || !formData.content.trim()) return;

        setIsSubmitting(true);
        try {
            if (currentNote && currentNote.id) {
                await updateNote(user.uid, currentNote.id, formData);
                toast({
                    title: "Note updated",
                    description: "Your note has been updated successfully."
                });
            } else {
                await addNote(user.uid, formData);
                toast({
                    title: "Note created",
                    description: "Your new note has been saved."
                });
            }
            setIsDialogOpen(false);
        } catch (error) {
            console.error('Error saving note:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to save note. Please try again."
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (noteId: string) => {
        if (!user || !confirm('Are you sure you want to delete this note?')) return;

        try {
            await deleteNote(user.uid, noteId);
            toast({
                title: "Note deleted",
                description: "Your note has been deleted."
            });
        } catch (error) {
            console.error('Error deleting note:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to delete note."
            });
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-[#F0F5FF] dark:bg-[#0D1117] p-4 md:p-8 font-[Poppins] pb-24">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-[#0A1D42] dark:text-[#F0F6FC] tracking-tight">
                            Health <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Notes</span>
                        </h1>
                        <p className="text-sm text-[#475569] dark:text-[#8B949E] mt-2 font-medium">
                            Keep track of your symptoms, questions, and medical history.
                        </p>
                    </div>

                    <Button
                        onClick={() => handleOpenDialog()}
                        className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-blue-500/25 rounded-xl px-6 h-12 font-bold transition-all hover:scale-105 active:scale-95"
                    >
                        <Plus className="mr-2 h-5 w-5" />
                        New Note
                    </Button>
                </div>

                {/* Search Bar */}
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <Input
                        type="text"
                        placeholder="Search your notes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-11 h-14 rounded-2xl border-0 bg-white dark:bg-[#161B22] shadow-sm ring-1 ring-gray-200 dark:ring-gray-800 focus:ring-2 focus:ring-blue-500 transition-all text-base"
                    />
                </div>

                {/* Notes Grid */}
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                    </div>
                ) : filteredNotes.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-[#161B22] rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-4">
                            <FileText className="h-10 w-10 text-blue-500" />
                        </div>
                        <h3 className="text-xl font-bold text-[#0A1D42] dark:text-[#F0F6FC] mb-2">No notes found</h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                            {searchQuery ? "No notes match your search." : "Start by creating your first health note to keep track of your well-being."}
                        </p>
                        {!searchQuery && (
                            <Button
                                onClick={() => handleOpenDialog()}
                                variant="outline"
                                className="border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/30"
                            >
                                Create Note
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredNotes.map((note) => (
                            <Card
                                key={note.id}
                                className="group relative overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-white dark:bg-[#161B22] rounded-3xl flex flex-col h-full"
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-400 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />

                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start gap-2">
                                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-100 transition-colors">
                                            {note.category || 'General'}
                                        </Badge>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleOpenDialog(note)}
                                                className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => note.id && handleDelete(note.id)}
                                                className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <CardTitle className="text-xl font-bold text-[#0A1D42] dark:text-[#F0F6FC] line-clamp-1 mt-2">
                                        {note.title}
                                    </CardTitle>
                                </CardHeader>

                                <CardContent className="flex-1">
                                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-4 leading-relaxed whitespace-pre-wrap">
                                        {note.content}
                                    </p>
                                </CardContent>

                                <CardFooter className="pt-0 pb-4 px-6 text-xs text-gray-400 flex items-center gap-2">
                                    <Calendar className="h-3.5 w-3.5" />
                                    <span>
                                        {format(note.updatedAt, 'MMM d, yyyy • h:mm a')}
                                    </span>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Create/Edit Modal */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-[600px] rounded-3xl p-0 overflow-hidden bg-white dark:bg-[#161B22] border-0 shadow-2xl">
                        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                    {currentNote ? <Edit2 className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
                                    {currentNote ? 'Edit Note' : 'New Health Note'}
                                </DialogTitle>
                                <p className="text-blue-100 text-sm mt-1">
                                    {currentNote ? 'Update your existing note details below.' : 'Record symptoms, doctor instructions, or health observations.'}
                                </p>
                            </DialogHeader>
                        </div>

                        <div className="p-6 space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-[#0A1D42] dark:text-[#F0F6FC] ml-1">Title</label>
                                <Input
                                    placeholder="e.g., Morning Migraine Symptoms"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="h-12 rounded-xl border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-[#0D1117]"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-[#0A1D42] dark:text-[#F0F6FC] ml-1">Category</label>
                                <div className="flex flex-wrap gap-2">
                                    {['General', 'Symptoms', 'Medication', 'Doctor Visit', 'Diet', 'Exercise'].map(cat => (
                                        <Badge
                                            key={cat}
                                            variant={formData.category === cat ? 'default' : 'outline'}
                                            className={`cursor-pointer px-3 py-1.5 rounded-lg transition-all ${formData.category === cat
                                                ? 'bg-blue-600 hover:bg-blue-700'
                                                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                                                }`}
                                            onClick={() => setFormData({ ...formData, category: cat })}
                                        >
                                            {cat}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-[#0A1D42] dark:text-[#F0F6FC] ml-1">Content</label>
                                <Textarea
                                    placeholder="Write your detailed notes here..."
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    className="min-h-[200px] rounded-xl border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-[#0D1117] resize-none p-4 leading-relaxed"
                                />
                            </div>
                        </div>

                        <DialogFooter className="p-6 pt-2 bg-gray-50 dark:bg-[#0D1117]/50 flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setIsDialogOpen(false)}
                                className="flex-1 h-11 rounded-xl font-semibold border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-[#161B22]"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting || !formData.title.trim() || !formData.content.trim()}
                                className="flex-1 h-11 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-blue-500/20"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    'Save Note'
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
