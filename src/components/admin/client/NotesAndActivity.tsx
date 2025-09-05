import React, { useState } from 'react';
import {
    MessageSquare, Plus, Calendar, User, Edit, Trash2,
    Clock, Tag, Search, Filter, Save, X, AlertCircle,
    CheckCircle, Phone, Mail
} from 'lucide-react';

interface Note {
    id: string;
    content: string;
    author: string;
    created_at: string;
    updated_at?: string;
    type: 'note' | 'call' | 'email' | 'meeting' | 'system';
    tags?: string[];
    priority?: 'low' | 'medium' | 'high';
}

interface ActivityItem {
    id: string;
    type: 'booking_created' | 'booking_updated' | 'payment_received' | 'status_changed' | 'note_added';
    description: string;
    timestamp: string;
    user?: string;
    metadata?: any;
}

interface NotesAndActivityProps {
    customerId: string;
    customerName: string;
    notes?: Note[];
    activities?: ActivityItem[];
    onAddNote: (note: Omit<Note, 'id' | 'created_at'>) => void;
    onUpdateNote: (noteId: string, content: string) => void;
    onDeleteNote: (noteId: string) => void;
}

const NotesAndActivity: React.FC<NotesAndActivityProps> = ({
    customerId,
    customerName,
    notes = [],
    activities = [],
    onAddNote,
    onUpdateNote,
    onDeleteNote
}) => {
    const [activeTab, setActiveTab] = useState<'notes' | 'activity'>('notes');
    const [showAddNote, setShowAddNote] = useState(false);
    const [newNote, setNewNote] = useState('');
    const [noteType, setNoteType] = useState<'note' | 'call' | 'email' | 'meeting'>('note');
    const [notePriority, setNotePriority] = useState<'low' | 'medium' | 'high'>('medium');
    const [noteTags, setNoteTags] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [editingNote, setEditingNote] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatTimeAgo = (dateString: string) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours}h ago`;
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}d ago`;
        return formatDateTime(dateString);
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'call':
                return <Phone className="w-4 h-4 text-green-500" />;
            case 'email':
                return <Mail className="w-4 h-4 text-blue-500" />;
            case 'meeting':
                return <User className="w-4 h-4 text-purple-500" />;
            case 'system':
                return <AlertCircle className="w-4 h-4 text-gray-500" />;
            default:
                return <MessageSquare className="w-4 h-4 text-orange-500" />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'call':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'email':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'meeting':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'system':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default:
                return 'bg-orange-100 text-orange-800 border-orange-200';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default:
                return 'bg-green-100 text-green-800 border-green-200';
        }
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'booking_created':
                return <Calendar className="w-4 h-4 text-blue-500" />;
            case 'booking_updated':
                return <Edit className="w-4 h-4 text-orange-500" />;
            case 'payment_received':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'status_changed':
                return <AlertCircle className="w-4 h-4 text-purple-500" />;
            case 'note_added':
                return <MessageSquare className="w-4 h-4 text-gray-500" />;
            default:
                return <Clock className="w-4 h-4 text-gray-400" />;
        }
    };

    const handleAddNote = () => {
        if (!newNote.trim()) return;

        const tags = noteTags.split(',').map(tag => tag.trim()).filter(Boolean);

        onAddNote({
            content: newNote,
            author: 'Current User', // TODO: Get from auth context
            type: noteType,
            priority: notePriority,
            tags: tags.length > 0 ? tags : undefined
        });

        // Reset form
        setNewNote('');
        setNoteTags('');
        setNoteType('note');
        setNotePriority('medium');
        setShowAddNote(false);
    };

    const handleEditNote = (noteId: string) => {
        const note = notes.find(n => n.id === noteId);
        if (note) {
            setEditingNote(noteId);
            setEditContent(note.content);
        }
    };

    const handleSaveEdit = () => {
        if (editingNote && editContent.trim()) {
            onUpdateNote(editingNote, editContent);
            setEditingNote(null);
            setEditContent('');
        }
    };

    const handleCancelEdit = () => {
        setEditingNote(null);
        setEditContent('');
    };

    const filteredNotes = notes.filter(note => {
        const matchesSearch = note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            note.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
            note.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesType = filterType === 'all' || note.type === filterType;

        return matchesSearch && matchesType;
    });

    const filteredActivities = activities.filter(activity => {
        return activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            activity.type.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Notes & Activity</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Track interactions and important information for {customerName}
                    </p>
                </div>
                <button
                    onClick={() => setShowAddNote(true)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Note
                </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="flex space-x-8">
                    <button
                        onClick={() => setActiveTab('notes')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === 'notes'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Notes ({filteredNotes.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('activity')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === 'activity'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Activity ({filteredActivities.length})
                    </button>
                </nav>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder={activeTab === 'notes' ? 'Search notes, authors, or tags...' : 'Search activities...'}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {activeTab === 'notes' && (
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">All Types</option>
                                <option value="note">Notes</option>
                                <option value="call">Calls</option>
                                <option value="email">Emails</option>
                                <option value="meeting">Meetings</option>
                                <option value="system">System</option>
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Note Modal */}
            {showAddNote && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Add New Note</h3>
                        <button
                            onClick={() => setShowAddNote(false)}
                            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                                <select
                                    value={noteType}
                                    onChange={(e) => setNoteType(e.target.value as any)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="note">Note</option>
                                    <option value="call">Phone Call</option>
                                    <option value="email">Email</option>
                                    <option value="meeting">Meeting</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                                <select
                                    value={notePriority}
                                    onChange={(e) => setNotePriority(e.target.value as any)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma-separated)</label>
                                <input
                                    type="text"
                                    placeholder="follow-up, important, etc."
                                    value={noteTags}
                                    onChange={(e) => setNoteTags(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Note Content</label>
                            <textarea
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                placeholder="Enter your note here..."
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                            />
                        </div>

                        <div className="flex items-center justify-end space-x-3">
                            <button
                                onClick={() => setShowAddNote(false)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddNote}
                                disabled={!newNote.trim()}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                                Add Note
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Content */}
            {activeTab === 'notes' ? (
                <div className="space-y-4">
                    {filteredNotes.length > 0 ? (
                        filteredNotes.map((note) => (
                            <div key={note.id} className="bg-white rounded-xl border border-gray-200 p-6">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center space-x-3">
                                        {getTypeIcon(note.type)}
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <span className="font-medium text-gray-900">{note.author}</span>
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(note.type)}`}>
                                                    {note.type}
                                                </span>
                                                {note.priority && (
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(note.priority)}`}>
                                                        {note.priority}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-sm text-gray-500 mt-1">
                                                {formatTimeAgo(note.created_at)}
                                                {note.updated_at && note.updated_at !== note.created_at && (
                                                    <span className="ml-2">(edited)</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => handleEditNote(note.id)}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                                            title="Edit Note"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => onDeleteNote(note.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                            title="Delete Note"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {editingNote === note.id ? (
                                    <div className="space-y-3">
                                        <textarea
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                        />
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={handleSaveEdit}
                                                className="inline-flex items-center px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors duration-200"
                                            >
                                                <Save className="w-3 h-3 mr-1" />
                                                Save
                                            </button>
                                            <button
                                                onClick={handleCancelEdit}
                                                className="inline-flex items-center px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors duration-200"
                                            >
                                                <X className="w-3 h-3 mr-1" />
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-gray-800 whitespace-pre-wrap">{note.content}</p>
                                        {note.tags && note.tags.length > 0 && (
                                            <div className="flex items-center space-x-2 mt-3">
                                                <Tag className="w-4 h-4 text-gray-400" />
                                                <div className="flex flex-wrap gap-1">
                                                    {note.tags.map((tag, index) => (
                                                        <span key={index} className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                            <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No notes found</h3>
                            <p className="text-gray-500 mb-4">
                                {searchTerm || filterType !== 'all'
                                    ? 'Try adjusting your search criteria or filters.'
                                    : 'Start by adding your first note about this customer.'}
                            </p>
                            <button
                                onClick={() => setShowAddNote(true)}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add First Note
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredActivities.length > 0 ? (
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="divide-y divide-gray-200">
                                {filteredActivities.map((activity) => (
                                    <div key={activity.id} className="p-6">
                                        <div className="flex items-start space-x-4">
                                            <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                                {getActivityIcon(activity.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                                                    <p className="text-sm text-gray-500">{formatTimeAgo(activity.timestamp)}</p>
                                                </div>
                                                {activity.user && (
                                                    <p className="text-sm text-gray-500 mt-1">by {activity.user}</p>
                                                )}
                                                {activity.metadata && (
                                                    <div className="mt-2 text-xs text-gray-600 bg-gray-50 rounded p-2">
                                                        <pre className="whitespace-pre-wrap">{JSON.stringify(activity.metadata, null, 2)}</pre>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                            <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No activity found</h3>
                            <p className="text-gray-500">
                                {searchTerm
                                    ? 'Try adjusting your search criteria.'
                                    : 'Customer activity will appear here as interactions occur.'}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotesAndActivity;