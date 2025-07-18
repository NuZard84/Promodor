const { contextBridge, ipcRenderer } = require('electron');

// Store click-through state for global shortcut access
let isClickThrough = false;

// Global function to toggle click-through mode from shortcut
window.toggleClickThroughFromShortcut = () => {
  try {
    isClickThrough = !isClickThrough;
    ipcRenderer.invoke('toggle-click-through', isClickThrough);
    // Dispatch custom event for React to catch
    window.dispatchEvent(new CustomEvent('click-through-changed', { detail: isClickThrough }));
    return true; // Return success for executeJavaScript
  } catch (error) {
    console.error('Error in toggleClickThroughFromShortcut:', error);
    return false;
  }
};

contextBridge.exposeInMainWorld('electronAPI', {
  // Timer controls
  toggleTimer: () => ipcRenderer.send('toggle-timer'),
  resetTimer: () => ipcRenderer.send('reset-timer'),
  toggleClickThroughShortcut: () => window.toggleClickThroughFromShortcut(),
  
  // Overlay mode
  createOverlay: () => ipcRenderer.invoke('create-overlay'),
  closeOverlay: () => ipcRenderer.invoke('close-overlay'),
  isOverlayMode: () => window.location.hash === '#overlay',
  
  // Window controls
  toggleClickThrough: (enabled) => ipcRenderer.invoke('toggle-click-through', enabled),
  toggleAlwaysOnTop: (enabled) => ipcRenderer.invoke('toggle-always-on-top', enabled),
  
  // Notifications
  showNotification: (options) => ipcRenderer.invoke('show-notification', options),
  suppressNotifications: (suppress) => ipcRenderer.invoke('suppress-notifications', suppress),
  
  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  minimizeToTray: () => ipcRenderer.invoke('minimize-to-tray'),
  
  // Event listeners
  onShortcut: (channel, callback) => {
    ipcRenderer.on(channel, (_, data) => callback(data));
  },
  onOverlayClosed: (callback) => {
    ipcRenderer.on('overlay-closed', () => callback());
  }
}); 