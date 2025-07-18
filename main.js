const { app, BrowserWindow, ipcMain, globalShortcut, Notification, Menu } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

let mainWindow;
let overlayWindow;

function createWindow() {
  // Create the main browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'), // We'll create this
    },
    titleBarStyle: 'hiddenInset',
    frame: true,
    show: false,
    icon: path.join(__dirname, 'assets/icon.png'),
  });

  // Load the index.html from React app
  mainWindow.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, './client/build/index.html')}`
  );

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open DevTools if in development mode
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    if (overlayWindow) {
      overlayWindow.close();
    }
    mainWindow = null;
  });

  // Set up the menu
  createMenu();
}

function createOverlayWindow() {
  if (overlayWindow) {
    overlayWindow.focus();
    return;
  }

  overlayWindow = new BrowserWindow({
    width: 280,
    height: 320,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    movable: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
    },
    show: false,
    hasShadow: false,
    vibrancy: 'dark', // macOS only
    visualEffectState: 'active', // macOS only
  });

  // Load the same React app but it will detect overlay mode
  overlayWindow.loadURL(
    isDev
      ? 'http://localhost:3000#overlay'
      : `file://${path.join(__dirname, './client/build/index.html')}#overlay`
  );

  // Position overlay window at top-right corner
  const { screen } = require('electron');
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;
  overlayWindow.setPosition(width - 300, 20);

  overlayWindow.once('ready-to-show', () => {
    overlayWindow.show();
    overlayWindow.setAlwaysOnTop(true, 'floating');
  });

  overlayWindow.on('closed', () => {
    overlayWindow = null;
    // Notify main window that overlay was closed
    if (mainWindow) {
      mainWindow.webContents.send('overlay-closed');
    }
  });

  // Make window draggable
  overlayWindow.on('will-move', (event, newBounds) => {
    // Allow dragging
  });
}

