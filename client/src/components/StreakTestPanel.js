import React, { useState, useEffect } from 'react'
import {
    getCurrentStreak,
    getStreakFreezes,
    getStreakProtectionStatus,
    addStreakFreeze,
    consumeStreakFreeze,
    resetAllStreakData,
    markTodayComplete,
} from '../utils/streak'

const StreakTestPanel = () => {
    const [currentStreak, setCurrentStreak] = useState(0)
    const [streakFreezes, setStreakFreezes] = useState(0)
    const [protectionStatus, setProtectionStatus] = useState({})

    const refreshData = () => {
        setCurrentStreak(getCurrentStreak())
        setStreakFreezes(getStreakFreezes())
        setProtectionStatus(getStreakProtectionStatus())
    }

    useEffect(() => {
        refreshData()
        const interval = setInterval(refreshData, 1000)
        return () => clearInterval(interval)
    }, [])

    const handleAddFreeze = () => {
        addStreakFreeze(1)
        refreshData()
    }

    const handleUseFreeze = () => {
        consumeStreakFreeze()
        refreshData()
    }

    const handleCompleteToday = () => {
        markTodayComplete()
        refreshData()
    }

    const handleResetAll = () => {
        resetAllStreakData()
        refreshData()
    }

    return (
        <div className="p-4 bg-gray-900 text-white rounded-lg max-w-md">
            <h3 className="text-lg font-bold mb-4">Streak Test Panel</h3>
            
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-800 p-3 rounded">
                        <div className="text-2xl font-bold text-orange-500">{currentStreak}</div>
                        <div className="text-sm text-gray-400">Current Streak</div>
                    </div>
                    <div className="bg-gray-800 p-3 rounded">
                        <div className="text-2xl font-bold text-blue-500">{streakFreezes}</div>
                        <div className="text-sm text-gray-400">Freezes</div>
                    </div>
                </div>

                <div className="bg-gray-800 p-3 rounded">
                    <div className="text-sm font-semibold mb-2">Protection Status:</div>
                    <div className="space-y-1 text-xs">
                        <div>Grace Period: {protectionStatus.hasGracePeriod ? '✅ Available' : '❌ Unavailable'}</div>
                        <div>Streak Freeze: {protectionStatus.hasStreakFreeze ? '✅ Available' : '❌ Unavailable'}</div>
                        <div>Protected: {protectionStatus.isProtected ? '✅ Yes' : '❌ No'}</div>
                    </div>
                </div>

                <div className="space-y-2">
                    <button
                        onClick={handleCompleteToday}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
                    >
                        Complete Today
                    </button>
                    <button
                        onClick={handleAddFreeze}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                    >
                        Add Streak Freeze
                    </button>
                    <button
                        onClick={handleUseFreeze}
                        disabled={streakFreezes === 0}
                        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white py-2 px-4 rounded"
                    >
                        Use Streak Freeze
                    </button>
                    <button
                        onClick={handleResetAll}
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
                    >
                        Reset All Data
                    </button>
                </div>

                <div className="bg-gray-800 p-3 rounded text-xs">
                    <div className="font-semibold mb-2">How it works:</div>
                    <ul className="space-y-1 text-gray-400">
                        <li>• 24-hour grace period for missed days</li>
                        <li>• Earn 1 freeze every 7 days of streak</li>
                        <li>• Max 2 freezes at a time</li>
                        <li>• Freezes consumed automatically when needed</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default StreakTestPanel 