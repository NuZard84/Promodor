import React, { useState, useEffect, useRef } from 'react'
import useNotifier from '../hooks/useNotifier'
import { RotateCcw, Settings, X, Eye, NotepadTextIcon, Shrimp, Shrink } from 'lucide-react'
import Lottie from 'lottie-react'
import ModeSelector from './ModeSelector/ModeSelector'
import useGlobalShortcuts from '../hooks/useGlobalHooks'
import fireStreakAnimation from '../assets/animations/fire_streak.json'
import { completeFocusCycleToday } from '../utils/streak'

// Helper function to create pie slice path
const describeArc = (x, y, radius, startAngle, endAngle) => {
    const start = polarToCartesian(x, y, radius, endAngle)
    const end = polarToCartesian(x, y, radius, startAngle)
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'

    return [
        'M',
        start.x,
        start.y,
        'A',
        radius,
        radius,
        0,
        largeArcFlag,
        0,
        end.x,
        end.y,
        'L',
        x,
        y,
        'Z',
    ].join(' ')
}

const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0
    return {
        x: centerX + radius * Math.cos(angleInRadians),
        y: centerY + radius * Math.sin(angleInRadians),
    }
}

// Simple editable timer values (change here to test quickly)
const FOCUS_MIN = 1
const SHORT_BREAK_MIN = 1
const LONG_BREAK_MIN = 1
const LONG_BREAK_AFTER = 1

// const FOCUS_MIN = 25
// const SHORT_BREAK_MIN = 5
// const LONG_BREAK_MIN = 15
// const LONG_BREAK_AFTER = 4

