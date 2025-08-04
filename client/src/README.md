# Promodor Client - Modular Structure

This document describes the modular architecture of the Promodor client application.

## Project Structure

```
src/
├── components/          # React components
│   ├── Header/         # Header components
│   ├── Timer/          # Timer-related components
│   ├── Tasks/          # Task management components
│   ├── Settings/       # Settings components
│   ├── Sidebar/        # Sidebar components
│   ├── index.js        # Component exports
│   ├── OverlayMode.js  # Overlay mode component
│   └── NotesOverlay.js # Notes overlay component
├── hooks/              # Custom React hooks
│   ├── useTimer.js     # Timer state management
│   ├── useTasks.js     # Task state management
│   ├── useTheme.js     # Theme state management
│   └── index.js        # Hook exports
├── utils/              # Utility functions
│   ├── timerUtils.js   # Timer-related utilities
│   └── index.js        # Utility exports
├── App.js              # Main application component
└── README.md           # This file
```

## Components

### Timer Components
- **TimerDisplay**: Displays the timer with progress ring and overlay buttons
- **TimerControls**: Start/pause and reset buttons
- **ModeButtons**: Focus, short break, and long break mode selection
- **CycleInfo**: Pomodoro cycle progress indicators

### Task Components
- **TaskList**: Task management with add, toggle, and delete functionality

### Settings Components
- **SettingsModal**: Settings configuration modal

### Header Components
- **AppHeader**: Application header with theme toggle and navigation

### Sidebar Components
- **ProgressCard**: Today's progress statistics
- **StatsCard**: Session statistics

### Overlay Components
- **OverlayMode**: Minimal timer overlay window
- **NotesOverlay**: Notes overlay window

## Hooks

### useTimer
Manages timer state including:
- Minutes and seconds
- Active/paused state
- Current mode (focus/short break/long break)
- Cycle count
- Settings management

### useTasks
Manages task state including:
- Task list
- New task input
- Completed task count
- Task operations (add, toggle, delete)

### useTheme
Manages theme state including:
- Dark/light mode toggle
- Color scheme generation
- Theme persistence

## Utilities

### timerUtils
- **getModeInfo**: Returns mode-specific information (text, color, gradient)
- **calculateProgress**: Calculates timer progress percentage
- **formatTime**: Formats time as MM:SS
- **getTotalTime**: Gets total time for current mode

## Benefits of Modular Structure

1. **Separation of Concerns**: Each component has a single responsibility
2. **Reusability**: Components can be easily reused across the application
3. **Maintainability**: Smaller, focused files are easier to maintain
4. **Testability**: Individual components and hooks can be tested in isolation
5. **Scalability**: New features can be added without affecting existing code
6. **Readability**: Code is more organized and easier to understand

## Usage

The main App component orchestrates all the modular components and hooks:

```javascript
import { useTimer, useTasks, useTheme } from './hooks';
import { TimerDisplay, TaskList, SettingsModal } from './components';

const App = () => {
  const timer = useTimer(initialSettings);
  const tasks = useTasks();
  const theme = useTheme();
  
  // Component composition
  return (
    <div>
      <TimerDisplay {...timer} {...theme} />
      <TaskList {...tasks} {...theme} />
      <SettingsModal {...settings} {...theme} />
    </div>
  );
};
```

## File Cleanup

The following unused files were removed:
- `MinimalMode.js` - Not imported anywhere in the application
- Empty directories were cleaned up

The original monolithic `App.js` (808 lines) has been refactored into:
- Modular components (8-15 files)
- Custom hooks (3 files)
- Utility functions (1 file)
- Clean main App component (~150 lines) 