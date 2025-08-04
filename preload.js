const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  openMainWindow: () => ipcRenderer.invoke('open-main-window'),
  closeOverlay: () => ipcRenderer.invoke('close-overlay'),
  createOverlay: () => ipcRenderer.invoke('create-overlay'),

  // Overlay controls
  toggleClickThrough: (enabled) => ipcRenderer.invoke('toggle-click-through', enabled),

  // Timer controls
  toggleTimer: () => ipcRenderer.send('toggle-timer'),
  resetTimer: () => ipcRenderer.send('reset-timer'),

  // Notes overlay controls
  createNotesOverlay: () => ipcRenderer.invoke('create-notes-overlay'),
  closeNotesOverlay: () => ipcRenderer.invoke('close-notes-overlay'),

  // Notifications
  showNotification: (options) => ipcRenderer.invoke('show-notification', options),

  // Event listeners
  onShortcut: (channel, callback) => {
    ipcRenderer.on(channel, (_, data) => callback(data));
  }
}); 
