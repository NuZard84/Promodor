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
import { useTimer, useTasks, useNotifier } from './hooks';
import {
  OverlayMode,
  NotesOverlay,
  StreakOverlay
} from './components';
import { getCurrentStreak, getStreakFreezes, getStreakProtectionStatus, testMissDay, addTestStreakFreezes, completeFocusCycleToday, resetAllStreakData, simulateConsecutiveDays } from './utils/streak';
import { featureFlags } from './featureFlags';

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
    resetTimer,
    updateSettings
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
  const [closeAllWithMain, setCloseAllWithMain] = useState(featureFlags.closeAllWithMain);
  const [showDevOverlay, setShowDevOverlay] = useState(() => {
    const saved = localStorage.getItem('promodor_dev_overlay_dismissed');
    return saved !== 'true';
  });
  
  // Streak state
  const [currentStreak, setCurrentStreak] = useState(0);
  const [streakFreezes, setStreakFreezes] = useState(0);
  const [streakProtectionStatus, setStreakProtectionStatus] = useState({});

  // Navigation items 
  const navigationItems = [
    { id: 'overlays', label: 'Overlays', icon: Layers },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'stats', label: 'Statistics', icon: BarChart3 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'shortcuts', label: 'Shortcuts', icon: Keyboard },
  ];

  // Update completed tasks when timer completes
  useEffect(() => {
    if (mode === 'focus' && !isActive && minutes === 0 && seconds === 0) {
      updateCompletedTasks(completedTasks + 1);
    }
  }, [mode, isActive, minutes, seconds, completedTasks, updateCompletedTasks]);

  // Load streak data
  useEffect(() => {
    const loadStreakData = () => {
      setCurrentStreak(getCurrentStreak());
      setStreakFreezes(getStreakFreezes());
      setStreakProtectionStatus(getStreakProtectionStatus());
    };
    
    loadStreakData();
    
    // Listen for storage changes to update streak data
    const handleStorageChange = (e) => {
      if (e.key === 'promodor_streak_v1') {
        loadStreakData();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);


  // Test functions for frozen streak system
  const handleTestMissDay = () => {
    testMissDay();
    // Reload streak data after test
    setTimeout(() => {
      setCurrentStreak(getCurrentStreak());
      setStreakFreezes(getStreakFreezes());
      setStreakProtectionStatus(getStreakProtectionStatus());
    }, 100);
  };

  const handleAddTestFreezes = () => {
    addTestStreakFreezes(1);
    // Reload streak data after test
    setTimeout(() => {
      setCurrentStreak(getCurrentStreak());
      setStreakFreezes(getStreakFreezes());
      setStreakProtectionStatus(getStreakProtectionStatus());
    }, 100);
  };

  const handleCompleteFocusCycle = () => {
    completeFocusCycleToday();
    // Reload streak data after test
    setTimeout(() => {
      setCurrentStreak(getCurrentStreak());
      setStreakFreezes(getStreakFreezes());
      setStreakProtectionStatus(getStreakProtectionStatus());
    }, 100);
  };

  const handleResetAllStreakData = () => {
    if (window.confirm('Are you sure you want to reset all streak data? This cannot be undone.')) {
      resetAllStreakData();
      // Reload streak data after test
      setTimeout(() => {
        setCurrentStreak(getCurrentStreak());
        setStreakFreezes(getStreakFreezes());
        setStreakProtectionStatus(getStreakProtectionStatus());
      }, 100);
    }
  };

  const handleAddMultipleFreezes = (count) => {
    addTestStreakFreezes(count);
    // Reload streak data after test
    setTimeout(() => {
      setCurrentStreak(getCurrentStreak());
      setStreakFreezes(getStreakFreezes());
      setStreakProtectionStatus(getStreakProtectionStatus());
    }, 100);
  };

  const handleSimulateConsecutiveDays = (days) => {
    simulateConsecutiveDays(days);
    // Reload streak data after test
    setTimeout(() => {
      setCurrentStreak(getCurrentStreak());
      setStreakFreezes(getStreakFreezes());
      setStreakProtectionStatus(getStreakProtectionStatus());
    }, 100);
  };

  // Feature flag update function
  const updateFeatureFlag = async (flagName, value) => {
    if (flagName === 'closeAllWithMain') {
      setCloseAllWithMain(value);
      // Update the feature flag file
      if (window.electronAPI?.updateFeatureFlag) {
        try {
          const success = await window.electronAPI.updateFeatureFlag(flagName, value);
          if (success) {
            console.log('Feature flag updated successfully:', flagName, value);
          } else {
            console.error('Failed to update feature flag:', flagName, value);
            // Revert the state if update failed
            setCloseAllWithMain(!value);
          }
        } catch (error) {
          console.error('Error updating feature flag:', error);
          // Revert the state if update failed
          setCloseAllWithMain(!value);
        }
      } else {
        // For browser mode, we can update the local state
        console.log('Feature flag updated locally:', flagName, value);
      }
    }
  };

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
        default:
          console.warn('Unknown overlay type:', type);
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
    return <OverlayMode settings={settings} />;
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
          currentStreak={currentStreak}
          streakFreezes={streakFreezes}
          streakProtectionStatus={streakProtectionStatus}
          onTestMissDay={handleTestMissDay}
          onAddTestFreezes={handleAddTestFreezes}
          onCompleteFocusCycle={handleCompleteFocusCycle}
          onResetAllStreakData={handleResetAllStreakData}
          onAddMultipleFreezes={handleAddMultipleFreezes}
          onSimulateConsecutiveDays={handleSimulateConsecutiveDays}
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
          closeAllWithMain={closeAllWithMain}
          updateFeatureFlag={updateFeatureFlag}
        />;
      case 'notifications':
        return <NotificationsContent isDarkMode={isDarkMode} />;
      case 'shortcuts':
        return <ShortcutsContent isDarkMode={isDarkMode} />;
      default:
        return <OverlaysContent createOverlay={createOverlay} isDarkMode={isDarkMode} />;
    }
  };

  return (
    <div className={`h-screen flex flex-col ${isDarkMode
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
            
            {/* Streak Indicator */}
            <div className="ml-4 flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className="text-xs text-gray-300">{currentStreak}</span>
              </div>
              {streakFreezes > 0 && (
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                  <span className="text-xs text-gray-300">{streakFreezes}</span>
                </div>
              )}
            </div>
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
      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <div className={`w-64 ${isDarkMode
          ? 'bg-gray-800 border-r border-gray-700'
          : 'bg-white border-r border-gray-200'
          } flex flex-col sticky top-0`} style={{ height: 'calc(100vh - 2rem)', maxHeight: 'calc(100vh - 2rem)' }}>
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
          <nav className="flex-1 p-4 overflow-y-auto">
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
          <div className={`p-3 ${isDarkMode ? 'border-t border-gray-700' : 'border-t border-gray-200'
            }`}>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-200 ${isDarkMode
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
        <div className="flex-1 flex flex-col min-h-0">
          {/* Header */}
          <header className={`${isDarkMode
            ? 'bg-gray-800 border-b border-gray-700'
            : 'bg-white border-b border-gray-200'
            } px-8 py-[18px] sticky top-0 z-10`}>
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
          <main className="flex-1 p-8 overflow-y-auto custom-scrollbar">
            {renderMainContent()}
          </main>
        </div>
      </div>

      {/* Development Status Overlay */}
      {showDevOverlay && (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
          <div className={`${isDarkMode ? 'bg-orange-900/90 border-orange-700' : 'bg-orange-100 border-orange-300'} border rounded-xl p-4 shadow-lg`}>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Timer className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold ${isDarkMode ? 'text-orange-200' : 'text-orange-800'} mb-1`}>
                  Development Mode
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-orange-300' : 'text-orange-700'} mb-3`}>
                  Your data is currently saved locally. Profile features and cloud sync are coming soon!
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDevOverlay(false)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      isDarkMode 
                        ? 'bg-orange-800 hover:bg-orange-700 text-orange-200' 
                        : 'bg-orange-200 hover:bg-orange-300 text-orange-800'
                    }`}
                  >
                    Got it
                  </button>
                  <button
                    onClick={() => {
                      setShowDevOverlay(false);
                      localStorage.setItem('promodor_dev_overlay_dismissed', 'true');
                    }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      isDarkMode 
                        ? 'text-orange-400 hover:text-orange-300' 
                        : 'text-orange-600 hover:text-orange-700'
                    }`}
                  >
                    Don't show again
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowDevOverlay(false)}
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                  isDarkMode 
                    ? 'hover:bg-orange-800 text-orange-400' 
                    : 'hover:bg-orange-200 text-orange-600'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

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
    notifications: 'Notification and sound preferences',
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
const StatsContent = ({ 
  completedTasks, 
  cycle, 
  tasks, 
  isDarkMode, 
  currentStreak, 
  streakFreezes, 
  streakProtectionStatus, 
  onTestMissDay, 
  onAddTestFreezes, 
  onCompleteFocusCycle, 
  onResetAllStreakData, 
  onAddMultipleFreezes,
  onSimulateConsecutiveDays
}) => {
  const completedTasksList = tasks.filter(task => task.completed);
  
  // Check if we're in development mode and Electron is available
  const isDevelopmentMode = process.env.NODE_ENV === 'development' || 
                           process.env.NODE_ENV === 'dev' || 
                           window.location.hostname === 'localhost' ||
                           window.location.hostname === '127.0.0.1';
  const isElectronAvailable = typeof window !== 'undefined' && window.electronAPI;
  const showTestPanel = isDevelopmentMode && isElectronAvailable;
  
  // Debug logging for development mode detection
  if (process.env.NODE_ENV === 'development') {
    console.log('Development mode detection:', {
      NODE_ENV: process.env.NODE_ENV,
      hostname: window.location.hostname,
      isDevelopmentMode,
      isElectronAvailable,
      showTestPanel
    });
  }

  return (
    <div className="space-y-6">
      {/* Coming Soon Notice */}
      <div className={`${isDarkMode ? 'bg-yellow-900/20 border-yellow-700' : 'bg-yellow-50 border-yellow-200'
        } rounded-2xl p-6 border`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-yellow-500 flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-yellow-200' : 'text-yellow-800'
              } mb-1`}>Statistics Coming Soon</h3>
            <p className={`text-sm ${isDarkMode ? 'text-yellow-300' : 'text-yellow-700'
              }`}>
              Advanced statistics and analytics features are currently under development. 
              Basic stats are shown below as a preview.
            </p>
          </div>
        </div>
      </div>

      {/* Basic Stats Preview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-60">
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

      {/* Frozen Streak System */}
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } rounded-2xl p-6 border`}>
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'
          } mb-4 flex items-center gap-2`}>
          <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-blue-400"></div>
          </div>
          Frozen Streak System
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Current Streak */}
          <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl p-4 text-center`}>
            <div className="text-2xl font-bold text-orange-500 mb-1">{currentStreak}</div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Current Streak</div>
          </div>
          
          {/* Available Freezes */}
          <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl p-4 text-center`}>
            <div className="text-2xl font-bold text-blue-500 mb-1">{streakFreezes}</div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Available Freezes</div>
          </div>
          
          {/* Protection Status */}
          <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl p-4 text-center`}>
            <div className={`text-2xl font-bold mb-1 ${streakProtectionStatus.isProtected ? 'text-green-500' : 'text-gray-500'}`}>
              {streakProtectionStatus.isProtected ? 'Protected' : 'Unprotected'}
            </div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Status</div>
          </div>
        </div>
        
        {/* Protection Info */}
        <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl p-4`}>
          <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-2`}>
            How It Works
          </h4>
          <ul className={`text-sm space-y-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            <li>• Earn 1 freeze every 4 consecutive days of activity</li>
            <li>• Maximum of 3 freezes can be held at once</li>
            <li>• Freezes automatically protect your streak when you miss a day</li>
            <li>• One freeze is consumed per day missed</li>
          </ul>
        </div>
      </div>

      {/* Enhanced Test Panel for Frozen Streak System - Development Only */}
      {showTestPanel && (
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } rounded-2xl p-6 border`}>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'
            } mb-4 flex items-center gap-2`}>
            <div className="w-6 h-6 rounded-lg bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
            </div>
            Frozen Streak Test Panel (Development)
          </h3>
        
        <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl p-4`}>
          <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-3`}>
            Test Frozen Streak System
          </h4>
          
          {/* Current Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h5 className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                Current Status
              </h5>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} space-y-1`}>
                <div>• Current Streak: <span className="font-semibold text-orange-500">{currentStreak}</span> days</div>
                <div>• Available Freezes: <span className="font-semibold text-blue-500">{streakFreezes}</span></div>
                <div>• Protection: <span className={`font-semibold ${streakProtectionStatus.isProtected ? 'text-green-500' : 'text-red-500'}`}>
                  {streakProtectionStatus.isProtected ? 'Active' : 'Inactive'}
                </span></div>
                <div>• Last Completed: <span className="font-semibold">
                  {streakProtectionStatus.lastCompleted ? new Date(streakProtectionStatus.lastCompleted).toLocaleDateString() : 'Never'}
                </span></div>
                <div>• Last Missed: <span className="font-semibold">
                  {streakProtectionStatus.lastMissed ? new Date(streakProtectionStatus.lastMissed).toLocaleDateString() : 'None'}
                </span></div>
              </div>
            </div>
            <div>
              <h5 className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                How to Test
              </h5>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} space-y-1`}>
                <div>1. <strong>Complete Focus Cycle</strong> - Mark today as completed</div>
                <div>2. <strong>Earn Freezes</strong> - Get 1 freeze every 4 consecutive days</div>
                <div>3. <strong>Test Miss Day</strong> - Simulate missing a day</div>
                <div>4. <strong>Add Test Freezes</strong> - Manually add freezes for testing</div>
                <div>5. <strong>Reset Data</strong> - Clear all streak data to start fresh</div>
              </div>
            </div>
          </div>
          
          {/* Test Buttons */}
          <div className="space-y-3">
            <h5 className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
              Test Actions
            </h5>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <button
                onClick={onCompleteFocusCycle}
                className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
                title="Mark today as completed and increment streak"
              >
                Complete Cycle
              </button>
              
              <button
                onClick={onTestMissDay}
                className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                title="Simulate missing a day to test freeze protection"
              >
                Test Miss Day
              </button>
              
              <button
                onClick={onAddTestFreezes}
                className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                title="Add 1 test freeze"
              >
                Add 1 Freeze
              </button>
              
              <button
                onClick={() => onAddMultipleFreezes(3)}
                className="px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-medium transition-colors"
                title="Add 3 test freezes (maximum)"
              >
                Add 3 Freezes
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <button
                onClick={() => onSimulateConsecutiveDays(4)}
                className="px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition-colors"
                title="Simulate 4 consecutive days (earns 1 freeze)"
              >
                Simulate 4 Days
              </button>
              
              <button
                onClick={() => onSimulateConsecutiveDays(8)}
                className="px-3 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-sm font-medium transition-colors"
                title="Simulate 8 consecutive days (earns 2 freezes)"
              >
                Simulate 8 Days
              </button>
              
              <button
                onClick={() => onSimulateConsecutiveDays(12)}
                className="px-3 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg text-sm font-medium transition-colors"
                title="Simulate 12 consecutive days (earns 3 freezes)"
              >
                Simulate 12 Days
              </button>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={onResetAllStreakData}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
                title="Reset all streak data to start fresh"
              >
                Reset All Data
              </button>
            </div>
          </div>
          
          {/* Test Scenarios */}
          <div className="mt-4">
            <h5 className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
              Test Scenarios
            </h5>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} space-y-1`}>
              <div><strong>Scenario 1:</strong> Simulate 4 days → Earn 1 freeze → Test Miss Day → Streak continues</div>
              <div><strong>Scenario 2:</strong> Add 3 freezes → Test Miss Day 3 times → Streak continues → No freezes left</div>
              <div><strong>Scenario 3:</strong> Test Miss Day without freezes → Streak resets to 0</div>
              <div><strong>Scenario 4:</strong> Simulate 8 days → Earn 2 freezes → Test Miss Day → Streak continues</div>
              <div><strong>Scenario 5:</strong> Simulate 12 days → Earn 3 freezes (maximum) → Test Miss Day → Streak continues</div>
            </div>
          </div>
        </div>
        </div>
      )}

      {/* Development Mode Notice */}
      {!showTestPanel && (
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } rounded-2xl p-6 border`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gray-500 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'
                } mb-1`}>Test Panel Unavailable</h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                The frozen streak test panel is only available in development mode with Electron. 
                {!isDevelopmentMode && ' (Not in development mode)'}
                {!isElectronAvailable && ' (Electron not available)'}
              </p>
            </div>
          </div>
        </div>
      )}

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className={`p-6 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'
          } rounded-xl flex flex-col h-full`}>
          <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center mb-4">
            <Timer className="w-6 h-6 text-orange-500" />
          </div>
          <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'
            } mb-2`}>Timer Overlay</h4>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'
            } text-sm mb-4 flex-grow`}>
            Compact timer that floats above other windows
          </p>
          <button
            onClick={() => createOverlay('timer')}
            className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors mt-auto"
          >
            Create Timer Overlay
          </button>
        </div>

        <div className={`p-6 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'
          } rounded-xl flex flex-col h-full`}>
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mb-4">
            <CheckSquare className="w-6 h-6 text-blue-500" />
          </div>
          <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'
            } mb-2`}>Notes Overlay</h4>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'
            } text-sm mb-4 flex-grow`}>
            Quick notes and task list overlay
          </p>
          <button
            onClick={() => createOverlay('notes')}
            className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors mt-auto"
          >
            Create Notes Overlay
          </button>
        </div>

        <div className={`p-6 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'
          } rounded-xl flex flex-col h-full`}>
          <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-4">
            <BarChart3 className="w-6 h-6 text-green-500" />
          </div>
          <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'
            } mb-2`}>Streak Overlay</h4>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'
            } text-sm mb-4 flex-grow`}>
            Progress streak display at bottom of screen
          </p>
          <button
            onClick={() => createOverlay('streak')}
            className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors mt-auto"
          >
            Create Streak Overlay
          </button>
        </div>
      </div>
    </div>
  </div>
);

