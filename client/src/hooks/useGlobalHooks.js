// useGlobalShortcuts.js - Updated Hook
import { useCallback, useEffect, useState } from 'react'

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

    const enableHyperMode = useCallback(() => {
        console.log('Enabling hyperMode')
        setHyperMode(true)
    }, [])

    const disableHyperMode = useCallback(() => {
        console.log('Disabling hyperMode')
        setHyperMode(false)
    }, [])

    const toggleHyperMode = useCallback(() => {
        setHyperMode((prev) => {
            const newValue = !prev
            console.log(
                'Manual toggle: Hypermode changing from',
                prev,
                'to',
                newValue
            )
            return newValue
        })
    }, [])
    return {
        hyperMode,
        enableHyperMode, // For testing
        disableHyperMode,
        toggleHyperMode,
    }
}

export default useGlobalShortcuts
