const {
    app,
    BrowserWindow,
    ipcMain,
    globalShortcut,
    Notification,
    Menu,
} = require('electron')
const path = require('path')
const isDev = require('electron-is-dev')
const fs = require('fs')

// Add this flag at the top after isDev
const SHOW_DEVTOOLS_IN_PRODUCTION = false // Set to true to enable DevTools in production

// Function to load feature flags
const loadFeatureFlags = () => {
    try {
        const featureFlagsPath = isDev 
            ? path.join(__dirname, 'client/src/featureFlags.js')
            : path.join(__dirname, 'client/build/static/js/featureFlags.js')
        
        console.log('Loading feature flags from:', featureFlagsPath)
        
        // For now, we'll use a simple approach and read the JavaScript file
        if (isDev) {
            const content = fs.readFileSync(featureFlagsPath, 'utf8')
            console.log('Feature flags file content:', content)
            // Simple regex to extract the closeAllWithMain value
            const match = content.match(/closeAllWithMain:\s*(true|false)/)
            const result = match ? match[1] === 'true' : true // default to true
            console.log('Feature flag closeAllWithMain:', result)
            return result
        }
        return true // default to true in production
    } catch (error) {
        console.error('Error loading feature flags:', error)
        return true // default to true on error
    }
}

// Function to update feature flags
const updateFeatureFlag = (flagName, value) => {
    try {
        const featureFlagsPath = isDev 
            ? path.join(__dirname, 'client/src/featureFlags.js')
            : path.join(__dirname, 'client/build/static/js/featureFlags.js')
        
        if (isDev && flagName === 'closeAllWithMain') {
            const content = fs.readFileSync(featureFlagsPath, 'utf8')
            const updatedContent = content.replace(
                /closeAllWithMain:\s*(true|false)/,
                `closeAllWithMain: ${value}`
            )
            fs.writeFileSync(featureFlagsPath, updatedContent, 'utf8')
            console.log(`Feature flag ${flagName} updated to ${value}`)
            return true
        }
        return false
    } catch (error) {
        console.error('Error updating feature flag:', error)
        return false
    }
}

let mainWindow
let overlayWindow = null
let notesOverlayWindow = null
let streakOverlayWindow = null

// At the top of main.js, add better path resolution
const getPreloadPath = () => {
    const preloadPath = path.join(__dirname, 'preload.js')
    console.log('Preload path:', preloadPath)
    console.log('Preload exists:', require('fs').existsSync(preloadPath))
    return preloadPath
}

const preloadPath = getPreloadPath()

function createWindow() {
    // Platform-specific configurations
    const platformConfig = {
        darwin: {
            vibrancy: 'under-window',
            visualEffectState: 'active',
            titleBarStyle: 'hiddenInset',
        },
        win32: {
            visualEffectState: 'active',
            titleBarStyle: 'hidden',
        },
        linux: {
            visualEffectState: 'active',
            titleBarStyle: 'hidden',
        },
    }

    const currentPlatform = process.platform
    const platformSettings = platformConfig[currentPlatform] || {}

    // Create the main browser window
    mainWindow = new BrowserWindow({
        width: 1300,
        height: 775,
        frame: false, // Remove default frame for custom title bar
        transparent: false,
        backgroundColor: '#f8fafc',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: preloadPath,
            // Enable hardware acceleration for better performance
            enableWebGL: true,
            experimentalFeatures: true,
        },
        show: false,
        icon: path.join(__dirname, 'assets/icon.png'),
        // Platform-specific settings
        ...platformSettings,
        // Additional settings for better appearance
        hasShadow: true,
        titleBarStyle: 'hidden',
        minWidth: 1300,
        minHeight: 775,
    })

    // Load the index.html from React app
    const startUrl = isDev
        ? 'http://localhost:3000'
        : `file://${path.join(__dirname, 'client/build/index.html')}`

    console.log('Loading main window URL:', startUrl)
    mainWindow.loadURL(startUrl)

    // Show window when ready
    mainWindow.once('ready-to-show', () => {
        mainWindow.show()
        // Ensure transparency is properly set after window is shown
        mainWindow.setBackgroundColor('#00000000')

        // Debug: Log window settings
        console.log('Main window created with settings:', {
            transparent: mainWindow.isVisible(),
            backgroundColor: mainWindow.getBackgroundColor(),
            platform: process.platform,
            vibrancy:
                process.platform === 'darwin'
                    ? 'under-window'
                    : 'not supported',
        })
    })

    // Open DevTools if in development mode
    if (isDev || SHOW_DEVTOOLS_IN_PRODUCTION) {
        mainWindow.webContents.openDevTools()
    }

    mainWindow.on('closed', () => {
        // Check feature flag to determine if overlays should close with main app
        const shouldCloseAllWithMain = loadFeatureFlags()
        
        if (shouldCloseAllWithMain) {
            // Original behavior: close all overlays when main app closes
            if (overlayWindow) {
                overlayWindow.close()
            }
            if (notesOverlayWindow) {
                closeNotesOverlayWindow()
            }
            if (streakOverlayWindow) {
                closeStreakOverlayWindow()
            }
        } else {
            // New behavior: keep overlays open when main app closes
            console.log('Feature flag set to keep overlays open when main app closes')
            // Just set mainWindow to null without closing overlays
        }
        
        mainWindow = null
    })

    // Set up the menu
    createMenu()
}

