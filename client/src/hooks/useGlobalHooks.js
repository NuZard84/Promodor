// useGlobalShortcuts.js - Updated Hook
import { useCallback, useEffect, useState } from 'react'

const useGlobalShortcuts = () => {
    const [hyperMode, setHyperMode] = useState(false)
    const [superHyperMode, setSuperHyperMode] = useState(false)

    useEffect(() => {
        console.log('useGlobalShortcuts effect running')

        // Check if we're in Electron environment with context bridge
        if (typeof window !== 'undefined' && window.electronAPI) {
            const handleToggleHyperMode = (event, data) => {
                setHyperMode((prev) => {
                    const newValue = !prev
                    // If turning off hyper mode, also turn off super hyper mode
                    if (!newValue) {
                        setSuperHyperMode(false)
                    }
                    return newValue
                })
            }

            const handleToggleSuperHyperMode = (event, data) => {
                setSuperHyperMode((prev) => {
                    const newValue = !prev
                    // If turning on super hyper mode, also turn on hyper mode
                    if (newValue) {
                        setHyperMode(true)
                    }
                    return newValue
                })
            }

            const cleanup1 = window.electronAPI.onToggleHyperMode(
                handleToggleHyperMode
            )
            const cleanup2 = window.electronAPI.onToggleSuperHyperMode(
                handleToggleSuperHyperMode
            )

            // Return cleanup function
            return () => {
                cleanup1()
                cleanup2()
            }
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
        setSuperHyperMode(false)
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
            if (!newValue) {
                setSuperHyperMode(false)
            }
            return newValue
        })
    }, [])

    const toggleSuperHyperMode = useCallback(() => {
        setSuperHyperMode((prev) => {
            const newValue = !prev
            console.log(
                'Manual toggle: Super hyper mode changing from',
                prev,
                'to',
                newValue
            )
            if (newValue) {
                setHyperMode(true)
            }
            return newValue
        })
    }, [])

    return {
        hyperMode,
        superHyperMode,
        enableHyperMode, // For testing
        disableHyperMode,
        toggleHyperMode,
        toggleSuperHyperMode,
    }
}

export default useGlobalShortcuts
