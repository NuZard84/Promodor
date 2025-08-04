import React, { useState, useEffect, useCallback } from 'react'
import { Play, Pause, RotateCcw, Settings, X, Eye } from 'lucide-react'

const OverlayMode = () => {
    // Timer state
    const [minutes, setMinutes] = useState(25)
    const [seconds, setSeconds] = useState(0)
    const [isActive, setIsActive] = useState(false)
    const [mode, setMode] = useState('focus')
    const [cycle, setCycle] = useState(1)
    const [isClickThrough, setIsClickThrough] = useState(false)

    // Settings
    const [settings, setSettings] = useState({
        focusTime: 25,
        shortBreakTime: 5,
        longBreakTime: 15,
        longBreakAfter: 4,
    })

    // Timer logic
    useEffect(() => {
        let interval = null
        if (isActive) {
            interval = setInterval(() => {
                if (seconds === 0) {
                    if (minutes === 0) {
                        handleTimerComplete()
                    } else {
                        setMinutes(minutes - 1)
                        setSeconds(59)
                    }
                } else {
                    setSeconds(seconds - 1)
                }
            }, 1000)
        }
        return () => clearInterval(interval)
    }, [isActive, seconds, minutes])

    const handleTimerComplete = useCallback(() => {
        setIsActive(false)
        // Handle mode switching logic here
    }, [mode, cycle, settings])

    const toggleTimer = () => setIsActive(!isActive)
    const resetTimer = () => {
        setIsActive(false)
        if (mode === 'focus') {
            setMinutes(settings.focusTime)
        } else if (mode === 'shortBreak') {
            setMinutes(settings.shortBreakTime)
        } else {
            setMinutes(settings.longBreakTime)
        }
        setSeconds(0)
    }

    const toggleClickThrough = () => {
        const newState = !isClickThrough
        setIsClickThrough(newState)
        if (window.electronAPI) {
            window.electronAPI.toggleClickThrough(newState)
        }
    }

    const closeOverlay = () => {
        if (window.electronAPI) {
            window.electronAPI.closeOverlay()
        }
    }

    const openMainWindow = () => {
        if (window.electronAPI) {
            window.electronAPI.openMainWindow()
        }
    }

    // Global shortcut handler
    useEffect(() => {
        window.toggleClickThroughFromShortcut = toggleClickThrough
        return () => {
            delete window.toggleClickThroughFromShortcut
        }
    }, [isClickThrough])

    const formatTime = (mins, secs) => {
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(
            2,
            '0'
        )}`
    }

    // Get mode info
    const getModeInfo = () => {
        switch (mode) {
            case 'focus':
                return {
                    text: 'FOCUS',
                    color: '#FF6B47',
                    glowColor: 'rgba(255, 107, 71, 0.4)',
                    icon: '👁️',
                    totalTime: settings.focusTime * 60,
                }
            case 'shortBreak':
                return {
                    text: 'SHORT BREAK',
                    color: '#4ECDC4',
                    glowColor: 'rgba(78, 205, 196, 0.4)',
                    icon: '☕',
                    totalTime: settings.shortBreakTime * 60,
                }
            case 'longBreak':
                return {
                    text: 'LONG BREAK',
                    color: '#4ECDC4',
                    glowColor: 'rgba(78, 205, 196, 0.4)',
                    icon: '🛋️',
                    totalTime: settings.longBreakTime * 60,
                }
            default:
                return {
                    text: 'FOCUS',
                    color: '#FF6B47',
                    glowColor: 'rgba(255, 107, 71, 0.4)',
                    icon: '👁️',
                    totalTime: settings.focusTime * 60,
                }
        }
    }

    const modeInfo = getModeInfo()
    const currentTimeInSeconds = minutes * 60 + seconds

    // Fixed progress calculation: when timer is full (25:00), progress should be 0
    // As time counts down, progress increases
    const progress =
        ((modeInfo.totalTime - currentTimeInSeconds) / modeInfo.totalTime) * 100

    const radius = 80
    const circumference = 2 * Math.PI * radius

    // Fixed stroke calculation: start with full circumference (no progress)
    // As progress increases, reduce the dash offset to fill the circle
    const strokeDashoffset = circumference - (progress / 100) * circumference

    return (
        <div
            className="overlay-container w-min h-full flex flex-col"
            style={{
                borderRadius: '35px',
                border: '1px solid rgba(255, 255, 255, 0.21)',
                WebkitAppRegion: isClickThrough ? 'no-drag' : 'drag',
                cursor: isClickThrough ? 'default' : 'move',
                padding: '16px',
                background: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            }}
        >
            {/* Top Controls */}
            <div
                className="hidden flex justify-between items-center mb-4"
                style={{
                    WebkitAppRegion: isClickThrough ? 'no-drag' : 'drag',
                    pointerEvents: isClickThrough ? 'none' : 'auto',
                }}
            >
                <button
                    onClick={openMainWindow}
                    className="w-8 h-8 rounded-full bg-white bg-opacity-10 hover:bg-opacity-20 transition-all flex items-center justify-center text-white text-opacity-60 hover:text-opacity-100"
                    title="Open Settings"
                >
                    <Settings size={14} />
                </button>

                <div className="flex space-x-2">
                    <button
                        onClick={toggleClickThrough}
                        className={`w-8 h-8 rounded-full transition-all flex items-center justify-center ${
                            isClickThrough
                                ? 'bg-blue-500 bg-opacity-80 text-white'
                                : 'bg-white bg-opacity-10 hover:bg-opacity-20 text-white text-opacity-60 hover:text-opacity-100'
                        }`}
                        title="Toggle Click-through (Ctrl+Shift+C)"
                    >
                        <Eye size={14} />
                    </button>

                    <button
                        onClick={closeOverlay}
                        className="w-8 h-8 rounded-full bg-red-500 bg-opacity-20 hover:bg-opacity-40 text-red-400 hover:text-red-300 transition-all flex items-center justify-center"
                        title="Close Overlay"
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>

            {/* Main Timer Display */}
            <div
                className="  flex flex-col items-center justify-center flex-1"
                style={{
                    WebkitAppRegion: isClickThrough ? 'no-drag' : 'drag',
                }}
            >
                {/* Circular Progress */}
                <div className="relative mb-4">
                    <svg
                        width="180"
                        height="180"
                        className="transform -rotate-90"
                    >
                        {/* Background circle */}
                        <circle
                            cx="90"
                            cy="90"
                            r={radius}
                            stroke="rgba(255, 255, 255, 0.1)"
                            strokeWidth="10"
                            fill="none"
                        />
                        {/* Progress circle */}
                        <circle
                            cx="90"
                            cy="90"
                            r={radius}
                            stroke={modeInfo.color}
                            strokeWidth="10"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            style={{
                                transition:
                                    'stroke-dashoffset 0.5s ease-in-out',
                                filter: `drop-shadow(0 0 10px ${modeInfo.color}60)`,
                                // This ensures the progress starts from the top and goes clockwise
                                transformOrigin: 'center',
                            }}
                        />
                    </svg>

                    {/* Timer Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="jetbrains-mono-200 font-light text-white text-3xl tracking-wide mb-2">
                            {formatTime(minutes, seconds)}
                        </div>
                        {/* Cycle dots */}
                        <div className="flex space-x-2">
                            {[...Array(settings.longBreakAfter)].map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-[4px] h-2 rounded-full transition-all ${
                                        i < cycle
                                            ? 'bg-[#FF6B47] bg-opacity-70'
                                            : 'bg-white bg-opacity-35'
                                    }`}
                                    style={{
                                        boxShadow:
                                            i < cycle
                                                ? `0 0 6px ${modeInfo.color}60`
                                                : 'none',
                                    }}
                                />
                            ))}
                        </div>
                        {/* Mode Label */}
                        <div
                            className="jetbrains-mono-100 text-center mb-1"
                            style={{
                                WebkitAppRegion: isClickThrough
                                    ? 'no-drag'
                                    : 'drag',
                            }}
                        >
                            <div className="mt-1 text-white text-opacity-70 text-xs font-medium tracking-wide">
                                {modeInfo.text}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Control Buttons */}
            <div
                className=" flex gap-1 justify-center space-x-6"
                style={{
                    WebkitAppRegion: 'no-drag',
                    pointerEvents: isClickThrough ? 'none' : 'auto',
                }}
            >
                {/* Reset Button */}
                <button
                    onClick={resetTimer}
                    className="w-8 h-8 rounded-full bg-white bg-opacity-10 hover:bg-opacity-20 text-white text-opacity-60 hover:text-opacity-100 transition-all flex items-center justify-center"
                    style={{
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                >
                    <RotateCcw size={10} />
                </button>

                {/* Play/Pause Button */}
                <button
                    onClick={toggleTimer}
                    className="jetbrains-mono-200 px-5 text-xs rounded-full bg-white bg-opacity-15 hover:bg-opacity-25 text-white transition-all flex items-center justify-center"
                    style={{
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        boxShadow: '0 6px 24px rgba(0, 0, 0, 0.3)',
                    }}
                >
                    {isActive ? (
                        // <Pause size={20} />
                        <p>Pause</p>
                    ) : (
                        // <Play size={20} style={{ marginLeft: '2px' }} />
                        <p>Start</p>
                    )}
                </button>

                {/* Settings Button */}
                <button
                    onClick={openMainWindow}
                    className="w-8 h-8 rounded-full bg-white bg-opacity-10 hover:bg-opacity-20 text-white text-opacity-60 hover:text-opacity-100 transition-all flex items-center justify-center"
                    style={{
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                >
                    <Settings size={16} />
                </button>
            </div>

            {/* Bottom Shortcut Hint */}
            <div
                className="hidden text-center text-white text-opacity-30 text-xs mt-4"
                style={{
                    WebkitAppRegion: isClickThrough ? 'no-drag' : 'drag',
                }}
            >
                Ctrl+Shift+C: Click-through
            </div>
        </div>
    )
}

export default OverlayMode
