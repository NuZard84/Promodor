import React, { useState, useEffect } from 'react';
import {
  Settings,
  Bell,
  Volume2,
  Keyboard,
  BarChart3,
  CheckSquare,
  Layers,
  Plus,
  X,
  Minus,
  Square,
  Timer,
  Moon,
  Sun,
  User
} from 'lucide-react';
import { useTimer, useTasks, useTheme } from './hooks';
import {
  OverlayMode,
  NotesOverlay,
  StreakOverlay
} from './components';
import StreakTestPanel from './components/StreakTestPanel';

const App = () => {
  // Check if we're in overlay mode
  const isOverlayMode = window.location.hash === '#overlay';
  const isNotesOverlayMode = window.location.hash === '#notes-overlay';
  const isStreakOverlayMode = window.location.hash === '#streak-overlay';

  // Initialize hooks
  const initialSettings = {
    focusTime: 25,
    shortBreakTime: 5,
    longBreakTime: 15,
    longBreakAfter: 4
  };

  const {
    minutes,
    seconds,
    isActive,
    mode,
    cycle,
    settings,
    toggleTimer,
    resetTimer,
    setModeAndReset,
    updateSettings,
    setCycle
  } = useTimer(initialSettings);

  const {
    tasks,
    newTask,
    setNewTask,
    completedTasks,
    addTask,
    toggleTask,
    deleteTask,
    updateCompletedTasks
  } = useTasks();

  // App state
  const [activeTab, setActiveTab] = useState('overlays');
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [showEditMenu, setShowEditMenu] = useState(false);
  const [showViewMenu, setShowViewMenu] = useState(false);
  const [showHelpMenu, setShowHelpMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Navigation items 
  const navigationItems = [
    { id: 'overlays', label: 'Overlays', icon: Layers },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'stats', label: 'Statistics', icon: BarChart3 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'sounds', label: 'Sounds', icon: Volume2 },
    { id: 'shortcuts', label: 'Shortcuts', icon: Keyboard },
  ];

  // Update completed tasks when timer completes
  useEffect(() => {
    if (mode === 'focus' && !isActive && minutes === 0 && seconds === 0) {
      updateCompletedTasks(completedTasks + 1);
    }
  }, [mode, isActive, minutes, seconds, completedTasks, updateCompletedTasks]);

  // Overlay functions
  const createOverlay = (type) => {
    if (window.electronAPI) {
      switch (type) {
        case 'timer':
          window.electronAPI.createOverlay?.();
          break;
        case 'notes':
          window.electronAPI.createNotesOverlay?.();
          break;
        case 'streak':
          window.electronAPI.createStreakOverlay?.();
          break;
      }
    }
  };

  // Window controls with better error handling
  const minimizeWindow = () => {
    if (window.electronAPI?.minimizeWindow) {
      window.electronAPI.minimizeWindow().catch(console.error);
    } else {
      console.warn('electronAPI.minimizeWindow not available - running in browser mode');
    }
  };

  const maximizeWindow = () => {
    if (window.electronAPI?.maximizeWindow) {
      window.electronAPI.maximizeWindow().catch(console.error);
    } else {
      console.warn('electronAPI.maximizeWindow not available - running in browser mode');
    }
  };

  const closeWindow = () => {
    if (window.electronAPI?.closeWindow) {
      window.electronAPI.closeWindow().catch(console.error);
    } else {
      console.warn('electronAPI.closeWindow not available - running in browser mode');
      // In browser mode, just close the tab
      window.close();
    }
  };

  // Menu actions
  const handleNewSession = () => {
    resetTimer();
    setShowFileMenu(false);
  };

  const handleQuit = () => {
    if (window.electronAPI?.quit) {
      window.electronAPI.quit();
    } else {
      window.close();
    }
  };

  // Render overlay components if in overlay mode
  if (isOverlayMode) {
    return <OverlayMode />;
  }

  if (isNotesOverlayMode) {
    return <NotesOverlay />;
  }

  if (isStreakOverlayMode) {
    return <StreakOverlay />;
  }

  // Main content renderer
  const renderMainContent = () => {
    switch (activeTab) {
      case 'tasks':
        return <TasksContent
          tasks={tasks}
          newTask={newTask}
          setNewTask={setNewTask}
          addTask={addTask}
          toggleTask={toggleTask}
          deleteTask={deleteTask}
          completedTasks={completedTasks}
          isDarkMode={isDarkMode}
        />;
      case 'stats':
        return <StatsContent
          completedTasks={completedTasks}
          cycle={cycle}
          tasks={tasks}
          isDarkMode={isDarkMode}
        />;
      case 'overlays':
        return <OverlaysContent createOverlay={createOverlay} isDarkMode={isDarkMode} />;
      case 'profile':
        return <ProfileContent isDarkMode={isDarkMode} />;
      case 'settings':
        return <SettingsContent
          settings={settings}
          updateSettings={updateSettings}
          isDarkMode={isDarkMode}
        />;
      case 'notifications':
        return <NotificationsContent isDarkMode={isDarkMode} />;
      case 'sounds':
        return <SoundsContent isDarkMode={isDarkMode} />;
      case 'shortcuts':
        return <ShortcutsContent isDarkMode={isDarkMode} />;
      default:
        return <OverlaysContent createOverlay={createOverlay} isDarkMode={isDarkMode} />;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode
      ? 'bg-gradient-to-br from-gray-900 to-gray-800'
      : 'bg-gradient-to-br from-gray-50 to-gray-100'
      }`}>
      {/* Custom Title Bar */}
      <div
        className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-800'
          } text-white flex items-center justify-between h-8 text-sm select-none`}
        style={{ WebkitAppRegion: 'drag' }}
      >
        {/* Menu Bar */}
        <div className="flex items-center" style={{ WebkitAppRegion: 'no-drag' }}>
          <div className="flex items-center px-4 py-1">
            <div className="w-4 h-4 rounded-lg bg-orange-500 flex items-center justify-center mr-2">
              <Timer className="w-2.5 h-2.5 text-white" />
            </div>
            <span className="text-xs font-medium">Pomogo</span>
          </div>

          {/* Menu Items */}
          <div className="flex">
            {/* File Menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowFileMenu(!showFileMenu);
                  setShowEditMenu(false);
                  setShowViewMenu(false);
                  setShowHelpMenu(false);
                }}
                className="px-3 py-1 hover:bg-gray-700 transition-colors"
              >
                File
              </button>
              {showFileMenu && (
                <div className="absolute top-full left-0 bg-gray-800 border border-gray-600 rounded shadow-lg py-1 z-50 min-w-48">
                  <button
                    onClick={handleNewSession}
                    className="w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center justify-between"
                  >
                    New Session
                    <span className="text-gray-400 text-xs">Ctrl+N</span>
                  </button>
                  <div className="border-t border-gray-600 my-1"></div>
                  <button
                    onClick={() => createOverlay('timer')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-700"
                  >
                    Create Timer Overlay
                  </button>
                  <button
                    onClick={() => createOverlay('notes')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-700"
                  >
                    Create Notes Overlay
                  </button>
                  <button
                    onClick={() => createOverlay('streak')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-700"
                  >
                    Create Streak Overlay
                  </button>
                  <div className="border-t border-gray-600 my-1"></div>
                  <button
                    onClick={handleQuit}
                    className="w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center justify-between"
                  >
                    Quit
                    <span className="text-gray-400 text-xs">Ctrl+Q</span>
                  </button>
                </div>
              )}
            </div>

            {/* Edit Menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowEditMenu(!showEditMenu);
                  setShowFileMenu(false);
                  setShowViewMenu(false);
                  setShowHelpMenu(false);
                }}
                className="px-3 py-1 hover:bg-gray-700 transition-colors"
              >
                Edit
              </button>
              {showEditMenu && (
                <div className="absolute top-full left-0 bg-gray-800 border border-gray-600 rounded shadow-lg py-1 z-50 min-w-48">
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center justify-between">
                    Preferences
                    <span className="text-gray-400 text-xs">Ctrl+,</span>
                  </button>
                </div>
              )}
            </div>

            {/* View Menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowViewMenu(!showViewMenu);
                  setShowFileMenu(false);
                  setShowEditMenu(false);
                  setShowHelpMenu(false);
                }}
                className="px-3 py-1 hover:bg-gray-700 transition-colors"
              >
                View
              </button>
              {showViewMenu && (
                <div className="absolute top-full left-0 bg-gray-800 border border-gray-600 rounded shadow-lg py-1 z-50 min-w-48">
                  <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-700"
                  >
                    Toggle {isDarkMode ? 'Light' : 'Dark'} Mode
                  </button>
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-700">
                    Full Screen
                  </button>
                </div>
              )}
            </div>

            {/* Help Menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowHelpMenu(!showHelpMenu);
                  setShowFileMenu(false);
                  setShowEditMenu(false);
                  setShowViewMenu(false);
                }}
                className="px-3 py-1 hover:bg-gray-700 transition-colors"
              >
                Help
              </button>
              {showHelpMenu && (
                <div className="absolute top-full left-0 bg-gray-800 border border-gray-600 rounded shadow-lg py-1 z-50 min-w-48">
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-700">
                    About Pomogo
                  </button>
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-700">
                    Keyboard Shortcuts
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Window Controls */}
        <div className="flex items-center" style={{ WebkitAppRegion: 'no-drag' }}>
          <button
            onClick={minimizeWindow}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-700 transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={maximizeWindow}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-700 transition-colors"
          >
            <Square className="w-3 h-3" />
          </button>
          <button
            onClick={closeWindow}
            className="w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main App Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <div className={`w-64 ${isDarkMode
          ? 'bg-gray-800 border-r border-gray-700'
          : 'bg-white border-r border-gray-200'
          } flex flex-col`}>
          {/* Logo */}
          <div className={`p-6 ${isDarkMode ? 'border-b border-gray-700' : 'border-b border-gray-200'
            }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
                <Timer className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}>Pomogo</h1>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>Focus Timer</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${isActive
                      ? 'bg-orange-500 text-white shadow-lg'
                      : isDarkMode
                        ? 'text-gray-300 hover:bg-orange-900/20 hover:text-orange-400'
                        : 'text-gray-600 hover:bg-orange-50 hover:text-orange-600'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Theme Toggle */}
          <div className={`p-4 ${isDarkMode ? 'border-t border-gray-700' : 'border-t border-gray-200'
            }`}>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isDarkMode
                ? 'text-gray-300 hover:bg-orange-900/20 hover:text-orange-400'
                : 'text-gray-600 hover:bg-orange-50 hover:text-orange-600'
                }`}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              <span className="font-medium">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className={`${isDarkMode
            ? 'bg-gray-800 border-b border-gray-700'
            : 'bg-white border-b border-gray-200'
            } px-8 py-[18px]`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'
                  } capitalize`}>
                  {activeTab}
                </h2>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  } mt-1`}>
                  {getTabDescription(activeTab)}
                </p>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 p-8 overflow-auto">
            {renderMainContent()}
          </main>
        </div>
      </div>

      {/* Click outside to close menus */}
      {(showFileMenu || showEditMenu || showViewMenu || showHelpMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowFileMenu(false);
            setShowEditMenu(false);
            setShowViewMenu(false);
            setShowHelpMenu(false);
          }}
        />
      )}
    </div>
  );
};

// Helper function for tab descriptions
const getTabDescription = (tab) => {
  const descriptions = {
    overlays: 'Configure overlay windows',
    tasks: 'Manage your tasks and goals',
    stats: 'Track your progress and statistics',
    profile: 'Manage your profile and preferences',
    settings: 'Timer and app preferences',
    notifications: 'Notification preferences',
    sounds: 'Audio settings',
    shortcuts: 'Keyboard shortcuts'
  };
  return descriptions[tab] || '';
};

// Tasks Content Component
const TasksContent = ({
  tasks,
  newTask,
  setNewTask,
  addTask,
  toggleTask,
  deleteTask,
  completedTasks,
  isDarkMode
}) => {
  const activeTasks = tasks.filter(task => !task.completed);
  const completedTasksList = tasks.filter(task => task.completed);

  return (
    <div className="space-y-6">
      {/* Add Task */}
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } rounded-2xl p-6 border`}>
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'
          } mb-4`}>Add New Task</h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Enter a new task..."
            className={`flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${isDarkMode
              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
              : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
              }`}
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
          />
          <button
            onClick={addTask}
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>
      </div>

      {/* Active Tasks */}
      {activeTasks.length > 0 && (
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } rounded-2xl p-6 border`}>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'
            } mb-4`}>
            Active Tasks ({activeTasks.length})
          </h3>
          <div className="space-y-3">
            {activeTasks.map((task) => (
              <div key={task.id} className={`flex items-center gap-3 p-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                } rounded-xl`}>
                <button
                  onClick={() => toggleTask(task.id)}
                  className="w-5 h-5 rounded border-2 border-gray-300 hover:border-orange-500 transition-colors"
                />
                <span className={`flex-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>{task.text}</span>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Tasks */}
      {completedTasksList.length > 0 && (
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } rounded-2xl p-6 border`}>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'
            } mb-4`}>
            Completed Tasks ({completedTasksList.length})
          </h3>
          <div className="space-y-3">
            {completedTasksList.map((task) => (
              <div key={task.id} className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <div className="w-5 h-5 rounded bg-green-500 flex items-center justify-center">
                  <CheckSquare className="w-3 h-3 text-white" />
                </div>
                <span className={`flex-1 line-through ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>{task.text}</span>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Stats Content Component
const StatsContent = ({ completedTasks, cycle, tasks, isDarkMode }) => {
  const completedTasksList = tasks.filter(task => task.completed);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } rounded-2xl p-6 border`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
              <Timer className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>
                {completedTasks}
              </div>
              <div className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                Completed Sessions
              </div>
            </div>
          </div>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } rounded-2xl p-6 border`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <CheckSquare className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>
                {completedTasksList.length}
              </div>
              <div className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                Tasks Completed
              </div>
            </div>
          </div>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } rounded-2xl p-6 border`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>
                {cycle}
              </div>
              <div className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                Current Cycle
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Chart Placeholder */}
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } rounded-2xl p-8 border`}>
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'
          } mb-6`}>Progress Overview</h3>
        <div className={`h-64 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
          } rounded-xl flex items-center justify-center`}>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
            Progress charts will be implemented here
          </p>
        </div>
      </div>

      {/* Streak Test Panel */}
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } rounded-2xl p-8 border`}>
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'
          } mb-6`}>Frozen Streak Testing</h3>
        <div className="flex justify-center">
          <StreakTestPanel />
        </div>
      </div>
    </div>
  );
};

