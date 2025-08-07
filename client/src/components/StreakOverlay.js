import React, { useState } from 'react'
import { X, Eye, Flame, Calendar, Target, TrendingUp } from 'lucide-react'

const StreakOverlay = () => {
    const [isClickThrough, setIsClickThrough] = useState(false)
    const [streakData] = useState({
        currentStreak: 7,
        longestStreak: 15,
        totalSessions: 142,
        weeklyGoal: 25,
        completedThisWeek: 18
    })

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

    // Generate calendar for current month
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
    const weeklyProgress = (streakData.completedThisWeek / streakData.weeklyGoal) * 100

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
                padding: '16px',
                height: '100vh',
                maxHeight: '100vh',
            }}
        >
            {/* Header */}
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <Flame size={16} className="text-orange-500" />
                    <h2 className="text-white text-base font-semibold">Streak Tracker</h2>
                </div>

                <div className="flex space-x-2">
                    <button
                        onClick={toggleClickThrough}
                        className={`w-6 h-6 rounded-full transition-all flex items-center justify-center ${isClickThrough
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
                        className="w-6 h-6 rounded-full bg-red-500 bg-opacity-20 hover:bg-opacity-40 text-red-400 hover:text-red-300 transition-all flex items-center justify-center"
                        style={{ WebkitAppRegion: 'no-drag' }}
                        title="Close Overlay"
                    >
                        <X size={10} />
                    </button>
                </div>
            </div>

            {/* Compact Stats Cards */}
            <div className="grid grid-cols-3 gap-2 mb-6 flex-shrink-0">
                <div className="bg-white/10 rounded-lg p-2 text-center">
                    <Flame size={14} className="text-orange-500 mx-auto mb-1" />
                    <div className="text-lg font-bold text-white">{streakData.currentStreak}</div>
                    <div className="text-white/60 text-xs leading-tight">Current</div>
                    <div className="text-white/60 text-xs leading-tight">Streak</div>
                </div>

                <div className="bg-white/10 rounded-lg p-2 text-center">
                    <Target size={14} className="text-green-500 mx-auto mb-1" />
                    <div className="text-lg font-bold text-white">{streakData.longestStreak}</div>
                    <div className="text-white/60 text-xs leading-tight">Best Streak</div>
                </div>

                <div className="bg-white/10 rounded-lg p-2 text-center">
                    <TrendingUp size={14} className="text-blue-500 mx-auto mb-1" />
                    <div className="text-lg font-bold text-white">{streakData.totalSessions}</div>
                    <div className="text-white/60 text-xs leading-tight">Total</div>
                    <div className="text-white/60 text-xs leading-tight">Sessions</div>
                </div>
            </div>

            {/* Weekly Progress */}
            <div className="mb-6 flex-shrink-0">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-white text-sm font-medium">Weekly Goal</span>
                    <span className="text-white/80 text-sm font-medium">
                        {streakData.completedThisWeek}/{streakData.weeklyGoal}
                    </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                        className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(weeklyProgress, 100)}%` }}
                    />
                </div>
            </div>

            {/* Activity Calendar */}
            <div className="flex-1 flex flex-col min-h-0">
                <div className="flex justify-between items-center mb-3 flex-shrink-0">
                    <h3 className="text-white text-sm font-medium">Activity Calendar</h3>
                    <Calendar size={12} className="text-white/60" />
                </div>

                {/* Days of week header */}
                <div className="grid grid-cols-7 gap-1 mb-2 flex-shrink-0">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                        <div key={index} className="text-center text-white/50 text-xs py-1 font-medium">
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
                                ${day === null ? '' :
                                    day.isToday ? 'bg-orange-500 text-white shadow-lg' :
                                        day.hasSession ? 'bg-orange-500/70 text-white' :
                                            'bg-white/10 text-white/50 hover:bg-white/20'
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