function createOverlayWindow() {
    const preloadPath = path.join(__dirname, 'preload.js')
    console.log('Creating overlay with preload:', preloadPath)
    console.log('Preload exists:', require('fs').existsSync(preloadPath))

    overlayWindow = new BrowserWindow({
        width: 214,
        height: 286,
        alwaysOnTop: true,
        skipTaskbar: true,
        resizable: false,
        movable: true,
        frame: false,
        transparent: true,
        backgroundColor: '#00000000',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: preloadPath,
            enableWebGL: true,
            experimentalFeatures: true,
        },
        hasShadow: false,
        thickFrame: false,
    })

    const startUrl = isDev
        ? 'http://localhost:3000#overlay'
        : `file://${path.join(__dirname, 'client/build/index.html')}#overlay`

    console.log('Loading overlay URL:', startUrl)
    overlayWindow.loadURL(startUrl)

    // Add DevTools back for debugging
    if (isDev || SHOW_DEVTOOLS_IN_PRODUCTION) {
        overlayWindow.webContents.openDevTools()
    }

    overlayWindow.once('ready-to-show', () => {
        overlayWindow.show()
        overlayWindow.setBackgroundColor('#00000000')

        // Add debugging after window is ready
        overlayWindow.webContents.executeJavaScript(`
            console.log('Window electronAPI:', typeof window.electronAPI);
            console.log('Available methods:', window.electronAPI ? Object.keys(window.electronAPI) : 'none');
        `)
    })

    overlayWindow.on('closed', () => {
        overlayWindow = null
    })
}

function closeOverlayWindow() {
    if (overlayWindow) {
        overlayWindow.close()
        overlayWindow = null
    }
}

function createNotesOverlayWindow() {
    // If window exists, just show it
    if (notesOverlayWindow) {
        notesOverlayWindow.show()
        notesOverlayWindow.focus()
        return
    }

    const platformConfig = {
        darwin: {
            visualEffectState: 'active',
        },
        win32: {
            visualEffectState: 'active',
        },
        linux: {
            visualEffectState: 'active',
        },
    }

    const currentPlatform = process.platform
    const platformSettings = platformConfig[currentPlatform] || {}

    notesOverlayWindow = new BrowserWindow({
        width: 270,
        height: 400,
        alwaysOnTop: true,
        skipTaskbar: true,
        resizable: true,
        movable: true,
        frame: false,
        transparent: true,
        backgroundColor: '#00000000',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: preloadPath,
            enableWebGL: true,
            experimentalFeatures: true,
        },
        ...platformSettings,
        hasShadow: false,
        thickFrame: false,
        maxWidth: 500,
        maxHeight: 600,
    })

    // Fix the URL loading for production
    const startUrl = isDev
        ? 'http://localhost:3000#notes-overlay'
        : `file://${path.join(
            __dirname,
            'client/build/index.html'
        )}#notes-overlay`

    console.log('Loading notes overlay URL:', startUrl)
    notesOverlayWindow.loadURL(startUrl)

    if (isDev || SHOW_DEVTOOLS_IN_PRODUCTION) {
        notesOverlayWindow.webContents.openDevTools()
    }

    notesOverlayWindow.once('ready-to-show', () => {
        notesOverlayWindow.show()
        notesOverlayWindow.setBackgroundColor('#00000000')

        console.log('Notes overlay window created with settings:', {
            transparent: notesOverlayWindow.isVisible(),
            backgroundColor: notesOverlayWindow.getBackgroundColor(),
            platform: process.platform,
        })
    })

    notesOverlayWindow.on('closed', () => {
        notesOverlayWindow = null
    })
}