// Overlays Content Component
const OverlaysContent = ({ createOverlay, isDarkMode }) => (
  <div className="space-y-6">
    <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } rounded-2xl p-8 border`}>
      <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'
        } mb-6`}>Overlay Windows</h3>
      <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'
        } mb-6`}>
        Create floating overlay windows that stay on top of other applications.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`p-6 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'
          } rounded-xl`}>
          <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center mb-4">
            <Timer className="w-6 h-6 text-orange-500" />
          </div>
          <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'
            } mb-2`}>Timer Overlay</h4>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'
            } text-sm mb-4`}>
            Compact timer that floats above other windows
          </p>
          <button
            onClick={() => createOverlay('timer')}
            className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
          >
            Create Timer Overlay
          </button>
        </div>

        <div className={`p-6 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'
          } rounded-xl`}>
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mb-4">
            <CheckSquare className="w-6 h-6 text-blue-500" />
          </div>
          <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'
            } mb-2`}>Notes Overlay</h4>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'
            } text-sm mb-4`}>
            Quick notes and task list overlay
          </p>
          <button
            onClick={() => createOverlay('notes')}
            className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Create Notes Overlay
          </button>
        </div>

        <div className={`p-6 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'
          } rounded-xl`}>
          <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-4">
            <BarChart3 className="w-6 h-6 text-green-500" />
          </div>
          <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'
            } mb-2`}>Streak Overlay</h4>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'
            } text-sm mb-4`}>
            Progress streak display at bottom of screen
          </p>
          <button
            onClick={() => createOverlay('streak')}
            className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
          >
            Create Streak Overlay
          </button>
        </div>
      </div>
    </div>
  </div>
);

// Settings Content Component
const SettingsContent = ({ settings, updateSettings, isDarkMode }) => (
  <div className="space-y-6">
    <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } rounded-2xl p-8 border`}>
      <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'
        } mb-6`}>Timer Settings</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
            } mb-2`}>
            Focus Time (minutes)
          </label>
          <input
            type="number"
            value={settings.focusTime}
            onChange={(e) => updateSettings({ ...settings, focusTime: parseInt(e.target.value) })}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 ${isDarkMode
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'bg-white border-gray-200 text-gray-900'
              }`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
            } mb-2`}>
            Short Break (minutes)
          </label>
          <input
            type="number"
            value={settings.shortBreakTime}
            onChange={(e) => updateSettings({ ...settings, shortBreakTime: parseInt(e.target.value) })}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 ${isDarkMode
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'bg-white border-gray-200 text-gray-900'
              }`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
            } mb-2`}>
            Long Break (minutes)
          </label>
          <input
            type="number"
            value={settings.longBreakTime}
            onChange={(e) => updateSettings({ ...settings, longBreakTime: parseInt(e.target.value) })}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 ${isDarkMode
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'bg-white border-gray-200 text-gray-900'
              }`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
            } mb-2`}>
            Long Break After (cycles)
          </label>
          <input
            type="number"
            value={settings.longBreakAfter}
            onChange={(e) => updateSettings({ ...settings, longBreakAfter: parseInt(e.target.value) })}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 ${isDarkMode
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'bg-white border-gray-200 text-gray-900'
              }`}
          />
        </div>
      </div>
    </div>
  </div>
);

// Placeholder components for other tabs
const NotificationsContent = ({ isDarkMode }) => (
  <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    } rounded-2xl p-8 border`}>
    <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'
      } mb-6`}>Notification Settings</h3>
    <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
      Notification preferences will be implemented here.
    </p>
  </div>
);

const SoundsContent = ({ isDarkMode }) => (
  <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    } rounded-2xl p-8 border`}>
    <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'
      } mb-6`}>Sound Settings</h3>
    <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
      Audio configuration options will be implemented here.
    </p>
  </div>
);

const ShortcutsContent = ({ isDarkMode }) => (
  <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    } rounded-2xl p-8 border`}>
    <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'
      } mb-6`}>Keyboard Shortcuts</h3>
    <div className="space-y-4">
      <div className={`flex justify-between items-center p-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
        } rounded-xl`}>
        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>New Session</span>
        <kbd className={`px-3 py-1 ${isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
          } rounded text-sm`}>Ctrl+N</kbd>
      </div>
      <div className={`flex justify-between items-center p-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
        } rounded-xl`}>
        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Toggle Timer Overlay</span>
        <kbd className={`px-3 py-1 ${isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
          } rounded text-sm`}>Ctrl+Shift+O</kbd>
      </div>
      <div className={`flex justify-between items-center p-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
        } rounded-xl`}>
        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Toggle Notes Overlay</span>
        <kbd className={`px-3 py-1 ${isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
          } rounded text-sm`}>Ctrl+Shift+N</kbd>
      </div>
      <div className={`flex justify-between items-center p-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
        } rounded-xl`}>
        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Toggle Streak Overlay</span>
        <kbd className={`px-3 py-1 ${isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
          } rounded text-sm`}>Ctrl+Shift+T</kbd>
      </div>
    </div>
  </div>
);

// Profile Content Component
const ProfileContent = ({ isDarkMode }) => (
  <div className="space-y-6">
    {/* Profile Info */}
    <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } rounded-2xl p-8 border`}>
      <div className="flex items-center gap-6 mb-8">
        <div className="w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center">
          <User className="w-10 h-10 text-white" />
        </div>
        <div>
          <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'
            } mb-2`}>Focus Master</h3>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Productivity enthusiast since 2024</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`p-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
          } rounded-xl text-center`}>
          <div className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'
            } mb-2`}>127</div>
          <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'
            } text-sm`}>Total Sessions</div>
        </div>

        <div className={`p-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
          } rounded-xl text-center`}>
          <div className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'
            } mb-2`}>52h</div>
          <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'
            } text-sm`}>Focus Time</div>
        </div>

        <div className={`p-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
          } rounded-xl text-center`}>
          <div className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'
            } mb-2`}>15</div>
          <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'
            } text-sm`}>Day Streak</div>
        </div>
      </div>
    </div>

    {/* Achievements */}
    <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } rounded-2xl p-8 border`}>
      <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'
        } mb-6`}>Achievements</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`flex items-center gap-4 p-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
          } rounded-xl`}>
          <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center">
            <Timer className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>First Timer</div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Complete your first focus session</div>
          </div>
        </div>

        <div className={`flex items-center gap-4 p-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
          } rounded-xl`}>
          <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
            <CheckSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>Task Master</div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Complete 10 tasks in a day</div>
          </div>
        </div>

        <div className={`flex items-center gap-4 p-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
          } rounded-xl`}>
          <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>Streak Keeper</div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Maintain a 7-day streak</div>
          </div>
        </div>

        <div className={`flex items-center gap-4 p-4 ${isDarkMode ? 'bg-gray-700 opacity-50' : 'bg-gray-50 opacity-50'
          } rounded-xl`}>
          <div className="w-12 h-12 rounded-full bg-gray-400 flex items-center justify-center">
            <Timer className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className={`font-semibold ${isDarkMode ? 'text-gray-500' : 'text-gray-500'
              }`}>Century Club</div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-600' : 'text-gray-500'
              }`}>Complete 100 focus sessions</div>
          </div>
        </div>
      </div>
    </div>

    {/* Preferences */}
    <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } rounded-2xl p-8 border`}>
      <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'
        } mb-6`}>Profile Preferences</h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>Show achievements</div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Display achievement notifications</div>
          </div>
          <button className="w-12 h-6 bg-orange-500 rounded-full relative">
            <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>Weekly reports</div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Receive weekly productivity summaries</div>
          </div>
          <button className={`w-12 h-6 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
            } rounded-full relative`}>
            <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5"></div>
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>Share statistics</div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Allow sharing of anonymized productivity data</div>
          </div>
          <button className={`w-12 h-6 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
            } rounded-full relative`}>
            <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5"></div>
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default App;