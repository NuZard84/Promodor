import React from 'react'
import { Eye, Settings, X } from 'lucide-react'
import CompactShortcutsHelp from '../hotkeysList/hotKeysList'

const NotesHeader = ({
    isClickThrough,
    toggleClickThrough,
    openMainWindow,
    closeOverlay,
    FilterButton,
    DeleteAllNotes
}) => {
    return (
        <div
            className="Bricolage_Grotesque flex  justify-between items-center mb-4 gap-1"
            style={{
                WebkitAppRegion: isClickThrough ? 'no-drag' : 'drag',
                cursor: isClickThrough ? 'default' : 'move',
            }}
        >
            <h2 className="text-white text-sm font-medium">Quick Notes</h2>

            <div className="flex space-x-2">
                <button
                    onClick={toggleClickThrough}
                    className={`hidden w-7 h-7 rounded-full transition-all flex items-center justify-center ${
                        isClickThrough
                            ? 'bg-blue-500 bg-opacity-80 text-white'
                            : 'bg-white bg-opacity-10 hover:bg-opacity-20 text-white text-opacity-60 hover:text-opacity-100'
                    }`}
                    title="Toggle Click-through (Ctrl+Shift+C)"
                >
                    <Eye size={12} />
                </button>
                <div
                    style={{
                        WebkitAppRegion: 'no-drag',
                    }}
                >
                    <CompactShortcutsHelp />
                </div>
                <button
                    onClick={closeOverlay}
                    className="hidden w-7 h-7 rounded-full bg-red-500 bg-opacity-20 hover:bg-opacity-40 text-red-400 hover:text-red-300 transition-all flex items-center justify-center"
                    title="Close Overlay"
                >
                    <X size={12} />
                </button>
                {FilterButton}
                {DeleteAllNotes}
            </div>
        </div>
    )
}

export default NotesHeader