function closeOverlayWindow() {
  if (overlayWindow) {
    overlayWindow.close();
    overlayWindow = null;
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
            mainWindow.webContents.send('new-session');
          }
        },
        {
          label: 'Toggle Overlay Mode',
          accelerator: 'CmdOrCtrl+Shift+O',
          click: () => {
            if (overlayWindow) {
              closeOverlayWindow();
            } else {
              createOverlayWindow();
            }
          }
        },
        {
          label: 'Hide Window',
          accelerator: 'CmdOrCtrl+Shift+H',
          click: () => {
            if (overlayWindow) {
              overlayWindow.hide();
            } else if (mainWindow) {
              mainWindow.hide();
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Timer',
      submenu: [
        {
          label: 'Start/Pause',
          accelerator: 'Space',
          click: () => {
            mainWindow.webContents.send('toggle-timer');
          }
        },
        {
          label: 'Reset',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow.webContents.send('reset-timer');
          }
        },
        {
          label: 'Focus Mode',
          accelerator: 'CmdOrCtrl+1',
          click: () => {
            mainWindow.webContents.send('switch-mode', 'focus');
          }
        },
        {
          label: 'Short Break',
          accelerator: 'CmdOrCtrl+2',
          click: () => {
            mainWindow.webContents.send('switch-mode', 'shortBreak');
          }
        },
        {
          label: 'Long Break',
          accelerator: 'CmdOrCtrl+3',
          click: () => {
            mainWindow.webContents.send('switch-mode', 'longBreak');
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Toggle Focus Mode',
          accelerator: 'CmdOrCtrl+Shift+F',
          click: () => {
            toggleFocusMode();
          }
        },
        {
          label: 'Always on Top',
          type: 'checkbox',
          click: (menuItem) => {
            mainWindow.setAlwaysOnTop(menuItem.checked);
          }
        },
        { type: 'separator' },
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow.reload();
          }
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: process.platform === 'darwin' ? 'Alt+Cmd+I' : 'Ctrl+Shift+I',
          click: () => {
            mainWindow.webContents.toggleDevTools();
          }
        }
      ]
    },
    {
      label: 'Window',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'CmdOrCtrl+M',
          click: () => {
            mainWindow.minimize();
          }
        },
        {
          label: 'Close',
          accelerator: 'CmdOrCtrl+W',
          click: () => {
            mainWindow.close();
          }
        }
      ]
    }
  ];

  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        {
          label: 'About ' + app.getName(),
          role: 'about'
        },
        { type: 'separator' },
        {
          label: 'Services',
          role: 'services',
          submenu: []
        },
        { type: 'separator' },
        {
          label: 'Hide ' + app.getName(),
          accelerator: 'Command+H',
          role: 'hide'
        },
        {
          label: 'Hide Others',
          accelerator: 'Command+Shift+H',
          role: 'hideothers'
        },
        {
          label: 'Show All',
          role: 'unhide'
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function toggleFocusMode() {
  if (mainWindow.isKiosk()) {
    mainWindow.setKiosk(false);
    mainWindow.setMenuBarVisibility(true);
  } else {
    mainWindow.setKiosk(true);
    mainWindow.setMenuBarVisibility(false);
  }
}

function registerGlobalShortcuts() {
  // Global shortcuts for overlay mode
  globalShortcut.register('CmdOrCtrl+Shift+P', () => {
    if (overlayWindow) {
      overlayWindow.webContents.send('toggle-timer');
    } else if (mainWindow) {
      mainWindow.webContents.send('toggle-timer');
    }
  });

  globalShortcut.register('CmdOrCtrl+Shift+H', () => {
    if (overlayWindow) {
      overlayWindow.hide();
    } else if (mainWindow) {
      mainWindow.hide();
    }
  });

  globalShortcut.register('CmdOrCtrl+Shift+S', () => {
    if (overlayWindow) {
      overlayWindow.show();
    } else if (mainWindow) {
      mainWindow.show();
    }
  });

  globalShortcut.register('CmdOrCtrl+Shift+O', () => {
    if (overlayWindow) {
      closeOverlayWindow();
    } else {
      createOverlayWindow();
    }
  });

  // Focus mode toggle
  globalShortcut.register('CmdOrCtrl+Alt+F', () => {
    toggleFocusMode();
  });
}

// IPC handlers
ipcMain.handle('create-overlay', () => {
  createOverlayWindow();
});

ipcMain.handle('close-overlay', () => {
  closeOverlayWindow();
});

ipcMain.handle('toggle-always-on-top', (event, enabled) => {
  if (overlayWindow) {
    overlayWindow.setAlwaysOnTop(enabled, 'floating');
  }
  if (mainWindow) {
    mainWindow.setAlwaysOnTop(enabled);
  }
});

ipcMain.handle('toggle-click-through', (event, enabled) => {
  if (overlayWindow) {
    overlayWindow.setIgnoreMouseEvents(enabled, { forward: true });
  }
});

ipcMain.handle('show-notification', (event, options) => {
  if (Notification.isSupported()) {
    const notification = new Notification({
      title: options.title,
      body: options.body,
      icon: path.join(__dirname, 'assets/icon.png'),
      sound: true,
    });
    
    notification.show();
    
    notification.on('click', () => {
      if (mainWindow) {
        mainWindow.focus();
      }
    });
  }
});

ipcMain.handle('suppress-notifications', (event, suppress) => {
  // In a real implementation, you would integrate with the system's
  // Do Not Disturb functionality here
  console.log(`Notifications ${suppress ? 'suppressed' : 'enabled'}`);
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('minimize-to-tray', () => {
  if (mainWindow) {
    mainWindow.hide();
  }
});

// App event handlers
app.whenReady().then(() => {
  createWindow();
  registerGlobalShortcuts();
  
  // Handle app activation (macOS)
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  // Unregister all global shortcuts
  globalShortcut.unregisterAll();
});

app.on('before-quit', () => {
  // Clean up any resources
  if (overlayWindow) {
    overlayWindow.destroy();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    // You could open in default browser here if needed
    // require('electron').shell.openExternal(navigationUrl);
  });
});

// Auto-updater (for production)
if (!isDev) {
  const { autoUpdater } = require('electron-updater');
  
  autoUpdater.checkForUpdatesAndNotify();
  
  autoUpdater.on('update-available', () => {
    if (mainWindow) {
      mainWindow.webContents.send('update-available');
    }
  });
  
  autoUpdater.on('update-downloaded', () => {
    if (mainWindow) {
      mainWindow.webContents.send('update-downloaded');
    }
  });
}