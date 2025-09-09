const { contextBridge, ipcRenderer } = require('electron')

console.log('Preload script loaded')

contextBridge.exposeInMainWorld('electronAPI', {
    // Window controls
    openMainWindow: () => {
        console.log('openMainWindow called')
        return ipcRenderer.invoke('open-main-window')
    },
    closeOverlay: () => {
        console.log('closeOverlay called')
        return ipcRenderer.invoke('close-overlay')
    },
    createOverlay: () => ipcRenderer.invoke('create-overlay'),

    // Overlay controls
    toggleClickThrough: (enabled) => {
        console.log('toggleClickThrough called with:', enabled)
        return ipcRenderer.invoke('toggle-click-through', enabled)
    },

    // Timer controls
    toggleTimer: () => ipcRenderer.send('toggle-timer'),
    resetTimer: () => ipcRenderer.send('reset-timer'),

    // Notes overlay controls
    createNotesOverlay: () => {
        console.log('createNotesOverlay called')
        return ipcRenderer.invoke('create-notes-overlay')
    },
    closeNotesOverlay: () => {
        console.log('closeNotesOverlay called')
        return ipcRenderer.invoke('close-notes-overlay')
    },
    toggleHyperMode: () => ipcRenderer.invoke('toggle-hyper-mode'),
    toggleSuperHyperMode: () => ipcRenderer.invoke('toggle-super-hyper-mode'),

    // Listen for shortcut events from main process
    onToggleHyperMode: (callback) => {
        ipcRenderer.on('toggle-hyper-mode', callback)

        // Return cleanup function
        return () => {
            ipcRenderer.removeListener('toggle-hyper-mode', callback)
        }
    },
    onToggleSuperHyperMode: (callback) => {
        ipcRenderer.on('toggle-super-hyper-mode', callback)

        // Return cleanup function
        return () => {
            ipcRenderer.removeListener('toggle-super-hyper-mode', callback)
        }
    },
    onToggleTimer: (callback) => {
        ipcRenderer.on('toggle-timer', callback)

        // Return cleanup function
        return () => {
            ipcRenderer.removeListener('toggle-timer', callback)
        }
    },
    onResetTimer: (callback) => {
        ipcRenderer.on('reset-timer', callback)

        // Return cleanup function
        return () => {
            ipcRenderer.removeListener('reset-timer', callback)
        }
    },
    onSetMode: (callback) => {
        ipcRenderer.on('set-mode', callback)

        // Return cleanup function
        return () => {
            ipcRenderer.removeListener('set-mode', callback)
        }
    },
    // Notifications
    showNotification: (options) =>
        ipcRenderer.invoke('show-notification', options),
    toggleNotesOverlay: () => ipcRenderer.invoke('toggle-notes-overlay'),
    
    // Feature flags
    updateFeatureFlag: (flagName, value) => 
        ipcRenderer.invoke('update-feature-flag', flagName, value),
    
    // Listen for events from main process
    onShortcut: (channel, callback) => {
        ipcRenderer.on(channel, callback)

        return () => {
            ipcRenderer.removeListener(channel, callback)
        }
    },
    createStreakOverlay: () => {
        console.log('createStreakOverlay called from preload')
        return ipcRenderer.invoke('create-streak-overlay')
    },
    closeStreakOverlay: () => {
        console.log('closeStreakOverlay called from preload')
        return ipcRenderer.invoke('close-streak-overlay')
    },
    toggleStreakOverlay: () => {
        console.log('toggleStreakOverlay called from preload')
        return ipcRenderer.invoke('toggle-streak-overlay')
    },

    sendOverlaySize: (size) => ipcRenderer.send('overlay-size', size),

    // Window controls for main window
    minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
    maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
    closeWindow: () => ipcRenderer.invoke('close-window'),
    quit: () => ipcRenderer.invoke('quit-app'),
})

console.log('electronAPI exposed to window')