// Settings Content Component
const SettingsContent = ({ settings, updateSettings, isDarkMode, closeAllWithMain, updateFeatureFlag }) => {
  const [tempSettings, setTempSettings] = useState(settings);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showOverlayNote, setShowOverlayNote] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);
  const notify = useNotifier();

  // Update temp settings when settings prop changes
  useEffect(() => {
    setTempSettings(settings);
    setHasChanges(false);
  }, [settings]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  // Check if there are changes
  const checkForChanges = (newSettings) => {
    const changed = Object.keys(newSettings).some(key => 
      newSettings[key] !== settings[key]
    );
    setHasChanges(changed);
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    const newSettings = { ...tempSettings, [field]: parseInt(value) || 0 };
    setTempSettings(newSettings);
    checkForChanges(newSettings);
    
    // Show overlay note when timer settings change
    if (['focusTime', 'shortBreakTime', 'longBreakTime', 'longBreakAfter'].includes(field)) {
      // Clear existing timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      setShowOverlayNote(true);
      // Auto-hide after 4 seconds
      const newTimeoutId = setTimeout(() => {
        setShowOverlayNote(false);
        setTimeoutId(null);
      }, 4000);
      setTimeoutId(newTimeoutId);
    }
  };

  // Save settings
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Clear timeout and hide overlay note
      if (timeoutId) {
        clearTimeout(timeoutId);
        setTimeoutId(null);
      }
      setShowOverlayNote(false);
      
      // Update the main app settings
      updateSettings(tempSettings);
      
      // Save to localStorage for persistence
      localStorage.setItem('promodor_timer_settings', JSON.stringify(tempSettings));
      
      setHasChanges(false);
      
      // Show success notification
      notify('Settings Saved', 'Timer settings have been updated successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      notify('Error', 'Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to original settings
  const handleReset = () => {
    // Clear timeout and hide overlay note
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setShowOverlayNote(false);
    
    setTempSettings(settings);
    setHasChanges(false);
  };

  return (
    <div className="space-y-6">
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } rounded-2xl p-8 border`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>Timer Settings</h3>
          {hasChanges && (
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-600 hover:bg-gray-500 text-gray-300' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                Reset
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
              } mb-2`}>
              Focus Time (minutes)
            </label>
            <input
              type="number"
              min="1"
              max="120"
              value={tempSettings.focusTime}
              onChange={(e) => handleInputChange('focusTime', e.target.value)}
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
              min="1"
              max="60"
              value={tempSettings.shortBreakTime}
              onChange={(e) => handleInputChange('shortBreakTime', e.target.value)}
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
              min="1"
              max="120"
              value={tempSettings.longBreakTime}
              onChange={(e) => handleInputChange('longBreakTime', e.target.value)}
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
              min="1"
              max="20"
              value={tempSettings.longBreakAfter}
              onChange={(e) => handleInputChange('longBreakAfter', e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 ${isDarkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-200 text-gray-900'
                }`}
            />
          </div>
        </div>

        {/* Settings Preview */}
        <div className={`mt-6 p-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl`}>
          <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
            Current Settings Preview
          </h4>
          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Focus: {tempSettings.focusTime}min • Short Break: {tempSettings.shortBreakTime}min • 
            Long Break: {tempSettings.longBreakTime}min • Long Break After: {tempSettings.longBreakAfter} cycles
          </div>
        </div>

        {/* Overlay Note */}
        {showOverlayNote && (
          <div className={`mt-4 p-3 ${isDarkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'} border rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300`}>
            <div className={`w-5 h-5 rounded-full ${isDarkMode ? 'bg-blue-500' : 'bg-blue-400'} flex items-center justify-center flex-shrink-0`}>
              <Timer className="w-3 h-3 text-white" />
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>
                Timer settings changed
              </p>
              <p className={`text-xs ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                If you have a timer overlay open, close and reopen it to see the changes.
              </p>
            </div>
            <button
              onClick={() => setShowOverlayNote(false)}
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                isDarkMode 
                  ? 'hover:bg-blue-800 text-blue-400' 
                  : 'hover:bg-blue-200 text-blue-600'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Feature Flags Section */}
    <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } rounded-2xl p-8 border`}>
      <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'
        } mb-6`}>Overlay Behavior</h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>Close overlays with main app</div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
              When enabled, all overlay windows will close when the main app is closed. 
              When disabled, overlay windows will stay open even when the main app is closed.
            </div>
          </div>
          <button 
            onClick={() => updateFeatureFlag('closeAllWithMain', !closeAllWithMain)}
            className={`w-12 h-6 ${closeAllWithMain ? 'bg-orange-500' : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
              } rounded-full relative transition-colors`}
          >
            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
              closeAllWithMain ? 'translate-x-6' : 'translate-x-0.5'
            }`}></div>
          </button>
        </div>
        
        <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl p-4`}>
          <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            <strong>Current setting:</strong> {closeAllWithMain ? 'Overlays will close with main app' : 'Overlays will stay open when main app closes'}
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

// Notifications Content Component
const NotificationsContent = ({ isDarkMode }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    // Load from localStorage or default to true
    try {
      const saved = localStorage.getItem('promodor_notifications_enabled');
      return saved !== null ? JSON.parse(saved) : true;
    } catch (error) {
      console.error('Error loading notification setting:', error);
      return true;
    }
  });

  const handleNotificationToggle = async () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    
    // Save to localStorage
    localStorage.setItem('promodor_notifications_enabled', JSON.stringify(newValue));
    
    // Update IPC setting if available
    if (window.electronAPI?.updateNotificationSetting) {
      try {
        await window.electronAPI.updateNotificationSetting(newValue);
        console.log('Notification setting updated via IPC:', newValue);
      } catch (error) {
        console.error('Error updating notification setting via IPC:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Notification Settings */}
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } rounded-2xl p-8 border`}>
        <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'
          } mb-6`}>Notification Settings</h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>Enable Notifications</div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Show system notifications when timer completes</div>
            </div>
            <button 
              onClick={handleNotificationToggle}
              className={`w-12 h-6 ${notificationsEnabled ? 'bg-orange-500' : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                } rounded-full relative transition-colors`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                notificationsEnabled ? 'translate-x-6' : 'translate-x-0.5'
              }`}></div>
            </button>
          </div>
          
          {/* Current Status */}
          <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl p-4`}>
            <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <strong>Current status:</strong> {notificationsEnabled ? 'Notifications are enabled' : 'Notifications are disabled'}
            </div>
          </div>
        </div>
      </div>

      {/* Sound Settings - Coming Soon */}
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } rounded-2xl p-8 border`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gray-500 flex items-center justify-center">
            <Volume2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'
              } mb-1`}>Sound Settings Coming Soon</h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
              Advanced sound customization features are currently under development. 
              You'll be able to customize timer sounds, volume, and audio preferences soon!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


const ShortcutsContent = ({ isDarkMode }) => (
  <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    } rounded-2xl p-8 border`}>
    <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'
      } mb-6`}>Keyboard Shortcuts</h3>
    
    {/* Global Shortcuts Section */}
    <div className="mb-8">
      <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'
        } mb-4`}>Global Shortcuts (Work when app is unfocused)</h4>
      <div className="space-y-3">
        <div className={`flex justify-between items-center p-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
          } rounded-xl`}>
          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Start/Pause Timer</span>
          <kbd className={`px-3 py-1 ${isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
            } rounded text-sm`}>Ctrl+Shift+Space</kbd>
        </div>
        <div className={`flex justify-between items-center p-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
          } rounded-xl`}>
          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Reset Timer</span>
          <kbd className={`px-3 py-1 ${isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
            } rounded text-sm`}>Ctrl+Shift+Z</kbd>
        </div>
        <div className={`flex justify-between items-center p-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
          } rounded-xl`}>
          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Global Timer Toggle</span>
          <kbd className={`px-3 py-1 ${isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
            } rounded text-sm`}>Ctrl+Shift+P</kbd>
        </div>
        <div className={`flex justify-between items-center p-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
          } rounded-xl`}>
          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Toggle Timer Overlay</span>
          <kbd className={`px-3 py-1 ${isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
            } rounded text-sm`}>Ctrl+Shift+O</kbd>
        </div>
        <div className={`flex justify-between items-center p-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
          } rounded-xl`}>
          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Toggle Notes Overlay</span>
          <kbd className={`px-3 py-1 ${isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
            } rounded text-sm`}>Ctrl+Shift+N</kbd>
        </div>
        <div className={`flex justify-between items-center p-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
          } rounded-xl`}>
          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Toggle Streak Overlay</span>
          <kbd className={`px-3 py-1 ${isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
            } rounded text-sm`}>Ctrl+Shift+T</kbd>
        </div>
        <div className={`flex justify-between items-center p-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
          } rounded-xl`}>
          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Hide Window</span>
          <kbd className={`px-3 py-1 ${isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
            } rounded text-sm`}>Ctrl+Shift+H</kbd>
        </div>
        <div className={`flex justify-between items-center p-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
          } rounded-xl`}>
          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Show Window</span>
          <kbd className={`px-3 py-1 ${isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
            } rounded text-sm`}>Ctrl+Shift+S</kbd>
        </div>
        <div className={`flex justify-between items-center p-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
          } rounded-xl`}>
          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Toggle Click-through</span>
          <kbd className={`px-3 py-1 ${isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
            } rounded text-sm`}>Ctrl+Shift+C</kbd>
        </div>
      </div>
    </div>

    {/* Mode Shortcuts Section */}
    <div className="mb-8">
      <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'
        } mb-4`}>Timer Mode Shortcuts</h4>
      <div className="space-y-3">
        <div className={`flex justify-between items-center p-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
          } rounded-xl`}>
          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Focus Mode</span>
          <kbd className={`px-3 py-1 ${isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
            } rounded text-sm`}>Ctrl+Shift+1</kbd>
        </div>
        <div className={`flex justify-between items-center p-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
          } rounded-xl`}>
          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Short Break</span>
          <kbd className={`px-3 py-1 ${isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
            } rounded text-sm`}>Ctrl+Shift+2</kbd>
        </div>
        <div className={`flex justify-between items-center p-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
          } rounded-xl`}>
          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Long Break</span>
          <kbd className={`px-3 py-1 ${isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
            } rounded text-sm`}>Ctrl+Shift+3</kbd>
        </div>
      </div>
    </div>

    {/* Special Features Section */}
    <div>
      <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'
        } mb-4`}>Special Features</h4>
      <div className="space-y-3">
        <div className={`flex justify-between items-center p-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
          } rounded-xl`}>
          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Hyper Mode</span>
          <kbd className={`px-3 py-1 ${isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
            } rounded text-sm`}>Ctrl+Shift+A</kbd>
        </div>
        <div className={`flex justify-between items-center p-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
          } rounded-xl`}>
          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Super Hyper Mode</span>
          <kbd className={`px-3 py-1 ${isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
            } rounded text-sm`}>Ctrl+Shift+X</kbd>
        </div>
      </div>
    </div>

    {/* Note */}
    <div className={`mt-6 p-4 ${isDarkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'
      } rounded-xl border`}>
      <p className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
        <strong>Note:</strong> Global shortcuts work even when the app is not in focus, 
        making it easy to control your timer from anywhere on your system.
      </p>
    </div>
  </div>
);

// Profile Content Component
const ProfileContent = ({ isDarkMode }) => (
  <div className="space-y-6">
    {/* Development Notice */}
    <div className={`${isDarkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'
      } rounded-2xl p-6 border`}>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
          <Timer className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-blue-200' : 'text-blue-800'
            } mb-1`}>Profile Features Coming Soon</h3>
          <p className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-700'
            }`}>
            Your profile and personalization features are currently under development. 
            Data is saved locally for now, and full profile functionality will be available soon!
          </p>
        </div>
      </div>
    </div>

    {/* Profile Info - Coming Soon Preview */}
    <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } rounded-2xl p-8 border opacity-60`}>
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