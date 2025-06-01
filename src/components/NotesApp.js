"use client";

import { useState, useEffect } from "react";

export default function NotesApp() {
    const [notes, setNotes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingNote, setEditingNote] = useState(null);
    const [formData, setFormData] = useState({ title: "", content: "" });

    // Fetch notes
    const fetchNotes = async () => {
        try {
            const response = await fetch("/api/notes");
            if (response.ok) {
                const data = await response.json();
                setNotes(data);
            }
        } catch (error) {
            console.error("Error fetching notes:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Create new note
    const createNote = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("/api/notes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const newNote = await response.json();
                setNotes([newNote, ...notes]);
                setFormData({ title: "", content: "" });
                setShowForm(false);
            }
        } catch (error) {
            console.error("Error creating note:", error);
        }
    };

    // Update note
    const updateNote = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`/api/notes/${editingNote.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const updatedNote = await response.json();
                setNotes(notes.map(note => note.id === editingNote.id ? updatedNote : note));
                setFormData({ title: "", content: "" });
                setEditingNote(null);
                setShowForm(false);
            }
        } catch (error) {
            console.error("Error updating note:", error);
        }
    };

    // Delete note
    const deleteNote = async (id) => {
        if (!confirm("Are you sure you want to delete this note?")) return;

        try {
            const response = await fetch(`/api/notes/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                setNotes(notes.filter(note => note.id !== id));
            }
        } catch (error) {
            console.error("Error deleting note:", error);
        }
    };

    // Start editing
    const startEdit = (note) => {
        setEditingNote(note);
        setFormData({ title: note.title, content: note.content });
        setShowForm(true);
    };

    // Cancel form
    const cancelForm = () => {
        setShowForm(false);
        setEditingNote(null);
        setFormData({ title: "", content: "" });
    };

    useEffect(() => {
        fetchNotes();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-600">Loading notes...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">My Notes</h1>
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Add New Note
                    </button>
                </div>

                {/* Form Modal */}
                {showForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                            <h2 className="text-xl font-semibold mb-4">
                                {editingNote ? "Edit Note" : "Add New Note"}
                            </h2>
                            <form onSubmit={editingNote ? updateNote : createNote}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Content
                                    </label>
                                    <textarea
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div className="flex gap-2 justify-end">
                                    <button
                                        type="button"
                                        onClick={cancelForm}
                                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    >
                                        {editingNote ? "Update" : "Create"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Notes Grid */}
                {notes.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-500 text-lg">No notes yet</div>
                        <div className="text-gray-400 text-sm">Click "Add New Note" to get started</div>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {notes.map((note) => (
                            <div
                                key={note.id}
                                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-semibold text-gray-900 truncate flex-1">
                                        {note.title}
                                    </h3>
                                    <div className="flex gap-1 ml-2">
                                        <button
                                            onClick={() => startEdit(note)}
                                            className="text-blue-600 hover:text-blue-800 text-sm"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => deleteNote(note.id)}
                                            className="text-red-600 hover:text-red-800 text-sm ml-2"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                                <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                                    {note.content}
                                </p>
                                <div className="text-xs text-gray-400">
                                    {new Date(note.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
