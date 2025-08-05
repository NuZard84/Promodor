const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload script loaded');

contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  openMainWindow: () => {
    console.log('openMainWindow called');
    return ipcRenderer.invoke('open-main-window');
  },
  closeOverlay: () => {
    console.log('closeOverlay called');
    return ipcRenderer.invoke('close-overlay');
  },
  createOverlay: () => ipcRenderer.invoke('create-overlay'),

  // Overlay controls
  toggleClickThrough: (enabled) => {
    console.log('toggleClickThrough called with:', enabled);
    return ipcRenderer.invoke('toggle-click-through', enabled);
  },

  // Timer controls
  toggleTimer: () => ipcRenderer.send('toggle-timer'),
  resetTimer: () => ipcRenderer.send('reset-timer'),

  // Notes overlay controls
  createNotesOverlay: () => {
    console.log('createNotesOverlay called');
    return ipcRenderer.invoke('create-notes-overlay');
  },
  closeNotesOverlay: () => {
    console.log('closeNotesOverlay called');
    return ipcRenderer.invoke('close-notes-overlay');
  },
  toggleNotesOverlay: () => ipcRenderer.invoke('toggle-notes-overlay'),

  // Notifications
  showNotification: (options) => ipcRenderer.invoke('show-notification', options),

  // Listen for events from main process
  onShortcut: (channel, callback) => {
    ipcRenderer.on(channel, callback);
  }
});

console.log('electronAPI exposed to window');
