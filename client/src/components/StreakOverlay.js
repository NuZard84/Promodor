import React, { useEffect, useState } from 'react'
import { X, Eye, Flame, Calendar, Target, TrendingUp } from 'lucide-react'
import { ensureRolloverNow, getCurrentWeekInfo, getCurrentStreak, getWeeklyCycleCount, onLocalMidnight } from '../utils/streak'

const StreakOverlay = () => {
    const [isClickThrough, setIsClickThrough] = useState(false)
    const WEEKLY_GOAL = 28
    const [currentStreak, setCurrentStreak] = useState(0)
    const [weekInfo, setWeekInfo] = useState(() => getCurrentWeekInfo())
    const [weeklyCycleCount, setWeeklyCycleCount] = useState(() => getWeeklyCycleCount())

    const toggleClickThrough = () => {
        const newState = !isClickThrough
        setIsClickThrough(newState)
        if (window.electronAPI) {
            window.electronAPI.toggleClickThrough(newState)
        }
    }

    const closeOverlay = () => {
        if (window.electronAPI) {
            window.electronAPI.closeStreakOverlay()
        }
    }

    // Generate calendar for current month (placeholder/mock)
    const generateCalendarDays = () => {
        const today = new Date()
        const currentMonth = today.getMonth()
        const currentYear = today.getFullYear()
        const firstDay = new Date(currentYear, currentMonth, 1)
        const lastDay = new Date(currentYear, currentMonth + 1, 0)
        const daysInMonth = lastDay.getDate()
        const startingDayOfWeek = firstDay.getDay()

        const days = []

        // Add empty cells for days before month starts
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null)
        }

        // Add days of the month with mock session data
        for (let day = 1; day <= daysInMonth; day++) {
            const isToday = day === today.getDate()
            const hasSession = Math.random() > 0.4 // Mock data
            days.push({ day, isToday, hasSession })
        }

        return days
    }

    const calendarDays = generateCalendarDays()
    const weeklyProgress = (weeklyCycleCount / WEEKLY_GOAL) * 100

    useEffect(() => {
        const refresh = () => {
            ensureRolloverNow()
            setCurrentStreak(getCurrentStreak())
            setWeekInfo(getCurrentWeekInfo())
            setWeeklyCycleCount(getWeeklyCycleCount())
        }
        // Initial
        refresh()
        // At local midnight
        const cancelMidnight = onLocalMidnight(refresh)
        // When any other window updates storage
        const onStorage = (e) => {
            if (!e || e.key == null || e.key === 'promodor_streak_v1') {
                refresh()
            }
        }
        window.addEventListener('storage', onStorage)
        return () => {
            cancelMidnight && cancelMidnight()
            window.removeEventListener('storage', onStorage)
        }
    }, [])

    return (
        <div
            className="w-full h-full flex flex-col overflow-hidden"
            style={{
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.21)',
                WebkitAppRegion: isClickThrough ? 'no-drag' : 'drag',
                background: 'rgba(0, 0, 0, 0.8)',
                backdropFilter: 'blur(10px)',
                fontFamily: 'Bricolage Grotesque, sans-serif',
                padding: '10px',
            }}
        >
            {/* Header */}
            <div className="hidden flex justify-between items-center mb-1 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <Flame size={16} className="text-orange-500" />
                    <h2 className="text-white text-base font-semibold">
                        Streak Tracker
                    </h2>
                </div>

                <div className="flex space-x-2">
                    <button
                        onClick={toggleClickThrough}
                        className={`hidden w-6 h-6 rounded-full transition-all flex items-center justify-center ${
                            isClickThrough
                                ? 'bg-blue-500 bg-opacity-80 text-white'
                                : 'bg-white bg-opacity-10 hover:bg-opacity-20 text-white text-opacity-60 hover:text-opacity-100'
                        }`}
                        style={{ WebkitAppRegion: 'no-drag' }}
                        title="Toggle Click-through"
                    >
                        <Eye size={10} />
                    </button>

                    <button
                        onClick={closeOverlay}
                        className="hidden w-6 h-6 rounded-full bg-red-500 bg-opacity-20 hover:bg-opacity-40 text-red-400 hover:text-red-300 transition-all flex items-center justify-center"
                        style={{ WebkitAppRegion: 'no-drag' }}
                        title="Close Overlay"
                    >
                        <X size={10} />
                    </button>
                </div>
            </div>

            {/* Compact Stats Cards */}
            <div className="flex  flex-shrink-0 items-center justify-center gap-4">
                <div className="min-w-20 bg-white/10 h-full justify-center flex  flex-col rounded-xl p-2 text-center">
                    <div className="text-4xl font-bold text-white">
                        {/* <div className="relative rounded-full">
                            <Flame
                                size={14}
                                className="text-orange-500 fill-red-300 mx-auto mb-1 "
                            />
                        </div> */}
                        {streakData.currentStreak || 0} 
                    </div>
                    <div className={`flex flex-row gap-1 items-center ${streakData.currentStreak > 10 ?"":"justify-center"}`}>
                        <div className={`relative rounded-full ${streakData.currentStreak > 10 ?"":"hidden"}` }>
                            <Flame
                                size={22}
                                className="text-orange-500 fill-red-300 mx-auto mb-1 "
                            />
                        </div>
                        {currentStreak}
                    </div>
                    <div className="text-white/60 text-[10px] leading-tight">
                        Current
                    </div>
                    <div className="text-white/60 text-[10px] leading-tight">
                        Streak
                    </div>
                </div>

                <div className="hidden bg-white/10 rounded-lg p-2 text-center">
                    <Target size={14} className="text-green-500 mx-auto mb-1" />
                    <div className="text-lg font-bold text-white">0</div>
                    <div className="text-white/60 text-xs leading-tight">
                        Best Streak
                    </div>
                </div>

                <div className="hidden bg-white/10 rounded-lg p-2 text-center">
                    <TrendingUp
                        size={14}
                        className="text-blue-500 mx-auto mb-1"
                    />
                    <div className="text-lg font-bold text-white">0</div>
                    <div className="text-white/60 text-xs leading-tight">
                        Total
                    </div>
                    <div className="text-white/60 text-xs leading-tight">
                        Sessions
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <div className=" flex flex-1 flex-col w-full">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-white text-sm font-medium">
                                Weekly Goal
                            </span>
                            <span className="text-white/80 text-sm font-medium">
                                {weeklyCycleCount}/{WEEKLY_GOAL}
                            </span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                            <div
                                className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
                                style={{
                                    width: `${Math.min(weeklyProgress, 100)}%`,
                                }}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-7 gap-1 mb-2 flex-shrink-0">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(
                            (day, index) => {
                                const today = new Date().getDay() // 0 = Sunday, 1 = Monday, etc.
                                const isToday = index === today

                                return (
                                    <div
                                        key={index}
                                        className="flex flex-col text-center py-1 font-medium"
                                    >
                                        <div
                                            className={`text-xs ${
                                                isToday
                                                    ? 'text-white'
                                                    : 'text-white/50'
                                            }`}
                                        >
                                            {day}
                                        </div>
                                        {index % 1 ==  0 ? (
                                            <div className="w-6 h-6 rounded-full bg-orange-600 flex justify-center items-center">
                                                <Flame
                                                    className="text-white/70 fill-orange-700"
                                                    size={18}
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-6 h-6 rounded-full bg-orange-500/20"></div>
                                        )}
                                    </div>
                                )
                            }
                        )}
                    </div>
                </div>
            </div>

            {/* Weekly Progress */}

            {/* Activity Calendar */}
            <div className="hidden flex-1 flex flex-col min-h-0">
                <div className="flex justify-between items-center mb-3 flex-shrink-0">
                    <h3 className="text-white text-sm font-medium">
                        Activity Calendar
                    </h3>
                    <Calendar size={12} className="text-white/60" />
                </div>

                {/* Days of week header */}
                <div className="grid grid-cols-7 gap-1 mb-2 flex-shrink-0">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                        <div
                            key={index}
                            className="text-center text-white/50 text-xs py-1 font-medium"
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-2">
                    {calendarDays.map((day, index) => (
                        <div
                            key={index}
                            className={`
                                w-full h-8 rounded-md text-xs flex items-center justify-center font-medium
                                ${
                                    day === null
                                        ? ''
                                        : day.isToday
                                        ? 'bg-orange-500 text-white shadow-lg'
                                        : day.hasSession
                                        ? 'bg-orange-500/70 text-white'
                                        : 'bg-white/10 text-white/50 hover:bg-white/20'
                                }
                                transition-all duration-200
                            `}
                        >
                            {day?.day}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default StreakOverlay
