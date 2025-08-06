// useGlobalShortcuts.js - Updated Hook
import { useEffect, useState } from 'react'

const useGlobalShortcuts = () => {
    const [hyperMode, setHyperMode] = useState(false)

    useEffect(() => {
        console.log('useGlobalShortcuts effect running')

        // Check if we're in Electron environment with context bridge
        if (typeof window !== 'undefined' && window.electronAPI) {
            const handleToggleHyperMode = (event, data) => {
                setHyperMode((prev) => {
                    const newValue = !prev
                    return newValue
                })
            }

            const cleanup = window.electronAPI.onToggleHyperMode(
                handleToggleHyperMode
            )

            // Return cleanup function
            return cleanup
        } else {
            console.log(
                'electronAPI not available - not in Electron context or context bridge not working'
            )
        }
    }, [])

    return {
        hyperMode,
    }
}

export default useGlobalShortcuts