function closeNotesOverlayWindow() {
    if (notesOverlayWindow) {
        notesOverlayWindow.close()
        notesOverlayWindow = null
    }
}

function closeStreakOverlayWindow() {
    if (streakOverlayWindow) {
        streakOverlayWindow.close()
        streakOverlayWindow = null
    }
}

function createMenu() {
    const template = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'New Session',
                    accelerator: 'CmdOrCtrl+N',
                    click: () => {
                        mainWindow.webContents.send('new-session')
                    },
                },
                {
                    label: 'Toggle Overlay Mode',
                    accelerator: 'CmdOrCtrl+Shift+O',
                    click: () => {
                        if (overlayWindow) {
                            closeOverlayWindow()
                        } else {
                            createOverlayWindow()
                        }
                    },
                },
                {
                    label: 'Toggle Notes Overlay',
                    accelerator: 'CmdOrCtrl+Shift+N',
                    click: () => {
                        if (notesOverlayWindow) {
                            closeNotesOverlayWindow()
                        } else {
                            createNotesOverlayWindow()
                        }
                    },
                },
                {
                    label: 'Hide Window',
                    accelerator: 'CmdOrCtrl+Shift+H',
                    click: () => {
                        if (overlayWindow) {
                            overlayWindow.hide()
                        } else if (mainWindow) {
                            mainWindow.hide()
                        }
                    },
                },
                { type: 'separator' },
                {
                    label: 'Quit',
                    accelerator:
                        process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
                    click: () => {
                        app.quit()
                    },
                },
            ],
        },
        {
            label: 'Timer',
            submenu: [
                {
                    label: 'Start/Pause',
                    accelerator: 'Space',
                    click: () => {
                        mainWindow.webContents.send('toggle-timer')
                    },
                },
                {
                    label: 'Reset',
                    accelerator: 'CmdOrCtrl+R',
                    click: () => {
                        mainWindow.webContents.send('reset-timer')
                    },
                },
                {
                    label: 'Focus Mode',
                    accelerator: 'CmdOrCtrl+1',
                    click: () => {
                        mainWindow.webContents.send('switch-mode', 'focus')
                    },
                },
                {
                    label: 'Short Break',
                    accelerator: 'CmdOrCtrl+2',
                    click: () => {
                        mainWindow.webContents.send('switch-mode', 'shortBreak')
                    },
                },
                {
                    label: 'Long Break',
                    accelerator: 'CmdOrCtrl+3',
                    click: () => {
                        mainWindow.webContents.send('switch-mode', 'longBreak')
                    },
                },
            ],
        },
        {
            label: 'View',
            submenu: [
                {
                    label: 'Toggle Focus Mode',
                    accelerator: 'CmdOrCtrl+Shift+F',
                    click: () => {
                        toggleFocusMode()
                    },
                },
                {
                    label: 'Toggle Super Hyper Mode',
                    accelerator: 'CmdOrCtrl+Shift+X',
                    click: () => {
                        if (overlayWindow && !overlayWindow.isDestroyed()) {
                            overlayWindow.webContents.send('toggle-super-hyper-mode')
                        }
                        if (notesOverlayWindow && !notesOverlayWindow.isDestroyed()) {
                            notesOverlayWindow.webContents.send('toggle-super-hyper-mode')
                        }
                        if (mainWindow && !mainWindow.isDestroyed()) {
                            mainWindow.webContents.send('toggle-super-hyper-mode')
                        }
                    },
                },
                {
                    label: 'Always on Top',
                    type: 'checkbox',
                    click: (menuItem) => {
                        mainWindow.setAlwaysOnTop(menuItem.checked)
                    },
                },
                { type: 'separator' },
                {
                    label: 'Reload',
                    accelerator: 'CmdOrCtrl+R',
                    click: () => {
                        mainWindow.reload()
                    },
                },
                {
                    label: 'Toggle Developer Tools',
                    accelerator:
                        process.platform === 'darwin'
                            ? 'Alt+Cmd+I'
                            : 'Ctrl+Shift+I',
                    click: () => {
                        mainWindow.webContents.toggleDevTools()
                    },
                },
            ],
        },
        {
            label: 'Window',
            submenu: [
                {
                    label: 'Minimize',
                    accelerator: 'CmdOrCtrl+M',
                    click: () => {
                        mainWindow.minimize()
                    },
                },
                {
                    label: 'Close',
                    accelerator: 'CmdOrCtrl+W',
                    click: () => {
                        mainWindow.close()
                    },
                },
            ],
        },
    ]

    if (process.platform === 'darwin') {
        template.unshift({
            label: app.getName(),
            submenu: [
                {
                    label: 'About ' + app.getName(),
                    role: 'about',
                },
                { type: 'separator' },
                {
                    label: 'Services',
                    role: 'services',
                    submenu: [],
                },
                { type: 'separator' },
                {
                    label: 'Hide ' + app.getName(),
                    accelerator: 'Command+H',
                    role: 'hide',
                },
                {
                    label: 'Hide Others',
                    accelerator: 'Command+Shift+H',
                    role: 'hideothers',
                },
                {
                    label: 'Show All',
                    role: 'unhide',
                },
                { type: 'separator' },
                {
                    label: 'Quit',
                    accelerator: 'Command+Q',
                    click: () => {
                        app.quit()
                    },
                },
            ],
        })
    }

    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
}

