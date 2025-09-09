import React, { useState } from 'react'
import { useUnifiedItems, useOverlay } from '../hooks'
import { NotesHeader, NotesInput, NotesList } from './Notes'
import FilterButton from './FilterButton/FilterButton'

import PriorityCounter from './Notes/NotesCount'
import DeleteAllNotesComponent from './DeleteAllNotes/DeleteAllNotes'
const NotesOverlay = () => {
    const [selectedFilter, setSelectedFilter] = useState(null)
    const [showFilters, setShowFilters] = useState(false)

    const {
        items,
        notes,
        tasks,
        completedTasks,
        newItem,
        setNewItem,
        editingId,
        editingText,
        setEditingText,
        showInput,
        setShowInput,
        selectedColor,
        setSelectedColor,
        itemType,
        setItemType,
        colors,
        addItem,
        startEditing,
        saveEdit,
        cancelEdit,
        deleteItem,
        deleteAllItems,
        toggleTask,
        handleKeyPress,
    } = useUnifiedItems()

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
                        deleteAllNotes={deleteAllItems}
                        notes={items}
                    />
                }
            />

            {/* Delete All Notes Button */}

            {/* Add Note Input */}
            <div className="">
                <NotesInput
                    showInput={showInput}
                    setShowInput={setShowInput}
                    newNote={newItem}
                    setNewNote={setNewItem}
                    addNote={addItem}
                    handleKeyPress={handleKeyPress}
                    isClickThrough={isClickThrough}
                    selectedColor={selectedColor}
                    setSelectedColor={setSelectedColor}
                    colors={colors}
                    itemType={itemType}
                    setItemType={setItemType}
                />
            </div>

            {/* Notes List */}
            <NotesList
                notes={items}
                editingId={editingId}
                editingText={editingText}
                setEditingText={setEditingText}
                startEditing={startEditing}
                saveEdit={saveEdit}
                cancelEdit={cancelEdit}
                deleteNote={deleteItem}
                handleKeyPress={handleKeyPress}
                isClickThrough={isClickThrough}
                selectedFilter={selectedFilter}
                setSelectedFilter={setSelectedFilter}
                toggleTask={toggleTask}
            />
            <PriorityCounter
                notes={items}
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
