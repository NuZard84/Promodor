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
let mainWindow
let overlayWindow
let notesOverlayWindow

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
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,

        transparent: true,
        backgroundColor: '#00000000',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, 'preload.js'),
            // Enable hardware acceleration for better performance
            enableWebGL: true,
            experimentalFeatures: true,
        },
        show: false,
        icon: path.join(__dirname, 'assets/icon.png'),
        // Platform-specific settings
        ...platformSettings,
        // Additional settings for better transparency
        hasShadow: false,
    })

    // Load the index.html from React app
    mainWindow.loadURL(
        isDev
            ? 'http://localhost:3000'
            : `file://${path.join(__dirname, './client/build/index.html')}`
    )

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
    if (isDev) {
        mainWindow.webContents.openDevTools()
    }

    mainWindow.on('closed', () => {
        if (overlayWindow) {
            overlayWindow.close()
        }
        if (notesOverlayWindow) {
            notesOverlayWindow.close()
        }
        mainWindow = null
    })

    // Set up the menu
    createMenu()
}

function createOverlayWindow() {
    // Platform-specific configurations for overlay
    const platformConfig = {
        darwin: {
            vibrancy: 'under-window',
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

    overlayWindow = new BrowserWindow({
        width: 280,
        height: 400,
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
            preload: path.join(__dirname, 'preload.js'),
            // Enable hardware acceleration for better performance
            enableWebGL: true,
            experimentalFeatures: true,
        },
        // Platform-specific settings
        ...platformSettings,
        // Additional settings for better transparency
        hasShadow: false,
        thickFrame: false,
    })

    overlayWindow.loadURL(
        isDev
            ? 'http://localhost:3000#overlay'
            : `file://${path.join(
                  __dirname,
                  './client/build/index.html#overlay'
              )}`
    )

    overlayWindow.once('ready-to-show', () => {
        overlayWindow.show()
        // Ensure transparency is properly set after window is shown
        overlayWindow.setBackgroundColor('#00000000')

        // Debug: Log overlay window settings
        console.log('Overlay window created with settings:', {
            transparent: overlayWindow.isVisible(),
            backgroundColor: overlayWindow.getBackgroundColor(),
            platform: process.platform,
            vibrancy:
                process.platform === 'darwin'
                    ? 'under-window'
                    : 'not supported',
        })
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
    const platformConfig = {
        darwin: {
            vibrancy: 'under-window',
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
        width: 320,
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
            preload: path.join(__dirname, 'preload.js'),
            enableWebGL: true,
            experimentalFeatures: true,
        },
        ...platformSettings,
        hasShadow: false,
        thickFrame: false,
        minWidth: 280,
        minHeight: 300,
        maxWidth: 500,
        maxHeight: 600,
    })

    notesOverlayWindow.loadURL(
        isDev
            ? 'http://localhost:3000#notes-overlay'
            : `file://${path.join(
                  __dirname,
                  './client/build/index.html#notes-overlay'
              )}`
    )

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
        if (notesOverlayWindow) {
            closeNotesOverlayWindow()
        } else {
            createNotesOverlayWindow()
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
    if (overlayWindow) {
        overlayWindow.setIgnoreMouseEvents(enabled, { forward: true })
    }
})

ipcMain.handle('show-notification', (event, options) => {
    if (Notification.isSupported()) {
        const notification = new Notification({
            title: options.title,
            body: options.body,
            icon: path.join(__dirname, 'assets/icon.png'),
            sound: true,
        })

        notification.show()

        notification.on('click', () => {
            if (mainWindow) {
                mainWindow.focus()
            }
        })
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
    if (!mainWindow) {
        createWindow()
    } else {
        mainWindow.show()
        mainWindow.focus()
    }
})

// Add IPC handlers for notes overlay
ipcMain.handle('create-notes-overlay', () => {
    createNotesOverlayWindow()
})

ipcMain.handle('close-notes-overlay', () => {
    closeNotesOverlayWindow()
})

// App event handlers
app.whenReady().then(() => {
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

    createOverlayWindow() // Start with overlay instead of main window
    registerGlobalShortcuts()

    // Handle app activation (macOS)
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createOverlayWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('will-quit', () => {
    // Unregister all global shortcuts
    globalShortcut.unregisterAll()
})

app.on('before-quit', () => {
    // Clean up any resources
    if (overlayWindow) {
        overlayWindow.destroy()
    }
    if (notesOverlayWindow) {
        notesOverlayWindow.destroy()
    }
})

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
    contents.on('new-window', (event, navigationUrl) => {
        event.preventDefault()
        // You could open in default browser here if needed
        // require('electron').shell.openExternal(navigationUrl);
    })
})

// Auto-updater (for production)
if (!isDev) {
    const { autoUpdater } = require('electron-updater')

    autoUpdater.checkForUpdatesAndNotify()

    autoUpdater.on('update-available', () => {
        if (mainWindow) {
            mainWindow.webContents.send('update-available')
        }
    })

    autoUpdater.on('update-downloaded', () => {
        if (mainWindow) {
            mainWindow.webContents.send('update-downloaded')
        }
    })
}