function toggleFocusMode() {
    if (mainWindow.isKiosk()) {
        mainWindow.setKiosk(false)
        mainWindow.setMenuBarVisibility(true)
    } else {
        mainWindow.setKiosk(true)
        mainWindow.setMenuBarVisibility(false)
    }
}

function registerGlobalShortcuts() {
    // Global shortcuts for overlay mode
    globalShortcut.register('CmdOrCtrl+Shift+P', () => {
        if (overlayWindow) {
            overlayWindow.webContents.send('toggle-timer')
        } else if (mainWindow) {
            mainWindow.webContents.send('toggle-timer')
        }
    })

    // Add global shortcut for click-through toggle
    globalShortcut.register('CmdOrCtrl+Shift+C', () => {
        if (overlayWindow) {
            overlayWindow.webContents.executeJavaScript(`
        if (window.toggleClickThroughFromShortcut) {
          window.toggleClickThroughFromShortcut();
        }
      `)
        }
    })

    globalShortcut.register('CmdOrCtrl+Shift+H', () => {
        if (overlayWindow) {
            overlayWindow.hide()
        } else if (mainWindow) {
            mainWindow.hide()
        }
    })

    globalShortcut.register('CmdOrCtrl+Shift+S', () => {
        if (overlayWindow) {
            overlayWindow.show()
        } else if (mainWindow) {
            mainWindow.show()
        }
    })

    globalShortcut.register('CmdOrCtrl+Shift+O', () => {
        if (overlayWindow) {
            closeOverlayWindow()
        } else {
            createOverlayWindow()
        }
    })

    // Focus mode toggle
    globalShortcut.register('CmdOrCtrl+Alt+F', () => {
        if (mainWindow) {
            toggleFocusMode()
        }
    })

    globalShortcut.register('CmdOrCtrl+Shift+N', () => {
        toggleNotesOverlay()
    })
    globalShortcut.register('CmdOrCtrl+Shift+A', () => {
        console.log('Hypermode shortcut triggered!')

        // Send to all windows that might be listening
        if (overlayWindow && !overlayWindow.isDestroyed()) {
            console.log('Sending to overlay window')
            overlayWindow.webContents.send('toggle-hyper-mode')
        }
        if (notesOverlayWindow && !notesOverlayWindow.isDestroyed()) {
            console.log('Sending to notes overlay window')
            notesOverlayWindow.webContents.send('toggle-hyper-mode')
        }
        if (mainWindow && !mainWindow.isDestroyed()) {
            console.log('Sending to main window')
            mainWindow.webContents.send('toggle-hyper-mode')
        }

        // Debug: Check which windows are available
        console.log('Windows status:', {
            overlay: overlayWindow ? 'exists' : 'null',
            notesOverlay: notesOverlayWindow ? 'exists' : 'null',
            main: mainWindow ? 'exists' : 'null',
        })
    })

    // Super hyper mode shortcut
    globalShortcut.register('CmdOrCtrl+Shift+X', () => {
        console.log('Super hyper mode shortcut triggered!')

        // Send to all windows that might be listening
        if (overlayWindow && !overlayWindow.isDestroyed()) {
            console.log('Sending super hyper mode to overlay window')
            overlayWindow.webContents.send('toggle-super-hyper-mode')
        }
        if (notesOverlayWindow && !notesOverlayWindow.isDestroyed()) {
            console.log('Sending super hyper mode to notes overlay window')
            notesOverlayWindow.webContents.send('toggle-super-hyper-mode')
        }
        if (mainWindow && !mainWindow.isDestroyed()) {
            console.log('Sending super hyper mode to main window')
            mainWindow.webContents.send('toggle-super-hyper-mode')
        }
    })
}

