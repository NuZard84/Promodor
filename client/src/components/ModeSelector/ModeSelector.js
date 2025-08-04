import React from 'react'

const ModeSelector = ({ mode, onModeChange, isActive, modeInfo }) => {
    const handleModeChange = (newMode) => {
        if (!isActive) {
            onModeChange(newMode)
        }
    }

    return (
        <div className="flex justify-center space-x-2 mb-4">
            {[
                { key: 'focus', label: '🍅', color: '#a76959' },
                { key: 'shortBreak', label: '🍵', color: '#6B9C84' },
                { key: 'longBreak', label: '⏳', color: '#5D7D9A' },
            ].map(({ key, label, color }) => (
                <button
                    key={key}
                    onClick={() => handleModeChange(key)}
                    disabled={isActive}
                    className={`px-3 py-1 rounded-full text-xs transition-all ${
                        mode === key
                            ? 'text-white shadow-lg'
                            : 'bg-opacity-10 hover:bg-opacity-20 text-white text-opacity-60'
                    }`}
                    style={{
                        backgroundColor: mode === key ? color : 'transparent',
                        opacity: isActive ? 0.5 : 1,
                        cursor: isActive ? 'not-allowed' : 'pointer',
                    }}
                >
                    {label}
                </button>
            ))}
        </div>
    )
}

export default ModeSelector