const OverlayMode = () => {
    // Timer state
    const [minutes, setMinutes] = useState(FOCUS_MIN)
    const [seconds, setSeconds] = useState(0)
    const [isActive, setIsActive] = useState(false)
    const [mode, setMode] = useState('focus')
    const [cycle, setCycle] = useState(0)
    const [isClickThrough, setIsClickThrough] = useState(false)
    const [autoHyperMode, setAutoHyperMode] = useState(false)

    // Lottie animation ref
    const lottieRef = useRef()

    const notify = useNotifier()

    // Handle hover events for Lottie animation
    const handleMouseEnter = () => {
        if (lottieRef.current) {
            lottieRef.current.play()
        }
    }

    const handleMouseLeave = () => {
        if (lottieRef.current) {
            lottieRef.current.stop()
        }
    }

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
    }, [isActive, seconds, minutes, handleTimerComplete])

    function handleTimerComplete() {
        const prevMode = mode
        const wasFocus = mode === 'focus'
        resetTimer()
        disableHyperMode() // This will also disable super hyper mode
        if (wasFocus) {
            setCycle((prev) => prev + 1)
            try {
                completeFocusCycleToday()
            } catch {}
            // Focus just completed → going to short break (by design here)
            notify(
                'Focus complete',
                `Time for a short break (${SHORT_BREAK_MIN} min).`
            )
        } else if (prevMode === 'shortBreak') {
            // Short break ended → back to focus
            notify('Short break over', 'Back to focus!')
        } else if (prevMode === 'longBreak') {
            // Long break ended → back to focus
            notify('Long break over', 'Back to focus!')
        }
    }

    const toggleTimer = () => {
        const newActiveState = !isActive
        
        // If starting the timer and auto hyper mode is enabled, enable super hyper mode
        if (newActiveState && autoHyperMode && !superHyperMode) {
            // Enable super hyper mode when starting timer
            if (window.electronAPI && window.electronAPI.toggleSuperHyperMode) {
                window.electronAPI.toggleSuperHyperMode()
            }
        }
        
        setIsActive(newActiveState)
    }
    function resetTimer() {
        setIsActive(false)
        if (mode === 'focus') {
            setMode('shortBreak')
            setMinutes(SHORT_BREAK_MIN)
        } else if (mode === 'shortBreak') {
            setMode('focus')
            setMinutes(FOCUS_MIN)
        } else {
            setMode('focus')
            setMinutes(FOCUS_MIN)
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
    }, [isClickThrough, toggleClickThrough])

    const formatTime = (mins, secs) => {
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(
            2,
            '0'
        )}`
    }

    const toggleNotesOverlay = () => {
        if (window.electronAPI) {
            window.electronAPI.toggleNotesOverlay()
        }
    }

    // Add streak overlay handler
    const toggleStreakOverlay = () => {
        console.log('toggleStreakOverlay called')
        console.log('electronAPI available:', !!window.electronAPI)
        console.log(
            'createStreakOverlay function:',
            typeof window.electronAPI?.createStreakOverlay
        )

        if (window.electronAPI && window.electronAPI.createStreakOverlay) {
            window.electronAPI
                .createStreakOverlay()
                .then(() => console.log('Streak overlay created successfully'))
                .catch((error) =>
                    console.error('Error creating streak overlay:', error)
                )
        } else {
            console.error('electronAPI or createStreakOverlay not available')
        }
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
                    totalTime: FOCUS_MIN * 60,
                }
            case 'shortBreak':
                return {
                    text: 'SHORT BREAK',
                    color: '#4ECDC4',
                    glowColor: 'rgba(78, 205, 196, 0.4)',
                    icon: '☕',
                    totalTime: SHORT_BREAK_MIN * 60,
                }
            case 'longBreak':
                return {
                    text: 'LONG BREAK',
                    color: '#5D7D9A',
                    glowColor: 'rgba(78, 205, 196, 0.9)',
                    icon: '🛋️',
                    totalTime: LONG_BREAK_MIN * 60,
                }
            default:
                return {
                    text: 'FOCUS',
                    color: '#FF6B47',
                    glowColor: 'rgba(255, 107, 71, 0.4)',
                    icon: '👁️',
                    totalTime: FOCUS_MIN * 60,
                }
        }
    }
    const { hyperMode, superHyperMode, disableHyperMode } = useGlobalShortcuts()

    useEffect(() => {
        console.log(
            'Hyper mode:',
            hyperMode,
            'Super hyper mode:',
            superHyperMode
        )
    }, [hyperMode, superHyperMode])
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
    const handleModeChange = (newMode) => {
        setMode(newMode)
        setIsActive(false)

        // Reset timer based on new mode using simple constants
        switch (newMode) {
            case 'focus':
                setMinutes(FOCUS_MIN)
                break
            case 'shortBreak':
                setMinutes(SHORT_BREAK_MIN)
                break
            case 'longBreak':
                setMinutes(LONG_BREAK_MIN)
                break
            default:
                setMinutes(FOCUS_MIN)
        }
        setSeconds(0)
    }
    // Super hyper mode - minimal pie chart timer
    if (superHyperMode) {
        const superRadius = 30
        const superProgress =
            ((modeInfo.totalTime - currentTimeInSeconds) / modeInfo.totalTime) *
            100
        const angle = (superProgress / 100) * 360

        return (
            <div className='bg-black/40 w-min p-[10px] rounded-2xl'>
                <div
                    className=" flex items-center justify-center p-2 "
                    style={{
                        WebkitAppRegion: isClickThrough ? 'no-drag' : 'drag',
                        cursor: isClickThrough ? 'default' : 'move',
                        width: '60px',
                        height: '60px',
                        // background: 'transparent', 
                    }}
                >
                    <div className="relative">
                        <svg width="140" height="140" viewBox="0 0 140 140">
                                                         {/* Background circle */}
                             <circle
                                 cx="70"
                                 cy="70"
                                 r={superRadius}
                                 fill={`${modeInfo.color}30`}
                             />

                                                         {/* Progress pie slice */}
                             <path
                                 d={describeArc(
                                     70,
                                     70,
                                     superRadius,
                                     0,
                                     Math.max(angle, 1) // Always show at least 1 degree
                                 )}
                                 fill={modeInfo.color}
                                 style={{
                                     filter: `drop-shadow(0 0 8px ${modeInfo.color}80)`,
                                 }}
                             />
                        </svg>

                        {/* Timer Text */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="Bricolage_Grotesque font-bold text-white text-sm tracking-wide">
                                {formatTime(minutes, seconds)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div
            className="overlay-container w-min h-full flex flex-col "
            style={{
                borderRadius: '35px',
                border: '1px solid rgba(255, 255, 255, 0.21)',
                WebkitAppRegion: isClickThrough ? 'no-drag' : 'drag',
                cursor: isClickThrough ? 'default' : 'move',
                padding: '16px',
                background: 'rgba(0, 0, 0, 0.5)',
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
                <div className="relative ">
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
                            stroke="rgba(255, 255, 255, 0.2)"
                            strokeWidth="10"
                            fill="none"
                        />

                        <circle
                            cx="90"
                            cy="90"
                            r={radius}
                            stroke={modeInfo.color}
                            strokeWidth="10"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            // Ensure at least 1% progress is shown visually
                            strokeDashoffset={
                                circumference -
                                (Math.max(progress, 1) / 100) * circumference
                            }
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
                        <div className="Bricolage_Grotesque font-bold text-white text-3xl tracking-wide mb-2">
                            {formatTime(minutes, seconds)}
                        </div>
                        {/* Cycle dots */}
                        <div className="flex space-x-2">
                            <>
                                <div className="flex flex-row items-center justify-center Bricolage_Grotesque">
                                    <button
                                        onClick={toggleStreakOverlay}
                                        onMouseEnter={handleMouseEnter}
                                        onMouseLeave={handleMouseLeave}
                                        className="font-semibold transition-all cursor-pointer flex items-center"
                                        style={{
                                            color: '#FF6B47',
                                            WebkitAppRegion: 'no-drag',
                                            pointerEvents: isClickThrough
                                                ? 'none'
                                                : 'auto',
                                        }}
                                        title="Open Streak Tracker"
                                    >
                                        <span className="mr-1">{cycle}</span>
                                        <div className="w-[26px] h-[26px] mx-[-6px]">
                                            <Lottie
                                                lottieRef={lottieRef}
                                                animationData={
                                                    fireStreakAnimation
                                                }
                                                loop={false}
                                                autoplay={false}
                                                onError={(error) => {
                                                    console.error(
                                                        'Lottie animation error:',
                                                        error
                                                    )
                                                }}
                                            />
                                        </div>
                                    </button>
                                    <div className="h-[50%] w-[1.5px] bg-white/20 mr-2 ml-2"></div>
                                    <p
                                        className="font-semibold"
                                        style={{ color: '#FF6B47' }}
                                    >
                                        {cycle * FOCUS_MIN}⏱️
                                    </p>
                                </div>
                            </>
                        </div>
                        {/* Mode Label */}
                        <div
                            className=" text-center mb-1"
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
            <div className={` ${hyperMode ? 'hidden' : ''} `}>
                <ModeSelector
                    mode={mode}
                    onModeChange={handleModeChange}
                    isActive={isActive}
                    modeInfo={modeInfo}
                />
                
                                 {/* Auto Super Hyper Mode Toggle */}
                 <div className="flex items-center justify-center mt-3 mb-2 absolute top-1 right-3 ">
                     <button
                         onClick={() => setAutoHyperMode(!autoHyperMode)}
                         className={`flex items-center space-x-2 cursor-pointer p-1 rounded-full transition-all ${
                             autoHyperMode 
                                 ? 'bg-orange-500/80 text-white' 
                                 : 'bg-orange-400/40 text-white/70 hover:bg-black/60'
                         }`}
                         title="Toggle auto super hyper mode"
                         style={{
                             WebkitAppRegion: 'no-drag',
                             pointerEvents: isClickThrough ? 'none' : 'auto',
                         }}
                     >
                         <Shrink size={16}/>
                     </button>
                 </div>
                
                {/* Bottom Control Buttons */}
            </div>
            <div
                className={`flex  justify-center gap-2 ${
                    hyperMode ? 'hidden' : ''
                }`}
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
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                >
                    <RotateCcw size={10} />
                </button>

                {/* Play/Pause Button */}
                <button
                    onClick={toggleTimer}
                    className="Bricolage_Grotesque px-5 text-xs rounded-full bg-white bg-opacity-15 hover:bg-opacity-25 text-white transition-all flex items-center justify-center"
                    style={{
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
                    className="hidden w-8 h-8 rounded-full bg-white bg-opacity-10 hover:bg-opacity-20 text-white text-opacity-60 hover:text-opacity-100 transition-all flex items-center justify-center"
                    style={{
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                >
                    <Settings size={16} />
                </button>
                <button
                    onClick={toggleNotesOverlay}
                    className="w-8 h-8 rounded-full bg-white bg-opacity-10 hover:bg-opacity-20 text-white text-opacity-60 hover:text-opacity-100 transition-all flex items-center justify-center"
                    style={{
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                >
                    <NotepadTextIcon size={12} />
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