// IPC handlers
ipcMain.handle('create-overlay', () => {
    createOverlayWindow()
})

ipcMain.handle('close-overlay', () => {
    closeOverlayWindow()
})

ipcMain.handle('toggle-always-on-top', (event, enabled) => {
    if (overlayWindow) {
        overlayWindow.setAlwaysOnTop(enabled, 'floating')
    }
    if (mainWindow) {
        mainWindow.setAlwaysOnTop(enabled)
    }
})

ipcMain.handle('toggle-click-through', (event, enabled) => {
    console.log('IPC: toggle-click-through called with:', enabled)
    if (overlayWindow) {
        overlayWindow.setIgnoreMouseEvents(enabled, { forward: true })
    }
    if (notesOverlayWindow) {
        notesOverlayWindow.setIgnoreMouseEvents(enabled, { forward: true })
    }
})

ipcMain.handle('show-notification', (event, options) => {
    try {
        console.log('IPC: show-notification', options)
        if (!Notification.isSupported()) {
            console.log('Notifications not supported on this platform/session')
            return false
        }

        const notification = new Notification({
            title: options?.title || 'Notification',
            body: options?.body || '',
            icon: path.join(__dirname, 'assets/icon.png'),
            // use Electron's silent flag; there is no sound option
            silent: false,
        })

        notification.show()

        notification.on('click', () => {
            if (mainWindow) {
                mainWindow.focus()
            }
        })
        return true
    } catch (err) {
        console.log('Error showing notification:', err)
        return false
    }
})

ipcMain.handle('suppress-notifications', (event, suppress) => {
    // In a real implementation, you would integrate with the system's
    // Do Not Disturb functionality here
    console.log(`Notifications ${suppress ? 'suppressed' : 'enabled'}`)
})

ipcMain.handle('get-app-version', () => {
    return app.getVersion()
})

ipcMain.handle('minimize-to-tray', () => {
    if (mainWindow) {
        mainWindow.hide()
    }
})

// Add new IPC handler for opening main window
ipcMain.handle('open-main-window', () => {
    console.log('IPC: open-main-window called')
    if (!mainWindow) {
        console.log('Creating new main window')
        createWindow()
    } else {
        console.log('Showing existing main window')
        mainWindow.show()
        mainWindow.focus()
    }
})

// Add IPC handlers for notes overlay
ipcMain.handle('create-notes-overlay', () => {
    console.log('IPC: create-notes-overlay called')
    if (!notesOverlayWindow) {
        console.log('Creating new notes overlay')
        createNotesOverlayWindow()
    } else {
        console.log('Showing existing notes overlay')
        notesOverlayWindow.show()
        notesOverlayWindow.focus()
    }
})
// Add this function after createNotesOverlayWindow
function toggleNotesOverlay() {
    if (notesOverlayWindow) {
        if (notesOverlayWindow.isVisible()) {
            notesOverlayWindow.hide()
        } else {
            notesOverlayWindow.show()
            notesOverlayWindow.focus()
        }
    } else {
        createNotesOverlayWindow()
    }
}

ipcMain.handle('toggle-hyper-mode', () => {
    console.log('Manual hypermode toggle from renderer')

    // Send to all windows that might be listening
    if (overlayWindow && !overlayWindow.isDestroyed()) {
        overlayWindow.webContents.send('toggle-hyper-mode')
    }
    if (notesOverlayWindow && !notesOverlayWindow.isDestroyed()) {
        notesOverlayWindow.webContents.send('toggle-hyper-mode')
    }
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('toggle-hyper-mode')
    }

    return true
})

ipcMain.handle('toggle-super-hyper-mode', () => {
    console.log('Manual super hyper mode toggle from renderer')

    // Send to all windows that might be listening
    if (overlayWindow && !overlayWindow.isDestroyed()) {
        overlayWindow.webContents.send('toggle-super-hyper-mode')
    }
    if (notesOverlayWindow && !notesOverlayWindow.isDestroyed()) {
        notesOverlayWindow.webContents.send('toggle-super-hyper-mode')
    }
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('toggle-super-hyper-mode')
    }

    return true
})

// Add this with your other IPC handlers
ipcMain.handle('toggle-notes-overlay', () => {
    toggleNotesOverlay()
})

ipcMain.handle('close-notes-overlay', () => {
    console.log('IPC: close-notes-overlay called')
    closeNotesOverlayWindow()
})

