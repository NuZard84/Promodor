import React from 'react'
import { Eye, Settings, X } from 'lucide-react'

const NotesHeader = ({
    isClickThrough,
    toggleClickThrough,
    openMainWindow,
    closeOverlay,
    FilterButton,
}) => {
    return (
        <div
            className="jetbrains-mono-200 flex justify-between items-center mb-4"
            style={{
                WebkitAppRegion: isClickThrough ? 'no-drag' : 'drag',
                cursor: isClickThrough ? 'default' : 'move',
                // pointerEvents: isClickThrough ? 'none' : 'auto',
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

                <button
                    onClick={closeOverlay}
                    className="hidden w-7 h-7 rounded-full bg-red-500 bg-opacity-20 hover:bg-opacity-40 text-red-400 hover:text-red-300 transition-all flex items-center justify-center"
                    title="Close Overlay"
                >
                    <X size={12} />
                </button>
                {FilterButton}
            </div>
        </div>
    )
}

export default NotesHeader
