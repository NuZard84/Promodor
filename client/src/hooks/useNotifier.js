import { useCallback } from 'react'

// Provides a single notification API for renderer code.
// Prefers Electron main-process notifications via preload (window.electronAPI.showNotification)
// and falls back to the Web Notification API.
export default function useNotifier() {
    const notify = useCallback((title, body, options = {}) => {
        try {
            const payload = { title, body, ...options }

            if (
                typeof window !== 'undefined' &&
                window.electronAPI &&
                typeof window.electronAPI.showNotification === 'function'
            ) {
                window.electronAPI.showNotification(payload)
                return
            }

            if (typeof window !== 'undefined' && 'Notification' in window) {
                if (Notification.permission === 'granted') {
                    new Notification(title, { body, ...options })
                } else if (Notification.permission !== 'denied') {
                    Notification.requestPermission().then((permission) => {
                        if (permission === 'granted') {
                            new Notification(title, { body, ...options })
                        }
                    })
                }
            }
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Notification error:', error)
        }
    }, [])

    return notify
}