// Window control handlers
ipcMain.handle('minimize-window', () => {
    if (mainWindow) {
        mainWindow.minimize()
    }
})

ipcMain.handle('maximize-window', () => {
    if (mainWindow) {
        if (mainWindow.isMaximized()) {
            mainWindow.unmaximize()
        } else {
            mainWindow.maximize()
        }
    }
})

ipcMain.handle('close-window', () => {
    if (mainWindow) {
        mainWindow.close()
    }
})

ipcMain.handle('quit-app', () => {
    app.quit()
})

// Add missing timer event listeners for overlay windows
ipcMain.on('toggle-timer', (event) => {
    // Forward to all windows
    if (mainWindow) {
        mainWindow.webContents.send('toggle-timer')
    }
    if (overlayWindow) {
        overlayWindow.webContents.send('toggle-timer')
    }
    if (notesOverlayWindow) {
        notesOverlayWindow.webContents.send('toggle-timer')
    }
})

ipcMain.on('reset-timer', (event) => {
    // Forward to all windows
    if (mainWindow) {
        mainWindow.webContents.send('reset-timer')
    }
    if (overlayWindow) {
        overlayWindow.webContents.send('reset-timer')
    }
    if (notesOverlayWindow) {
        notesOverlayWindow.webContents.send('reset-timer')
    }
})

// Add these IPC handlers with your existing ones
ipcMain.handle('create-streak-overlay', () => {
    console.log('IPC: create-streak-overlay called')
    createStreakOverlayWindow()
})

ipcMain.handle('close-streak-overlay', () => {
    console.log('IPC: close-streak-overlay called')
    closeStreakOverlayWindow()
})

ipcMain.handle('toggle-streak-overlay', () => {
    console.log('IPC: toggle-streak-overlay called')
    if (streakOverlayWindow && !streakOverlayWindow.isDestroyed()) {
        if (streakOverlayWindow.isVisible()) {
            streakOverlayWindow.hide()
        } else {
            streakOverlayWindow.show()
        }
    } else {
        createStreakOverlayWindow()
    }
})

// Feature flag update handler
ipcMain.handle('update-feature-flag', (event, flagName, value) => {
    console.log(`IPC: update-feature-flag called with ${flagName} = ${value}`)
    return updateFeatureFlag(flagName, value)
})
// Replace your createStreakOverlayWindow function with this improved version
function createStreakOverlayWindow() {
    console.log('Creating streak overlay window...')
    if (streakOverlayWindow && !streakOverlayWindow.isDestroyed()) {
        console.log('Streak overlay already exists, focusing...')
        streakOverlayWindow.focus()
        streakOverlayWindow.show()
        return
    }

    const { screen } = require('electron')
    const primaryDisplay = screen.getPrimaryDisplay()
    const { width: screenWidth, height: screenHeight } =
        primaryDisplay.workAreaSize

    const bottomPadding = 20

    // Start tiny — will resize after render
    streakOverlayWindow = new BrowserWindow({
        width: 200,
        height: 100,
        x: Math.round((screenWidth - 200) / 2),
        y: screenHeight - 100 - bottomPadding,
        frame: false,
        transparent: true,
        alwaysOnTop: false,
        skipTaskbar: true,
        resizable: false,
        movable: false,
        minimizable: false,
        maximizable: false,
        closable: true,
        backgroundColor: '#00000000',
        webPreferences: {
            preload: preloadPath,
            nodeIntegration: false,
            contextIsolation: true,
            enableWebGL: true,
            experimentalFeatures: true,
        },
        hasShadow: false,
        thickFrame: false,
        focusable: false,
        acceptFirstMouse: false,
        roundedCorners: false,
        show: false,
    })

    streakOverlayWindow.setAlwaysOnTop(false)
    streakOverlayWindow.setVisibleOnAllWorkspaces(true)

    const streakUrl = isDev
        ? 'http://localhost:3000#streak-overlay'
        : `file://${path.join(
            __dirname,
            'client/build/index.html'
        )}#streak-overlay`

    console.log('Loading streak overlay URL:', streakUrl)
    streakOverlayWindow.loadURL(streakUrl)

    if (isDev || SHOW_DEVTOOLS_IN_PRODUCTION) {
        streakOverlayWindow.webContents.openDevTools()
    }

    streakOverlayWindow.once('ready-to-show', () => {
        console.log('Streak overlay ready to show')
        streakOverlayWindow.show()
        streakOverlayWindow.setBackgroundColor('#00000000')

        // Make it visible initially for 5 seconds, then send to background
        streakOverlayWindow.setAlwaysOnTop(true)
        streakOverlayWindow.focus()

        console.log('Streak overlay shown and focused')

        // After 5 seconds, send to background
        setTimeout(() => {
            console.log('Sending streak overlay to background after 5 seconds')
            streakOverlayWindow.blur()
            sendStreakOverlayToBackground()
        }, 5000)

        // Ensure it stays in background
        setTimeout(() => sendStreakOverlayToBackground(), 7000)
    })

    streakOverlayWindow.on('closed', () => {
        streakOverlayWindow = null
    })

    // Listen for renderer's size measurement
    const { ipcMain } = require('electron')
    ipcMain.once('overlay-size', (event, { width, height }) => {
        streakOverlayWindow.setBounds({
            x: Math.round((screenWidth - width) / 2),
            y: screenHeight - height - bottomPadding,
            width,
            height,
        })
    })
}

