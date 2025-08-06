import React, { useState } from 'react'
import { HelpCircle, X } from 'lucide-react'

const CompactShortcutsHelp = () => {
    const [isOpen, setIsOpen] = useState(false)

    const shortcuts = [
        { keys: 'Space', desc: 'Start/Pause Timer' },
        { keys: 'Ctrl+R', desc: 'Reset Timer' },
        { keys: 'Ctrl+Shift+A', desc: 'Hyper Mode' },
        { keys: 'Ctrl+Shift+N', desc: 'Toggle Notes' },
        { keys: 'Ctrl+Shift+O', desc: 'Toggle Overlay' },
        { keys: 'Ctrl+Shift+H', desc: 'Hide Window' },
        { keys: 'Ctrl+Shift+P', desc: 'Global Timer Toggle' },
        { keys: 'Ctrl+Shift+C', desc: 'Click Through' },
        { keys: 'Ctrl+1/2/3', desc: 'Focus/Short/Long Break' },
    ]

    const isMac =
        typeof navigator !== 'undefined' &&
        navigator.platform.indexOf('Mac') === 0

    const formatKeys = (keys) => {
        if (isMac) {
            return keys.replace(/Ctrl/g, '⌘').replace(/Shift/g, '⇧')
        }
        return keys
    }

    return (
        <>
            {/* Help Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation()
                    setIsOpen(true)
                }}
                className="flex items-center justify-center w-7 h-7 bg-white/5 hover:bg-white/15 rounded-lg transition-all duration-200 group border border-white/10"
                title="Keyboard Shortcuts"
                style={{ WebkitAppRegion: 'no-drag' }}
            >
                <HelpCircle className="w-4 h-4 text-white/60 group-hover:text-white/90" />
            </button>

            {/* Compact Modal */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-[9999] flex items-start justify-start"
                    style={{
                        WebkitAppRegion: 'no-drag',
                    }}
                    >
                    <div
                        className="absolute inset-0  "
                        onClick={() => setIsOpen(false)}
                    />

                    <div className="relative w-min  rounded-2xl border border-white/20 bg-black/80 ">
                        {/* Header */}
                        <div className="flex items-center justify-between p-2 border-b border-white/10">
                            <h3 className="text-lg font-medium text-white">
                                Shortcuts
                            </h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-white/10 rounded"
                            >
                                <X className="w-4 h-4 text-white/70" />
                            </button>
                        </div>

                        {/* Shortcuts List */}
                        <div className="p-4 max-h-48 w-min overflow-y-auto custom-scrollbar">
                            <div className="space-y-2">
                                {shortcuts.map((shortcut, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-2 py-2  hover:bg-white/5 rounded-lg"
                                    >
                                        <span className="text-white text-[10px]">
                                            {shortcut.desc}
                                        </span>
                                        <kbd className="px-1 py-1 text-[10px] bg-white/10 text-white rounded border border-white/20 font-mono">
                                            {formatKeys(shortcut.keys)}
                                        </kbd>
                                    </div>
                                ))}
                            </div>

                            {/* Platform Note */}
                            <div className="mt-4 pt-3 border-t border-white/10">
                                <p className="text-xs text-white/50 text-center">
                                    {isMac
                                        ? 'Using ⌘ and ⇧ keys'
                                        : 'Global shortcuts work when app is unfocused'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default CompactShortcutsHelp
