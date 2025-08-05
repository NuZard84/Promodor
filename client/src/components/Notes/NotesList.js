import React, { useState } from 'react'
import { Edit3, Trash2, Save, X, Filter } from 'lucide-react'

const NotesList = ({
    notes,
    editingId,
    editingText,
    setEditingText,
    startEditing,
    saveEdit,
    cancelEdit,
    deleteNote,
    handleKeyPress,
    isClickThrough,
    selectedFilter,
    setSelectedFilter, // Add these new props
}) => {
    // Add state for filter dropdown
    const [showFilters, setShowFilters] = useState(false)

    // Add filter colors
    const filterColors = [
        { id: 'high', color: '#FF6B47', label: 'High Priority' },
        { id: 'medium', color: '#FFB443', label: 'Medium Priority' },
        { id: 'low', color: '#4ECDC4', label: 'Low Priority' },
        { id: 'neutral', color: '#8F9DAF', label: 'No Priority' },
    ]

    // Filter notes based on selected color
    const filteredNotes = selectedFilter
        ? notes.filter((note) => note.color === selectedFilter)
        : notes

    if (notes.length === 0) {
        return (
            <div className="jetbrains-mono-200 h-full text-center text-white text-opacity-40 text-xs mt-8">
                No notes yet
            </div>
        )
    }

    return (
        <div
            className="jetbrains-mono-200 custom-scrollbar h-full flex flex-col"
            style={{
                WebkitAppRegion: 'no-drag',
                flex: '1 1 auto',
                overflowY: 'auto',
                paddingRight: '8px',
                minHeight: '0',
            }}
        >
            {/* Notes List */}
            <div className="space-y-2 mt-1">
                {filteredNotes.map((note) => (
                    <div
                        key={note.id}
                        className="px-2 py-1 rounded-md transition-all"
                        style={{
                            backgroundColor: `${note.color}15`,
                            borderLeft: `3px solid ${note.color}`,
                            backdropFilter: 'blur(10px)',
                        }}
                    >
                        {editingId === note.id ? (
                            <div className="space-y-2">
                                <textarea
                                    value={editingText}
                                    onChange={(e) =>
                                        setEditingText(e.target.value)
                                    }
                                    onKeyDown={handleKeyPress}
                                    className="w-full p-2 text-xs rounded resize-none"
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        color: 'white',
                                        outline: 'none',
                                        minHeight: '40px',
                                    }}
                                    autoFocus
                                />
                                <div className="flex space-x-2 ">
                                    <button
                                        onClick={saveEdit}
                                        className="p-1 rounded bg-green-500 bg-opacity-20 hover:bg-opacity-30 text-green-300 transition-all"
                                    >
                                        <Save size={12} />
                                    </button>
                                    <button
                                        onClick={cancelEdit}
                                        className="p-1 rounded bg-white bg-opacity-10 hover:bg-opacity-20 text-white text-opacity-60 hover:text-opacity-100 transition-all"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="group">
                                <div className="flex justify-between items-start">
                                    <p className="text-white text-xs flex-1 leading-relaxed">
                                        {note.text}
                                    </p>
                                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2 absolute right-0 bottom-0">
                                        <button
                                            onClick={() => startEditing(note)}
                                            className="p-1 rounded bg-white/70 text-black hover:bg-white/50 transition-all"
                                        >
                                            <Edit3 size={10} />
                                        </button>
                                        <button
                                            onClick={() => deleteNote(note.id)}
                                            className="p-1 rounded bg-red-500/70 text-white hover:bg-red-500/50 transition-all"
                                        >
                                            <Trash2 size={10} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default NotesList