// Improved background positioning function
function sendStreakOverlayToBackground() {
    if (!streakOverlayWindow || streakOverlayWindow.isDestroyed()) return

    console.log('Sending streak overlay to background...')

    try {
        // First, ensure it's not on top
        streakOverlayWindow.setAlwaysOnTop(false)
        streakOverlayWindow.blur()

        if (process.platform === 'win32') {
            // Windows: Use native APIs to send to bottom
            try {
                const hwnd = streakOverlayWindow.getNativeWindowHandle()
                if (hwnd) {
                    const { exec } = require('child_process')

                    // Method 1: Use PowerShell to set window to bottom
                    exec(
                        `powershell -WindowStyle Hidden -Command "
                        Add-Type -TypeDefinition '
                            using System;
                            using System.Runtime.InteropServices;
                            public class Win32 {
                                [DllImport(\\"user32.dll\\")]
                                public static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter, int x, int y, int cx, int cy, uint uFlags);
                                public static readonly IntPtr HWND_BOTTOM = new IntPtr(1);
                                public const uint SWP_NOSIZE = 0x0001;
                                public const uint SWP_NOMOVE = 0x0002;
                                public const uint SWP_NOACTIVATE = 0x0010;
                            }
                        ';
                        try {
                            [Win32]::SetWindowPos([IntPtr]${hwnd.readBigUInt64LE
                            ? hwnd.readBigUInt64LE()
                            : hwnd
                        }, [Win32]::HWND_BOTTOM, 0, 0, 0, 0, [Win32]::SWP_NOSIZE -bor [Win32]::SWP_NOMOVE -bor [Win32]::SWP_NOACTIVATE);
                            Write-Host 'Window sent to bottom successfully';
                        } catch {
                            Write-Host 'Failed to set window position';
                        }
                    "`,
                        (error, stdout, stderr) => {
                            if (error) {
                                console.log('PowerShell method failed:', error)
                                // Fallback method
                                setTimeout(() => {
                                    streakOverlayWindow.setAlwaysOnTop(false)
                                    streakOverlayWindow.blur()
                                }, 100)
                            } else {
                                console.log('PowerShell output:', stdout)
                            }
                        }
                    )
                }
            } catch (error) {
                console.log('Native method failed:', error)
                // Simple fallback
                streakOverlayWindow.setAlwaysOnTop(false)
                streakOverlayWindow.blur()
            }
        } else if (process.platform === 'darwin') {
            // macOS: Set to lowest window level
            streakOverlayWindow.setLevel(0) // Desktop level
            console.log('Set macOS window to desktop level')
        } else {
            // Linux: Use standard methods
            streakOverlayWindow.setAlwaysOnTop(false)
            streakOverlayWindow.blur()
            console.log('Applied Linux fallback positioning')
        }
    } catch (error) {
        console.log('Error in sendStreakOverlayToBackground:', error)
        // Ultimate fallback
        streakOverlayWindow.setAlwaysOnTop(false)
        streakOverlayWindow.blur()
    }
}

