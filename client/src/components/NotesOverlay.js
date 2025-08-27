import React, { useState } from 'react'
import { useNotes, useOverlay } from '../hooks'
import { NotesHeader, NotesInput, NotesList } from './Notes'
import FilterButton from './FilterButton/FilterButton'

import PriorityCounter from './Notes/NotesCount'
import DeleteAllNotesComponent from './DeleteAllNotes/DeleteAllNotes'
const NotesOverlay = () => {
    const [selectedFilter, setSelectedFilter] = useState(null)
    const [showFilters, setShowFilters] = useState(false)

    const {
        notes,
        newNote,
        setNewNote,
        editingId,
        editingText,
        setEditingText,
        showInput,
        setShowInput,
        selectedColor,
        setSelectedColor,
        colors, // Get colors from hook
        addNote,
        startEditing,
        saveEdit,
        cancelEdit,
        deleteNote,
        deleteAllNotes,
        handleKeyPress,
    } = useNotes()

    const { isClickThrough, toggleClickThrough, closeOverlay, openMainWindow } =
        useOverlay()

    return (
        <div
            className="notes-overlay-container w-max flex flex-col "
            style={{
                height: '80vh', // Changed from h-88 to explicit height
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.21)',
                WebkitAppRegion: isClickThrough ? 'no-drag' : 'drag',
                // cursor: isClickThrough ? 'default' : 'move',
                padding: '16px',
                background: 'rgba(0, 0, 0, 0.5)',
            }}
        >
            {/* Header */}

            <NotesHeader
                isClickThrough={isClickThrough}
                toggleClickThrough={toggleClickThrough}
                openMainWindow={openMainWindow}
                closeOverlay={closeOverlay}
                FilterButton={
                    <FilterButton
                        selectedFilter={selectedFilter}
                        setSelectedFilter={setSelectedFilter}
                        showFilters={showFilters}
                        setShowFilters={setShowFilters}
                    />
                }
                DeleteAllNotes={
                    <DeleteAllNotesComponent
                        deleteAllNotes={deleteAllNotes}
                        notes={notes}
                    />
                }
            />

            {/* Delete All Notes Button */}

            {/* Add Note Input */}
            <div className="">
                <NotesInput
                    showInput={showInput}
                    setShowInput={setShowInput}
                    newNote={newNote}
                    setNewNote={setNewNote}
                    addNote={addNote}
                    handleKeyPress={handleKeyPress}
                    isClickThrough={isClickThrough}
                    selectedColor={selectedColor}
                    setSelectedColor={setSelectedColor}
                    colors={colors} // Pass colors to NotesInput
                />
            </div>

            {/* Notes List */}
            <NotesList
                notes={notes}
                editingId={editingId}
                editingText={editingText}
                setEditingText={setEditingText}
                startEditing={startEditing}
                saveEdit={saveEdit}
                cancelEdit={cancelEdit}
                deleteNote={deleteNote}
                handleKeyPress={handleKeyPress}
                isClickThrough={isClickThrough}
                selectedFilter={selectedFilter}
                setSelectedFilter={setSelectedFilter}
            />
            <PriorityCounter
                notes={notes}
                colors={colors}
                selectedFilter={selectedFilter}
                setSelectedFilter={setSelectedFilter}
                showFilters={showFilters}
                setShowFilters={setShowFilters}
                isClickThrough={isClickThrough}
            />
            {/* Custom scrollbar styles */}
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 2px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 2px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.5);
                }
            `}</style>
        </div>
    )
}

export default NotesOverlay