// Add this function to continuously ensure the window stays in background
function maintainStreakOverlayPosition() {
    if (!streakOverlayWindow || streakOverlayWindow.isDestroyed()) return

    // Check every 5 seconds and ensure it's still in the background
    setInterval(() => {
        if (
            streakOverlayWindow &&
            !streakOverlayWindow.isDestroyed() &&
            streakOverlayWindow.isVisible()
        ) {
            // Only reposition if the window somehow got on top
            if (streakOverlayWindow.isAlwaysOnTop()) {
                console.log(
                    'Streak overlay detected on top, sending to background...'
                )
                sendStreakOverlayToBackground()
            }
        }
    }, 5000) // Check every 5 seconds
}
function repositionStreakOverlay() {
    if (!streakOverlayWindow || streakOverlayWindow.isDestroyed()) return

    const { screen } = require('electron')
    const primaryDisplay = screen.getPrimaryDisplay()
    const { width: screenWidth, height: screenHeight } =
        primaryDisplay.workAreaSize

    const overlayWidth = 502
    const overlayHeight = 120
    const bottomPadding = 20

    const newX = Math.round((screenWidth - overlayWidth) / 2)
    const newY = screenHeight - overlayHeight - bottomPadding

    streakOverlayWindow.setBounds({
        x: newX,
        y: newY,
        width: overlayWidth,
        height: overlayHeight,
    })
}

// Update your app.whenReady() section
app.whenReady().then(() => {
    // Ensure Windows notifications work in development by setting an AppUserModelID
    if (process.platform === 'win32') {
        try {
            app.setAppUserModelId('com.promodor.app')
        } catch (err) {
            console.log('Failed to set AppUserModelID:', err)
        }
    }

    // Enable hardware acceleration for better performance
    app.commandLine.appendSwitch('enable-hardware-acceleration')
    app.commandLine.appendSwitch('enable-features', 'VaapiVideoDecoder')
    app.commandLine.appendSwitch('ignore-gpu-blacklist')
    app.commandLine.appendSwitch('enable-gpu-rasterization')
    app.commandLine.appendSwitch('enable-zero-copy')

    // Debug: Check hardware acceleration
    console.log(
        'Hardware acceleration enabled:',
        app.commandLine.hasSwitch('enable-hardware-acceleration')
    )
    console.log('Platform:', process.platform)
    console.log('Electron version:', process.versions.electron)

    createWindow() // Start with main window
    registerGlobalShortcuts()

    // Start the position maintenance system
    setTimeout(() => maintainStreakOverlayPosition(), 2000)

    // Handle app activation (macOS)
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createOverlayWindow()
        }
    })
})

// Handle app quit - close all windows
app.on('before-quit', () => {
    console.log('App is quitting, checking feature flag for overlay behavior...')
    
    // Check feature flag to determine if overlays should close with app
    const shouldCloseAllWithMain = loadFeatureFlags()
    
    if (shouldCloseAllWithMain) {
        console.log('Feature flag enabled: closing all overlay windows...')
        if (overlayWindow && !overlayWindow.isDestroyed()) {
            overlayWindow.close()
        }

        if (notesOverlayWindow && !notesOverlayWindow.isDestroyed()) {
            closeNotesOverlayWindow()
        }

        if (streakOverlayWindow && !streakOverlayWindow.isDestroyed()) {
            closeStreakOverlayWindow()
        }
    } else {
        console.log('Feature flag disabled: keeping overlay windows open...')
    }
})

// Handle window-all-closed event
app.on('window-all-closed', () => {
    console.log('All windows closed, checking feature flag for overlay behavior...')
    
    // Check feature flag to determine if overlays should close with app
    const shouldCloseAllWithMain = loadFeatureFlags()
    
    if (shouldCloseAllWithMain) {
        console.log('Feature flag enabled: closing any remaining overlay windows...')
        // Close any remaining overlay windows
        if (overlayWindow && !overlayWindow.isDestroyed()) {
            overlayWindow.close()
        }

        if (notesOverlayWindow && !notesOverlayWindow.isDestroyed()) {
            closeNotesOverlayWindow()
        }

        if (streakOverlayWindow && !streakOverlayWindow.isDestroyed()) {
            closeStreakOverlayWindow()
        }
    } else {
        console.log('Feature flag disabled: keeping overlay windows open...')
    }

    // On macOS, keep app running even when all windows are closed
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

// Update the global shortcut for streak overlay
function updateGlobalShortcuts() {
    // Add this to your registerGlobalShortcuts function
    globalShortcut.register('CmdOrCtrl+Shift+T', () => {
        console.log('Streak overlay toggle triggered')
        if (streakOverlayWindow && !streakOverlayWindow.isDestroyed()) {
            if (streakOverlayWindow.isVisible()) {
                streakOverlayWindow.hide()
            } else {
                streakOverlayWindow.show()
                setTimeout(() => sendStreakOverlayToBackground(), 100)
            }
        } else {
            createStreakOverlayWindow()
        }
    })
}
